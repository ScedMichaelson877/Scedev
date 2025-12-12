// Kullanıcı sistemi
let currentUser = null;
const STORAGE_KEY = 'sced_user';
const USERS_KEY = 'sced_users';
const TOPICS_KEY = 'sced_topics';
const LANG_KEY = 'sced_lang';
let currentLang = 'tr';

// Avatar seçenekleri
const avatarSeeds = ['ali', 'ayse', 'mehmet', 'zeynep', 'ahmet', 'fatma', 'can', 'elif', 'murat', 'selin', 'burak', 'deniz'];

// Çeviri metinleri
const translations = {
    tr: {
        welcome: 'Hoş geldin',
        loggedOut: 'Çıkış yapıldı. Görüşmek üzere!',
        profileUpdated: 'Profilin güncellendi!',
        topicCreated: 'Konunuz başarıyla oluşturuldu!',
        loginRequired: 'Konu açmak için lütfen giriş yapın!',
        enterUsername: 'Lütfen kullanıcı adı girin!',
        enterEmail: 'Lütfen e-posta girin!',
        enterTitle: 'Lütfen konu başlığı girin!',
        enterContent: 'Lütfen konu içeriği girin!',
        downloadingAPK: 'SceBrawl APK indiriliyor...',
        downloadingIPA: 'SceBrawl IPA indiriliyor...',
        confirmLogout: 'Çıkış yapmak istediğinize emin misiniz?'
    },
    en: {
        welcome: 'Welcome',
        loggedOut: 'Logged out. See you!',
        profileUpdated: 'Profile updated!',
        topicCreated: 'Your topic has been created successfully!',
        loginRequired: 'Please login to create topics!',
        enterUsername: 'Please enter a username!',
        enterEmail: 'Please enter an email!',
        enterTitle: 'Please enter a topic title!',
        enterContent: 'Please enter topic content!',
        downloadingAPK: 'Downloading SceBrawl APK...',
        downloadingIPA: 'Downloading SceBrawl IPA...',
        confirmLogout: 'Are you sure you want to logout?'
    }
};

// Admin hesabı oluştur
function initializeAdminAccount() {
    const users = JSON.parse(localStorage.getItem('sced_users') || '[]');
    
    // Admin hesabı zaten var mı kontrol et (email ile)
    const adminExists = users.find(u => u.email === 'admin@scedev.com');
    
    if (!adminExists) {
        const adminAccount = {
            username: 'SceDev',
            email: 'admin@scedev.com',
            password: '5411',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=scedev',
            themeColor: '#6366f1',
            nameColor: 'rainbow',
            bio: 'Sced Developer Team Admin',
            role: 'admin',
            joinDate: new Date().toISOString()
        };
        
        users.push(adminAccount);
        localStorage.setItem('sced_users', JSON.stringify(users));
        console.log('✅ Admin hesabı oluşturuldu');
        console.log('📧 Email:', adminAccount.email);
        console.log('👤 Username:', adminAccount.username);
        console.log('🔑 Password:', adminAccount.password);
    } else {
        console.log('ℹ️ Admin hesabı zaten var');
        console.log('Admin bilgileri:', adminExists);
    }
}

// Sayfa yüklendiğinde kullanıcıyı kontrol et
window.addEventListener('DOMContentLoaded', function() {
    // Admin test hesabı oluştur (ilk yüklemede)
    initializeAdminAccount();
    loadLanguage();
    loadUser();
    generateAvatars();
    initLiquidCanvas();
    renderTopics();
    loadGoogleAPI();
});

// Dil yükle
function loadLanguage() {
    const savedLang = localStorage.getItem(LANG_KEY) || 'tr';
    changeLanguage(savedLang);
}

// Dil değiştir
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    
    // Buton durumlarını güncelle
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('lang' + lang.charAt(0).toUpperCase() + lang.charAt(1)).classList.add('active');
    
    // Tüm çeviri elemanlarını güncelle
    document.querySelectorAll('[data-tr]').forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // Placeholder'ları güncelle
            const placeholderAttr = 'data-placeholder-' + lang;
            if (element.hasAttribute(placeholderAttr)) {
                element.placeholder = element.getAttribute(placeholderAttr);
            }
        } else {
            // Text içeriğini güncelle
            const text = element.getAttribute('data-' + lang);
            if (text) {
                element.textContent = text;
            }
        }
    });
    
    // Glitch efekti için data-text güncelle
    const glitchElement = document.querySelector('.glitch');
    if (glitchElement) {
        glitchElement.setAttribute('data-text', 'Sced Developer Team');
    }
}

// Kullanıcıyı yükle
function loadUser() {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
}

// Kullanıcı arayüzünü güncelle
function updateUserInterface() {
    if (currentUser) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userProfileHeader').style.display = 'flex';
        document.getElementById('headerAvatar').src = currentUser.avatar;
        
        const headerUsernameEl = document.getElementById('headerUsername');
        headerUsernameEl.innerHTML = getUsernameHTML(currentUser.username, currentUser.role, currentUser.nameColor);
        if (currentUser.role === 'admin') {
            headerUsernameEl.classList.add('admin-badge');
        } else {
            headerUsernameEl.classList.remove('admin-badge');
        }
        
        // Topic form profil
        document.getElementById('topicFormAvatar').src = currentUser.avatar;
        document.getElementById('topicFormUsername').textContent = currentUser.username;
        document.querySelector('#topicFormProfile p').textContent = currentUser.bio || 'Hoş geldin!';
        
        // Tema rengini uygula
        if (currentUser.themeColor) {
            document.documentElement.style.setProperty('--primary-color', currentUser.themeColor);
        }
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('userProfileHeader').style.display = 'none';
    }
}

