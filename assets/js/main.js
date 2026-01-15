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

    // --- КЭШ ---
    function getCachedStats(slug) {
        const cached = sessionStorage.getItem('stats_' + slug);
        return cached ? JSON.parse(cached) : null;
    }
    function setCachedStats(slug, data) {
        sessionStorage.setItem('stats_' + slug, JSON.stringify(data));
    }

    // =======================================================
    // 1. ЛОГИКА ДЛЯ СТАТЬИ (СЕКЦИИ, ЛАЙКИ, ССЫЛКИ)
    // =======================================================
    if (window.articleSlug) {
        
        // --- A. FIREBASE (ЛАЙКИ И ПРОСМОТРЫ) ---
        const postRef = ref(db, 'posts/' + window.articleSlug);
        const cached = getCachedStats(window.articleSlug);
        if (cached) updateUI(cached.views, cached.likes);

        const viewedKey = 'viewed_' + window.articleSlug;
        if (!localStorage.getItem(viewedKey)) {
            runTransaction(postRef, (post) => {
                if (post) { post.views = (post.views || 0) + 1; } 
                else { post = { views: 1, likes: 0 }; }
                return post;
            });
            localStorage.setItem(viewedKey, 'true');
        }

        onValue(postRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateUI(data.views, data.likes);
                setCachedStats(window.articleSlug, { views: data.views, likes: data.likes });
            }
        });

        function updateUI(views, likes) {
            const viewEl = document.getElementById('meta-views');
            const likeEl = document.getElementById('meta-likes');
            const btnEl = document.getElementById('like-btn-count');
            if (viewEl) viewEl.innerText = `👁️ ${views || 0}`;
            if (likeEl) likeEl.innerText = `❤️ ${likes || 0}`;
            if (btnEl) btnEl.innerText = likes || 0;
        }

        function doLike() {
            const likeBtn = document.getElementById('like-btn');
            if (likeBtn) {
                likeBtn.style.transform = "scale(1.2)";
                setTimeout(() => likeBtn.style.transform = "scale(1)", 200);
            }
            const likedKey = 'liked_' + window.articleSlug;
            if (localStorage.getItem(likedKey)) return;

            const currentLikes = parseInt(document.getElementById('like-btn-count').innerText || 0);
            updateUI(null, currentLikes + 1); 

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
        
        // --- B. ОБРАБОТКА КОНТЕНТА (СЕКЦИИ И СОДЕРЖАНИЕ) ---
        if (contentBody) {
            
            // 1. Double Click Like
            contentBody.addEventListener('dblclick', (e) => {
                if (e.target.closest('h2') || e.target.closest('h3') || e.target.tagName === 'A') return; // Не лайкать на заголовках
                if (window.getSelection) { window.getSelection().removeAllRanges(); }
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

            // 2. Внешние ссылки в новую вкладку
            const links = contentBody.querySelectorAll('a');
            links.forEach(link => {
                if (link.hostname !== window.location.hostname && !link.hash) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
            });

            // --- C. МАГИЯ СЕКЦИЙ И TOC ---
            processSections(contentBody);
        }
    }

    // --- ФУНКЦИЯ ОБРАБОТКИ СЕКЦИЙ ---
    function processSections(contentBody) {
        const headers = Array.from(contentBody.querySelectorAll('h2, h3'));
        
        // Если нет H2, ничего не делаем
        if (headers.filter(h => h.tagName === 'H2').length === 0) return;

        const tocContainer = document.getElementById('toc-container');
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        
        let currentSectionDiv = null;
        let currentH2Li = null;
        let currentH3Ul = null;

        // 1. Проходим по всем элементам и группируем их
        const children = Array.from(contentBody.children);
        
        children.forEach(node => {
            if (node.tagName === 'H2') {
                // Создаем ID
                if (!node.id) node.id = slugify(node.innerText);
                
                // --- Добавляем в TOC ---
                currentH2Li = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#' + node.id;
                link.innerText = node.innerText;
                link.onclick = (e) => handleTocClick(e, node.id);
                currentH2Li.appendChild(link);
                tocList.appendChild(currentH2Li);
                currentH3Ul = null; // Сброс подсписка

                // --- Создаем обертку для сворачивания ---
                // Превращаем H2 в кнопку
                node.className = 'section-header-h2';
                const chevron = document.createElement('svg');
                chevron.className = 'section-toggle-icon';
                chevron.innerHTML = '<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>';
                chevron.setAttribute('viewBox', '0 0 24 24');
                
                // Вставляем шеврон ПЕРЕД текстом
                node.insertBefore(chevron, node.firstChild);

                // Создаем DIV для контента
                currentSectionDiv = document.createElement('div');
                currentSectionDiv.className = 'section-content';
                currentSectionDiv.id = 'sec-' + node.id;
                
                // Вставляем DIV после H2
                node.after(currentSectionDiv);

                // Логика клика по H2 (Сворачивание)
                node.addEventListener('click', (e) => {
                    // Если кликнули по тексту - копируем ссылку
                    if (e.target !== chevron && e.target.tagName !== 'SVG' && e.target.tagName !== 'path') {
                        copyAnchor(node.id);
                    } else {
                        // Иначе сворачиваем
                        toggleSection(node, currentSectionDiv);
                    }
                });

            } else if (node.tagName === 'H3') {
                if (!node.id) node.id = slugify(node.innerText);
                
                // Добавляем в TOC
                if (currentH2Li) {
                    if (!currentH3Ul) {
                        currentH3Ul = document.createElement('ul');
                        currentH3Ul.className = 'toc-sublist';
                        currentH2Li.appendChild(currentH3Ul);
                    }
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = '#' + node.id;
                    link.innerText = node.innerText;
                    link.onclick = (e) => handleTocClick(e, node.id);
                    li.appendChild(link);
                    currentH3Ul.appendChild(li);
                }

                // Переносим H3 внутрь текущей секции
                if (currentSectionDiv) currentSectionDiv.appendChild(node);
                
                // Логика копирования
                node.addEventListener('click', () => copyAnchor(node.id));

            } else {
                // Обычный текст/картинки - переносим в текущую секцию
                if (currentSectionDiv) {
                    currentSectionDiv.appendChild(node);
                }
            }
        });

        // Отображаем TOC
        tocContainer.innerHTML = '<h3 class="toc-title">Содержание</h3>';
        tocContainer.appendChild(tocList);
        tocContainer.style.display = 'block';

        // Проверяем хэш при загрузке (чтобы открыть нужную секцию)
        if (window.location.hash) {
            setTimeout(() => {
                const id = window.location.hash.substring(1);
                openSectionById(id);
            }, 500);
        }
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    
    function toggleSection(header, contentDiv) {
        if (header.classList.contains('collapsed')) {
            // Развернуть
            header.classList.remove('collapsed');
            contentDiv.style.maxHeight = contentDiv.scrollHeight + "px"; // Анимация
            setTimeout(() => contentDiv.style.maxHeight = "none", 400); // Убираем ограничение после анимации
        } else {
            // Свернуть
            contentDiv.style.maxHeight = contentDiv.scrollHeight + "px"; // Фиксируем высоту
            requestAnimationFrame(() => {
                header.classList.add('collapsed');
                contentDiv.style.maxHeight = "0px";
            });
        }
    }

    function handleTocClick(e, targetId) {
        e.preventDefault();
        openSectionById(targetId);
        // Меняем URL без перезагрузки
        history.pushState(null, null, '#' + targetId);
    }

    function openSectionById(id) {
        const target = document.getElementById(id);
        if (!target) return;

        // Ищем родительскую секцию
        const parentSection = target.closest('.section-content');
        if (parentSection) {
            // Находим заголовок этой секции (он перед div)
            const header = parentSection.previousElementSibling;
            if (header && header.classList.contains('collapsed')) {
                toggleSection(header, parentSection);
            }
        }

        // Скроллим к элементу
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function copyAnchor(id) {
        const url = window.location.href.split('#')[0] + '#' + id;
        navigator.clipboard.writeText(url).then(() => {
            showToast("Ссылка на секцию скопирована!");
        });
    }

    function showToast(text) {
        let toast = document.querySelector('.anchor-tooltip');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'anchor-tooltip';
            document.body.appendChild(toast);
        }
        toast.innerText = text;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2000);
    }

    function slugify(text) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')           // Пробелы в тире
            .replace(/[^\w\-а-яё]+/g, '')   // Удаляем спецсимволы
            .replace(/\-\-+/g, '-');        // Убираем двойные тире
    }


    // =======================================================
    // 2. ОСТАЛЬНАЯ ЛОГИКА (ЛЕНТА, КНОПКА ВВЕРХ, ПОЧТА)
    // =======================================================
    
    // Лента просмотров
    const viewCounts = document.querySelectorAll('.view-count');
    if (viewCounts.length > 0) {
        viewCounts.forEach(el => {
            const slug = el.getAttribute('data-slug');
            const likeEl = el.closest('.post-meta').querySelector('.like-count');
            const cached = getCachedStats(slug);
            if (cached) {
                el.innerText = cached.views || 0;
                if(likeEl) likeEl.innerText = cached.likes || 0;
            }
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

    // Кнопка наверх
    const backToTopBtn = document.getElementById('back-to-top');
    const pinnedPost = document.querySelector('.pinned-post'); 
    const socialBar = document.querySelector('.social-bar');
    window.addEventListener('scroll', () => {
        if (!backToTopBtn) return;
        let threshold = 300;
        if (pinnedPost) { threshold = pinnedPost.offsetTop + pinnedPost.offsetHeight; }
        else if (socialBar) { threshold = socialBar.offsetTop + socialBar.offsetHeight; }

        if (window.scrollY > threshold) backToTopBtn.classList.add('visible');
        else backToTopBtn.classList.remove('visible');
    });
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Копирование почты
    const emailBtn = document.getElementById('email-copy-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = "alex.petrovortex@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                const tooltip = emailBtn.querySelector('.copy-tooltip');
                tooltip.classList.add('visible');
                setTimeout(() => tooltip.classList.remove('visible'), 2000);
            });
        });
    }

} catch (e) {
    console.error("JS Error:", e);
}
