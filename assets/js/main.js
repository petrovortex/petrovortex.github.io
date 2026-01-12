// --- 1. НАСТРОЙКА FIREBASE ---
// Вставь сюда свои данные из консоли Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCT8cb1AQ4AylcD1b75bKa07Cbnt32M2yY",
  authDomain: "open-thoughts-by-petrovortex.firebaseapp.com",
  projectId: "open-thoughts-by-petrovortex",
  databaseURL: "https://open-thoughts-by-petrovortex-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "open-thoughts-by-petrovortex.firebasestorage.app",
  messagingSenderId: "26636268836",
  appId: "1:26636268836:web:68d7b00fdf16f9652a6fb1",
  measurementId: "G-SMNZKZV5W2"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 2. ЛОГИКА ДЛЯ СТРАНИЦЫ СТАТЬИ ---
// Проверяем, находимся ли мы внутри статьи (есть ли slug)
if (window.articleSlug) {
    const postRef = ref(db, 'posts/' + window.articleSlug);
    
    // А) СЧЕТЧИК ПРОСМОТРОВ (увеличиваем сразу при загрузке)
    // Используем localStorage, чтобы не накручивать просмотры при перезагрузке страницы одним и тем же человеком
    const viewedKey = 'viewed_' + window.articleSlug;
    if (!localStorage.getItem(viewedKey)) {
        runTransaction(postRef, (post) => {
            if (post) {
                post.views = (post.views || 0) + 1;
            } else {
                post = { views: 1, likes: 0 };
            }
            return post;
        });
        localStorage.setItem(viewedKey, 'true');
    }

    // Б) СЛУШАЕМ ИЗМЕНЕНИЯ (чтобы обновить цифры на экране)
    onValue(postRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('meta-views').innerText = `👁️ ${data.views || 0}`;
            document.getElementById('meta-likes').innerText = `❤️ ${data.likes || 0}`;
            document.getElementById('like-btn-count').innerText = data.likes || 0;
        }
    });

    // В) ЛОГИКА ЛАЙКА
    const likeBtn = document.getElementById('like-btn');
    const contentBody = document.querySelector('.post-content-body');
    const heartAnim = document.getElementById('like-animation-heart');

    // Функция лайка
    function doLike() {
        // Проверка: лайкал ли уже?
        const likedKey = 'liked_' + window.articleSlug;
        if (localStorage.getItem(likedKey)) {
            alert("Вы уже поставили лайк этой статье!");
            return;
        }

        // Анимация сердца по центру
        heartAnim.classList.remove('animate');
        void heartAnim.offsetWidth; // хак для перезапуска анимации
        heartAnim.classList.add('animate');

        // Анимация кнопки
        likeBtn.style.transform = "scale(1.2)";
        setTimeout(() => likeBtn.style.transform = "scale(1)", 200);

        // Запись в базу
        runTransaction(postRef, (post) => {
            if (post) {
                post.likes = (post.likes || 0) + 1;
            } else {
                post = { views: 1, likes: 1 };
            }
            return post;
        });

        // Запоминаем, что лайкнул
        localStorage.setItem(likedKey, 'true');
    }

    // Обработчик кнопки
    likeBtn.addEventListener('click', doLike);

    // Обработчик двойного тапа по тексту
    contentBody.addEventListener('dblclick', (e) => {
        doLike();
    });
}

// --- 3. ЛОГИКА ДЛЯ ЛЕНТЫ (ГЛАВНАЯ) ---
// Если мы на главной, нам нужно подгрузить лайки для всех статей в списке
const viewCounts = document.querySelectorAll('.view-count');
if (viewCounts.length > 0) {
    viewCounts.forEach(el => {
        const slug = el.getAttribute('data-slug');
        const pRef = ref(db, 'posts/' + slug);
        onValue(pRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                el.innerText = data.views || 0;
                // Ищем соседний элемент лайков
                const likeEl = el.closest('.post-meta').querySelector('.like-count');
                if(likeEl) likeEl.innerText = data.likes || 0;
            } else {
                el.innerText = 0;
                const likeEl = el.closest('.post-meta').querySelector('.like-count');
                if(likeEl) likeEl.innerText = 0;
            }
        });
    });
}

// --- 4. КНОПКА "НАВЕРХ" ---
const backToTopBtn = document.getElementById('back-to-top');
const pinnedPost = document.querySelector('.pinned-post');

window.addEventListener('scroll', () => {
    let threshold = 300; // По умолчанию через 300px
    
    // Если есть закрепленная статья, кнопка появится, когда она скроется
    if (pinnedPost) {
        threshold = pinnedPost.offsetTop + pinnedPost.offsetHeight;
    }

    if (window.scrollY > threshold) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