// Avatar grid oluştur
function generateAvatars() {
    const grids = [document.getElementById('avatarGrid'), document.getElementById('profileAvatarGrid')];
    
    grids.forEach(grid => {
        if (grid) {
            grid.innerHTML = avatarSeeds.map(seed => 
                `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}" 
                     class="avatar-option" 
                     data-seed="${seed}" 
                     onclick="selectAvatar('${seed}')">`
            ).join('');
        }
    });
}

// Avatar seç
let selectedAvatarSeed = 'user';
function selectAvatar(seed) {
    selectedAvatarSeed = seed;
    document.querySelectorAll('.avatar-option').forEach(img => {
        img.classList.remove('selected');
        if (img.dataset.seed === seed) {
            img.classList.add('selected');
        }
    });
}

// Login modal aç
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    switchTab('login'); // Default olarak login tab'ı göster
}

// Login modal kapat
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Tab değiştir (Login/Register)
function switchTab(type) {
    // Tab butonlarını güncelle
    const loginModal = document.getElementById('loginModal');
    const tabBtns = loginModal.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn, index) => {
        btn.classList.remove('active');
        if ((type === 'login' && index === 0) || (type === 'register' && index === 1)) {
            btn.classList.add('active');
        }
    });
    
    // Tab içeriklerini güncelle
    document.getElementById('loginTabContent').classList.remove('active');
    document.getElementById('registerTabContent').classList.remove('active');
    document.getElementById(type + 'TabContent').classList.add('active');
}

// Profil modal aç
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
    
    if (currentUser) {
        document.getElementById('currentAvatar').src = currentUser.avatar;
        document.getElementById('currentUsername').textContent = currentUser.username;
        
        // Admin badge göster
        const usernameEl = document.getElementById('currentUsername');
        if (currentUser.role === 'admin') {
            usernameEl.className = 'username-rainbow';
        } else {
            usernameEl.className = 'username-' + (currentUser.nameColor || 'white');
        }
        
        // Role badge
        const roleBadge = document.getElementById('userRole');
        if (roleBadge) {
            roleBadge.style.display = 'inline-block';
            if (currentUser.role === 'admin') {
                roleBadge.className = 'user-role-badge admin';
                roleBadge.textContent = 'Admin ⭐';
            } else {
                roleBadge.className = 'user-role-badge user';
                roleBadge.textContent = currentLang === 'tr' ? 'Kullanıcı' : 'User';
            }
        }
        
        document.getElementById('newUsername').value = currentUser.username;
        document.getElementById('profileEmail').value = currentUser.email || '';
        document.getElementById('userBio').value = currentUser.bio || '';
        
        // İsim rengi seçili göster
        if (currentUser.role !== 'admin') {
            document.querySelectorAll('.name-color-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.color === currentUser.nameColor) {
                    btn.classList.add('selected');
                }
            });
        }
        
        // Tema rengini seçili göster
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.color === currentUser.themeColor) {
                btn.classList.add('selected');
            }
        });
    }
}

// Profil modal kapat
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Email ile giriş yap
function loginWithEmail() {
    const email = document.getElementById('loginEmailField').value.trim();
    const password = document.getElementById('loginPasswordField').value.trim();
    
    if (!email) {
        alert(currentLang === 'tr' ? 'Lütfen e-posta girin!' : 'Please enter email!');
        return;
    }
    
    if (!password) {
        alert(currentLang === 'tr' ? 'Lütfen şifre girin!' : 'Please enter password!');
        return;
    }
    
    // LocalStorage'dan kullanıcıları kontrol et
    const users = JSON.parse(localStorage.getItem('sced_users') || '[]');
    console.log('=== GİRİŞ DEBUG ===');
    console.log('Kayıtlı kullanıcılar:', users);
    console.log('Giriş denemesi - Email/Username:', email, 'Password:', password);
    
    // Email veya username ile giriş yapılabilsin
    const user = users.find(u => {
        console.log('Kontrol ediliyor:', u.email, '===', email, '?', u.email === email);
        console.log('Kontrol ediliyor:', u.username, '===', email, '?', u.username === email);
        console.log('Şifre kontrol:', u.password, '===', password, '?', u.password === password);
        return (u.email === email || u.username === email) && u.password === password;
    });
    
    console.log('Bulunan kullanıcı:', user);
    
    if (user) {
        currentUser = user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        updateUserInterface();
        closeLoginModal();
        showNotification(translations[currentLang].welcome + ', ' + user.username + '! 🎉');
    } else {
        alert(currentLang === 'tr' ? 'E-posta/kullanıcı adı veya şifre hatalı!' : 'Invalid email/username or password!');
    }
}

