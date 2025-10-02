import {
    products,
    exercises,
    getInitialUserData
} from './data.js';

import * as storage from './storage.js';
// Import all UI template functions
import {
    homePageTemplate,
    exercisesPageTemplate,
    exerciseListPageTemplate,
    exerciseDetailPageTemplate,
    programPageTemplate,
    renderDailyProgram,
    productPickerPageTemplate,
    exercisePickerPageTemplate,
    myGoalPageTemplate,
    favoritesPageTemplate,
    achievementsPageTemplate, 
    loginPageTemplate,
    registerPageTemplate,
    showAchievementModal,
    profilePageTemplate,
    onboardingPageTemplate,
    progressPageTemplate,
    updateStatsPageTemplate } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- DYNAMIC DATA REFERENCES ---
    // These will point to the current user's data after login.
    let userProfile, userProgram, achievementsData;

    const loadAndMergeUserData = async (username) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("No auth token found for loading data.");
            return false;
        }

        try {
            // API'den tüm verileri paralel olarak çek
            const [profileRes, programRes] = await Promise.all([
                fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/user/program', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!profileRes.ok || !programRes.ok) {
                throw new Error('Failed to fetch user data from API.');
            }

            const profileData = await profileRes.json();
            const programData = await programRes.json();

            // Başlangıç verilerini al (başarımlar gibi statik yapılar için)
            const initialData = getInitialUserData(username);

            // Global state değişkenlerini doldur
            userProfile = { ...initialData.userProfile, ...profileData };
            userProgram = programData;
            achievementsData = initialData.achievementsData; // Başarım verileri henüz backend'de değil

            // TODO: Başarımlar ve favoriler de backend'den gelmeli.
            // Şimdilik başlangıç verilerinden gelenleri kullanıyoruz.

            return true;
        } catch (error) {
            console.error("Error loading user data from API:", error);
            // Hata durumunda kullanıcıyı logout yapıp login sayfasına yönlendirebiliriz.
            logout();
            return false;
        }
    };

    const saveProgramToBackend = async () => {
        if (!userProgram || userProfile.isGuest) return; // Misafir kullanıcılar için kaydetme
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("Cannot save program: No auth token.");
            return;
        }

        try {
            const response = await fetch('/api/user/program', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userProgram)
            });

            if (!response.ok) {
                throw new Error('Failed to save program to backend.');
            }
        } catch (error) {
            console.error("Error saving program:", error);
            // Hata durumunda kullanıcıya bildirim gösterilebilir.
        }
    };

    // --- DOM ELEMENTS (defined later) ---
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const navButtons = document.querySelectorAll('.nav-button');
    const appHeader = document.getElementById('app-header');
    const backButton = document.getElementById('back-button');

    // --- STATE MANAGEMENT ---
    let currentPage = 'login';
    let pageHistory = [];
    let currentParams = {};
    let selectedDayForProgram = 'Mon';

    // --- PAGE TEMPLATE MAPPING ---
    const pageTemplates = {
        home: () => homePageTemplate(userProfile, userProgram, achievementsData),
        login: () => loginPageTemplate(), // Login page doesn't need user data yet
        register: () => registerPageTemplate(), // New register page
        exercises: () => exercisesPageTemplate(),
        program: () => programPageTemplate(selectedDayForProgram, userProgram),
        profile: () => profilePageTemplate(userProfile, achievementsData),
        exerciseList: (params) => {
            const product = products.find(p => p.id == params.productId);
            return product ? exerciseListPageTemplate(params.productId) : '<p class="p-6 pt-24 page">Product not found.</p>';
        },
        exerciseDetail: (params) => {
            const exercise = exercises.find(e => e.id == params.exerciseId);
            return exercise ? exerciseDetailPageTemplate(params.exerciseId, userProfile) : '<p class="p-6 pt-24 page">Exercise not found.</p>';
        },
        productPicker: (params) => productPickerPageTemplate(params.day),
        exercisePicker: (params) => exercisePickerPageTemplate(params.day, params.productId, userProgram),
        myGoal: () => myGoalPageTemplate(userProfile),
        favorites: () => favoritesPageTemplate(userProfile),
        achievements: () => achievementsPageTemplate(achievementsData),
        onboarding: (params) => onboardingPageTemplate(params.step, userProfile),
        progress: () => progressPageTemplate(userProfile),
        updateStats: () => updateStatsPageTemplate(userProfile)
   };
    // --- ROUTING / PAGE RENDERING ---
    const renderPage = (pageName, params = {}) => {
        mainContent.innerHTML = '';

        const templateFunction = pageTemplates[pageName];

        if (templateFunction) {
            mainContent.innerHTML = templateFunction(params);
        } else {
            // Fallback for unknown page
            mainContent.innerHTML = '<p class="p-6 pt-24 page">Page not found.</p>';
        }

        updateNav(pageName);

        // For the initial home page render or direct navigation to home from bottom nav,
        // remove the 'page' class to prevent the fadeIn animation and ensure immediate visibility.
        // This logic needs to be adjusted for login/register flow
        if (pageName === 'home' && pageHistory.length <= 1) { // If coming from login or directly to home
            const renderedPageElement = mainContent.firstElementChild;
            if (renderedPageElement && renderedPageElement.classList.contains('page')) {
                renderedPageElement.classList.remove('page'); // Remove fade-in for initial load
            }
        }

        // Always update calorie and step UI when a page is rendered, in case data changed.
        if (pageName === 'home') {
            updateCaloriesUI();
            updateStepCounterUI();
        }

        mainContent.scrollTop = 0; // Scroll to top on page change

        if (pageHistory.length > 0) {
            // Special case: don't show back button if coming from login
            const fromLogin = pageHistory.length === 1 && (pageHistory[0].page === 'login' || pageHistory[0].page === 'register' || pageHistory[0].page.startsWith('onboarding'));
            if (fromLogin) {
                appHeader.classList.add('hidden');
                backButton.classList.add('hidden');
                return;
            }
            appHeader.classList.remove('hidden');
            backButton.classList.remove('hidden');
        } else {
            appHeader.classList.add('hidden');
            backButton.classList.add('hidden');
        }
    };

    // --- STEP COUNTER LOGIC ---
    let stepCounterActive = false;
    const magnitudeThreshold = 11.5; // Cihaza göre ayarlanması gerekebilir
    const stepDelay = 500; // ms cinsinden adımlar arası minimum gecikme
    let lastStepTime = 0; // To prevent multiple steps from a single movement

    const updateStepCounterUI = () => {
        const today = new Date().toDateString();
        if (!userProfile) return;
        if (userProfile.stepData.lastUpdated !== today) {
            userProfile.stepData.todaySteps = 0;
            userProfile.stepData.todayCalories = 0;
            userProfile.stepData.lastUpdated = today;
        }

        const stepCountEl = document.getElementById('step-count-text');
        const progressRingEl = document.getElementById('step-progress-ring');
        const stepIconContainer = document.getElementById('step-icon-container');

        if (stepCountEl && progressRingEl && stepIconContainer) {
            stepCountEl.textContent = userProfile.stepData.todaySteps.toLocaleString();
            const progress = Math.min((userProfile.stepData.todaySteps / userProfile.stepData.goal) * 100, 100);
            progressRingEl.style.strokeDasharray = `${progress}, 100`;

            if (progress >= 100) {
                // Hedefe ulaşıldı, onay işareti göster
                stepIconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-sky-500"><path d="M20 6 9 17l-5-5"/></svg>`;
            } else {
                // Hedefe henüz ulaşılmadı, normal ikonu göster
                stepIconContainer.innerHTML = `<span class="text-lg text-sky-500">&#128099;</span>`;
            }
        }
    };

    const updateCaloriesUI = () => {
        const calorieCountEl = document.getElementById('calorie-count-text');
        const progressRingEl = document.getElementById('calorie-progress-ring');
        const calorieIconContainer = document.getElementById('calorie-icon-container');
        if (!calorieCountEl || !userProfile) return; // Add userProfile check

        if (calorieCountEl && progressRingEl && calorieIconContainer) {
            calorieCountEl.textContent = userProfile.stepData.todayCalories.toLocaleString();
            const progress = Math.min((userProfile.stepData.todayCalories / userProfile.stepData.calorieGoal) * 100, 100);
            progressRingEl.style.strokeDasharray = `${progress}, 100`;

            if (progress >= 100) {
                // Hedefe ulaşıldı, onay işareti göster
                calorieIconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-orange-400"><path d="M20 6 9 17l-5-5"/></svg>`;
            } else {
                // Hedefe henüz ulaşılmadı, normal ikonu göster
                calorieIconContainer.innerHTML = `<span class="text-lg">🔥</span>`;
            }
        }
    };

    const handleMotion = (event) => {
        const acceleration = event.accelerationIncludingGravity;
        const magnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        const now = Date.now();

        if (magnitude > magnitudeThreshold && (now - lastStepTime) > stepDelay) {
            userProfile.stepData.todaySteps++;
            lastStepTime = now;
            updateStepCounterUI();
            updateCaloriesUI(); // Also update calories as steps contribute to it
            checkAndAwardAchievements(); // Check for step/calorie achievements
        }
    };

    const startStepCounter = async () => {
        if (stepCounterActive) return;
        const stepCard = document.getElementById('step-counter-card');

        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceMotionEvent.requestPermission();
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                    stepCounterActive = true;
                    if (stepCard) stepCard.classList.add('border-emerald-400');
                }
            } catch (error) {
                // Kullanıcı izin penceresini kapattığında oluşan hatayı yoksay
                if (error.name === 'NotAllowedError') return;
                console.error('Motion permission request error:', error);
                if (stepCard) stepCard.classList.add('border-red-400');
            }
        } else {
            // iOS dışındaki cihazlar için (genellikle Android)
            window.addEventListener('devicemotion', handleMotion);
            stepCounterActive = true;
            if (stepCard) stepCard.classList.add('border-emerald-400');
        }
    };

    const login = async (username, password) => {
        try {
            const response = await fetch('/api/auth/login', { // Backend API endpoint'i
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                // Hata mesajını göster
                console.error("Login failed");
                return false;
            }

            const { token, user } = await response.json();
            localStorage.setItem('authToken', token); // Sunucudan gelen token'ı sakla

            // API'den tüm verileri yükle
            const success = await loadAndMergeUserData(user.username);
            if (!success) return false;

            navigateTo('home'); // Veri yüklendikten sonra yönlendir
            bottomNav.classList.remove('hidden');
            // ... diğer başlangıç işlemleri
            return true;
        } catch (error) {
            console.error('An error occurred during login:', error);
            return false;
        }
    };

    const register = async (username, name, email, password) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend'den gelen hata mesajını göster
                const errorEl = document.getElementById('register-error');
                if (errorEl) {
                    errorEl.textContent = data.message || 'Registration failed.';
                    errorEl.classList.remove('hidden');
                }
                return false;
            }

            // Kayıt başarılı, backend token ve kullanıcı verisini döndürdü
            const { token, user } = data;
            localStorage.setItem('authToken', token);

            // Yeni kayıt olan kullanıcının verilerini API'den yükle
            const success = await loadAndMergeUserData(user.username);
            if (!success) return false;
            
            navigateTo('onboarding', { step: 1 });
            return true;
        } catch (error) {
            console.error('An error occurred during registration:', error);
            return false;
        }
    };

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Token yoksa, direkt login sayfasını göster
            renderPage('login');
            return;
        }

        try {
            // Backend'e token ile profil bilgisi isteği at
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Token geçerli, kullanıcı bilgilerini aldık
                const user = await response.json();
                const success = await loadAndMergeUserData(user.username); // API'den verileri yükle
                if (!success) return;

                navigateTo('home'); // Ana sayfaya yönlendir
                bottomNav.classList.remove('hidden');
            } else {
                // Token geçersiz veya süresi dolmuş
                localStorage.removeItem('authToken');
                renderPage('login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            renderPage('login'); // Bir hata olursa login sayfasına yönlendir
        }
    };

    const loginAsGuest = () => {
        loadAndMergeUserData('jane'); // Using 'jane' as the guest template
        userProfile.isGuest = true; // Mark this session as a guest session
        userProfile.name = "Guest"; // Change name to 'Guest'
        userProfile.avatar = 'https://placehold.co/100x100/9ca3af/FFFFFF?text=G&font=roboto'; // Guest avatar

        navigateTo('home');
        bottomNav.classList.remove('hidden');
        checkAndAwardAchievements();
        updateStepCounterUI();
        updateCaloriesUI();
    };
    const logout = () => {
        storage.saveUserData(userProfile, userProgram, achievementsData); // Save data before logging out
        userProfile = null;
        userProgram = null;
        achievementsData = null;
        pageHistory = [];
        renderPage('login');
        localStorage.removeItem('authToken'); // Token'ı da sil
        bottomNav.classList.add('hidden');
    };

    const navigateTo = (pageName, params = {}) => {
        pageHistory.push({ page: currentPage, params: currentParams });
        currentPage = pageName;
        currentParams = params;
        renderPage(pageName, params);
    };

    const goBack = () => {
        const lastPage = pageHistory.pop();
        if (lastPage) {
            currentPage = lastPage.page;
            currentParams = lastPage.params;
            renderPage(currentPage, currentParams);
        }
    };

    backButton.addEventListener('click', goBack);

    const updateNav = (activePage) => {
        // If not logged in, hide nav and don't try to update it
        if (!userProfile) {
            bottomNav.classList.add('hidden');
            appHeader.classList.add('hidden');
            backButton.classList.add('hidden');
            return;
        }
        if (!userProfile) return; // Don't update nav if not logged in
        navButtons.forEach(button => {
            const page = button.dataset.page;
            const isActive = page === activePage ||
                (activePage.startsWith('exercise') && page === 'exercises') ||
                (activePage.startsWith('product') && page === 'program') ||
                ['myGoal', 'favorites', 'achievements', 'progress'].includes(activePage) && page === 'profile' ||
                activePage.startsWith('onboarding'); // Keep nav hidden during onboarding

            if (isActive) {
                button.classList.remove('text-gray-500');
                button.classList.add('text-rose-500', 'active');
            } else {
                button.classList.add('text-gray-500');
                button.classList.remove('text-rose-500', 'active');
            }
        });
    };

    // --- ACHIEVEMENT LOGIC ---
    // New, modular achievement checking system
    const achievementCheckers = [
        { id: 1, check: ({ uniqueCompleted }) => uniqueCompleted.size > 0 }, // First Step
        { id: 2, check: ({ dayOrder, isDayFullyCompleted }) => dayOrder.every(isDayFullyCompleted) }, // Perfect Week
        { id: 3, check: ({ context }) => context?.event === 'exercise_completed' && new Date().getHours() < 8 }, // Early Bird
        { id: 4, check: ({ dayOrder, todayShort, isDayFullyCompleted }) => { // Consistency King
            const todayIndex = dayOrder.indexOf(todayShort);
            for (let i = 0; i < 3; i++) {
                const checkDayIndex = (todayIndex - i + 7) % 7;
                if (!isDayFullyCompleted(dayOrder[checkDayIndex])) return false;
            }
            return true;
        }},
        { id: 5, check: ({ completedProductExercises }) => completedProductExercises[1] >= 5 }, // Ring Master
        { id: 6, check: ({ completedProductExercises }) => completedProductExercises[2] >= 5 }, // Ball Fanatic
        { id: 7, check: ({ uniqueCompleted }) => uniqueCompleted.size >= 5 }, // Pilates Beginner
        { id: 8, check: ({ uniqueCompleted }) => uniqueCompleted.size >= 20 }, // Pilates Enthusiast
        { id: 9, check: ({ completedProductTypes }) => completedProductTypes.size >= 3 }, // Full Body Flow
        { id: 10, check: ({ completedProductExercises }) => completedProductExercises[5] >= 5 }, // Sliding Star
        { id: 11, check: ({ completedProductExercises }) => completedProductExercises[4] >= 5 }, // Band Pro
        { id: 12, check: ({ context, todayShort }) => context?.event === 'exercise_completed' && (todayShort === 'Sat' || todayShort === 'Sun') }, // Weekend Warrior
        { id: 13, check: ({ uniqueCompleted }) => { // Core Champion
            const coreExercisesCount = Array.from(uniqueCompleted).filter(id => exercises.find(e => e.id === id)?.muscles.includes('Core')).length;
            return coreExercisesCount >= 25;
        }},
        { id: 14, check: ({ completedProductTypes }) => completedProductTypes.size >= 5 }, // Full House
        { id: 15, check: ({ totalCompleted }) => totalCompleted >= 50 }, // Dedicated
        { id: 16, check: ({ uniqueCompleted }) => uniqueCompleted.size >= 50 }, // Pilates Pro
        { id: 17, check: ({ userProfile }) => userProfile.favorites.length >= 5 }, // Favorite Fanatic
        { id: 18, check: ({ userProgram, dayOrder }) => dayOrder.every(day => userProgram.schedule[day]?.length > 0) }, // Program Builder
        { id: 19, check: ({ completedProductExercises }) => completedProductExercises[3] >= 5 }, // Weight Band Wizard
        { id: 20, check: ({ totalCompleted }) => totalCompleted >= 100 }, // Century Club
        { id: 21, check: ({ userProfile }) => userProfile.stepData.todaySteps >= userProfile.stepData.goal }, // Step Goal Smasher
        { id: 22, check: ({ userProfile }) => userProfile.stepData.todayCalories >= userProfile.stepData.calorieGoal }, // Calorie Crusher
    ];

    const checkAndAwardAchievements = (context = {}) => {
        if (!userProfile || !userProgram || !achievementsData) return;
        const newAchievementsEarned = [];

        // --- Pre-calculate common metrics ---
        const uniqueCompleted = new Set();
        let totalCompletedCount = 0;
        const completedProductExercises = {}; // { productId: count }
        for (const day in userProgram.schedule) {
            userProgram.schedule[day].forEach(item => {
                if (item.completed) {
                    uniqueCompleted.add(item.id);
                    totalCompletedCount++;
                    const exercise = exercises.find(e => e.id === item.id);
                    if (exercise) {
                        completedProductExercises[exercise.productId] = (completedProductExercises[exercise.productId] || 0) + 1;
                    }
                }
            });
        }
        const completedProductTypes = new Set(Array.from(uniqueCompleted).map(id => exercises.find(e => e.id === id)?.productId));
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const todayShort = dayOrder[today.getDay() - 1 < 0 ? 6 : today.getDay() - 1];
        const isDayFullyCompleted = (day) => {
            const schedule = userProgram.schedule[day];
            return schedule && schedule.length > 0 && schedule.every(item => item.completed);
        };

        const metrics = {
            userProfile,
            userProgram,
            uniqueCompleted,
            totalCompleted: totalCompletedCount,
            completedProductTypes,
            completedProductExercises,
            dayOrder,
            todayShort,
            isDayFullyCompleted,
            context
        };

        // --- Check each achievement ---
        achievementCheckers.forEach(checker => {
            const achievement = achievementsData.find(a => a.id === checker.id);
            if (achievement && !achievement.earned) {
                if (checker.check(metrics)) {
                    achievement.earned = true;
                    newAchievementsEarned.push(achievement);
                }
            }
        });

        // If new achievements were earned, show them one by one.
        if (newAchievementsEarned.length > 0) {
            const showNextAchievement = () => {
                if (newAchievementsEarned.length > 0) {
                    const nextAchievement = newAchievementsEarned.shift();
                    showAchievementModal(nextAchievement, showNextAchievement); // Pass a callback
                }
            };
            showNextAchievement();
        }
    };

    // --- GLOBAL EVENT LISTENER (delegated from document) ---
    document.addEventListener('click', async (e) => {
        // Handle Login Submit
        if (e.target.id === 'login-submit-btn') {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            login(username, password);
            return;
        }

        // Handle Go to Register
        if (e.target.id === 'go-to-register') {
            navigateTo('register');
            return;
        }

        // Handle Register Submit
        const registerBtn = e.target.closest('#register-submit-btn');
        if (registerBtn) {
            const username = document.getElementById('register-username').value;
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const errorEl = document.getElementById('register-error');

            if (password !== confirmPassword) {
                errorEl.textContent = 'Passwords do not match.';
                errorEl.classList.remove('hidden');
                return;
            }
            register(username, name, email, password);
            return;
        }

        // Handle Guest Login
        if (e.target.id === 'login-as-guest') {
            loginAsGuest();
            return;
        }

        // Handle Go to Login
        if (e.target.id === 'go-to-login') {
            navigateTo('login');
            return;
        }

        // Handle Onboarding Flow
        const onboardingNextBtn = e.target.closest('#onboarding-next-btn');
        if (onboardingNextBtn) {
            const step = parseInt(onboardingNextBtn.dataset.step);
            const errorEl = document.getElementById('onboarding-error');
            errorEl.classList.add('hidden');

            if (step === 1) {
                const age = document.getElementById('onboarding-age').value;
                if (!age || age < 13) { errorEl.textContent = 'Please enter a valid age.'; errorEl.classList.remove('hidden'); return; }
                userProfile.age = parseInt(age);
                navigateTo('onboarding', { step: 2 });
            } else if (step === 2) {
                const height = document.getElementById('onboarding-height').value;
                const weight = document.getElementById('onboarding-weight').value;
                if (!height || height < 100) { errorEl.textContent = 'Please enter a valid height in cm.'; errorEl.classList.remove('hidden'); return; }
                if (!weight || weight < 30) { errorEl.textContent = 'Please enter a valid weight in kg.'; errorEl.classList.remove('hidden'); return; }
                userProfile.height = parseInt(height);
                userProfile.weight = parseInt(weight);
                // Add first entry to weight history
                userProfile.weightHistory.push({ date: new Date().toISOString().split('T')[0], weight: userProfile.weight });
                navigateTo('onboarding', { step: 3 });
            } else if (step === 4) { // The final "Let's Go" step
                storage.saveUserData(userProfile, userProgram, achievementsData);
                navigateTo('home');
                bottomNav.classList.remove('hidden');
                checkAndAwardAchievements();
                updateStepCounterUI();
                updateCaloriesUI();
            }
            return;
        }

        const onboardingGoalBtn = e.target.closest('.onboarding-goal-btn');
        if (onboardingGoalBtn) {
            const goal = onboardingGoalBtn.dataset.goal;
            userProfile.goal = goal;

            // Visually select the button
            document.querySelectorAll('.onboarding-goal-btn').forEach(btn => btn.classList.remove('bg-rose-100', 'border-rose-400'));
            onboardingGoalBtn.classList.add('bg-rose-100', 'border-rose-400');

            // Automatically move to the final step after a short delay
            setTimeout(() => {
                navigateTo('onboarding', { step: 4 });
            }, 400);
        }

        if (!userProfile) return; // Guard: Don't process clicks if not logged in

        // Navigate from program builder product list to exercise picker
        const productPickerCard = e.target.closest('.product-picker-card');
        if (productPickerCard) {
            const productId = productPickerCard.dataset.productId;
            const day = productPickerCard.dataset.day;
            navigateTo('exercisePicker', { day, productId });
        }

        // Navigate from any exercise item to its detail page
        const exerciseItem = e.target.closest('.exercise-item');
        if (exerciseItem) {
            const exerciseId = exerciseItem.dataset.exerciseId;
            navigateTo('exerciseDetail', { exerciseId });
        }

        // Navigate from product list to exercise list
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productId = productCard.dataset.productId;
            navigateTo('exerciseList', { productId });
        }

        // From Home, start today's workout
        const startWorkoutBtn = e.target.closest('.start-workout-btn');
        if (startWorkoutBtn) {
            const day = startWorkoutBtn.dataset.day;
            selectedDayForProgram = day;
            navigateTo('program');
        }

        // From Home, explore exercises
        const exploreExercisesBtn = e.target.closest('.explore-exercises-btn');
        if (exploreExercisesBtn) {
            navigateTo('exercises');
        }

        // From Home, start step counter
        const stepCard = e.target.closest('#step-permission-status');
        if (stepCard) {
            startStepCounter();
        }

        // From Home, handle goal editing
        const goalEditor = e.target.closest('.goal-editor');
        if (goalEditor) {
            const textSpan = goalEditor.querySelector('.goal-text');
            const inputEl = goalEditor.querySelector('.goal-input');

            if (textSpan && inputEl) {
                goalEditor.classList.add('editing');
                textSpan.classList.add('hidden');
                inputEl.classList.remove('hidden');
                inputEl.focus();
                inputEl.select();
            }
        }


        // From Home, navigate to a specific day in the program
        const goToProgramDay = e.target.closest('.go-to-program-day');
        if (goToProgramDay) {
            const day = goToProgramDay.dataset.day;
            selectedDayForProgram = day;
            navigateTo('program');
        }

        // On profile page, handle navigation
        const profileOption = e.target.closest('.profile-option');
        if (profileOption) {
            const pageName = profileOption.dataset.page; 
            navigateTo(pageName);
        }

        // On profile page, handle update stats button
        const updateStatsBtn = e.target.closest('#update-stats-btn');
        if (updateStatsBtn) {
            navigateTo('updateStats');
        }
        // On update stats page, handle save button
        const saveStatsBtn = e.target.closest('#save-stats-btn'); // Use async here
        if (saveStatsBtn) { 
            const nameInput = document.getElementById('update-name-input');
            const ageInput = document.getElementById('update-age-input');
            const heightInput = document.getElementById('update-height-input');
            const newWeightInput = document.getElementById('update-weight-input');
            const errorEl = document.getElementById('update-stats-error');

            const name = nameInput.value.trim();
            const age = parseInt(ageInput.value);
            const height = parseInt(heightInput.value);
            const weight = parseFloat(newWeightInput.value);

            if (!name) {
                errorEl.textContent = 'Please enter your name.';
                errorEl.classList.remove('hidden');
                return;
            }
            if (!age || age < 13) {
                errorEl.textContent = 'Please enter a valid age.';
                errorEl.classList.remove('hidden');
                return;
            }
            if (!height || height < 100) {
                errorEl.textContent = 'Please enter a valid height in cm.';
                errorEl.classList.remove('hidden');
                return;
            }
            if (!weight || weight < 30) {
                errorEl.textContent = 'Please enter a valid weight.';
                errorEl.classList.remove('hidden');
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, age, height, weight })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update profile.');
                }

                const { user: updatedUser } = await response.json();

                // Update local state with the response from the server
                Object.assign(userProfile, updatedUser);

                showToastNotification('Profile updated successfully!');
                goBack(); // Go back to the profile page

            } catch (error) {
                console.error('Profile update failed:', error);
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
        }

        // On program page, handle day selection
        const daySelectorButton = e.target.closest('.day-selector-button');
        if (daySelectorButton) {
            selectedDayForProgram = daySelectorButton.dataset.day;

            document.querySelectorAll('.day-selector-button').forEach(btn => {
                btn.classList.remove('bg-rose-500', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-600');
            });
            daySelectorButton.classList.add('bg-rose-500', 'text-white');
            daySelectorButton.classList.remove('bg-gray-100', 'text-gray-600');

            const dailyProgramView = document.getElementById('daily-program-view');
            if (dailyProgramView) {
                // Add animation for a smoother content transition
                dailyProgramView.classList.remove('content-fade-in');
                // This is a trick to restart the CSS animation
                void dailyProgramView.offsetWidth;
                dailyProgramView.classList.add('content-fade-in');

                dailyProgramView.innerHTML = renderDailyProgram(selectedDayForProgram, userProgram);
            }
        }

        // On program page, navigate to product picker for adding an exercise
        const addExerciseButton = e.target.closest('.add-exercise-button');
        if (addExerciseButton) {
            const day = addExerciseButton.dataset.day;
            navigateTo('productPicker', { day });
        }

        // Handle edit avatar button click
        const editAvatarBtn = e.target.closest('#edit-avatar-btn');
        if (editAvatarBtn) {
            document.getElementById('avatar-upload').click();
        } else if (e.target.id === 'avatar-upload') { /* Handled by 'change' listener */ }

        // Handle Logout
        const logoutBtn = e.target.closest('#logout-btn');
        if (logoutBtn) {
            logout();
        }


        // Handle exercise completion toggle
        const completionCheckbox = e.target.closest('.completion-checkbox');
        if (completionCheckbox) {
            const day = completionCheckbox.dataset.day;
            const exerciseId = parseInt(completionCheckbox.dataset.exerciseId);
            const exerciseData = exercises.find(e => e.id === exerciseId);
            const scheduleItem = userProgram.schedule[day].find(item => item.id === exerciseId);

            if (scheduleItem && exerciseData) {
                scheduleItem.completed = !scheduleItem.completed;
                // Kaloriyi ekle veya çıkar
                userProfile.stepData.todayCalories += scheduleItem.completed ? exerciseData.calories : -exerciseData.calories;
                const dailyProgramView = document.getElementById('daily-program-view');
                if (dailyProgramView) {
                    dailyProgramView.innerHTML = renderDailyProgram(day, userProgram);
                    // Pass context for time-sensitive achievements
                    updateCaloriesUI(); // Update calorie UI after re-render
                    checkAndAwardAchievements({ event: 'exercise_completed' });
                    saveProgramToBackend(); // Save program changes to backend
                }
            }
        }

        // Handle deleting an exercise from the program
        const deleteExerciseButton = e.target.closest('.delete-exercise-button');
        if (deleteExerciseButton) {
            const day = deleteExerciseButton.dataset.day;
            const exerciseId = parseInt(deleteExerciseButton.dataset.exerciseId);

            // Filter out the exercise to be deleted
            userProgram.schedule[day] = userProgram.schedule[day].filter(item => item.id !== exerciseId);

            // Re-render the daily program view to reflect the change
            const dailyProgramView = document.getElementById('daily-program-view');
            if (dailyProgramView) {
                dailyProgramView.innerHTML = renderDailyProgram(day, userProgram);
                saveProgramToBackend(); // Save program changes to backend
            }
        }

        // Handle toggling a favorite exercise
        const toggleFavoriteBtn = e.target.closest('.toggle-favorite-btn');
        if (toggleFavoriteBtn) {
            const exerciseId = parseInt(toggleFavoriteBtn.dataset.exerciseId);
            const svg = toggleFavoriteBtn.querySelector('svg');
            const index = userProfile.favorites.indexOf(exerciseId);

            if (index > -1) { // Is a favorite, remove it
                userProfile.favorites.splice(index, 1);
                toggleFavoriteBtn.classList.remove('text-red-500', 'bg-red-50');
                toggleFavoriteBtn.classList.add('text-gray-400');
                svg.setAttribute('fill', 'none');
            } else { // Not a favorite, add it
                userProfile.favorites.push(exerciseId);
                toggleFavoriteBtn.classList.add('text-red-500', 'bg-red-50');
                toggleFavoriteBtn.classList.remove('text-gray-400');
                svg.setAttribute('fill', 'currentColor');
            }
            checkAndAwardAchievements(); // Check for favorite-related achievements
            storage.saveUserData(userProfile, userProgram, achievementsData); // Save changes
        }

        // On exercise picker page, save selections and go back
        const saveProgramButton = e.target.closest('.save-program-button');
        if (saveProgramButton) {
            const day = saveProgramButton.dataset.day;

            const otherProductExercises = userProgram.schedule[day].filter(scheduleItem => {
                const exercise = exercises.find(e => e.id === scheduleItem.id);
                return exercise.productId != currentParams.productId;
            });

            const selectedExercises = [];
            document.querySelectorAll('#main-content input[type="checkbox"]:checked').forEach(checkbox => {
                const exerciseId = parseInt(checkbox.dataset.exerciseId);
                const existingItem = userProgram.schedule[day].find(item => item.id === exerciseId);
                selectedExercises.push({
                    id: exerciseId,
                    completed: existingItem ? existingItem.completed : false
                });
            });

            userProgram.schedule[day] = [...otherProductExercises, ...selectedExercises];

            goBack();
            goBack();
            checkAndAwardAchievements({ event: 'program_updated' });
            saveProgramToBackend(); // Save program changes to backend
        }

        // On My Goal page, save goals
        const saveGoalsBtn = e.target.closest('#save-goals-btn');
        if (saveGoalsBtn) {
            userProfile.stepData.calorieGoal = parseInt(document.getElementById('calorie-goal-input').value) || 0;
            userProfile.stepData.goal = parseInt(document.getElementById('step-goal-input').value) || 0;
            
            storage.saveUserData(userProfile, userProgram, achievementsData);
            updateCaloriesUI();
            updateStepCounterUI();
            checkAndAwardAchievements();
            showToastNotification('Goals saved successfully!');
            goBack();
        }
    });

    // Listener for file input change (delegated from document)
    document.addEventListener('change', e => {
        if (e.target.id === 'avatar-upload') {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const avatarDataUrl = event.target.result;
                    userProfile.avatar = avatarDataUrl;
                    storage.saveAvatar(userProfile.username, avatarDataUrl); // Save to localStorage per user
                    renderPage('profile'); // Re-render the profile page to show the new avatar
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // Listener for input and blur changes (delegated from document)
    document.addEventListener('input', e => {
        // Handle exercise search filtering
        if (e.target.id === 'exercise-search-input') {
            const searchTerm = e.target.value.toLowerCase();
            const exerciseItems = document.querySelectorAll('#exercise-list-container .exercise-item');
            exerciseItems.forEach(item => {
                const itemSearchTerm = item.dataset.searchTerm;
                const isVisible = itemSearchTerm.includes(searchTerm);
                item.style.display = isVisible ? 'flex' : 'none';
            });
        }
    });

    document.addEventListener('blur', (e) => {
        if (e.target.id === 'home-step-goal-input') {
            const newGoal = parseInt(e.target.value) || 0;
            userProfile.stepData.goal = newGoal;
            storage.saveUserData(userProfile, userProgram, achievementsData);
            updateStepCounterUI();
            checkAndAwardAchievements();
            // Reset UI
            const editor = e.target.closest('.goal-editor');
            editor.querySelector('.goal-text').textContent = `Goal: ${newGoal.toLocaleString()}`;
            editor.classList.remove('editing');
            e.target.classList.add('hidden');
            editor.querySelector('.goal-text').classList.remove('hidden');
        }
        if (e.target.id === 'home-calorie-goal-input') {
            const newGoal = parseInt(e.target.value) || 0;
            userProfile.stepData.calorieGoal = newGoal;
            storage.saveUserData(userProfile, userProgram, achievementsData);
            updateCaloriesUI();
            checkAndAwardAchievements();
            // Reset UI
            const editor = e.target.closest('.goal-editor');
            editor.querySelector('.goal-text').textContent = `Goal: ${newGoal.toLocaleString()} kcal`;
            editor.classList.remove('editing');
            e.target.classList.add('hidden');
            editor.querySelector('.goal-text').classList.remove('hidden');
        }
    }, true); // Use capturing to ensure the event is caught

    bottomNav.addEventListener('click', (e) => {
        if (!userProfile) return; // Prevent navigation if not logged in
        const button = e.target.closest('.nav-button');
        if (button && button.dataset.page !== currentPage) {
            // If navigating to the program page, set the selected day to today
            if (button.dataset.page === 'program') {
                const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const today = new Date();
                const todayIndex = today.getDay() - 1; // Monday = 0, Sunday = 6
                selectedDayForProgram = dayOrder[todayIndex < 0 ? 6 : todayIndex];
            }
            // Clear history when navigating via bottom nav
            pageHistory = [{ page: 'home', params: {} }]; // Start history from home
            navigateTo(button.dataset.page); 
        }
    });


    // --- INITIALIZATION ---
    setTimeout(() => {
        // 1. Check if the user is already logged in via token.
        checkAuthStatus();
        // 2. Then, start the splash screen fade-out.
        splashScreen.style.opacity = '0';
        splashScreen.style.pointerEvents = 'none';
    }, 1500);
});