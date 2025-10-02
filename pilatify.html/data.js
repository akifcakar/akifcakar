const products = [
    { id: 1, name: 'Pilates Ring', description: 'Enhance core engagement and tone your muscles.', img: 'https://store.betterme.world/cdn/shop/files/11-11_Better_Me59459_61d2a4cd-7103-49ad-85b5-ef85c3974222_1000x.png?v=1756374191' },
    { id: 2, name: 'Pilates Ball', description: 'Improve balance, stability, and core strength.', img: 'https://cdn.betterme.world/articles/wp-content/uploads/2025/01/ready-3-6.png' },
    { id: 3, name: 'Weight Bands', description: 'Add resistance to sculpt and strengthen.', img: 'https://store.betterme.world/cdn/shop/files/11-11BetterMe62833_1000x.png?v=1756214317' },
    { id: 4, name: 'Resistance Band', description: 'Perfect for stretching and strength training.', img: 'https://store.betterme.world/cdn/shop/files/11-11_Better_Me59689_800x.png?v=1701022140' },
    { id: 5, name: 'Sliding Disc', description: 'Engage your core with smooth gliding.', img: 'https://store.betterme.world/cdn/shop/files/11-25_Better_Me168848_6bce53a3-4e42-4348-a61b-1dc4a04588a4.jpg?v=1738079190' },
];

