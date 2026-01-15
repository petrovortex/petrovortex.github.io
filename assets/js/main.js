import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

    function getCachedStats(slug) {
        const cached = sessionStorage.getItem('stats_' + slug);
        return cached ? JSON.parse(cached) : null;
    }
    function setCachedStats(slug, data) {
        sessionStorage.setItem('stats_' + slug, JSON.stringify(data));
    }

    // ОПРЕДЕЛЯЕМ ЯЗЫК СТРАНИЦЫ (из тега html lang="...")
    const currentLang = document.documentElement.lang || 'ru';
    const textDict = {
        ru: {
            copied: "Ссылка на секцию скопирована!",
            copyHint: "Скопировать ссылку",
            tocTitle: "Содержание"
        },
        en: {
            copied: "Section link copied!",
            copyHint: "Copy link",
            tocTitle: "Table of Contents"
        }
    };
    const texts = textDict[currentLang] || textDict['ru'];

    // --- 1. ЛОГИКА СТАТЬИ ---
    if (window.articleSlug) {
        
        // --- FIREBASE ---
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
        
        if (contentBody) {
            contentBody.addEventListener('dblclick', (e) => {
                if (e.target.closest('h2') || e.target.closest('h3') || e.target.tagName === 'A') return; 
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

            const links = contentBody.querySelectorAll('a');
            links.forEach(link => {
                if (link.hostname !== window.location.hostname && !link.hash) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
            });

            // ЗАПУСК ЛОГИКИ СЕКЦИЙ
            processSections(contentBody);
        }
    }

    // --- ФУНКЦИЯ ОБРАБОТКИ СЕКЦИЙ (ИСПРАВЛЕННАЯ) ---
    function processSections(contentBody) {
        // 1. Ищем все H2
        const h2Elements = Array.from(contentBody.querySelectorAll('h2'));
        if (h2Elements.length === 0) return; // Если секций нет - выходим

        const tocContainer = document.getElementById('toc-container');
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        // 2. Проходим по каждому H2 и собираем контент ПОД ним
        h2Elements.forEach(h2 => {
            // А. ID и Атрибуты
            if (!h2.id) h2.id = slugify(h2.innerText);
            h2.className = 'section-header-h2';
            h2.setAttribute('data-hint', texts.copyHint); // Текст подсказки (RU/EN)

            // Б. Создаем DIV для контента секции
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section-content';
            sectionDiv.id = 'sec-' + h2.id;

            // В. Собираем всех соседей, пока не встретим следующий H2
            let nextNode = h2.nextSibling;
            const elementsToMove = [];
            
            while (nextNode) {
                // Если встретили следующий H2 - стоп
                if (nextNode.nodeType === 1 && nextNode.tagName === 'H2') break;
                
                const nodeToMove = nextNode;
                nextNode = nextNode.nextSibling; // Сразу берем следующий, т.к. текущий переместим
                elementsToMove.push(nodeToMove);
            }

            // Перемещаем найденные элементы внутрь DIV
            // Вставляем DIV после H2
            h2.after(sectionDiv);
            elementsToMove.forEach(node => sectionDiv.appendChild(node));

            // Г. Добавляем Шеврон (Птичку)
            const chevron = document.createElement('svg');
            chevron.className = 'section-toggle-icon';
            // Используем простой путь для стрелки вниз
            chevron.innerHTML = '<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>';
            chevron.setAttribute('viewBox', '0 0 24 24');
            h2.insertBefore(chevron, h2.firstChild);

            // Д. Добавляем в TOC (Содержание)
            const tocLi = document.createElement('li');
            const tocLink = document.createElement('a');
            tocLink.href = '#' + h2.id;
            tocLink.innerText = h2.innerText;
            tocLink.onclick = (e) => handleTocClick(e, h2.id);
            tocLi.appendChild(tocLink);
            
            // Е. Ищем H3 внутри собранного sectionDiv
            const h3Elements = Array.from(sectionDiv.querySelectorAll('h3'));
            if (h3Elements.length > 0) {
                const subUl = document.createElement('ul');
                subUl.className = 'toc-sublist';
                
                h3Elements.forEach(h3 => {
                    if (!h3.id) h3.id = slugify(h3.innerText);
                    h3.setAttribute('data-hint', texts.copyHint); // Подсказка
                    h3.addEventListener('click', () => copyAnchor(h3.id)); // Копирование H3

                    const subLi = document.createElement('li');
                    const subLink = document.createElement('a');
                    subLink.href = '#' + h3.id;
                    subLink.innerText = h3.innerText;
                    subLink.onclick = (e) => handleTocClick(e, h3.id);
                    subLi.appendChild(subLink);
                    subUl.appendChild(subLi);
                });
                tocLi.appendChild(subUl);
            }
            tocList.appendChild(tocLi);

            // Ж. Обработчик клика по H2
            h2.addEventListener('click', (e) => {
                // Если кликнули по тексту или пустому месту справа - копируем
                // Если по иконке - сворачиваем
                if (e.target === chevron || e.target.tagName === 'path' || e.target.tagName === 'svg') {
                     toggleSection(h2, sectionDiv);
                } else {
                     copyAnchor(h2.id);
                }
            });
        });

        // 3. Финализируем TOC
        tocContainer.innerHTML = `<h3 class="toc-title">${texts.tocTitle}</h3>`;
        tocContainer.appendChild(tocList);
        tocContainer.style.display = 'block';

        // Открытие по ссылке
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
            contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
            setTimeout(() => contentDiv.style.maxHeight = "none", 400);
        } else {
            // Свернуть
            contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
            requestAnimationFrame(() => {
                header.classList.add('collapsed');
                contentDiv.style.maxHeight = "0px";
            });
        }
    }

    function handleTocClick(e, targetId) {
        e.preventDefault();
        openSectionById(targetId);
        history.pushState(null, null, '#' + targetId);
    }

    function openSectionById(id) {
        const target = document.getElementById(id);
        if (!target) return;

        const parentSection = target.closest('.section-content');
        if (parentSection) {
            const header = parentSection.previousElementSibling;
            if (header && header.classList.contains('collapsed')) {
                toggleSection(header, parentSection);
            }
        }
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function copyAnchor(id) {
        const url = window.location.href.split('#')[0] + '#' + id;
        navigator.clipboard.writeText(url).then(() => {
            showToast(texts.copied);
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
            .replace(/\s+/g, '-')
            .replace(/[^\w\-а-яё]+/g, '')
            .replace(/\-\-+/g, '-');
    }

    // --- ОСТАЛЬНАЯ ЛОГИКА ---
    // (Лента, Кнопка наверх, Почта - без изменений, но они тут нужны)
    const viewCounts = document.querySelectorAll('.view-count');
    if (viewCounts.length > 0) {
        viewCounts.forEach(el => {
            const slug = el.getAttribute('data-slug');
            const likeEl = el.closest('.post-meta').querySelector('.like-count');
            const cached = getCachedStats(slug);
            if (cached) { el.innerText = cached.views || 0; if(likeEl) likeEl.innerText = cached.likes || 0; }
            const pRef = ref(db, 'posts/' + slug);
            onValue(pRef, (snapshot) => {
                const data = snapshot.val();
                if (data) { el.innerText = data.views || 0; if(likeEl) likeEl.innerText = data.likes || 0; setCachedStats(slug, { views: data.views, likes: data.likes }); }
            });
        });
    }

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
    if (backToTopBtn) backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
