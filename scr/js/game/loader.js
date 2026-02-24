const animationCache = {};
let loadedCount = 0;

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

const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const gameContent = document.getElementById('game-content');
const loadingChicken = document.getElementById('loading-chicken');

async function preload() {

    let chickenLoaded = false;

    await new Promise(resolve => {
        loadingChicken.onload = () => { chickenLoaded = true; resolve(); };

        if (loadingChicken.complete || loadingChicken.naturalWidth > 0) {
            chickenLoaded = true;
            resolve();
        }

        setTimeout(resolve, 3000);
    });


    const allAssets = CONFIG.assets;

    for (let i = 0; i < allAssets.length; i++) {
        const name = allAssets[i].replace('.tgs', '');
        const data = await loadTGS(CONFIG.assetsPath + allAssets[i]);
        if (data) animationCache[name] = data;
        loadedCount++;
        loadingText.textContent = `${loadedCount}/${allAssets.length} loaded`;
    }

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