// Yeni kullanıcı kaydı
function registerUser() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerPasswordConfirm').value.trim();
    
    if (!username) {
        alert(translations[currentLang].enterUsername);
        return;
    }
    
    if (!email) {
        alert(translations[currentLang].enterEmail);
        return;
    }
    
    if (!password) {
        alert(currentLang === 'tr' ? 'Lütfen şifre girin!' : 'Please enter password!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert(currentLang === 'tr' ? 'Şifreler eşleşmiyor!' : 'Passwords do not match!');
        return;
    }
    
    // Email validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert(currentLang === 'tr' ? 'Geçerli bir e-posta girin!' : 'Enter a valid email!');
        return;
    }
    
    // Kullanıcılar listesini al
    const users = JSON.parse(localStorage.getItem('sced_users') || '[]');
    
    // Email kontrolü
    if (users.find(u => u.email === email)) {
        alert(currentLang === 'tr' ? 'Bu e-posta zaten kayıtlı!' : 'This email is already registered!');
        return;
    }
    
    // Yeni kullanıcı oluştur
    const newUser = {
        username: username,
        email: email,
        password: password, // Gerçek uygulamada hash'lenmiş olmalı
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        themeColor: '#6366f1',
        nameColor: 'white',
        bio: '',
        role: 'user', // Default role
        joinDate: new Date().toISOString()
    };
    
    // Kullanıcıyı ekle ve kaydet
    users.push(newUser);
    localStorage.setItem('sced_users', JSON.stringify(users));
    
    // Otomatik giriş yap
    currentUser = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    closeLoginModal();
    showNotification(translations[currentLang].welcome + ', ' + username + '! 🎉');
}

