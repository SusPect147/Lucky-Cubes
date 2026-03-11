const animationCache = {};
let loadedCount = 0;
let totalAssets = 0;
let serverState = null;
let dataLoaded = false; // Track when coins + min are loaded

const SCRIPTS_TO_LOAD = [
    'scr/js/backend.js',
    'scr/js/wallet.js',
    'scr/js/utils/input-handlers.js',
    'scr/js/utils/formatters.js',
    'scr/js/utils/particles.js',
    'scr/js/ui/ui-updates.js',
    'scr/js/ui/quests.js',
    'scr/js/ui/shop.js',
    'scr/js/ui/inventory.js',
    'scr/js/ui/menu.js',
    'scr/js/ui/effects.js',
    'scr/js/ui/leaderboard.js',
    'scr/js/game/game.js',
    'scr/js/game/events.js',
];

const IMAGES_TO_LOAD = [
    'assets/UI/images/1-last.png',
    'assets/UI/images/2-last.png',
    'assets/UI/images/3-last.png',
    'assets/UI/images/cubes_cubes.png',
];

function _loaderGetInitData() {
    if (typeof API !== 'undefined' && API.getInitData) return API.getInitData();
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            return window.Telegram.WebApp.initData;
        }
    } catch (e) { }
    return '';
}

async function loadTGS(path) {
    try {
        let buf;
        try {
            const r = await fetch(path);
            if (!r.ok) throw new Error('fetch failed');
            buf = await r.arrayBuffer();
        } catch (fetchErr) {
            buf = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', path, true);
                xhr.responseType = 'arraybuffer';
                const timeout = setTimeout(() => reject(new Error('XHR timeout')), 8000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error('XHR failed: ' + xhr.status));
                    }
                };
                xhr.onerror = () => { clearTimeout(timeout); reject(new Error('XHR network error')); };
                xhr.send();
            });
        }
        const inflated = pako.inflate(new Uint8Array(buf));
        const text = new TextDecoder().decode(inflated);
        return JSON.parse(text);
    } catch (e) {
        console.error("Error loading TGS:", path, e);
        return null;
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        const timeout = setTimeout(() => resolve(false), 8000);
        script.onload = () => { clearTimeout(timeout); resolve(true); };
        script.onerror = () => {
            clearTimeout(timeout);
            console.error('Failed to load script:', src);
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

async function loadScriptWithRetry(src, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        const success = await loadScript(i > 0 ? src.split('?')[0] + '?retry=' + Date.now() : src);
        if (success) return true;
        await new Promise(r => setTimeout(r, 1000));
    }
    return false;
}

async function loadTGSWithRetry(path, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        const data = await loadTGS(i > 0 ? path + '?retry=' + Date.now() : path);
        if (data) return data;
        await new Promise(r => setTimeout(r, 1000));
    }
    return null;
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => resolve(true), 8000);
        img.onload = () => { clearTimeout(timeout); resolve(true); };
        img.onerror = () => { clearTimeout(timeout); resolve(false); };
        img.src = src;
    });
}

const loadingScreen = document.getElementById('loading-screen');
const gameContent = document.getElementById('game-content');

function updateLoadingText(banned = false) {
    const mainText = document.getElementById('loading-text-main');
    const fillMy = document.getElementById('loading-progress-fill-my');
    const fillCubes = document.getElementById('loading-progress-fill-cubes');

    if (mainText) {
        if (banned) {
            mainText.innerHTML = "BANNED";
            if (fillMy) fillMy.style.width = '0%';
            if (fillCubes) fillCubes.style.width = '0%';
            return;
        }
        const rawText = i18n.t('loading', { loaded: loadedCount, total: totalAssets });
        mainText.innerHTML = rawText.toUpperCase();

        if (totalAssets > 0) {
            const percentage = Math.min((loadedCount / totalAssets) * 100, 100);

            // "My" fills from 0% to 26%, then "CUBES" fills from 26% to 100%
            if (percentage <= 26) {
                // Map 0-26% overall to 0-100% of "My"
                const myPct = (percentage / 26) * 100;
                if (fillMy) fillMy.style.width = myPct + '%';
                if (fillCubes) fillCubes.style.width = '0%';
            } else {
                // "My" is fully filled
                if (fillMy) fillMy.style.width = '100%';
                // Map 26-100% overall to 0-100% of "CUBES"
                const cubesPct = ((percentage - 26) / 74) * 100;
                if (fillCubes) fillCubes.style.width = cubesPct + '%';
            }
        }
    }
}

