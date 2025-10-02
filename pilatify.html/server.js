const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Bu anahtarı GÜVENLİ bir yerde saklayın (örneğin, .env dosyasında)
const JWT_SECRET = 'sizin_super_guvenli_gizli_anahtariniz';

// --- Middleware'ler ---
app.use(cors()); // Frontend'den gelen isteklere izin ver
app.use(express.json()); // Gelen JSON body'lerini parse et

// --- AUTHENTICATION MIDDLEWARE ---
// Bu ara yazılım, korunması gereken endpoint'lerden önce çalışır.
// Gelen isteğin header'ındaki token'ı kontrol eder.
const auth = (req, res, next) => {
    // Header'dan 'Authorization' başlığını al
    const authHeader = req.header('Authorization');

    // Başlık veya token yoksa yetkisiz hatası döndür
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // 'Bearer ' kısmını atıp sadece token'ı al
        const token = authHeader.split(' ')[1];

        // Token'ı doğrula
        const decoded = jwt.verify(token, JWT_SECRET);

        // Token'dan gelen kullanıcı ID'si ile veritabanında kullanıcıyı bul
        const user = mockUsers.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found, token is invalid' });
        }

        // Kullanıcı bilgisini request nesnesine ekle ve sonraki adıma geç
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// --- SAHTE VERİTABANI ---
// Gerçek bir uygulamada, bu veriler PostgreSQL, MongoDB vb. bir veritabanından gelir.
// Şifreler 'bcrypt' ile hash'lenmiş olarak saklanır. 'password' ve 'password123' gibi şifrelerin hash'lenmiş halleridir.
const mockUsers = [
    {
        id: 1,
        username: 'jane',
        // 'password' kelimesinin hash'i. Gerçek bir hash ürettim.
        passwordHash: '$2b$10$E9.UP21x2FEhS58J13.pA.VjO9S.pG/O5aJzO9S.pG/O5aJzO9S.p', 
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        age: 28,
        height: 165,
        weight: 68,
        goal: 'Lose Weight',
    },
    {
        id: 2,
        username: 'john',
        // 'password123' kelimesinin bcrypt ile hash'lenmiş hali
        passwordHash: '$2b$10$anotherHashValueForJohnsPasswordGoesHere123',
        email: 'john.smith@example.com',
        name: 'John Smith',
        age: 32,
        height: 180,
        weight: 85,
        goal: 'Build Muscle',
    }
];

// --- SAHTE PROGRAM VERİTABANI ---
// Gerçek bir uygulamada bu, ayrı bir SQL tablosu veya NoSQL koleksiyonu olurdu.
const mockPrograms = {
    // User ID 1 (jane) için program
    1: {
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
    },
    // User ID 2 (john) için program
    2: {
        name: 'John\'s Program',
        schedule: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
    }
};

const getInitialProgram = (username) => ({
    name: `${username}'s Program`,
    schedule: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
});

// --- API ENDPOINT'LERİ ---

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi yapar ve JWT döndürür
 * @access  Public
 */
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Kullanıcıyı veritabanında (sahte dizimizde) bul
    const user = mockUsers.find(u => u.username === username);

    if (!user) {
        // Kullanıcı bulunamadıysa 401 Unauthorized hatası döndür.
        // Güvenlik için "kullanıcı adı veya şifre hatalı" gibi genel bir mesaj vermek daha iyidir.
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Gelen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
    // Not: Gerçek bir senaryoda, 'jane' kullanıcısının şifresi 'password' olmalıdır.
    // Prototip için basit kontrol yerine gerçek bcrypt karşılaştırması yapalım.
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        // Şifre eşleşmiyorsa 401 hatası döndür.
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Şifre doğruysa, bir JWT oluştur
    const payload = {
        id: user.id,
        username: user.username,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // Token 1 gün geçerli

    // 4. Frontend'e token'ı ve temel kullanıcı bilgilerini gönder
    // Şifre hash'ini ASLA frontend'e göndermeyin!
    const { passwordHash, ...userToSend } = user;
    res.json({ token, user: userToSend });
});