// Giriş yap (eski fonksiyon - Google OAuth için)
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    
    if (!username) {
        alert(translations[currentLang].enterUsername);
        return;
    }
    
    if (!email) {
        alert(translations[currentLang].enterEmail);
        return;
    }
    
    currentUser = {
        username: username,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`,
        themeColor: '#00ff88',
        nameColor: 'white',
        bio: '',
        role: 'user',
        joinDate: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    closeLoginModal();
    showNotification(translations[currentLang].welcome + ', ' + username + '! 🎉');
}

// Profil fotoğrafı yükle
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert(currentLang === 'tr' ? 'Fotoğraf boyutu 5MB\'dan küçük olmalı!' : 'Photo size must be less than 5MB!');
        return;
    }
    
    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
        alert(currentLang === 'tr' ? 'Lütfen geçerli bir resim dosyası seçin!' : 'Please select a valid image file!');
        return;
    }
    
    // FileReader ile dosyayı oku
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Avatarı güncelle
        if (currentUser) {
            currentUser.avatar = imageData;
            document.getElementById('currentAvatar').src = imageData;
            
            // LocalStorage'a kaydet
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
            updateUserInterface();
        }
    };
    
    reader.readAsDataURL(file);
}

// İsim rengi seç
function selectNameColor(color) {
    if (currentUser && currentUser.role === 'admin') {
        alert(currentLang === 'tr' ? 'Adminler varsayılan olarak rainbow renge sahiptir!' : 'Admins have rainbow color by default!');
        return;
    }
    
    document.querySelectorAll('.name-color-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.color === color) {
            btn.classList.add('selected');
        }
    });
}

// Profil kaydet
function saveProfile() {
    if (!currentUser) return;
    
    const newUsername = document.getElementById('newUsername').value.trim();
    const newBio = document.getElementById('userBio').value.trim();
    
    if (newUsername) {
        currentUser.username = newUsername;
    }
    
    currentUser.bio = newBio;
    
    // İsim rengi seçimi (sadece admin değilse)
    if (currentUser.role !== 'admin') {
        const selectedNameColor = document.querySelector('.name-color-btn.selected');
        if (selectedNameColor) {
            currentUser.nameColor = selectedNameColor.dataset.color;
        } else {
            currentUser.nameColor = 'white'; // Default
        }
    }
    
    // Seçili tema rengini al
    const selectedColor = document.querySelector('.color-btn.selected');
    if (selectedColor) {
        currentUser.themeColor = selectedColor.dataset.color;
    }
    
    // Şifre değişikliği
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword) {
        if (!currentPassword) {
            alert(currentLang === 'tr' ? 'Mevcut şifrenizi girin!' : 'Enter your current password!');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert(currentLang === 'tr' ? 'Yeni şifreler eşleşmiyor!' : 'New passwords do not match!');
            return;
        }
        // Şifreyi kaydet (gerçek uygulamada hash'lenmiş olmalı)
        currentUser.password = newPassword;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    closeProfileModal();
    showNotification(translations[currentLang].profileUpdated + ' ✨');
}

// Çıkış yap
function logout() {
    if (confirm(translations[currentLang].confirmLogout)) {
        localStorage.removeItem(STORAGE_KEY);
        currentUser = null;
        updateUserInterface();
        showNotification(translations[currentLang].loggedOut + ' 👋');
        
        // Tema rengini varsayılana döndür
        document.documentElement.style.setProperty('--primary-color', '#00ff88');
    }
}

// Tema rengi seçimi
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('color-btn')) {
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
    }
});

// Modal dışına tıklanınca kapat
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const profileModal = document.getElementById('profileModal');
    const topicDetailModal = document.getElementById('topicDetailModal');
    const userProfileModal = document.getElementById('userProfileModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
    if (event.target === topicDetailModal) {
        closeTopicDetail();
    }
    if (event.target === userProfileModal) {
        closeUserProfile();
    }
}

// Liquid Canvas Animation (Apple tarzı)
function initLiquidCanvas() {
    const canvas = document.getElementById('liquidCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    class Blob {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 200 + 100;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.color = `hsla(${Math.random() * 360}, 70%, 50%, 0.2)`;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < -this.radius || this.x > canvas.width + this.radius) {
                this.vx *= -1;
            }
            if (this.y < -this.radius || this.y > canvas.height + this.radius) {
                this.vy *= -1;
            }
        }
        
        draw() {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const blobs = [];
    for (let i = 0; i < 5; i++) {
        blobs.push(new Blob());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        blobs.forEach(blob => {
            blob.update();
            blob.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Firebase Configuration (Ücretsiz Realtime Database)
const firebaseConfig = {
    apiKey: "AIzaSyC2RjyBkLTNFq37_9rAp3svz9OBOt4Ckks",
    authDomain: "scedev-community.firebaseapp.com",
    databaseURL: "https://scedev-community-default-rtdb.firebaseio.com",
    projectId: "scedev-community",
    storageBucket: "scedev-community.firebasestorage.app",
    messagingSenderId: "703215926288",
    appId: "1:703215926288:web:66368eba08d75f3813de95"
};

// Firebase'i başlat (eğer SDK yüklüyse)
let database = null;
let useFirebase = false;

try {
    if (typeof firebase !== 'undefined') {
        console.log('🔧 Firebase SDK bulundu, başlatılıyor...');
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        useFirebase = true;
        console.log('🔥 Firebase bağlantısı kuruldu!');
        console.log('📊 Database URL:', firebaseConfig.databaseURL);
    } else {
        console.log('⚠️ Firebase SDK yüklenmedi');
        console.log('💡 Firebase olmadan LocalStorage kullanılacak');
    }
} catch (error) {
    console.error('❌ Firebase başlatma hatası:', error);
    console.error('📝 Hata detayı:', error.message);
    console.log('💾 LocalStorage moduna geçiliyor...');
    useFirebase = false;
}

// Firebase listener eklendi mi kontrol
let firebaseListenerAdded = false;

// Konuları yükle
function loadTopics() {
    // Firebase kullanılıyorsa real-time dinle (sadece bir kez)
    if (useFirebase && database && !firebaseListenerAdded) {
        firebaseListenerAdded = true;
        console.log('👂 Firebase listener ekleniyor...');
        database.ref('topics').on('value', (snapshot) => {
            console.log('🔔 Firebase\'den veri geldi!');
            const firebaseTopics = snapshot.val();
            if (firebaseTopics) {
                topics = Object.values(firebaseTopics);
                
                // Her konuda likedBy ve comments dizilerini garanti et
                topics.forEach(topic => {
                    if (!topic.likedBy) topic.likedBy = [];
                    if (!topic.comments) topic.comments = [];
                });
                
                console.log('✅ Firebase\'den yüklendi, toplam konu:', topics.length);
                // localStorage'a da kaydet
                localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
                // Sadece DOM güncellemesi yap, loadTopics'i tekrar çağırma
                const topicsList = document.getElementById('topicsList');
                if (topicsList) {
                    renderTopicsToDOM();
                }
            } else {
                console.log('⚠️ Firebase\'de hiç konu yok (snapshot.val() boş)');
            }
        }, (error) => {
            console.error('❌ Firebase listener hatası:', error.code, error.message);
        });
    }
    
    // LocalStorage'dan yükle (Firebase yoksa veya offline)
    const savedTopics = localStorage.getItem(TOPICS_KEY);
    if (savedTopics) {
        return JSON.parse(savedTopics);
    }
    // Default konular
    return [
        {
            id: 1,
            userName: "Ali",
            userRole: "user",
            nameColor: "blue",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
            title: "SceBrawl hakkında sorularım var",
            content: "Merhaba arkadaşlar! Yeni başladım ve bazı sorularım olacak. Yardımcı olabilir misiniz?",
            time: "2 saat önce",
            likes: 12,
            comments: [],
            likedBy: []
        },
        {
            id: 2,
            userName: "SceDev",
            userRole: "admin",
            nameColor: "rainbow",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=scedev",
            title: "Hoş geldiniz! 🎉",
            content: "SceDev topluluğuna hoş geldiniz! Bu platformda oyunumuz SceBrawl hakkında konuşabilir, stratejiler paylaşabilir ve yeni arkadaşlar edinebilirsiniz. Sorularınız için buradayız!",
            time: "3 gün önce",
            likes: 54854,
            comments: [],
            likedBy: []
        },
        {
            id: 3,
            userName: "Ayşe",
            userRole: "user",
            nameColor: "red",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ayse",
            title: "En iyi stratejiler neler?",
            content: "Oyunda daha iyi olmak için hangi stratejileri kullanmalıyım? Tecrübelerinizi paylaşır mısınız?",
            time: "5 saat önce",
            likes: 8,
            comments: [],
            likedBy: []
        },
        {
            id: 4,
            userName: "Mehmet",
            userRole: "user",
            nameColor: "white",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet",
            title: "Yeni güncelleme ne zaman gelecek?",
            content: "Gelecek güncelleme hakkında bilgi var mı? Hangi özellikler eklenecek?",
            time: "1 gün önce",
            likes: 15,
            comments: [],
            likedBy: []
        }
    ];
}

// Konuları kaydet
function saveTopics() {
    // LocalStorage'a kaydet
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
    console.log('💾 LocalStorage\'a kaydedildi, toplam konu sayısı:', topics.length);
    
    // Firebase'e de kaydet (eğer aktifse)
    if (useFirebase && database) {
        const topicsObj = {};
        topics.forEach(topic => {
            topicsObj[topic.id] = topic;
        });
        console.log('🔥 Firebase\'e yazılıyor... Toplam konu:', topics.length);
        database.ref('topics').set(topicsObj).then(() => {
            console.log('✅ Firebase yazma başarılı!');
        }).catch(error => {
            console.error('❌ Firebase yazma hatası:', error.code, error.message);
        });
    } else {
        console.log('ℹ️ Firebase aktif değil (useFirebase:', useFirebase, ', database:', !!database, ')');
    }
}

let topics = loadTopics();

// Google Sign-In
function loadGoogleAPI() {
    // Google API script'i dinamik olarak yükle
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function loginWithGoogle() {
    // Google OAuth 2.0 popup açma
    const clientId = '563835885662-2n9tfduv3vejldlsciqlhes96mvi76ae.apps.googleusercontent.com'; // Buraya Google Console'dan alınan Client ID eklenecek
    
    // Demo için simüle edilmiş Google login
    showNotification(currentLang === 'tr' ? 
        '🔧 Google login entegrasyonu için Google Cloud Console\'dan OAuth 2.0 Client ID almanız gerekiyor.' : 
        '🔧 You need to obtain OAuth 2.0 Client ID from Google Cloud Console for Google login integration.'
    );
    
    // Geçici demo Google login
    const demoGoogleUser = {
        username: 'Google User',
        email: 'user@gmail.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
        themeColor: '#6366f1',
        bio: currentLang === 'tr' ? 'Google ile giriş yaptı' : 'Signed in with Google',
        joinDate: new Date().toISOString(),
        provider: 'google'
    };
    
    currentUser = demoGoogleUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    closeLoginModal();
    showNotification(translations[currentLang].welcome + ', ' + demoGoogleUser.username + '! 🎉');
}

// Konuları render et
function renderTopics() {
    // Firebase kullanılmıyorsa localStorage'dan yükle
    if (!useFirebase) {
        const savedTopics = localStorage.getItem(TOPICS_KEY);
        if (savedTopics) {
            topics = JSON.parse(savedTopics);
        }
    }
    renderTopicsToDOM();
}

// Konuları DOM'a render et (iç fonksiyon)
function renderTopicsToDOM() {
    console.log('Konular render ediliyor:', topics.length + ' konu');
    const topicsList = document.getElementById('topicsList');
    
    if (topics.length === 0) {
        topicsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Henüz konu yok. İlk konuyu sen aç!</p>';
        return;
    }
    
    topicsList.innerHTML = topics.map(topic => {
        // likedBy ve comments dizilerini garanti et
        if (!topic.likedBy) topic.likedBy = [];
        if (!topic.comments) topic.comments = [];
        
        const isLiked = currentUser && topic.likedBy.includes(currentUser.username);
        const commentCount = topic.comments.length;
        
        // Kullanıcı adı renklendirmesi
        const usernameHTML = getUsernameHTML(topic.userName, topic.userRole, topic.nameColor);
        
        // Admin için silme butonu
        const deleteBtn = currentUser && currentUser.role === 'admin' ? 
            `<button class="delete-topic-btn" onclick="event.stopPropagation(); deleteTopic(${topic.id})" title="${currentLang === 'tr' ? 'Konuyu Sil' : 'Delete Topic'}">
                <i class="fas fa-trash"></i>
            </button>` : '';
        
        return `
        <div class="topic-card" onclick="openTopicDetail(${topic.id})">
            ${deleteBtn}
            <div class="topic-header">
                <img src="${topic.avatar}" alt="${topic.userName}" class="topic-avatar" onclick="event.stopPropagation(); openUserProfile(&quot;${topic.userName}&quot;)" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Profili Gör' : 'View Profile'}">
                <div class="topic-meta">
                    <h4 class="${topic.userRole === 'admin' ? 'admin-badge' : ''}" onclick="event.stopPropagation(); openUserProfile(&quot;${topic.userName}&quot;)" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Profili Gör' : 'View Profile'}">${usernameHTML}</h4>
                    <p>${topic.time}</p>
                </div>
            </div>
            <h3 class="topic-title">${topic.title}</h3>
            <p class="topic-content">${topic.content}</p>
            <div class="topic-actions" onclick="event.stopPropagation()">
                <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${topic.id})">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                    <span class="action-count">${topic.likes}</span>
                </button>
                <button class="action-btn" onclick="openTopicDetail(${topic.id})">
                    <i class="far fa-comment"></i>
                    <span class="action-count">${commentCount}</span>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Username HTML'i oluştur (rainbow veya renkli)
