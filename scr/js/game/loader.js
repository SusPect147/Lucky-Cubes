const animationCache = {}; 
let loadedCount = 0; 

async function loadTGS(path) {
    try {
        const r = await fetch(path);
        if (!r.ok) throw new Error();
        const buf = await r.arrayBuffer();
        const inflated = pako.inflate(new Uint8Array(buf));
        const text = new TextDecoder().decode(inflated);
        return JSON.parse(text);
    } catch (e) {
        console.error("Error loading TGS:", path);
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

