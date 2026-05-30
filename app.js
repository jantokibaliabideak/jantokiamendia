// CEIP Mendia HLHI - Jantokia
// Lógica de Cliente JS

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    lucide.createIcons();

    // 1. LANGUAGE SWITCHER LOGIC
    const langToggle = document.getElementById('langToggle');
    const currentLang = localStorage.getItem('lang') || 'eu';
    document.body.className = document.body.className.replace(/lang-\w+/, '') + ` lang-${currentLang}`;
    updateLangBtnText(currentLang);

    langToggle.addEventListener('click', () => {
        const activeLang = document.body.classList.contains('lang-eu') ? 'eu' : 'es';
        const newLang = activeLang === 'eu' ? 'es' : 'eu';
        
        document.body.classList.remove(`lang-${activeLang}`);
        document.body.classList.add(`lang-${newLang}`);
        localStorage.setItem('lang', newLang);
        updateLangBtnText(newLang);
    });

    function updateLangBtnText(lang) {
        langToggle.querySelector('.lang-indicator').textContent = lang.toUpperCase();
    }

    // 2. THEME SWITCHER LOGIC (Dark/Light Mode)
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    // 3. MOBILE MENU LOGIC
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('mobile-active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-active');
            mobileMenuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
            lucide.createIcons();
            
            // Set active class
            link.classList.add('active');
        });
    });

    // Scroll Spy: robust getBoundingClientRect method
    const sections = document.querySelectorAll('section:not(#2urte), header');
    const navItems = document.querySelectorAll('.nav-item');

    function updateActiveNav() {
        let currentId = 'hasiera'; // Default fallback
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // If the top of the section is near or above the middle of the screen
            if (rect.top <= window.innerHeight / 2.5) {
                currentId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentId}`) {
                item.classList.add('active');
            }
        });
    }

    // Update continuously to avoid browser scroll event bugs
    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('resize', updateActiveNav);
    setInterval(updateActiveNav, 200);
    updateActiveNav();

    // Add class to navbar on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. TAB CONTROLLER (Espacio 2 Años)
    const tabCards = document.querySelectorAll('.info-card');
    const tabContents = document.querySelectorAll('.display-tab-content');

    tabCards.forEach(card => {
        card.addEventListener('click', () => {
            const tabTarget = card.getAttribute('data-tab');
            
            // Deactivate all cards & contents
            tabCards.forEach(c => c.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate current card & content
            card.classList.add('active');
            document.getElementById(tabTarget).classList.add('active');
        });
    });

    // 5. ACCORDION FAQ LOGIC
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                accItem.querySelector('.accordion-body').style.maxHeight = null;
            });
            
            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // 6. DYNAMIC DATA LOADING (data.json)
    // We will attempt to load a JSON file that handles dynamic updates for news and documents.
    // If it fails or doesn't exist, we keep the static HTML defaults.
    fetch('data.json?t=' + Date.now())
        .then(response => {
            if (!response.ok) throw new Error('No custom data.json found, using defaults.');
            return response.json();
        })
        .then(data => {
            renderDynamicNews(data.news);
            renderDynamicMenus(data.menus);
            renderDynamicDocs(data.documents);
            renderDynamicGallery(data.gallery);
            renderDynamicConfig(data.config);
        })
        .catch(err => {
            console.log(err.message);
        });

    function renderDynamicNews(newsList) {
        if (!newsList || newsList.length === 0) return;
        
        const visibleNews = newsList.filter(news => !news.isHidden);
        if (visibleNews.length === 0) return;

        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = ''; // Clear fallback static item
        
        visibleNews.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-card';
            
            const hasTitleEu = news.title_eu && news.title_eu.trim() !== '';
            const hasTitleEs = news.title_es && news.title_es.trim() !== '';
            const hasTextEu = news.text_eu && news.text_eu.trim() !== '';
            const hasTextEs = news.text_es && news.text_es.trim() !== '';

            const titleHtml = (hasTitleEu || hasTitleEs) ? `
                <h3>
                    ${hasTitleEu ? `<span class="eu">${news.title_eu}</span>` : ''}
                    ${hasTitleEs ? `<span class="es">${news.title_es}</span>` : ''}
                </h3>
            ` : '';

            const textHtml = (hasTextEu || hasTextEs) ? `
                <div class="news-text-container">
                    ${hasTextEu ? `<div class="eu">${news.text_eu}</div>` : ''}
                    ${hasTextEs ? `<div class="es">${news.text_es}</div>` : ''}
                </div>
            ` : '';

            article.innerHTML = `
                ${news.imageUrl ? `<div class="news-img-box"><img src="${news.imageUrl}" class="news-img" alt="News Image"></div>` : ''}
                <div class="news-content">
                    <span class="news-date">${news.date}</span>
                    ${titleHtml}
                    ${textHtml}
                </div>
            `;
            newsGrid.appendChild(article);
        });
    }

    function renderDynamicMenus(menusList) {
        if (!menusList || menusList.length === 0) return;
        const menuListContainer = document.getElementById('menuDownloadsList');
        menuListContainer.innerHTML = '';
        
        menusList.forEach(menu => {
            const a = document.createElement('a');
            a.href = menu.fileUrl;
            a.className = 'menu-download-item';
            a.target = '_blank';
            const isLink = menu.type === 'Enlace';
            const icon = isLink ? 'folder-open' : 'file-text';
            const actionIcon = isLink ? 'external-link' : 'download';
            
            a.innerHTML = `
                <div class="item-icon"><i data-lucide="${icon}"></i></div>
                <div class="item-details">
                    <span class="item-name">
                        <span class="eu">${menu.name_eu}</span>
                        <span class="es">${menu.name_es}</span>
                    </span>
                    <span class="item-meta">${menu.type || 'PDF'} • ${menu.size || ''}</span>
                </div>
                <div class="item-action"><i data-lucide="${actionIcon}"></i></div>
            `;
            menuListContainer.appendChild(a);
        });
        lucide.createIcons();
    }

    function renderDynamicDocs(docsList) {
        if (!docsList || docsList.length === 0) return;
        const docsGrid = document.getElementById('docsGrid');
        docsGrid.innerHTML = '';
        
        docsList.forEach(doc => {
            const card = document.createElement('a');
            card.href = doc.fileUrl;
            card.className = 'card doc-card';
            card.target = '_blank';
            
            card.innerHTML = `
                <div class="doc-card-icon"><i data-lucide="${doc.icon || 'file-down'}"></i></div>
                <h3>
                    <span class="eu">${doc.title_eu}</span>
                    <span class="es">${doc.title_es}</span>
                </h3>
                <p>
                    <span class="eu">${doc.desc_eu}</span>
                    <span class="es">${doc.desc_es}</span>
                </p>
                <span class="doc-link">
                    <span class="eu">Deskargatu</span><span class="es">Descargar</span>
                    <i data-lucide="arrow-right"></i>
                </span>
            `;
            docsGrid.appendChild(card);
        });
        lucide.createIcons();
    }

    // 7. LIGHTBOX MODAL LOGIC FOR IMAGES (NEWS & GALLERY)
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.querySelector('.modal-close');

    if (imageModal && modalImage) {
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.addEventListener('click', (e) => {
                const imgBox = e.target.closest('.news-img-box');
                if (imgBox) {
                    const img = imgBox.querySelector('.news-img');
                    if (img) {
                        modalImage.src = img.src;
                        imageModal.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Disable page scrolling
                    }
                }
            });
        }

        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            galleryGrid.addEventListener('click', (e) => {
                const item = e.target.closest('.gallery-item');
                if (item) {
                    const img = item.querySelector('img');
                    if (img) {
                        modalImage.src = img.src;
                        imageModal.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Disable page scrolling
                    }
                }
            });
        }

        const closeModal = () => {
            imageModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore page scrolling
        };

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target.closest('.modal-close')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});

    function renderDynamicGallery(galleryList) {
        if (!galleryList || galleryList.length === 0) return;
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';
        galleryList.forEach(item => {
            const a = document.createElement('a');
            a.href = item.imageUrl;
            a.setAttribute('data-lightbox', 'comedor');
            
            const img = document.createElement('img');
            img.src = item.imageUrl;
            img.className = 'gallery-img';
            img.alt = 'Comedor Mendia';
            
            a.appendChild(img);
            galleryGrid.appendChild(a);
        });
    }

    function renderDynamicConfig(config) {
        if (!config) return;
        
        const map = {
            'heroTitle': {eu: config.hero_title_eu, es: config.hero_title_es},
            'heroDesc': {eu: config.hero_desc_eu, es: config.hero_desc_es},
            'orgSchedule': {eu: config.org_schedule_eu, es: config.org_schedule_es},
            'orgTeam': {eu: config.org_team_eu, es: config.org_team_es}
        };

        for (const [id, langs] of Object.entries(map)) {
            const el = document.getElementById(id);
            if (el && langs.eu && langs.es) {
                // Determine structure based on the element
                if (el.tagName === 'H1') {
                    el.innerHTML = `<span class="eu">${langs.eu}</span><span class="es">${langs.es}</span>`;
                } else if (el.tagName === 'P') {
                    el.innerHTML = `<span class="eu">${langs.eu}</span><span class="es">${langs.es}</span>`;
                } else if (el.tagName === 'DIV' && el.classList.contains('org-list-container')) {
                    el.innerHTML = `<ul class="eu list-unstyled">${langs.eu}</ul><ul class="es list-unstyled">${langs.es}</ul>`;
                }
            }
        }
    }
