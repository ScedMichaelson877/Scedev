// Kullanıcı sistemi
let currentUser = null;
const STORAGE_KEY = 'sced_user';

// Avatar seçenekleri
const avatarSeeds = ['ali', 'ayse', 'mehmet', 'zeynep', 'ahmet', 'fatma', 'can', 'elif', 'murat', 'selin', 'burak', 'deniz'];

// Sayfa yüklendiğinde kullanıcıyı kontrol et
window.addEventListener('DOMContentLoaded', function() {
    loadUser();
    generateAvatars();
    initLiquidCanvas();
    renderTopics();
});

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
        document.getElementById('headerUsername').textContent = currentUser.username;
        
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
}

// Login modal kapat
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Profil modal aç
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
    
    if (currentUser) {
        document.getElementById('currentAvatar').src = currentUser.avatar;
        document.getElementById('currentUsername').textContent = currentUser.username;
        document.getElementById('newUsername').value = currentUser.username;
        document.getElementById('userBio').value = currentUser.bio || '';
        
        // Mevcut avatarı seçili göster
        const avatarSeed = currentUser.avatar.split('seed=')[1];
        selectAvatar(avatarSeed);
        
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

// Giriş yap
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    
    if (!username) {
        alert('Lütfen kullanıcı adı girin!');
        return;
    }
    
    if (!email) {
        alert('Lütfen e-posta girin!');
        return;
    }
    
    currentUser = {
        username: username,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`,
        themeColor: '#00ff88',
        bio: '',
        joinDate: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    closeLoginModal();
    showNotification('Hoş geldin, ' + username + '! 🎉');
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
    currentUser.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`;
    
    // Seçili tema rengini al
    const selectedColor = document.querySelector('.color-btn.selected');
    if (selectedColor) {
        currentUser.themeColor = selectedColor.dataset.color;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    closeProfileModal();
    showNotification('Profilin güncellendi! ✨');
}

// Çıkış yap
function logout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        localStorage.removeItem(STORAGE_KEY);
        currentUser = null;
        updateUserInterface();
        showNotification('Çıkış yapıldı. Görüşmek üzere! 👋');
        
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
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === profileModal) {
        closeProfileModal();
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

// Konular için veri
let topics = [
    {
        id: 1,
        userName: "Ali",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
        title: "SceBrawl hakkında sorularım var",
        content: "Merhaba arkadaşlar! Yeni başladım ve bazı sorularım olacak. Yardımcı olabilir misiniz?",
        time: "2 saat önce"
    },
    {
        id: 2,
        userName: "Ayşe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ayse",
        title: "En iyi stratejiler neler?",
        content: "Oyunda daha iyi olmak için hangi stratejileri kullanmalıyım? Tecrübelerinizi paylaşır mısınız?",
        time: "5 saat önce"
    },
    {
        id: 3,
        userName: "Mehmet",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet",
        title: "Yeni güncelleme ne zaman gelecek?",
        content: "Gelecek güncelleme hakkında bilgi var mı? Hangi özellikler eklenecek?",
        time: "1 gün önce"
    }
];

// Konuları render et
function renderTopics() {
    const topicsList = document.getElementById('topicsList');
    
    if (topics.length === 0) {
        topicsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Henüz konu yok. İlk konuyu sen aç!</p>';
        return;
    }
    
    topicsList.innerHTML = topics.map(topic => `
        <div class="topic-card">
            <div class="topic-header">
                <img src="${topic.avatar}" alt="${topic.userName}" class="topic-avatar">
                <div class="topic-meta">
                    <h4>${topic.userName}</h4>
                    <p>${topic.time}</p>
                </div>
            </div>
            <h3 class="topic-title">${topic.title}</h3>
            <p class="topic-content">${topic.content}</p>
        </div>
    `).join('');
}

// Konu formu aç/kapat
function toggleTopicForm() {
    const form = document.getElementById('topicForm');
    const isVisible = form.style.display === 'block';
    form.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Yeni konu oluştur
function createTopic() {
    if (!currentUser) {
        alert('Konu açmak için lütfen giriş yapın!');
        openLoginModal();
        return;
    }
    
    const title = document.getElementById('topicTitle').value.trim();
    const content = document.getElementById('topicContent').value.trim();
    
    if (!title) {
        alert('Lütfen konu başlığı girin!');
        return;
    }
    
    if (!content) {
        alert('Lütfen konu içeriği girin!');
        return;
    }
    
    // Yeni konu oluştur
    const newTopic = {
        id: topics.length + 1,
        userName: currentUser.username,
        avatar: currentUser.avatar,
        title: title,
        content: content,
        time: 'Şimdi'
    };
    
    // Konuları başa ekle
    topics.unshift(newTopic);
    
    // Formu temizle
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicContent').value = '';
    
    // Konuları yeniden render et
    renderTopics();
    
    // Formu kapat
    toggleTopicForm();
    
    // Başarı mesajı
    showNotification('Konunuz başarıyla oluşturuldu! 🎉');
    
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
    const messages = {
        android: 'SceBrawl APK indiriliyor... 📱',
        ios: 'SceBrawl IPA indiriliyor... 🍎'
    };
    
    showNotification(messages[platform]);
    
    // Burada gerçek indirme linkini ekleyebilirsiniz
    // window.location.href = 'your-download-link';
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