function updateFooterInfo(appVersion) {
    const versionEl = document.getElementById('loading-app-version');
    const appLangEl = document.getElementById('loading-app-lang');
    const sysLangEl = document.getElementById('loading-sys-lang');

    if (versionEl) versionEl.textContent = 'v' + (appVersion || '—');
    if (appLangEl && typeof i18n !== 'undefined') appLangEl.textContent = (i18n.getLang() || '—').toUpperCase();
    if (sysLangEl) sysLangEl.textContent = (navigator.language || '—').toUpperCase();
}


let tiltWrapper;
let currentRotateX = 0;
let currentRotateY = 0;
let targetRotateX = 0;
let targetRotateY = 0;

document.addEventListener('mousemove', (e) => {
    tiltWrapper = document.getElementById('interactive-cube-wrapper');
    if (!tiltWrapper) return;
    const x = e.clientX;
    const y = e.clientY;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    targetRotateX = ((y - centerY) / centerY) * -35;
    targetRotateY = ((x - centerX) / centerX) * 35;
});

document.addEventListener('mouseleave', () => {
    targetRotateX = 0;
    targetRotateY = 0;
});

function animateTilt() {
    tiltWrapper = document.getElementById('interactive-cube-wrapper');
    if (tiltWrapper) {
        currentRotateX += (targetRotateX - currentRotateX) * 0.1;
        currentRotateY += (targetRotateY - currentRotateY) * 0.1;

        tiltWrapper.style.transform = `translate(-50%, -50%) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
    }
    requestAnimationFrame(animateTilt);
}

animateTilt();

async function preload() {
    i18n.init();

    // Show footer info immediately
    updateFooterInfo(null);

    const langBtn = document.getElementById('loading-lang-btn');
    if (langBtn) {
        langBtn.style.display = 'block';
        langBtn.addEventListener('click', () => {
            const current = i18n.getLang();
            i18n.setLang(current === 'en' ? 'ru' : 'en');
            updateFooterInfo(null);
        });
    }

    let isExiting = false;
    const skipBtn = document.getElementById('loading-skip-btn');
    let skipRequested = false;

    async function performExitTransition() {
        if (isExiting) return;
        isExiting = true;

        const cubeImg = document.getElementById('loading-cube-img');
        const cubeWrapper = document.getElementById('interactive-cube-wrapper');
        if (cubeImg) {
            cubeImg.style.transition = 'opacity 0.4s ease-out';
            cubeImg.style.opacity = '0';
        }
        if (cubeWrapper) {
            cubeWrapper.style.transition = 'opacity 0.4s ease-out';
            cubeWrapper.style.opacity = '0';
        }

        await new Promise(r => setTimeout(r, 400));
        loadingScreen.classList.add('glitch-exit');

        await new Promise(r => setTimeout(r, 800));
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        loadingScreen.style.opacity = '0';
        await new Promise(r => setTimeout(r, 500));

        loadingScreen.style.display = 'none';
        gameContent.style.opacity = '0';
        gameContent.style.display = 'block';
        gameContent.style.transition = 'opacity 0.5s ease-in';
        requestAnimationFrame(() => {
            gameContent.style.opacity = '1';
        });
        if (typeof Game !== 'undefined' && Game.init) {
            Game.init(serverState);
        }
        if (typeof Inventory !== 'undefined' && Inventory.init) {
            Inventory.init();
        }
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', async () => {
            skipRequested = true;
            skipBtn.style.display = 'none';
            if (langBtn) langBtn.style.display = 'none';
            await performExitTransition();
        });
    }

    try {
        if (CONFIG.ANALYTICS_TOKEN && window.telegramAnalytics) {
            window.telegramAnalytics.init({
                token: CONFIG.ANALYTICS_TOKEN,
                appName: 'my_cubes'
            });
        }
    } catch (e) {
        console.error("Analytics initialization failed:", e);
    }

    const tgsAssets = CONFIG.assets || [];

    // +1 for the server state fetch
    totalAssets = SCRIPTS_TO_LOAD.length + tgsAssets.length + IMAGES_TO_LOAD.length + 1;
    loadedCount = 0;
    updateLoadingText();

    function fetchWithTimeout(promise, ms) {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
        );
        return Promise.race([promise, timeout]);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    // ---- PHASE 1: SCRIPTS (DATA) ----

    // Load API separately since we need it for API calls
    await loadScriptWithRetry('scr/js/backend.js?v=' + Date.now());
    loadedCount++;
    updateLoadingText();

    let statePromise = null;
    let lbPromise = null;
    try {
        if (typeof API !== 'undefined') {
            statePromise = API.call('/api/state', null).catch(e => {
                console.error('Failed to fetch server state:', e);
                return null;
            });
            lbPromise = API.call('/api/leaderboard?limit=50', null).catch(() => null);
        }
    } catch (e) {
        console.error('API call initialization failed:', e);
    }

    for (let i = 0; i < SCRIPTS_TO_LOAD.length; i++) {
        if (skipRequested) break;
        if (SCRIPTS_TO_LOAD[i] === 'scr/js/backend.js') continue;
        await loadScriptWithRetry(SCRIPTS_TO_LOAD[i] + '?v=' + Date.now());
        loadedCount++;
        updateLoadingText();
    }

    // ---- PHASE 2: AWAIT SERVER STATE (coins, min, etc.) ----
    try {
        if (statePromise) {
            serverState = await fetchWithTimeout(statePromise, 5000);
            if (serverState && serverState.isBanned) {
                updateLoadingText(true);
                return;
            }
        }
    } catch (e) {
        console.error('Failed awaiting statePromise:', e);
    }

    // Fast retries: 2 attempts with 1s delay
    if (!serverState && !skipRequested) {
        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            if (skipRequested) break;
            await new Promise(r => setTimeout(r, 1000));
            try {
                if (typeof API !== 'undefined') {
                    serverState = await fetchWithTimeout(
                        API.call('/api/state', null),
                        4000
                    );
                    if (serverState && serverState.isBanned) {
                        updateLoadingText(true);
                        return;
                    }
                    if (serverState) break;
                }
            } catch (e) {
                console.error('Retry ' + attempt + ' failed:', e);
            }
        }
    }

    // Count the server state step as loaded
    loadedCount++;
    updateLoadingText();
    dataLoaded = true;

    // Update footer with real version from server
    updateFooterInfo(serverState ? serverState.appVersion : null);

    // Show skip button NOW (data is loaded — coins + min available)
    if (skipBtn && !isExiting && loadingScreen.style.display !== 'none') {
        skipBtn.style.display = 'block';
    }

    // ---- PHASE 3: TGS ASSETS (images/animations) ----
    const TGS_BATCH_SIZE = 4;
    for (let i = 0; i < tgsAssets.length && !skipRequested; i += TGS_BATCH_SIZE) {
        const batch = tgsAssets.slice(i, i + TGS_BATCH_SIZE);
        await Promise.all(batch.map(async (asset) => {
            const name = asset.replace('.tgs', '');
            const data = await loadTGSWithRetry(CONFIG.assetsPath + asset);
            if (data) animationCache[name] = data;
            loadedCount++;
            updateLoadingText();
        }));
    }

    // ---- PHASE 4: IMAGES ----
    for (let i = 0; i < IMAGES_TO_LOAD.length; i++) {
        if (skipRequested) break;
        await preloadImage(IMAGES_TO_LOAD[i]);
        loadedCount++;
        updateLoadingText();
    }

    if (lbPromise) {
        try {
            const lb = await lbPromise;
            if (lb) {
                const allEntries = [...(lb.byCoins || []), ...(lb.byMin || [])];
                const seen = new Set();
                const lbAvatars = [];
                for (const p of allEntries) {
                    if (p.photo_url && !p.photo_url.includes('missing') && !seen.has(p.photo_url)) {
                        seen.add(p.photo_url);
                        lbAvatars.push(p.photo_url);
                    }
                }
                if (lbAvatars.length > 0) {
                    totalAssets += lbAvatars.length;
                    updateLoadingText();
                    for (let i = 0; i < lbAvatars.length; i++) {
                        if (skipRequested) break;
                        await preloadImage(lbAvatars[i]);
                        loadedCount++;
                        updateLoadingText();
                    }
                }
            }
        } catch (e) {
            console.error('Error preloading leaderboard:', e);
        }
    }

    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user.photo_url) {
                const avatarContainer = document.getElementById('player-avatar-container');
                if (avatarContainer) {
                    avatarContainer.style.background = 'transparent';
                    const img = document.createElement('img');
                    img.src = user.photo_url;
                    img.alt = 'Avatar';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.borderRadius = '50%';
                    img.style.objectFit = 'cover';
                    avatarContainer.innerHTML = '';
                    avatarContainer.appendChild(img);
                }
            }
        }
    } catch (e) { console.error('Error loading avatar:', e); }

    // Proceed to game
    await performExitTransition();
}