function getUsernameHTML(username, role, nameColor, clickable = false) {
    if (role === 'admin') {
        // Admin için rainbow gradient
        return `<span class="username-rainbow">${username}</span>`;
    } else {
        // Normal kullanıcı için seçilmiş renk
        const colorClass = 'username-' + (nameColor || 'white');
        return `<span class="${colorClass}">${username}</span>`;
    }
}

// Kullanıcı profilini aç
function openUserProfile(username) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showNotification(currentLang === 'tr' ? '⚠️ Kullanıcı bulunamadı!' : '⚠️ User not found!');
        return;
    }
    
    // Kullanıcının açtığı konuları bul
    const userTopics = topics.filter(t => t.userName === username);
    
    // Kullanıcının yorumlarını bul
    let commentCount = 0;
    topics.forEach(topic => {
        if (topic.comments) {
            commentCount += topic.comments.filter(c => c.userName === username).length;
        }
    });
    
    const modal = document.getElementById('userProfileModal');
    const content = document.getElementById('userProfileContent');
    
    const usernameHTML = getUsernameHTML(user.username, user.role, user.nameColor);
    const roleText = user.role === 'admin' ? 
        (currentLang === 'tr' ? 'Yönetici' : 'Administrator') : 
        (currentLang === 'tr' ? 'Kullanıcı' : 'User');
    const roleIcon = user.role === 'admin' ? '👑' : '👤';
    
    content.innerHTML = `
        <div class="user-profile-detail">
            <div class="profile-header" style="text-align: center; margin-bottom: 2rem;">
                <img src="${user.avatar}" alt="${user.username}" style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--primary-color); margin-bottom: 1rem;">
                <h2 class="${user.role === 'admin' ? 'admin-badge' : ''}" style="margin-bottom: 0.5rem;">${usernameHTML}</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    ${roleIcon} ${roleText}
                </p>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">
                    <i class="fas fa-envelope"></i> ${user.email}
                </p>
            </div>
            
            <div class="profile-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card liquid-glass" style="padding: 1.5rem; text-align: center; border-radius: 12px;">
                    <div style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">${userTopics.length}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${currentLang === 'tr' ? 'Açılan Konu' : 'Topics Created'}
                    </div>
                </div>
                <div class="stat-card liquid-glass" style="padding: 1.5rem; text-align: center; border-radius: 12px;">
                    <div style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 0.5rem;">
                        <i class="fas fa-comment-dots"></i>
                    </div>
                    <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem;">${commentCount}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${currentLang === 'tr' ? 'Yapılan Yorum' : 'Comments Posted'}
                    </div>
                </div>
            </div>
            
            <div class="profile-topics">
                <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-list"></i>
                    ${currentLang === 'tr' ? 'Açılan Konular' : 'Created Topics'}
                </h3>
                ${userTopics.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${userTopics.slice(0, 5).map(topic => `
                            <div class="topic-card" onclick="closeUserProfile(); openTopicDetail(${topic.id})" style="cursor: pointer;">
                                <h4 style="margin-bottom: 0.5rem; color: var(--primary-color);">${topic.title}</h4>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                                    ${topic.content.substring(0, 100)}${topic.content.length > 100 ? '...' : ''}
                                </p>
                                <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                                    <span><i class="far fa-heart"></i> ${topic.likes}</span>
                                    <span><i class="far fa-comment"></i> ${topic.comments ? topic.comments.length : 0}</span>
                                    <span><i class="far fa-clock"></i> ${topic.time}</span>
                                </div>
                            </div>
                        `).join('')}
                        ${userTopics.length > 5 ? `
                            <p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
                                ${currentLang === 'tr' ? `+${userTopics.length - 5} konu daha...` : `+${userTopics.length - 5} more topics...`}
                            </p>
                        ` : ''}
                    </div>
                ` : `
                    <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        ${currentLang === 'tr' ? 'Henüz konu açılmamış' : 'No topics created yet'}
                    </p>
                `}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Kullanıcı profilini kapat
