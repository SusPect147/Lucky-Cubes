const animationCache = {};
let loadedCount = 0;
let totalAssets = 0;

// Scripts to load dynamically (in order)
const SCRIPTS_TO_LOAD = [
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
                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error('XHR failed: ' + xhr.status));
                    }
                };
                xhr.onerror = () => reject(new Error('XHR network error'));
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
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error('Failed to load script:', src);
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
        setTimeout(() => resolve(false), 5000);
    });
}

const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const gameContent = document.getElementById('game-content');
const loadingChicken = document.getElementById('loading-chicken');

function updateLoadingText() {
    if (loadingText) {
        loadingText.textContent = `${loadedCount}/${totalAssets} loaded`;
    }
}

async function preload() {
    const tgsAssets = CONFIG.assets || [];

    // Total: chicken + scripts + TGS + images
    totalAssets = 1 + SCRIPTS_TO_LOAD.length + tgsAssets.length + IMAGES_TO_LOAD.length;
    loadedCount = 0;
    updateLoadingText();

    // ── Step 1: Load chicken image FIRST ──
    await new Promise(resolve => {
        if (loadingChicken.complete && loadingChicken.naturalWidth > 0) {
            resolve();
        } else {
            loadingChicken.onload = () => resolve();
            loadingChicken.onerror = () => resolve();
            setTimeout(resolve, 3000);
        }
    });
    loadedCount++;
    updateLoadingText();

    // ── Step 2: Load all JS scripts ──
    for (let i = 0; i < SCRIPTS_TO_LOAD.length; i++) {
        await loadScript(SCRIPTS_TO_LOAD[i]);
        loadedCount++;
        updateLoadingText();
    }

    // ── Step 3: Load TGS animations ──
    for (let i = 0; i < tgsAssets.length; i++) {
        const name = tgsAssets[i].replace('.tgs', '');
        const data = await loadTGS(CONFIG.assetsPath + tgsAssets[i]);
        if (data) animationCache[name] = data;
        loadedCount++;
        updateLoadingText();
    }

    // ── Step 4: Preload images ──
    for (let i = 0; i < IMAGES_TO_LOAD.length; i++) {
        await preloadImage(IMAGES_TO_LOAD[i]);
        loadedCount++;
        updateLoadingText();
    }

    // ── Done: show game ──
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameContent.style.display = 'block';
        if (typeof Game !== 'undefined' && Game.init) {
            Game.init();
        }
        if (typeof Inventory !== 'undefined' && Inventory.init) {
            Inventory.init();
        }
    }, 600);
}
