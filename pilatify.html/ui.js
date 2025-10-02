import { products, exercises } from './data.js';

// --- HELPER FUNCTIONS ---

export const showToastNotification = (message) => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Toast container not found!');
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 opacity-0 transition-all duration-300 transform translate-y-full';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-full');
        toast.classList.add('opacity-100', 'translate-y-0');
    }, 50);

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-full');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
};

export const showAchievementModal = (achievement, onModalCloseCallback) => {
    const container = document.getElementById('achievement-modal-container');
    if (!container) return;

    const modalHTML = `
        <div class="modal fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="achievement-modal-content bg-gradient-to-br from-rose-400 to-orange-300 rounded-3xl p-1 text-center shadow-2xl w-full max-w-xs">
                <div class="bg-white/80 backdrop-blur-lg rounded-[22px] p-6 flex flex-col items-center">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span class="text-5xl">${achievement.icon}</span>
                    </div>
                    <h2 class="text-sm font-bold text-rose-500 uppercase tracking-wider mt-4">Achievement Unlocked</h2>
                    <p class="text-2xl font-extrabold text-gray-800 mt-1">${achievement.title}</p>
                    <p class="text-gray-600 mt-2 text-sm">${achievement.description}</p>
                    <button id="close-achievement-modal" class="mt-6 w-full bg-white text-rose-500 font-bold py-2.5 px-5 rounded-xl shadow-md hover:bg-rose-50 transition-colors">
                        Keep Going!
                    </button>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = modalHTML;

    const modalContent = container.querySelector('.achievement-modal-content');
    const modal = container.querySelector('.modal');

    // Re-introduce the bounce-in animation now that the root cause is fixed
    container.classList.remove('hidden');
    modalContent.classList.add('modal-bounce-in');

    const closeModal = () => {
        modal.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        modal.addEventListener('transitionend', () => {
            container.classList.add('hidden');
            container.innerHTML = '';
            if (onModalCloseCallback) {
                onModalCloseCallback(); // Call the next function in the queue
            }
        }, { once: true });
    };

    container.querySelector('#close-achievement-modal').addEventListener('click', closeModal);
    // Add event listener to close the modal when clicking on the backdrop
    modal.addEventListener('click', (e) => {
        // Only close if the click is on the modal backdrop itself, not on its children (the card)
        if (e.target === modal) {
            closeModal();
        }
    });
};

// Helper for showing error messages on login/register forms
const showFormError = (elementId, message) => {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(() => {
            errorEl.classList.add('hidden');
        }, 3000);
    }
};

export const loginPageTemplate = () => {
    return `
    <div class="p-6 pt-12 page flex flex-col justify-center items-center">
        <svg class="w-12 h-12 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 class="text-2xl font-extrabold text-gray-800 mt-4">Welcome to Pilatify</h1>
        <p class="text-gray-500 mt-2">Sign in to continue your journey.</p>

        <div class="mt-6 w-full max-w-xs space-y-3">
            <input type="text" id="login-username" placeholder="Username (try 'jane')" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <input type="password" id="login-password" placeholder="Password (try 'password')" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <p id="login-error" class="text-red-500 text-sm hidden"></p>
            <button id="login-submit-btn" class="w-full bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity">
                Login
            </button>
            <p class="text-sm text-gray-500 text-center">
                Don't have an account? <a href="#" id="go-to-register" class="text-rose-500 font-semibold hover:underline">Register here</a>
            </p>
            <p class="text-sm text-gray-500 text-center pt-1">
                Or <a href="#" id="login-as-guest" class="text-rose-500 font-semibold hover:underline">Continue as a Guest</a>
            </p>
        </div>

        <div class="mt-6 w-full max-w-xs space-y-3">
            <div class="relative flex py-4 items-center">
                <div class="flex-grow border-t border-gray-300"></div>
                <span class="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
                <div class="flex-grow border-t border-gray-300"></div>
            </div>
            <button class="flex items-center justify-center w-full py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Continue with Google">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 48 48" role="img" aria-labelledby="google-logo"><title id="google-logo">Google logo</title><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.696,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                <span class="font-semibold text-gray-700 text-sm">Google</span>
            </button>
        </div>
    </div>
    `;
};

export const registerPageTemplate = () => {
    return `
    <div class="p-6 pt-12 page flex flex-col justify-center items-center">
        <svg class="w-12 h-12 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
        <h1 class="text-2xl font-extrabold text-gray-800 mt-4">Join Pilatify</h1>
        <p class="text-gray-500 mt-2">Create your account to start your fitness journey.</p>

        <div class="mt-6 w-full max-w-xs space-y-3">
            <input type="text" id="register-username" placeholder="Username" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <input type="text" id="register-name" placeholder="Full Name" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <input type="email" id="register-email" placeholder="Email" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <input type="password" id="register-password" placeholder="Password" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <input type="password" id="register-confirm-password" placeholder="Confirm Password" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
            <p id="register-error" class="text-red-500 text-sm hidden"></p>
            <button id="register-submit-btn" class="w-full bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity">
                Register
            </button>
            <p class="text-sm text-gray-500 text-center">
                Already have an account? <a href="#" id="go-to-login" class="text-rose-500 font-semibold hover:underline">Login here</a>
            </p>
        </div>
    </div>
    `;
};

export const onboardingPageTemplate = (step = 1, userProfile = {}) => {
    const steps = [
        {
            icon: '🎂',
            title: "Let's get to know you",
            subtitle: "Your age helps us tailor recommendations.",
            input: `<input type="number" id="onboarding-age" placeholder="Enter your age" class="w-full text-center text-xl font-bold p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors">`,
            buttonText: "Next"
        },
        {
            icon: '📏',
            title: "What's your height and weight?",
            subtitle: "This is for calculating metrics like BMI. You can update your weight later.",
            input: `<div class="flex gap-3">
                        <input type="number" id="onboarding-height" placeholder="Height (cm)" class="w-1/2 text-center text-lg font-bold p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors">
                        <input type="number" id="onboarding-weight" placeholder="Weight (kg)" class="w-1/2 text-center text-lg font-bold p-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors">
                    </div>`,
            buttonText: "Next"
        },
        {
            icon: '🎯',
            title: "What's your primary goal?",
            subtitle: "Choose the one that best describes your ambition.",
            input: `<div class="space-y-2">
                        <button class="onboarding-goal-btn w-full p-3 text-left font-semibold bg-gray-100 rounded-xl border-2 border-transparent hover:border-rose-300 transition-colors" data-goal="Lose Weight">🥑 Lose Weight</button>
                        <button class="onboarding-goal-btn w-full p-3 text-left font-semibold bg-gray-100 rounded-xl border-2 border-transparent hover:border-rose-300 transition-colors" data-goal="Build Muscle">💪 Build Muscle</button>
                        <button class="onboarding-goal-btn w-full p-3 text-left font-semibold bg-gray-100 rounded-xl border-2 border-transparent hover:border-rose-300 transition-colors" data-goal="Improve Flexibility">🧘 Improve Flexibility</button>
                    </div>`,
            buttonText: "Finish & Start"
        },
        {
            icon: '🎉',
            title: `You're all set, ${userProfile.name.split(' ')[0]}!`,
            subtitle: "We've personalized your experience. Let's begin your journey to a stronger you.",
            input: `<div class="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <p class="text-xs text-emerald-700">Your initial BMI</p>
                        <p class="text-3xl font-extrabold text-emerald-800">${(userProfile.weight / ((userProfile.height / 100) ** 2)).toFixed(1)}</p>
                    </div>`,
            buttonText: "Let's Go!"
        }
    ];

    const currentStep = steps[step - 1];

    return `
    <div class="p-6 pt-12 page flex flex-col justify-center items-center text-center">
        <div class="text-5xl mb-4">${currentStep.icon}</div>
        <h1 class="text-2xl font-extrabold text-gray-800">${currentStep.title}</h1>
        <p class="text-gray-500 mt-2 max-w-xs">${currentStep.subtitle}</p>

        <div class="mt-8 w-full max-w-xs">
            ${currentStep.input}
            <p id="onboarding-error" class="text-red-500 text-sm hidden mt-2"></p>
        </div>

        <div class="mt-auto w-full max-w-xs pb-6">
             <button id="onboarding-next-btn" data-step="${step}" class="w-full bg-rose-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity">
                ${currentStep.buttonText}
            </button>
        </div>
    </div>
    `;
};

