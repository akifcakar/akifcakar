/**
 * localStorage ile ilgili tüm işlemleri yöneten modül.
 */

const getUserDataKey = (username) => `pilatify_userData_${username}`;
const getAvatarKey = (username) => `pilatify_avatar_${username}`;

/**
 * Kullanıcının ana verilerini (program, favoriler, başarımlar vb.) localStorage'a kaydeder.
 * @param {object} userProfile - Kullanıcının profil nesnesi.
 * @param {object} userProgram - Kullanıcının program nesnesi.
 * @param {Array} achievementsData - Kullanıcının başarım verileri.
 */
export const saveUserData = (userProfile, userProgram, achievementsData) => {
    if (!userProfile || userProfile.isGuest) return; // Misafir kullanıcılar için kaydetme

    const dataToSave = {
        userProgram: userProgram,
        favorites: userProfile.favorites,
        achievements: achievementsData,
        stepData: userProfile.stepData,
        profile: {
            name: userProfile.name,
            email: userProfile.email,
            age: userProfile.age,
            height: userProfile.height,
            weight: userProfile.weight,
            goal: userProfile.goal,
            weightHistory: userProfile.weightHistory,
        }
    };
    localStorage.setItem(getUserDataKey(userProfile.username), JSON.stringify(dataToSave));
};

/**
 * localStorage'dan kullanıcı verilerini yükler.
 * @param {string} username - Verileri yüklenecek kullanıcı adı.
 * @returns {object|null} Kayıtlı veri veya bulunamazsa null.
 */
export const loadUserData = (username) => {
    const savedData = localStorage.getItem(getUserDataKey(username));
    return savedData ? JSON.parse(savedData) : null;
};

/**
 * Yeni bir kullanıcıyı ilk verileriyle birlikte localStorage'a kaydeder.
 * @param {object} newUserData - getInitialUserData'dan gelen yeni kullanıcı verisi.
 */
export const saveNewUser = (newUserData) => {
    const { userProfile, userProgram, achievementsData } = newUserData;
    const dataToSave = {
        userProgram,
        favorites: userProfile.favorites,
        achievements: achievementsData,
        stepData: userProfile.stepData,
        profile: {
            name: userProfile.name,
            email: userProfile.email,
            password: userProfile.password, // Şifre sadece ilk kayıtta saklanır
            age: userProfile.age,
            height: userProfile.height,
            weight: userProfile.weight,
            goal: userProfile.goal,
            weightHistory: userProfile.weightHistory,
        }
    };
    localStorage.setItem(getUserDataKey(userProfile.username), JSON.stringify(dataToSave));
};

/**
 * Kullanıcının avatarını base64 formatında localStorage'a kaydeder.
 * @param {string} username - Kullanıcı adı.
 * @param {string} avatarDataUrl - Avatarın data URL'i.
 */
export const saveAvatar = (username, avatarDataUrl) => {
    localStorage.setItem(getAvatarKey(username), avatarDataUrl);
};

/**
 * Kullanıcının avatarını localStorage'dan yükler.
 * @param {string} username - Kullanıcı adı.
 * @returns {string|null} Avatarın data URL'i veya null.
 */
export const loadAvatar = (username) => {
    return localStorage.getItem(getAvatarKey(username));
};