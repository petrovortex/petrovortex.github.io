import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// --- КОНФИГ (Твои данные) ---
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

// Оборачиваем в try-catch, чтобы ошибки не ломали сайт
try {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    console.log("Firebase connected");

    // --- 1. ЛОГИКА ДЛЯ СТРАНИЦЫ СТАТЬИ ---
    if (window.articleSlug) {
        const postRef = ref(db, 'posts/' + window.articleSlug);
        
        // Счетчик просмотров
        const viewedKey = 'viewed_' + window.articleSlug;
        // Проверяем localStorage (чтобы не накручивать)
        if (!localStorage.getItem(viewedKey)) {
            runTransaction(postRef, (post) => {
                if (post) { post.views = (post.views || 0) + 1; } 
                else { post = { views: 1, likes: 0 }; }
                return post;
            });
            localStorage.setItem(viewedKey, 'true');
        }

        // Слушаем изменения в базе
        onValue(postRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Добавил проверки (if), чтобы не было ошибок, если элементов нет
                const viewEl = document.getElementById('meta-views');
                const likeEl = document.getElementById('meta-likes');
                const btnEl = document.getElementById('like-btn-count');

                if (viewEl) viewEl.innerText = `👁️ ${data.views || 0}`;
                if (likeEl) likeEl.innerText = `❤️ ${data.likes || 0}`;
                if (btnEl) btnEl.innerText = data.likes || 0;
            }
        });

        // Функция лайка
        function doLike() {
            const likedKey = 'liked_' + window.articleSlug;
            if (localStorage.getItem(likedKey)) {
                alert("Вы уже поставили лайк этой статье!");
                return;
            }

            // Анимации
            const heartAnim = document.getElementById('like-animation-heart');
            const likeBtn = document.getElementById('like-btn');
            
            if (heartAnim) {
                heartAnim.classList.remove('animate');
                void heartAnim.offsetWidth; 
                heartAnim.classList.add('animate');
            }

            if (likeBtn) {
                likeBtn.style.transform = "scale(1.2)";
                setTimeout(() => likeBtn.style.transform = "scale(1)", 200);
            }

            // Запись в базу
            runTransaction(postRef, (post) => {
                if (post) { post.likes = (post.likes || 0) + 1; }
                else { post = { views: 1, likes: 1 }; }
                return post;
            });

            localStorage.setItem(likedKey, 'true');
        }

        // КЛИК ПО КНОПКЕ
        const likeBtn = document.getElementById('like-btn');
        if (likeBtn) likeBtn.addEventListener('click', doLike);

        // ДВОЙНОЙ КЛИК ПО ТЕКСТУ
        const contentBody = document.querySelector('.post-content-body');
        if (contentBody) {
            contentBody.addEventListener('dblclick', (e) => {
                // 1. Убираем выделение текста
                if (window.getSelection) { window.getSelection().removeAllRanges(); }
                
                // 2. Создаем сердечко на лету
                const heart = document.createElement('div');
                heart.innerText = '❤️';
                heart.classList.add('heart-animation'); // Берет стили из CSS
                
                // 3. Ставим его в координаты клика
                // e.clientX и e.clientY — это координаты мышки/пальца
                heart.style.left = e.clientX + 'px';
                heart.style.top = e.clientY + 'px';

                // 4. Добавляем на страницу
                document.body.appendChild(heart);

                // 5. Запускаем анимацию
                // requestAnimationFrame гарантирует, что браузер успеет отрисовать элемент перед добавлением класса
                requestAnimationFrame(() => {
                    heart.classList.add('animate');
                });

                // 6. Удаляем сердечко из HTML через 800мс (время анимации), чтобы не засорять память
                setTimeout(() => {
                    heart.remove();
                }, 800);

                // 7. Записываем лайк в базу
                doLike();
            });
        }
    }

    // --- 2. ЛОГИКА ДЛЯ ЛЕНТЫ (ГЛАВНАЯ) ---
    const viewCounts = document.querySelectorAll('.view-count');
    if (viewCounts.length > 0) {
        viewCounts.forEach(el => {
            const slug = el.getAttribute('data-slug');
            const pRef = ref(db, 'posts/' + slug);
            onValue(pRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    el.innerText = data.views || 0;
                    const likeEl = el.closest('.post-meta').querySelector('.like-count');
                    if(likeEl) likeEl.innerText = data.likes || 0;
                }
            });
        });
    }

    // --- 3. КНОПКА "НАВЕРХ" ---
    const backToTopBtn = document.getElementById('back-to-top');
    const pinnedPost = document.querySelector('.pinned-post');

    window.addEventListener('scroll', () => {
        let threshold = 300;
        if (pinnedPost) { threshold = pinnedPost.offsetTop + pinnedPost.offsetHeight; }
        
        if (backToTopBtn) {
            if (window.scrollY > threshold) backToTopBtn.classList.add('visible');
            else backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

} catch (e) {
    console.error("Ошибка JS:", e);
}