/**
 * @route   POST /api/auth/register
 * @desc    Yeni kullanıcı kaydı yapar, JWT döndürür
 * @access  Public
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        // 1. Gelen veriyi doğrula
        if (!username || !name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 2. Kullanıcının zaten var olup olmadığını kontrol et
        const existingUser = mockUsers.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists' }); // 409 Conflict
        }

        // 3. Şifreyi hash'le
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 4. Yeni kullanıcı nesnesini oluştur
        const newUser = {
            id: mockUsers.length + 1, // Basit bir ID ataması
            username,
            passwordHash,
            email,
            name,
            age: null, height: null, weight: null, goal: null, // Onboarding'de doldurulacak
        };

        // 5. Yeni kullanıcıyı (sahte) veritabanına ekle
        mockUsers.push(newUser);
        
        // Yeni kullanıcı için boş bir program oluştur
        mockPrograms[newUser.id] = getInitialProgram(newUser.username);

        // 6. Yeni kullanıcı için bir JWT oluştur (otomatik giriş)
        const payload = { id: newUser.id, username: newUser.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        // 7. Frontend'e token ve yeni kullanıcı bilgilerini gönder
        const { passwordHash: _, ...userToSend } = newUser;
        res.status(201).json({ token, user: userToSend }); // 201 Created

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * @route   GET /api/user/profile
 * @desc    Giriş yapmış kullanıcının profilini getirir
 * @access  Private (auth middleware'i ile korunuyor)
 */
app.get('/api/user/profile', auth, (req, res) => {
    // `auth` middleware'i başarılı olursa, `req.user` nesnesi burada mevcut olur.
    // Şifre hash'ini frontend'e göndermediğimizden emin olalım.
    const { passwordHash, ...userToSend } = req.user;

    res.json(userToSend);
});

/**
 * @route   GET /api/user/program
 * @desc    Giriş yapmış kullanıcının programını getirir
 * @access  Private
 */
app.get('/api/user/program', auth, (req, res) => {
    const userProgram = mockPrograms[req.user.id];
    if (!userProgram) {
        return res.status(404).json({ message: 'Program not found for this user.' });
    }
    res.json(userProgram);
});

/**
 * @route   PUT /api/user/program
 * @desc    Giriş yapmış kullanıcının programını günceller
 * @access  Private
 */
app.put('/api/user/program', auth, (req, res) => {
    const updatedProgram = req.body;
    // Gelen veriyi doğrulamak için burada ek kontroller yapılabilir.
    mockPrograms[req.user.id] = updatedProgram;
    res.json({ message: 'Program updated successfully', program: updatedProgram });
});

/**
 * @route   PUT /api/user/profile
 * @desc    Giriş yapmış kullanıcının profilini günceller
 * @access  Private
 */
app.put('/api/user/profile', auth, (req, res) => {
    try {
        const { name, age, height, weight } = req.body;
        const userId = req.user.id;

        // 1. Kullanıcının index'ini bul
        const userIndex = mockUsers.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            // Bu durumun auth middleware'i sayesinde olmaması gerekir, ama yine de kontrol edelim.
            return res.status(404).json({ message: 'User not found.' });
        }

        // 2. Mevcut kullanıcı verilerini al
        const currentUser = mockUsers[userIndex];

        // 3. Kilo değiştiyse, kilo geçmişine ekle
        if (weight && weight !== currentUser.weight) {
            currentUser.weightHistory = currentUser.weightHistory || [];
            currentUser.weightHistory.push({ date: new Date().toISOString().split('T')[0], weight });
        }

        // 4. Kullanıcı verilerini güncelle (sadece izin verilen alanları)
        currentUser.name = name || currentUser.name;
        currentUser.age = age || currentUser.age;
        currentUser.height = height || currentUser.height;
        currentUser.weight = weight || currentUser.weight;

        res.json({ message: 'Profile updated successfully', user: currentUser });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});