function closeUserProfile() {
    document.getElementById('userProfileModal').style.display = 'none';
}

// Beğeni toggle
function toggleLike(topicId) {
    topicId = Number(topicId); // String'i number'a çevir
    if (!currentUser) {
        alert(translations[currentLang].loginRequired);
        openLoginModal();
        return;
    }
    
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    // likedBy dizisini garanti et
    if (!topic.likedBy) topic.likedBy = [];
    
    const userIndex = topic.likedBy.indexOf(currentUser.username);
    
    if (userIndex === -1) {
        // Beğen
        topic.likedBy.push(currentUser.username);
        topic.likes++;
        showNotification(currentLang === 'tr' ? '❤️ Beğendin!' : '❤️ Liked!');
    } else {
        // Beğeniyi kaldır
        topic.likedBy.splice(userIndex, 1);
        topic.likes--;
        showNotification(currentLang === 'tr' ? '💔 Beğeni kaldırıldı' : '💔 Unliked');
    }
    
    saveTopics();
    
    // Firebase kullanılmıyorsa manuel render et
    if (!useFirebase) {
        renderTopics();
    }
    // Firebase kullanılıyorsa otomatik güncellenecek
}

// Konu detayını aç
function openTopicDetail(topicId) {
    topicId = Number(topicId); // String'i number'a çevir
    // Firebase kullanıyorsa topics zaten güncel
    const topic = topics.find(t => t.id === topicId);
    console.log('Topic detay açılıyor - ID:', topicId, 'Bulunan topic:', topic);
    if (!topic) return;
    
    // likedBy ve comments dizilerini garanti et
    if (!topic.likedBy) topic.likedBy = [];
    if (!topic.comments) topic.comments = [];
    
    const modal = document.getElementById('topicDetailModal');
    const content = document.getElementById('topicDetailContent');
    
    const isLiked = currentUser && topic.likedBy.includes(currentUser.username);
    const commentCount = topic.comments.length;
    
    const topicUsernameHTML = getUsernameHTML(topic.userName, topic.userRole, topic.nameColor);
    
    // Admin için silme butonu
    const deleteBtn = currentUser && currentUser.role === 'admin' ? 
        `<button class="delete-topic-btn" style="position: absolute; top: 1rem; right: 1rem;" onclick="deleteTopic(${topic.id}); closeTopicDetail();" title="${currentLang === 'tr' ? 'Konuyu Sil' : 'Delete Topic'}">
            <i class="fas fa-trash"></i>
        </button>` : '';
    
    content.innerHTML = `
        <div class="topic-detail" style="position: relative;">
            ${deleteBtn}
            <div class="topic-detail-header">
                <img src="${topic.avatar}" alt="${topic.userName}" class="topic-detail-avatar" onclick="closeTopicDetail(); openUserProfile(&quot;${topic.userName}&quot;)" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Profili Gör' : 'View Profile'}">
                <div class="topic-detail-meta">
                    <h2 class="${topic.userRole === 'admin' ? 'admin-badge' : ''}" onclick="closeTopicDetail(); openUserProfile(&quot;${topic.userName}&quot;)" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Profili Gör' : 'View Profile'}">${topicUsernameHTML}</h2>
                    <div class="topic-detail-info">
                        <span><i class="far fa-clock"></i> ${topic.time}</span>
                    </div>
                </div>
            </div>
            
            <h3 class="topic-detail-title">${topic.title}</h3>
            <div class="topic-detail-content">${topic.content}</div>
            
            <div class="topic-detail-actions">
                <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${topic.id}); openTopicDetail(${topic.id});">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                    <span class="action-count">${topic.likes}</span>
                    <span>${currentLang === 'tr' ? 'Beğeni' : 'Likes'}</span>
                </button>
                <button class="action-btn">
                    <i class="far fa-comment"></i>
                    <span class="action-count">${commentCount}</span>
                    <span>${currentLang === 'tr' ? 'Yorum' : 'Comments'}</span>
                </button>
            </div>
            
            <div class="comments-section">
                <h4 class="comments-header">
                    <i class="fas fa-comments"></i>
                    ${currentLang === 'tr' ? 'Yorumlar' : 'Comments'} (${commentCount})
                </h4>
                
                ${currentUser ? `
                <div class="comment-form liquid-glass" style="position: relative; z-index: 10;">
                    <textarea 
                        id="newComment" 
                        class="comment-input" 
                        placeholder="${currentLang === 'tr' ? 'Yorumunuzu yazın...' : 'Write your comment...'}"
                        style="pointer-events: auto; position: relative; z-index: 11;"
                    ></textarea>
                    <button class="btn btn-primary" onclick="addComment(${topic.id})" style="pointer-events: auto;">
                        <i class="fas fa-paper-plane"></i>
                        ${currentLang === 'tr' ? 'Yorum Yap' : 'Post Comment'}
                    </button>
                </div>
                ` : `
                <div class="comment-form liquid-glass" style="text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        ${currentLang === 'tr' ? 'Yorum yapmak için giriş yapın' : 'Login to post comments'}
                    </p>
                    <button class="btn btn-primary" onclick="closeTopicDetail(); openLoginModal();">
                        <i class="fas fa-sign-in-alt"></i>
                        ${currentLang === 'tr' ? 'Giriş Yap' : 'Login'}
                    </button>
                </div>
                `}
                
                <div class="comments-list">
                    ${topic.comments && topic.comments.length > 0 ? 
                        topic.comments.map(comment => {
                            const commentUsernameHTML = getUsernameHTML(comment.userName, comment.userRole, comment.nameColor);
                            return `
                            <div class="comment-card liquid-glass">
                                <div class="comment-header">
                                    <img src="${comment.avatar}" alt="${comment.userName}" class="comment-avatar" onclick="closeTopicDetail(); openUserProfile(&quot;${comment.userName}&quot;)" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Profili Gör' : 'View Profile'}">
                                    <div class="comment-meta">
                                        <div class="comment-author ${comment.userRole === 'admin' ? 'admin-badge' : ''}" onclick="closeTopicDetail(); openUserProfile(&quot;${comment.userName}&quot;)" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Profili Gör' : 'View Profile'}">${commentUsernameHTML}</div>
                                        <div class="comment-time">${comment.time}</div>
                                    </div>
                                </div>
                                <div class="comment-content">${comment.content}</div>
                            </div>
                        `}).join('') 
                        : `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                            ${currentLang === 'tr' ? 'Henüz yorum yok. İlk yorumu sen yap!' : 'No comments yet. Be the first to comment!'}
                        </p>`
                    }
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Konu detayını kapat
function closeTopicDetail() {
    document.getElementById('topicDetailModal').style.display = 'none';
}

// Konu sil (Sadece admin)
function deleteTopic(topicId) {
    topicId = Number(topicId);
    
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification(currentLang === 'tr' ? '⛔ Sadece adminler konu silebilir!' : '⛔ Only admins can delete topics!');
        return;
    }
    
    const confirmed = confirm(currentLang === 'tr' ? 
        '🗑️ Bu konuyu silmek istediğinize emin misiniz?' : 
        '🗑️ Are you sure you want to delete this topic?');
    
    if (!confirmed) return;
    
    // Konuyu diziden kaldır
    const topicIndex = topics.findIndex(t => t.id === topicId);
    if (topicIndex > -1) {
        topics.splice(topicIndex, 1);
        saveTopics();
        
        // Firebase kullanılmıyorsa manuel render et
        if (!useFirebase) {
            renderTopics();
        }
        
        showNotification(currentLang === 'tr' ? '✅ Konu silindi!' : '✅ Topic deleted!');
        console.log('🗑️ Konu silindi - ID:', topicId);
    }
}

// Yorum ekle
function addComment(topicId) {
    topicId = Number(topicId); // String'i number'a çevir
    if (!currentUser) {
        alert(translations[currentLang].loginRequired);
        return;
    }
    
    const commentInput = document.getElementById('newComment');
    const content = commentInput.value.trim();
    
    if (!content) {
        alert(currentLang === 'tr' ? 'Lütfen yorum yazın!' : 'Please write a comment!');
        return;
    }
    
    // Firebase kullanıyorsa topics zaten güncel
    const topic = topics.find(t => t.id === topicId);
    console.log('Yorum ekleniyor - Topic ID:', topicId, 'Bulunan topic:', topic);
    if (!topic) {
        console.error('❌ Topic bulunamadı! ID:', topicId);
        return;
    }
    
    // comments ve likedBy dizilerini garanti et
    if (!topic.comments) topic.comments = [];
    if (!topic.likedBy) topic.likedBy = [];
    
    const newComment = {
        id: Date.now(),
        userName: currentUser.username,
        avatar: currentUser.avatar,
        userRole: currentUser.role || 'user',
        nameColor: currentUser.nameColor || 'white',
        content: content,
        time: currentLang === 'tr' ? 'Şimdi' : 'Now'
    };
    
    topic.comments.unshift(newComment);
    saveTopics();
    
    showNotification(currentLang === 'tr' ? '✅ Yorum eklendi!' : '✅ Comment added!');
    
    // Input'u temizle
    commentInput.value = '';
    
    // Modal'ı güncelle
    openTopicDetail(topicId);
    
    // Firebase kullanılmıyorsa manuel render et
    if (!useFirebase) {
        renderTopics();
    }
    // Firebase kullanılıyorsa otomatik güncellenecek
}

// Konu formu aç/kapat
function toggleTopicForm() {
    if (!currentUser) {
        alert(translations[currentLang].loginRequired);
        openLoginModal();
        return;
    }
    
    const form = document.getElementById('topicForm');
    form.classList.toggle('active');
    
    if (form.classList.contains('active')) {
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Yeni konu oluştur
function createTopic() {
    if (!currentUser) {
        alert(translations[currentLang].loginRequired);
        openLoginModal();
        return;
    }
    
    const title = document.getElementById('topicTitle').value.trim();
    const content = document.getElementById('topicContent').value.trim();
    
    if (!title) {
        alert(translations[currentLang].enterTitle);
        return;
    }
    
    if (!content) {
        alert(translations[currentLang].enterContent);
        return;
    }
    
    // Yeni konu oluştur
    const newTopic = {
        id: Date.now(),
        userName: currentUser.username,
        avatar: currentUser.avatar,
        userRole: currentUser.role || 'user',
        nameColor: currentUser.nameColor || 'white',
        title: title,
        content: content,
        time: currentLang === 'tr' ? 'Şimdi' : 'Now',
        likes: 0,
        comments: [],
        likedBy: []
    };
    
    // Konuları başa ekle
    topics.unshift(newTopic);
    
    console.log('📝 Yeni konu oluşturuldu:', newTopic.title);
    
    // Firebase'e veya LocalStorage'a kaydet
    saveTopics();
    
    // Firebase kullanılmıyorsa manuel render et
    if (!useFirebase) {
        renderTopics();
    }
    // Firebase kullanılıyorsa otomatik güncellenecek
    
    // Formu temizle
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicContent').value = '';
    
    // Formu kapat
    toggleTopicForm();
    
    // Başarı mesajı
    showNotification(translations[currentLang].topicCreated + ' 🎉');
    
    // Konular bölümüne scroll
    document.querySelector('.topics-list').scrollIntoView({ behavior: 'smooth' });
}

// Bildirim göster
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), #00cc6a);
        color: #000;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0, 255, 136, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Oyun indirme
function downloadGame(platform) {
    const downloadLinks = {
        android: 'https://d.nulsbrawl.com/dl/Nulls-Brawl-APK-64.226-(nulsbrawl.com).apk',
        ios: 'https://d.nulsbrawl.com/dl/Nulls-Brawl-APK-64.226-(nulsbrawl.com).apk' // IPA linki buraya eklenebilir
    };
    
    const message = platform === 'android' ? translations[currentLang].downloadingAPK : translations[currentLang].downloadingIPA;
    showNotification(message + ' 📱');
    
    // İndirmeyi başlat - yeni pencerede aç
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = downloadLinks[platform];
        link.download = platform === 'android' ? 'SceBrawl.apk' : 'SceBrawl.ipa';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 500);
}

// CSS animasyonları için style ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