const getDayBadgeContent = (day, userProgram) => {
    const totalCount = userProgram.schedule[day]?.length || 0;
    if (totalCount === 0) return '';

    const remainingCount = userProgram.schedule[day].filter(item => !item.completed).length;

    if (remainingCount === 0) {
        return `<span class="absolute flex h-4 w-4 items-center justify-center rounded-full bg-rose-500" style="top: -4px; right: -4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>`;
    }
    return `<span class="absolute flex h-4 w-4 items-center justify-center rounded-full bg-rose-300 text-xs font-bold text-rose-700" style="top: -4px; right: -4px;">${remainingCount}</span>`;
};

export const homePageTemplate = (userProfile, userProgram, achievementsData) => {
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayOrderFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const todayIndex = today.getDay() - 1; // Monday = 0
    const todayShort = dayOrder[todayIndex < 0 ? 6 : todayIndex];
    const todayFull = dayOrderFull[todayIndex < 0 ? 6 : todayIndex];

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(today);
    
    const todaysExercises = userProgram.schedule[todayShort] || [];
    
    const quotes = [
        "The body achieves what the mind believes.",
        "A little progress each day adds up to big results.",
        "Contrology develops the body uniformly, corrects wrong postures, restores physical vitality.",
        "The journey of a thousand miles begins with a single step."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const latestAchievement = [...achievementsData].reverse().find(a => a.earned);
    const earnedCount = achievementsData.filter(a => a.earned).length;
    const firstName = userProfile.name.split(' ')[0];


    let todayCardContent = '';
    if (todaysExercises.length > 0) {
        const remainingExercises = todaysExercises.filter(ex => !ex.completed).length;
        if (remainingExercises === 0) {
            todayCardContent = `
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-bold text-lg">Workout Complete!</h2>
                        <p class="text-xs opacity-90">You crushed it! Rest up and come back stronger.</p>
                    </div>
                    <div class="bg-white/20 w-12 h-12 flex items-center justify-center rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                </div>
            `;
        } else {
            todayCardContent = `
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="font-bold text-lg">Today's Workout</h2>
                        <p class="text-sm opacity-90">${remainingExercises} of ${todaysExercises.length} exercises left</p>
                    </div>
                    <button class="start-workout-btn bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105" data-day="${todayShort}">
                        Start
                    </button>
                </div>
            `;
        }
    } else {
         todayCardContent = `
            <h2 class="font-bold text-lg">It's a Rest Day!</h2>
            <p class="text-sm mt-1 opacity-90">Rest is key to building strength. Enjoy it!</p>
         `;
    }

    return `
    <div class="p-6 pt-12 page">
        <div class="flex items-center">
            <img src="${userProfile.avatar}" class="w-12 h-12 rounded-full mr-4 object-cover shadow-md">
            <div>
                <h1 class="text-2xl font-extrabold text-gray-800">Hello, ${firstName}!</h1>
                <p class="font-semibold text-rose-500 mt-1">${formattedDate}</p>
            </div>
        </div>
        <p class="text-gray-500 mt-2">Ready to strengthen your core today?</p>
        
        <div class="mt-6 bg-gradient-to-br from-rose-400 to-orange-300 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20">
            ${todayCardContent}
        </div>
        
        <div class="mt-8 mb-4">
            <h3 class="font-bold text-base text-gray-800 mb-3">Your Week</h3>
            <div class="flex justify-between items-stretch gap-1">
                ${dayOrder.map((day, index) => {
                    const currentDate = new Date();
                    const dayDiff = index - (todayIndex < 0 ? 6 : todayIndex);
                    currentDate.setDate(currentDate.getDate() + dayDiff);
                    const dateOfMonth = currentDate.getDate();
                    
                    const daySchedule = userProgram.schedule[day];
                    const hasWorkout = daySchedule && daySchedule.length > 0;
                    const isCompleted = hasWorkout && daySchedule.every(item => item.completed);
                    const isToday = day === todayShort;
                    
                    let containerClasses = 'bg-gray-100';
                    let dateClasses = 'text-gray-700';
                    let dayClasses = 'text-gray-400';
                    let statusIndicator = '';
                    
                    if (isToday) {
                        containerClasses = 'bg-rose-500 shadow-md shadow-rose-500/20';
                        dateClasses = 'text-white';
                        dayClasses = 'text-rose-100';
                    } else { // Only add status indicator if it's not today, as today is already visually distinct
                        if (isCompleted) {
                            statusIndicator = `<div class="w-2 h-2 rounded-full bg-rose-400 mt-1"></div>`;
                        } else if (hasWorkout) {
                            statusIndicator = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-orange-400 mt-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
                        } else { // Rest day
                            statusIndicator = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mt-1"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
                        }
                    }
                    return `
                    <div data-day="${day}" class="go-to-program-day cursor-pointer flex-1 flex flex-col justify-between items-center p-2 h-16 rounded-xl transition-all duration-300 ${containerClasses}">
                        <div class="text-center">
                            <span class="font-bold text-base ${dateClasses}">${dateOfMonth}</span>
                            <span class="block text-[9px] font-semibold uppercase ${dayClasses}">${day}</span>
                        </div>
                        <div class="h-3 flex items-center justify-center">${statusIndicator}</div>
                    </div>
                    `
                }).join('')}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-6">
            <div>
                <h3 class="font-bold text-base text-gray-800 mb-2">Daily Steps</h3>
                <div class="bg-white p-3 rounded-2xl shadow-md shadow-gray-900/5 border border-gray-100 flex">
                    <div class="relative w-10 h-10 mr-3 flex-shrink-0">
                        <svg class="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)"><path class="text-gray-200" stroke="currentColor" stroke-width="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path id="step-progress-ring" class="text-sky-500" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>
                        <div id="step-icon-container" class="absolute inset-0 flex items-center justify-center"><span class="text-lg text-sky-500">&#128099;</span></div>
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-baseline">
                            <p class="font-bold text-base text-gray-800 leading-tight"><span id="step-count-text">...</span></p>
                            <div id="step-permission-status" class="hidden text-xs text-gray-400 p-1 rounded-md bg-gray-100 cursor-pointer">
                                Start
                            </div>
                        </div>
                        <div class="goal-editor text-xs text-gray-500 leading-tight" data-goal-type="step">
                            <span class="goal-text">Goal: ${userProfile.stepData.goal.toLocaleString()}</span>
                            <input type="number" id="home-step-goal-input" value="${userProfile.stepData.goal}" class="goal-input hidden">
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="font-bold text-base text-gray-800 mb-2">Calories Burned</h3>
                <div class="bg-white p-3 rounded-2xl shadow-md shadow-gray-900/5 border border-gray-100 flex">
                    <div class="relative w-10 h-10 mr-3 flex-shrink-0">
                        <svg class="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)"><path class="text-gray-200" stroke="currentColor" stroke-width="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path id="calorie-progress-ring" class="text-orange-400" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>
                        <div id="calorie-icon-container" class="absolute inset-0 flex items-center justify-center"><span class="text-lg">🔥</span></div>
                    </div>
                    <div class="flex-grow">
                        <p class="font-bold text-base text-gray-800 leading-tight"><span id="calorie-count-text">...</span> <span class="text-xs font-medium">kcal</span></p>
                        <div class="goal-editor text-xs text-gray-500 leading-tight" data-goal-type="calorie">
                            <span class="goal-text">Goal: ${userProfile.stepData.calorieGoal.toLocaleString()} kcal</span>
                            <input type="number" id="home-calorie-goal-input" value="${userProfile.stepData.calorieGoal}" class="goal-input hidden">
                        </div>
                    </div>
                </div>
            </div>
        </div>

         <div class="mt-6">
            <h3 class="font-bold text-base text-gray-800 mb-2">Latest Achievement</h3>
            <div data-page="achievements" class="profile-option bg-white p-3 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-rose-300 transition-colors flex items-center">
                <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl mr-4">${latestAchievement.icon}</div>
                <div>
                    <p class="font-semibold text-gray-700">${latestAchievement.title}</p>
                    <p class="text-xs text-gray-400">You've earned ${earnedCount} badges so far!</p>
                </div>
                <svg class="ml-auto text-gray-300" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </div>
        
         <div class="mt-6 text-center bg-gray-50 p-3 rounded-xl">
            <p class="text-sm italic text-gray-600">"${randomQuote}"</p>
        </div>

    </div>
`;
}

export const exercisesPageTemplate = () => `
    <div class="p-6 pt-12 page">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-extrabold text-gray-800">Choose Equipment</h1>
            <p class="text-gray-500 mt-1">Select an equipment to see available exercises.</p>
        </div>
        <div class="space-y-2">
            ${products.map(p => {
                const count = exercises.filter(e => e.productId === p.id).length;
                return `
                <div class="product-card flex items-center p-2.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 rounded-xl transition-colors" data-product-id="${p.id}">
                    <img src="${p.img}" alt="${p.name}" class="w-16 h-16 object-cover rounded-xl mr-4">
                    <div class="flex-grow">
                        <h3 class="text-base font-bold text-gray-800">${p.name}</h3>
                        <p class="text-sm text-gray-500">${count} exercises</p>
                    </div>
                    <svg class="ml-auto text-gray-300" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
                `
            }).join('')}
        </div>
    </div>
`;

export const exerciseListPageTemplate = (productId) => {
    const product = products.find(p => p.id == productId);
    const productExercises = exercises.filter(e => e.productId == productId);
    return `
        <div class="p-6 pt-24 page">
            <h1 class="text-2xl font-extrabold text-gray-800">${product.name}</h1>
            <p class="text-gray-500 mt-1">Found ${productExercises.length} exercises.</p>

            <div class="mt-6 relative">
                <input type="text" id="exercise-search-input" placeholder="Search exercises..." class="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-2 border-transparent focus:border-rose-300 focus:ring-0 transition-colors text-sm">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            <div id="exercise-list-container" class="space-y-3 mt-6">
                ${productExercises.length > 0 ? productExercises.map(e => `
                    <div class="exercise-item flex items-center bg-white border border-gray-100 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-rose-400" 
                         data-exercise-id="${e.id}"
                         data-search-term="${e.name.toLowerCase()} ${e.muscles.toLowerCase()}">
                        <div class="flex-grow">
                            <h4 class="font-semibold text-gray-800">${e.name}</h4>
                            <p class="text-sm text-gray-500">${e.muscles}</p>
                        </div>
                        <svg class="ml-auto text-gray-300" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                `).join('') : `<p class="text-center text-gray-500 mt-8">No exercises found for this product yet.</p>`}
            </div>
        </div>
    `;
};

export const exerciseDetailPageTemplate = (exerciseId, userProfile) => {
    const exercise = exercises.find(e => e.id == exerciseId);
    const isFavorite = userProfile.favorites.includes(parseInt(exerciseId));
    return `
        <div class="page pt-12">
            ${exercise.youtubeId ? `
            <div class="w-full aspect-video bg-gray-200">
                 <iframe class="w-full h-full" src="https://www.youtube.com/embed/${exercise.youtubeId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            ` : `
            <img src="${exercise.gif}" class="w-full h-64 object-cover bg-gray-200">
            `}
            <div class="p-6 pb-24 bg-white rounded-t-3xl relative">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-xl font-extrabold text-gray-800">${exercise.name}</h2>
                        <p class="gradient-text font-semibold">${exercise.muscles}</p>
                    </div>
                    <button class="toggle-favorite-btn p-3 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}" data-exercise-id="${exercise.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                </div>

                 <div class="mt-6 grid grid-cols-3 gap-3 text-center">
                    <div class="bg-gray-50 rounded-xl p-3">
                        <p class="text-sm text-gray-500">Duration</p>
                        <p class="font-bold text-gray-800 text-base mt-1">15 min</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                        <p class="text-sm text-gray-500">Reps</p>
                        <p class="font-bold text-gray-800 text-base mt-1">3 x 12</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                        <p class="text-sm text-gray-500">Calories</p>
                        <p class="font-bold text-gray-800 text-base mt-1">~${exercise.calories} kcal</p>
                    </div>
                </div>
                
                <div class="mt-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div class="flex items-center text-gray-800 mb-4">
                         <svg class="w-6 h-6 mr-3 text-rose-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/></svg>
                         <h3 class="font-bold text-base">Instructions</h3>
                    </div>
                    <ul class="space-y-4 text-gray-600">
                        ${exercise.steps.map((step, index) => `<li class="flex items-start"><span class="bg-gradient-to-br from-rose-400 to-orange-300 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mr-3 mt-0.5 flex-shrink-0">${index + 1}</span><span class="flex-1">${step.substring(step.indexOf('.') + 2)}</span></li>`).join('')}
                    </ul>
                </div>

                <div class="space-y-3 mt-4">
                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                         <div class="flex items-center text-gray-800">
                             <svg class="w-5 h-5 mr-2 text-rose-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a4 4 0 0 0-4-4m16 0a4 4 0 0 0-4-4m0 0V4m0 8v8m-4-4H4m16 0h-4m-4-4a4 4 0 0 0 4-4"/></svg>
                             <h4 class="font-semibold text-sm">Breathing</h4>
                         </div>
                         <p class="text-sm text-gray-600 mt-2">${exercise.breathing}</p>
                    </div>
                     <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                         <div class="flex items-center text-gray-800">
                             <svg class="w-5 h-5 mr-2 text-rose-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                             <h4 class="font-semibold text-sm">Pro Tips</h4>
                         </div>
                          <ul class="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                            ${exercise.tips ? exercise.tips.map(tip => `<li>${tip}</li>`).join('') : '<li>Follow the instructions carefully.</li>'}
                          </ul>
                    </div>
                </div>

            </div>
        </div>
    `;
};

export const programPageTemplate = (selectedDayForProgram, userProgram) => {
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // --- Date Calculation for the current week ---
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // Sunday: 0, Monday: 1
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date();
    monday.setDate(today.getDate() + diffToMonday);

    return `
    <div class="page pt-12">
        <div class="px-6 flex justify-between items-center">
            <h1 class="text-2xl font-extrabold text-gray-800">My Program</h1>
        </div>
        
        <div class="mt-6 px-4">
            <div id="day-selector-container" class="flex items-center pt-2 pb-3 gap-x-1">
                ${dayOrder.map((day, index) => {
                    const currentDate = new Date(monday);
                    currentDate.setDate(monday.getDate() + index);
                    const dateOfMonth = currentDate.getDate();

                    const badgeContent = getDayBadgeContent(day, userProgram);
                    return `
                    <button class="day-selector-button relative w-0 flex-1 h-12 flex flex-col justify-center items-center rounded-lg transition-colors ${selectedDayForProgram === day ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}" data-day="${day}">
                        <span class="font-bold text-sm leading-none">${dateOfMonth}</span>
                        <span class="text-[9px] uppercase font-semibold opacity-80 mt-1">${day}</span>
                        ${badgeContent}
                    </button>
                    `
                }).join('')}
            </div>
        </div>

        <div class="p-6" id="daily-program-view">
            ${renderDailyProgram(selectedDayForProgram, userProgram)}
        </div>
    </div>
    `;
};

export const renderDailyProgram = (day, userProgram) => {
    const dailySchedule = userProgram.schedule[day];
    if (!dailySchedule || dailySchedule.length === 0) {
        return `
            <div class="text-center py-8 bg-gray-50 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-300"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                <h3 class="mt-4 text-base font-semibold text-gray-700">Time to Recharge!</h3>
                <p class="mt-1 text-sm text-gray-500">Rest is just as important as the workout.</p>
            </div>
            <button class="add-exercise-button mt-4 w-full text-center py-2.5 text-white font-bold bg-rose-500 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity" data-day="${day}">
                + Add Exercise
            </button>
        `;
    }
    
    const completedCount = dailySchedule.filter(ex => ex.completed).length;
    const totalCount = dailySchedule.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return `
        <div class="mb-4">
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-semibold text-gray-600">Daily Progress</span>
                <span class="text-sm font-bold text-rose-600">${completedCount}/${totalCount}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-orange-300 to-rose-500 h-2 rounded-full progress-bar-inner" style="width: ${progressPercentage}%"></div>
            </div>
        </div>
        <div class="space-y-3">
            ${dailySchedule.map(scheduleItem => {
                const exerciseDetail = exercises.find(ex => ex.id === scheduleItem.id);
                const productDetail = products.find(p => p.id === exerciseDetail.productId);
                return `
                <div class="daily-exercise-item flex items-center border border-gray-100 rounded-xl p-3 transition-all duration-300 ${scheduleItem.completed ? 'bg-emerald-50 opacity-60' : 'bg-white'}">
                    <input type="checkbox" id="ex-complete-${scheduleItem.id}" data-exercise-id="${scheduleItem.id}" data-day="${day}" class="completion-checkbox h-5 w-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500 custom-checkbox flex-shrink-0 mr-4" ${scheduleItem.completed ? 'checked' : ''}>
                    <img src="${productDetail.img}" alt="${productDetail.name}" class="w-12 h-12 object-cover rounded-lg flex-shrink-0 mr-3 bg-gray-100">
                    <div class="flex-grow cursor-pointer exercise-item" data-exercise-id="${scheduleItem.id}">
                        <h4 class="font-semibold text-gray-800 ${scheduleItem.completed ? 'line-through' : ''}">${exerciseDetail.name}</h4>
                        <p class="text-sm text-gray-500">${exerciseDetail.muscles}</p>
                    </div>
                    <button class="delete-exercise-button ml-2 p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" data-exercise-id="${scheduleItem.id}" data-day="${day}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
                `
            }).join('')}
        </div>
        <button class="add-exercise-button mt-4 w-full text-center py-2.5 text-white font-bold bg-rose-500 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity" data-day="${day}">
            + Add Exercise
        </button>
    `;
};

export const productPickerPageTemplate = (day) => {
     return `
        <div class="p-6 pt-24 page">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Select Equipment</h2>
            <div class="space-y-2">
            ${products.map(p => `
                <div class="product-picker-card cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex items-center p-3" data-product-id="${p.id}" data-day="${day}">
                    <img src="${p.img}" alt="${p.name}" class="w-20 h-20 object-cover rounded-xl flex-shrink-0">
                    <div class="pl-3 flex-grow">
                        <h3 class="font-bold text-gray-800">${p.name}</h3>
                    </div>
                    <svg class="ml-2 text-gray-300 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
            `).join('')}
            </div>
        </div>
    `;
};

export const exercisePickerPageTemplate = (day, productId, userProgram) => {
    const currentExerciseIds = userProgram.schedule[day].map(item => item.id);
    const availableExercises = exercises.filter(ex => ex.productId == productId);
    const product = products.find(p => p.id == productId);

    return `
    <div class="p-6 pt-24 page">
        <h2 class="text-xl font-bold text-gray-800 mb-1">Select Exercises</h2>
        <p class="text-gray-500 mb-4">Using: ${product.name}</p>
        <div class="space-y-2 pb-36">
        ${availableExercises.map(ex => `
            <label for="ex-${ex.id}" class="flex items-center bg-white p-3 rounded-xl border border-gray-100 cursor-pointer has-[:checked]:bg-rose-400/10 has-[:checked]:border-rose-400">
                <div class="flex-grow">
                    <h4 class="font-semibold text-gray-800">${ex.name}</h4>
                    <p class="text-sm text-gray-500">${ex.muscles}</p>
                </div>
                <input type="checkbox" id="ex-${ex.id}" data-exercise-id="${ex.id}" class="h-5 w-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500 custom-checkbox" ${currentExerciseIds.includes(ex.id) ? 'checked' : ''}>
            </label>
        `).join('')}
        </div>
        <div class="absolute bottom-16 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-10" style="max-width: 430px; margin: 0 auto;">
             <button class="save-program-button w-full bg-rose-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-rose-500/30 transition-transform transform hover:scale-105" data-day="${day}" data-product-id="${productId}">
                Save to Program
             </button>
        </div>
    </div>
    `;
};

export const myGoalPageTemplate = (userProfile) => `
    <div class="p-6 pt-24 page">
        <h1 class="text-2xl font-extrabold text-gray-800">My Goal</h1>
        <p class="text-gray-500 mt-1">Set your daily targets to stay motivated.</p>

        <div class="mt-8 space-y-6">
            <div>
                <label for="calorie-goal-input" class="flex items-center text-base font-bold text-gray-700 mb-2">
                    <span class="text-xl mr-3">🔥</span> Daily Calorie Goal
                </label>
                <input type="number" id="calorie-goal-input" value="${userProfile.stepData.calorieGoal}" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent text-base font-bold text-gray-800 focus:border-rose-300 focus:ring-0 transition-colors">
            </div>

            <div>
                <label for="step-goal-input" class="flex items-center text-base font-bold text-gray-700 mb-2">
                    <span class="text-xl mr-3">&#128099;</span> Daily Step Goal
                </label>
                <input type="number" id="step-goal-input" value="${userProfile.stepData.goal}" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent text-base font-bold text-gray-800 focus:border-rose-300 focus:ring-0 transition-colors">
            </div>
        </div>

        <div id="goal-saved-toast" class="fixed bottom-28 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 pointer-events-none">
            Goal saved!
        </div>

        <div class="mt-auto pt-6 pb-6">
            <button id="save-goals-btn" class="w-full bg-rose-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Changes
            </button>
        </div>
    </div>
`;

export const favoritesPageTemplate = (userProfile) => {
    const favoriteExercises = exercises.filter(ex => userProfile.favorites.includes(ex.id));

    return `
        <div class="p-6 pt-24 page">
            <h1 class="text-2xl font-extrabold text-gray-800">Favorite Exercises</h1>
            ${favoriteExercises.length > 0 ? `
                <div class="space-y-2 mt-6">
                    ${favoriteExercises.map(e => `
                        <div class="exercise-item flex items-center bg-white border border-gray-100 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-rose-400" data-exercise-id="${e.id}">
                            <div class="flex-grow">
                                <h4 class="font-semibold text-gray-800">${e.name}</h4>
                                <p class="text-sm text-gray-500">${e.muscles}</p>
                            </div>
                            <svg class="ml-auto text-gray-300" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                    `).join('')}
                </div>
            ` : `<p class="text-center text-gray-500 mt-8">You haven't added any favorite exercises yet.</p>`}
        </div>
    `;
};

export const achievementsPageTemplate = (achievementsData) => {
     const earnedCount = achievementsData.filter(a => a.earned).length;
     const totalCount = achievementsData.length;
    return `
    <div class="p-6 pt-12 page">
        <h1 class="text-2xl font-extrabold text-gray-800">Your Achievements</h1>
        <p class="text-gray-500 mt-1">You've unlocked ${earnedCount} of ${totalCount} badges. Keep going!</p>
        <div class="grid grid-cols-2 gap-3 mt-8">
            ${achievementsData.map(ach => `
                <div class="rounded-2xl p-3 text-center border ${ach.earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}">
                    <div class="text-4xl ${ach.earned ? '' : 'opacity-25'}">${ach.icon}</div>
                    <h3 class="font-bold mt-2 text-sm ${ach.earned ? 'text-amber-800' : 'text-gray-500'}">${ach.title}</h3>
                    <p class="text-xs mt-1 ${ach.earned ? 'text-amber-700' : 'text-gray-400'}">${ach.description}</p>
                </div>
            `).join('')}
        </div>
    </div>
`;
}

export const updateStatsPageTemplate = (userProfile) => { // Renamed from updateWeightPageTemplate
    return `
    <div class="p-6 pt-24 page flex flex-col">
        <h1 class="text-2xl font-extrabold text-gray-800">Update Your Stats</h1>
        <p class="text-gray-500 mt-1">Keep your profile information up to date.</p>

        <div class="mt-8 space-y-6">
            <div>
                <label for="update-name-input" class="text-base font-bold text-gray-700 mb-2">👤 Full Name</label>
                <input type="text" id="update-name-input" value="${userProfile.name || ''}" placeholder="e.g., Jane Doe" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent text-base font-bold text-gray-800 focus:border-rose-300 focus:ring-0 transition-colors">
            </div>
            <div>
                <label for="update-age-input" class="text-base font-bold text-gray-700 mb-2">🎂 Age</label>
                <input type="number" id="update-age-input" value="${userProfile.age || ''}" placeholder="e.g., 28" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent text-base font-bold text-gray-800 focus:border-rose-300 focus:ring-0 transition-colors">
            </div>
            <div>
                <label for="update-height-input" class="text-base font-bold text-gray-700 mb-2">📏 Height (cm)</label>
                <input type="number" id="update-height-input" value="${userProfile.height || ''}" placeholder="e.g., 165" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent text-base font-bold text-gray-800 focus:border-rose-300 focus:ring-0 transition-colors">
            </div>
            <div>
                <label for="update-weight-input" class="text-base font-bold text-gray-700 mb-2">⚖️ Weight (kg)</label>
                <input type="number" id="update-weight-input" value="${userProfile.weight || ''}" placeholder="e.g., 68.5" class="w-full p-3 bg-gray-100 rounded-xl border-2 border-transparent text-base font-bold text-gray-800 focus:border-rose-300 focus:ring-0 transition-colors">
            </div>
            <p id="update-stats-error" class="text-red-500 text-sm hidden pt-0"></p>
        </div>

        <div class="mt-auto pt-6 pb-6">
            <button id="save-stats-btn" class="w-full bg-rose-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-rose-500/30 hover:opacity-90 transition-opacity flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Changes
            </button>
        </div>
    </div>
    `;
};

export const progressPageTemplate = (userProfile) => {
    const { weight, height, weightHistory } = userProfile;
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : weight;
    const weightChange = weight - startWeight;

    return `
    <div class="p-6 pt-24 page">
        <h1 class="text-2xl font-extrabold text-gray-800">My Progress</h1>
        <p class="text-gray-500 mt-1">Track your body stats over time.</p>

        <div class="mt-8 grid grid-cols-3 gap-3 text-center">
            <div class="bg-gray-50 rounded-xl p-3"><p class="text-sm text-gray-500">Weight</p><p class="font-bold text-gray-800 text-base mt-1">${weight} kg</p></div>
            <div class="bg-gray-50 rounded-xl p-3"><p class="text-sm text-gray-500">BMI</p><p class="font-bold text-gray-800 text-base mt-1">${bmi}</p></div>
            <div class="bg-gray-50 rounded-xl p-3"><p class="text-sm text-gray-500">Change</p><p class="font-bold text-base mt-1 ${weightChange > 0 ? 'text-red-500' : 'text-green-500'}">${weightChange.toFixed(1)} kg</p></div>
        </div>

        <h3 class="font-bold text-base text-gray-800 mt-8 mb-4">Weight History</h3>
        <div class="space-y-2">
            ${weightHistory.slice().reverse().map(entry => `
                <div class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                    <span class="font-semibold text-gray-600">${new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span class="font-bold text-gray-800">${entry.weight} kg</span>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

export const profilePageTemplate = (userProfile, achievementsData) => {
    const earnedCount = achievementsData.filter(a => a.earned).length;
    const favoritesCount = userProfile.favorites.length;
    const { weight, height, age } = userProfile;
    const bmi = (weight && height) ? (weight / ((height / 100) ** 2)).toFixed(1) : 'N/A';

    return `
    <div class="p-6 pt-12 page">
        <div class="flex flex-col items-center">
            <div class="relative">
                <input type="file" id="avatar-upload" class="hidden" accept="image/*">
                <img id="profile-avatar-img" src="${userProfile.avatar}" class="w-20 h-20 rounded-full shadow-lg object-cover">
                <button id="edit-avatar-btn" class="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
            </div>
            <h2 class="text-xl font-bold mt-3">${userProfile.name}</h2>
            <p class="text-sm text-gray-500">${userProfile.email}</p>
        </div>

        <div class="mt-8 grid grid-cols-3 gap-3 text-center">
            <div class="bg-gray-50 rounded-xl p-3"><p class="text-sm text-gray-500">Weight</p><p class="font-bold text-gray-800 text-base mt-1">${weight || 'N/A'} kg</p></div>
            <div class="bg-gray-50 rounded-xl p-3"><p class="text-sm text-gray-500">Height</p><p class="font-bold text-gray-800 text-base mt-1">${height || 'N/A'} cm</p></div>
            <div class="bg-gray-50 rounded-xl p-3"><p class="text-sm text-gray-500">BMI</p><p class="font-bold text-gray-800 text-base mt-1">${bmi}</p></div>
        </div>

        <div class="mt-4 px-4">
            <button id="update-stats-btn" class="w-full text-center py-2.5 text-sm text-rose-500 font-bold bg-rose-100 rounded-xl hover:bg-rose-200 transition-colors">
                Update Profile
            </button>
        </div>

        <div class="mt-8 space-y-2">
            <div data-page="myGoal" class="profile-option flex items-center bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="bg-rose-100 p-2 rounded-lg"><svg class="w-5 h-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <span class="font-medium text-gray-700 ml-4">My Goal</span>
                <span class="ml-auto font-semibold text-rose-500">Strength <svg class="inline w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </div>
             <div data-page="favorites" class="profile-option flex items-center bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="bg-red-100 p-2 rounded-lg"><svg class="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>
                <span class="font-medium text-gray-700 ml-4">Favorite Exercises</span>
                <span class="ml-auto font-semibold text-gray-500">${favoritesCount} <svg class="inline w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </div>
             <div data-page="achievements" class="profile-option flex items-center bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="bg-amber-100 p-2 rounded-lg"><svg class="w-5 h-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
                <span class="font-medium text-gray-700 ml-4">Achievements</span>
                <span class="ml-auto font-semibold text-gray-500">🏆 ${earnedCount} <svg class="inline w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </div>
            <div data-page="progress" class="profile-option flex items-center bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div class="bg-sky-100 p-2 rounded-lg"><svg class="w-5 h-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></div>
                <span class="font-medium text-gray-700 ml-4">My Progress</span>
                <span class="ml-auto font-semibold text-gray-500"><svg class="inline w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </div>
        </div>
    </div>
`;
};