const exercises = [
    { id: 101, productId: 1, name: 'Inner Thigh Squeeze', muscles: 'Adductors, Core', calories: 15, youtubeId: '1ltZQ9rJiFw', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnk0a2RkcnNkaHUydWwzN2k5bzY3ZnM4Z3drc3p0am5tdTdwYjI4YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPm5t5aI43i2252/giphy.gif', steps: ['1. Lie on your back with knees bent.', '2. Place the Pilates Ring between your thighs.', '3. Squeeze the ring, hold for 3 seconds, and release.'], breathing: 'Exhale as you squeeze, inhale as you release.', tips: ['Focus on slow, controlled movements.', 'Keep your abdominal muscles engaged.'] },
    { id: 102, productId: 1, name: 'Core Crunch', muscles: 'Abdominals', calories: 18, youtubeId: 'AB1A_L2wH8Y', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajY3eHExOWZqZXBqOHgzZWVwY2Y0aXZwNWhxbmVucGttb2dyNzAzOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2f0k6aQ3sDM3cw/giphy.gif', steps: ['1. Lie on your back, holding the ring.', '2. Lift your head and shoulders off the mat.', '3. Pulse the ring as you crunch.'], breathing: 'Exhale on the crunch.', tips: ['Avoid pulling on your neck.', 'Keep your lower back pressed into the mat.'] },
    { id: 103, productId: 1, name: 'Overhead Press', muscles: 'Shoulders, Arms', calories: 20, youtubeId: '2-zgnK8S100', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Sit tall, holding the ring in both hands.', '2. Press the ring overhead, keeping shoulders down.', '3. Return to start with control.'], breathing: 'Exhale as you press up.', tips: ['Keep your core tight to support your back.'] },
    { id: 201, productId: 2, name: 'Ball Bridge', muscles: 'Glutes, Hamstrings', calories: 22, youtubeId: '5_r5pD-dD7U', gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGwxYjM4bGF1c2FucXl0bjh0MXNscXFscGJrZzBrdjY0MXd6bmZtcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2w4SPk0sdA86Y/giphy.gif', steps: ['1. Lie on your back with your feet on the ball.', '2. Lift your hips towards the ceiling.', '3. Lower down with control.'], breathing: 'Exhale as you lift.', tips: ['Squeeze your glutes at the top of the movement.', 'Don\'t let the ball roll side to side.'] },
    { id: 202, productId: 2, name: 'Stability Tuck', muscles: 'Core, Abs', calories: 25, youtubeId: 'sUe_QYT1G5M', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Start in a plank position with shins on the ball.', '2. Use your abs to pull your knees towards your chest.', '3. Extend back to plank position.'], breathing: 'Exhale as you tuck, inhale as you extend.', tips: ['Keep your back flat and avoid sagging.'] },
    { id: 301, productId: 3, name: 'Bicep Curls', muscles: 'Biceps', calories: 18, youtubeId: 'uO_SGAQh684', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Stand with feet shoulder-width apart.', '2. Hold the weight bands with an underhand grip.', '3. Curl the bands up towards your shoulders.'], breathing: 'Exhale on the curl.', tips: ['Keep your elbows tucked into your sides.'] },
    { id: 302, productId: 3, name: 'Glute Kickbacks', muscles: 'Glutes', calories: 20, youtubeId: 'SE_9723gS-s', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Start on all fours with the band around one foot.', '2. Kick the banded leg back and up.', '3. Return slowly to the starting position.'], breathing: 'Exhale as you kick back.', tips: ['Squeeze your glute at the top of the movement.'] },
    { id: 401, productId: 4, name: 'Lateral Band Walk', muscles: 'Glutes, Hips', calories: 22, youtubeId: 'Yv0w_N_2z-A', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Place the band around your ankles or knees.', '2. Lower into a squat position.', '3. Step sideways, keeping tension on the band.'], breathing: 'Breathe steadily throughout.', tips: ['Stay low and keep your feet parallel.'] },
    { id: 402, productId: 4, name: 'Band Pull-Apart', muscles: 'Shoulders, Upper Back', calories: 15, youtubeId: '4B3h-p_0-QA', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Hold the band with both hands, arms straight out.', '2. Pull the band apart by squeezing your shoulder blades.', '3. Return to the start with control.'], breathing: 'Exhale as you pull.', tips: ['Don\'t shrug your shoulders.'] },
    { id: 501, productId: 5, name: 'Sliding Lunges', muscles: 'Quads, Glutes', calories: 28, youtubeId: 'b3p_La5jmM0', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Stand with one foot on a sliding disc.', '2. Slide that foot back into a lunge position.', '3. Use your front leg to pull back to the start.'], breathing: 'Inhale as you slide back, exhale to return.', tips: ['Keep your chest up and front knee over your ankle.'] },
    { id: 502, productId: 5, name: 'Mountain Climbers', muscles: 'Core, Full Body', calories: 35, youtubeId: 'nmwgirg2gaE', gif: 'https://placehold.co/600x400/f0f0f0/333?text=Animation', steps: ['1. Start in a plank position with both feet on discs.', '2. Slide one knee towards your chest at a time.', '3. Keep your core engaged and back flat.'], breathing: 'Exhale with each knee drive.', tips: ['Maintain a quick, steady pace.'] },
];

// This structure holds the initial state for different users.
const initialUserStates = {
    jane: {
        userProfile: {
            username: 'jane',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            avatar: 'https://placehold.co/100x100/fb7185/FFFFFF?text=J&font=raleway',
            age: 28,
            height: 165, // cm
            weight: 68, // kg
            goal: 'Lose Weight', // 'Lose Weight', 'Build Muscle', 'Improve Flexibility'
            weightHistory: [{ date: '2024-05-01', weight: 68 }],
            favorites: [101, 201],
            stepData: {
                todaySteps: 4785,
                todayCalories: 0,
                goal: 10000,
                calorieGoal: 300,
                lastUpdated: new Date().toDateString()
            }
        },
        achievementsData: [
            { id: 1, title: 'First Step', description: 'Complete your first exercise.', icon: '&#127939;', earned: true },
            // ... (all 22 achievements with their initial 'earned' state)
            { id: 2, title: 'Perfect Week', description: 'Complete all workouts for 7 consecutive days.', icon: '&#128170;', earned: false },
            { id: 3, title: 'Early Bird', description: 'Complete a workout before 8 AM.', icon: '&#127749;', earned: false },
            { id: 4, title: 'Consistency King', description: 'Complete workouts for 3 days in a row.', icon: '&#128200;', earned: false },
            { id: 5, title: 'Ring Master', description: 'Complete 5 exercises using the Pilates Ring.', icon: '&#128738;', earned: false },
            { id: 6, title: 'Ball Fanatic', description: 'Complete 5 exercises using the Pilates Ball.', icon: '&#9918;', earned: false },
            { id: 7, title: 'Pilates Beginner', description: 'Complete 5 unique exercises.', icon: '&#127891;', earned: false },
            { id: 8, title: 'Pilates Enthusiast', description: 'Complete 20 unique exercises.', icon: '&#128170;', earned: false },
            { id: 9, title: 'Full Body Flow', description: 'Complete exercises from 3 different equipment types.', icon: '&#128170;', earned: false },
            { id: 10, title: 'Sliding Star', description: 'Complete 5 exercises using the Sliding Disc.', icon: '&#128692;', earned: false },
            { id: 11, title: 'Band Pro', description: 'Complete 5 exercises using Resistance Bands.', icon: '&#127947;', earned: false },
            { id: 12, title: 'Weekend Warrior', description: 'Complete a workout on a Saturday or Sunday.', icon: '&#129336;', earned: false },
            { id: 13, title: 'Core Champion', description: 'Complete 25 core-focused exercises.', icon: '&#127919;', earned: false },
            { id: 14, title: 'Full House', description: 'Use all 5 types of equipment.', icon: '&#127968;', earned: false },
            { id: 15, title: 'Dedicated', description: 'Complete 50 total exercises.', icon: '&#127941;', earned: false },
            { id: 16, title: 'Pilates Pro', description: 'Complete 50 unique exercises.', icon: '&#11088;', earned: false },
            { id: 17, title: 'Favorite Fanatic', description: 'Add 5 exercises to your favorites list.', icon: '&#10084;&#65039;', earned: false },
            { id: 18, title: 'Program Builder', description: 'Schedule at least one exercise for every day of the week.', icon: '&#127959;', earned: false },
            { id: 19, title: 'Weight Band Wizard', description: 'Complete 5 exercises using Weight Bands.', icon: '&#127947;', earned: false },
            { id: 20, title: 'Century Club', description: 'Complete 100 total exercises.', icon: '&#128175;', earned: false },
            { id: 21, title: 'Step Goal Smasher', description: 'Reach your daily step goal.', icon: '&#128099;', earned: false },
            { id: 22, title: 'Calorie Crusher', description: 'Reach your daily calorie goal.', icon: '&#128293;', earned: false },
        ],
        userProgram: {
            name: 'Jane\'s Workout',
            schedule: {
                Mon: [{id: 101, completed: true}, {id: 102, completed: false}],
                Tue: [],
                Wed: [{id: 201, completed: false}, {id: 401, completed: false}, {id: 502, completed: false}],
                Thu: [],
                Fri: [{id: 103, completed: false}, {id: 301, completed: false}, {id: 402, completed: false}],
                Sat: [],
                Sun: []
            }
        }
    },
    john: {
        userProfile: {
            username: 'john',
            name: 'John Smith',
            email: 'john.smith@example.com',
            avatar: 'https://placehold.co/100x100/60a5fa/FFFFFF?text=J&font=raleway',
            age: null,
            height: null,
            weight: null,
            goal: null,
            weightHistory: [],
            favorites: [],
            stepData: {
                todaySteps: 1250,
                todayCalories: 0,
                goal: 8000,
                calorieGoal: 500,
                lastUpdated: new Date().toDateString()
            }
        },
        achievementsData: [
             { id: 1, title: 'First Step', description: 'Complete your first exercise.', icon: '&#127939;', earned: false },
             // ... (all 22 achievements with 'earned: false')
            { id: 2, title: 'Perfect Week', description: 'Complete all workouts for 7 consecutive days.', icon: '&#128170;', earned: false },
            { id: 3, title: 'Early Bird', description: 'Complete a workout before 8 AM.', icon: '&#127749;', earned: false },
            { id: 4, title: 'Consistency King', description: 'Complete workouts for 3 days in a row.', icon: '&#128200;', earned: false },
            { id: 5, title: 'Ring Master', description: 'Complete 5 exercises using the Pilates Ring.', icon: '&#128738;', earned: false },
            { id: 6, title: 'Ball Fanatic', description: 'Complete 5 exercises using the Pilates Ball.', icon: '&#9918;', earned: false },
            { id: 7, title: 'Pilates Beginner', description: 'Complete 5 unique exercises.', icon: '&#127891;', earned: false },
            { id: 8, title: 'Pilates Enthusiast', description: 'Complete 20 unique exercises.', icon: '&#128170;', earned: false },
            { id: 9, title: 'Full Body Flow', description: 'Complete exercises from 3 different equipment types.', icon: '&#128170;', earned: false },
            { id: 10, title: 'Sliding Star', description: 'Complete 5 exercises using the Sliding Disc.', icon: '&#128692;', earned: false },
            { id: 11, title: 'Band Pro', description: 'Complete 5 exercises using Resistance Bands.', icon: '&#127947;', earned: false },
            { id: 12, title: 'Weekend Warrior', description: 'Complete a workout on a Saturday or Sunday.', icon: '&#129336;', earned: false },
            { id: 13, title: 'Core Champion', description: 'Complete 25 core-focused exercises.', icon: '&#127919;', earned: false },
            { id: 14, title: 'Full House', description: 'Use all 5 types of equipment.', icon: '&#127968;', earned: false },
            { id: 15, 'title': 'Dedicated', description: 'Complete 50 total exercises.', icon: '&#127941;', earned: false },
            { id: 16, title: 'Pilates Pro', description: 'Complete 50 unique exercises.', icon: '&#11088;', earned: false },
            { id: 17, title: 'Favorite Fanatic', description: 'Add 5 exercises to your favorites list.', icon: '&#10084;&#65039;', earned: false },
            { id: 18, title: 'Program Builder', description: 'Schedule at least one exercise for every day of the week.', icon: '&#127959;', earned: false },
            { id: 19, title: 'Weight Band Wizard', description: 'Complete 5 exercises using Weight Bands.', icon: '&#127947;', earned: false },
            { id: 20, title: 'Century Club', description: 'Complete 100 total exercises.', icon: '&#128175;', earned: false },
            { id: 21, title: 'Step Goal Smasher', description: 'Reach your daily step goal.', icon: '&#128099;', earned: false },
            { id: 22, title: 'Calorie Crusher', description: 'Reach your daily calorie goal.', icon: '&#128293;', earned: false },
        ],
        userProgram: {
            name: 'John\'s Program',
            schedule: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
        }
    }
};

// This function provides a deep copy of the initial state for a user.
export const getInitialUserData = (username) => {
    if (initialUserStates[username]) {
        // For existing template users like 'jane' or 'john', return a deep copy.
        return JSON.parse(JSON.stringify(initialUserStates[username]));
    }

    // For a brand new user, create a fresh, empty state.
    const newUserState = JSON.parse(JSON.stringify(initialUserStates.john)); // Use 'john' as a blank template
    newUserState.userProfile.username = username;
    newUserState.userProfile.name = ''; // Will be set during registration
    newUserState.userProfile.email = ''; // Will be set during registration
    newUserState.userProfile.avatar = `https://placehold.co/100x100/a78bfa/FFFFFF?text=${username.charAt(0).toUpperCase()}&font=roboto`;
    newUserState.userProfile.age = null;
    newUserState.userProfile.height = null;
    newUserState.userProfile.weight = null;
    newUserState.userProfile.goal = null;
    newUserState.userProfile.weightHistory = [];
    newUserState.userProgram.name = `${username}'s Program`;

    return newUserState;
};

// Export static data
export { products, exercises };
