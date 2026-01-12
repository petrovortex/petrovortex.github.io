import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// --- КОНФИГ ---
const firebaseConfig = {
  apiKey: "AIzaSyCT8cb1AQ4AylcD1b75bKa07Cbnt32M2yY",
  authDomain: "open-thoughts-by-petrovortex.firebaseapp.com",
  projectId: "open-thoughts-by-petrovortex",
  databaseURL: "https://open-thoughts-by-petrovortex-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "open-thoughts-by-petrovortex.firebasestorage.app",
  messagingSenderId: "26636268836",
  appId: "1:26636268836:web:68d7b00fdf16f9652a6fb1",
  measurementId: "G-SMNZKZV5W2"
};

try {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    // console.log("Firebase connected"); // Можно закомментировать для чистоты

    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ КЭША
    function getCachedStats(slug) {
        const cached = sessionStorage.getItem('stats_' + slug);
        return cached ? JSON.parse(cached) : null;
    }
    function setCachedStats(slug, data) {
        sessionStorage.setItem('stats_' + slug, JSON.stringify(data));
    }

    // --- 1. ЛОГИКА ДЛЯ СТРАНИЦЫ СТАТЬИ ---
    if (window.articleSlug) {
        const postRef = ref(db, 'posts/' + window.articleSlug);
        
        // A) МГНОВЕННЫЙ ПОКАЗ ИЗ КЭША (Пока грузится интернет)
        const cached = getCachedStats(window.articleSlug);
        if (cached) {
            updateUI(cached.views, cached.likes);
        }

        // Б) СЧЕТЧИК ПРОСМОТРОВ (+1)
        const viewedKey = 'viewed_' + window.articleSlug;
        if (!localStorage.getItem(viewedKey)) {
            runTransaction(postRef, (post) => {
                if (post) { post.views = (post.views || 0) + 1; } 
                else { post = { views: 1, likes: 0 }; }
                return post;
            });
            localStorage.setItem(viewedKey, 'true');
        }

        // В) СЛУШАЕМ ОБНОВЛЕНИЯ (Realtime)
        onValue(postRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateUI(data.views, data.likes);
                setCachedStats(window.articleSlug, { views: data.views, likes: data.likes });
            }
        });

        // Функция обновления интерфейса
        function updateUI(views, likes) {
            const viewEl = document.getElementById('meta-views');
            const likeEl = document.getElementById('meta-likes');
            const btnEl = document.getElementById('like-btn-count');
            if (viewEl) viewEl.innerText = `👁️ ${views || 0}`;
            if (likeEl) likeEl.innerText = `❤️ ${likes || 0}`;
            if (btnEl) btnEl.innerText = likes || 0;
        }

        // Г) ЛОГИКА ЛАЙКА
        function doLike() {
            const likedKey = 'liked_' + window.articleSlug;
            if (localStorage.getItem(likedKey)) {
                alert("Вы уже поставили лайк этой статье!");
                return;
            }

            // Анимации интерфейса
            const heartAnim = document.getElementById('like-animation-heart'); // На всякий случай
            const likeBtn = document.getElementById('like-btn');
            if (likeBtn) {
                likeBtn.style.transform = "scale(1.2)";
                setTimeout(() => likeBtn.style.transform = "scale(1)", 200);
            }

            // Оптимистичное обновление (сразу меняем цифру, не ждем ответа сервера)
            const currentLikes = parseInt(document.getElementById('like-btn-count').innerText || 0);
            updateUI(null, currentLikes + 1); // views не трогаем

            // Запись в базу
            runTransaction(postRef, (post) => {
                if (post) { post.likes = (post.likes || 0) + 1; }
                else { post = { views: 1, likes: 1 }; }
                return post;
            });
            localStorage.setItem(likedKey, 'true');
        }

        const likeBtn = document.getElementById('like-btn');
        if (likeBtn) likeBtn.addEventListener('click', doLike);

        const contentBody = document.querySelector('.post-content-body');
        if (contentBody) {
            contentBody.addEventListener('dblclick', (e) => {
                if (window.getSelection) { window.getSelection().removeAllRanges(); }
                
                // Создаем сердечко в месте клика
                const heart = document.createElement('div');
                heart.innerText = '❤️';
                heart.classList.add('heart-animation');
                heart.style.left = e.clientX + 'px';
                heart.style.top = e.clientY + 'px';
                document.body.appendChild(heart);
                
                requestAnimationFrame(() => { heart.classList.add('animate'); });
                setTimeout(() => { heart.remove(); }, 800);
                
                doLike();
            });
        }
    }

    // --- 2. ЛОГИКА ДЛЯ ЛЕНТЫ (ГЛАВНАЯ) ---
    const viewCounts = document.querySelectorAll('.view-count');
    if (viewCounts.length > 0) {
        viewCounts.forEach(el => {
            const slug = el.getAttribute('data-slug');
            const likeEl = el.closest('.post-meta').querySelector('.like-count');

            // 1. Сначала показываем из кэша (моментально)
            const cached = getCachedStats(slug);
            if (cached) {
                el.innerText = cached.views || 0;
                if(likeEl) likeEl.innerText = cached.likes || 0;
            }

            // 2. Потом грузим свежее
            const pRef = ref(db, 'posts/' + slug);
            onValue(pRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    el.innerText = data.views || 0;
                    if(likeEl) likeEl.innerText = data.likes || 0;
                    setCachedStats(slug, { views: data.views, likes: data.likes });
                }
            });
        });
    }

    // --- 3. КНОПКА "НАВЕРХ" ---
    const backToTopBtn = document.getElementById('back-to-top');
    const pinnedPost = document.querySelector('.pinned-post'); // или любой другой ориентир
    
    // Если pinnedPost нет (например, на странице статьи), берем просто отступ
    const triggerHeight = pinnedPost ? (pinnedPost.offsetTop + pinnedPost.offsetHeight) : 300;

    window.addEventListener('scroll', () => {
        if (backToTopBtn) {
            if (window.scrollY > triggerHeight) backToTopBtn.classList.add('visible');
            else backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

} catch (e) {
    console.error("JS Error:", e);
}
