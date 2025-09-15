// BL4Builds.net 交互脚本

document.addEventListener('DOMContentLoaded', function() {
    console.log('BL4Builds.net 已加载');

    // 初始化所有功能
    initMobileMenu();
    initBuildSearch();
    initBuildFilters();
    initCopyFunctionality();
    initLiteYouTube();
});

// 移动端菜单切换
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // 点击菜单项时关闭菜单
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// 构建搜索功能
function initBuildSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const buildsGrid = document.getElementById('builds-grid');
    const noResults = document.getElementById('no-results');

    if (searchInput && buildsGrid) {
        // 搜索按钮点击事件
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }

        // 回车键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // 实时搜索（可选）
        searchInput.addEventListener('input', function() {
            // 延迟搜索以避免过于频繁的操作
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(performSearch, 300);
        });
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const buildCards = buildsGrid.querySelectorAll('.build-card');
        let visibleCount = 0;

        buildCards.forEach(card => {
            const title = card.querySelector('.build-title').textContent.toLowerCase();
            const description = card.querySelector('.build-description').textContent.toLowerCase();
            const character = card.querySelector('.character-badge').textContent.toLowerCase();

            const matches = title.includes(query) ||
                          description.includes(query) ||
                          character.includes(query) ||
                          query === '';

            if (matches) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // 显示/隐藏无结果提示
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
}

// 构建筛选功能
function initBuildFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const buildsGrid = document.getElementById('builds-grid');
    const noResults = document.getElementById('no-results');

    if (filterButtons.length > 0 && buildsGrid) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 更新活跃状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // 执行筛选
                const filter = this.getAttribute('data-filter');
                filterBuilds(filter);
            });
        });
    }

    function filterBuilds(filter) {
        const buildCards = buildsGrid.querySelectorAll('.build-card');
        let visibleCount = 0;

        buildCards.forEach(card => {
            const character = card.getAttribute('data-character');
            const difficulty = card.getAttribute('data-difficulty');

            let shouldShow = false;

            if (filter === 'all') {
                shouldShow = true;
            } else if (filter === character || filter === difficulty) {
                shouldShow = true;
            }

            if (shouldShow) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // 显示/隐藏无结果提示
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
}

// 复制功能
function initCopyFunctionality() {
    const copyBuildBtn = document.getElementById('copy-build');
    const shareBuildBtn = document.getElementById('share-build');

    if (copyBuildBtn) {
        copyBuildBtn.addEventListener('click', function() {
            const url = window.location.href;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function() {
                    showNotification('构建链接已复制到剪贴板！');
                }).catch(function() {
                    fallbackCopyTextToClipboard(url);
                });
            } else {
                fallbackCopyTextToClipboard(url);
            }
        });
    }

    if (shareBuildBtn) {
        shareBuildBtn.addEventListener('click', function() {
            if (navigator.share) {
                const title = document.querySelector('.build-title').textContent;
                navigator.share({
                    title: title + ' - BL4Builds.net',
                    url: window.location.href
                });
            } else {
                // 降级到复制链接
                copyBuildBtn.click();
            }
        });
    }
}

// 降级复制功能
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showNotification('构建链接已复制到剪贴板！');
    } catch (err) {
        showNotification('复制失败，请手动复制链接');
    }

    document.body.removeChild(textArea);
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 轻量 YouTube 预载（点击时才创建 iframe）
function initLiteYouTube() {
    const els = document.querySelectorAll('.yt-lite[data-ytid]');
    els.forEach(el => {
        el.setAttribute('tabindex', '0');
        const id = el.getAttribute('data-ytid');
        const activate = () => {
            // 防止重复初始化
            if (el.classList.contains('is-active')) return;
            el.classList.add('is-active');
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
            iframe.title = 'YouTube video player';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            // 清空缩略图并插入 iframe
            el.innerHTML = '';
            el.appendChild(iframe);
        };
        el.addEventListener('click', activate, { once: true });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
            }
        });
    });
}

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
