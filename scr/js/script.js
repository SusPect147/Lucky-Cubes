// Глобальные переменные: CONFIG, Quests, updateLevel, updateUI, hideQuestMenu, showQuestMenu доступны
// pako и lottie доступны глобально из index.html

// 1. Функция загрузки TGS (используется только здесь и в preload)
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


// 2. Логика экрана загрузки и Preload
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
        Game.init();
    }, 600);
}


// 3. Основная логика игры (IIFE)
const Game = (function () {
    let totalXP = 0;
    let coinCount = 0;
    let currentMin = 0;
    let rollsToRainbow = 0;
    let targetRainbow = 0;
    let isRainbow = false;
    let isRolling = false;
    let currentAnim = null;
    
    
    function newRainbowTarget() {
        const rainbowFill = document.getElementById('rainbow-progress-fill');
        const rainbowText = document.getElementById('rainbow-text');

        targetRainbow = CONFIG.rainbowRollsMin + Math.floor(Math.random() * (CONFIG.rainbowRollsMax - CONFIG.rainbowRollsMin + 1));
        rollsToRainbow = 0;
        rainbowFill.style.width = '0%';
        rainbowText.textContent = `0/${targetRainbow} rolls to Rainbow Mode`;
    }

    function generateMin() {
        const lambda = isRainbow ? CONFIG.rainbowLambda : CONFIG.baseLambda;
        return Math.max(0.00001, -Math.log(1 - Math.random()) / lambda);
    }

    function addXP(amount) {
        totalXP += amount;
        // updateLevel доступен глобально из ui.js
        updateLevel(totalXP);
    }

    function showIdleCube() {
        const name = isRainbow ? 'super-first-cubic' : 'first-cubic';
        const data = animationCache[name];
        if (!data) return;

        if (currentAnim) currentAnim.destroy();
        currentAnim = lottie.loadAnimation({
            container: document.getElementById('cube-animation'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: data
        });
    }

    function rollCube() {
        if (isRolling) return;
        isRolling = true;
        
        // Quests доступен глобально из ui.js
        Quests.updateProgress('roll', 1);

        const roll = Math.floor(Math.random() * 6) + 1;
        const animData = animationCache[roll + '-cubic'];
        if (!animData) { isRolling = false; return; }

        if (currentAnim) currentAnim.destroy();
        currentAnim = lottie.loadAnimation({
            container: document.getElementById('cube-animation'),
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: animData
        });

        currentAnim.addEventListener('complete', function handler() {
            currentAnim.removeEventListener('complete', handler);

            const rainbowFill = document.getElementById('rainbow-progress-fill');
            const rainbowText = document.getElementById('rainbow-text');
            const rainbowOverlay = document.getElementById('rainbow-overlay');
            
            let reward = roll / 10;
            if (isRainbow) reward *= 2;
            coinCount += reward;

            
            const newMin = generateMin();
            if (newMin < currentMin || currentMin === 0) currentMin = newMin;

            
            addXP(CONFIG.xpPerRoll);

            
            if (!isRainbow) {
                rollsToRainbow++;
                const percent = (rollsToRainbow / targetRainbow) * 100;
                rainbowFill.style.width = percent + '%';
                rainbowText.textContent = `${rollsToRainbow}/${targetRainbow} rolls to Rainbow Mode`;

                if (rollsToRainbow >= targetRainbow) {
                    isRainbow = true;
                    rainbowText.textContent = 'Rainbow Mode Active!';
                    rainbowOverlay.classList.add('active');
                    showIdleCube();
                    
                    Quests.updateProgress('rainbow', 1);
                }
            } else {
                isRainbow = false;
                rainbowOverlay.classList.remove('active');
                newRainbowTarget();
                showIdleCube();
            }

            // updateUI доступен глобально из ui.js
            updateUI(coinCount, currentMin);
            isRolling = false;
        });
    }

    function claimQuest(id) {
        // Quests доступен глобально из ui.js
        const quest = Quests.data.find(q => q.id === id);
        if (!quest || !quest.completed || quest.claimed) return;
        
        // addXP is internal
        addXP(quest.xp);
        quest.claimed = true;
        
        const questEl = document.querySelector(`.quest-item[data-id="${id}"]`);
        // hideQuestMenu доступна глобально из ui.js
        const questOverlayEl = document.getElementById('quest-menu-overlay');

        if (!questEl) return;
        
        
        const rect = questEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = `${centerX + (Math.random() - 0.5) * rect.width * 0.4}px`;
            p.style.top = `${centerY + (Math.random() - 0.5) * rect.height * 0.4}px`;
            p.style.width = '5px';
            p.style.height = '5px';
            p.style.borderRadius = '50%';
            p.style.background = '#4CAF50'; 
            p.style.zIndex = '100';
            p.style.transition = 'all 0.8s ease-out';
            p.style.opacity = '1';
            
            document.body.appendChild(p);

            
            setTimeout(() => {
                
                p.style.transform = `translate(${(Math.random() - 0.5) * 150}px, ${(Math.random() - 0.5) * 150}px) scale(0)`;
                p.style.opacity = '0';
            }, 50);
            
            
            setTimeout(() => p.remove(), 1000);
        }
        
        
        if (quest.social) {
            
            questEl.classList.add('claiming');
            
            setTimeout(() => {
                questEl.remove();
                
                if (Quests.listEl.children.length === 0) hideQuestMenu();
            }, 500);
        } else {
            
            quest.current = 0;
            quest.target *= 2; 
            quest.completed = false; 
            quest.claimed = false;
            Quests.render(); 
        }
        
        
        Quests.render();
    }
    
    // 4. Инициализация игры и экспорты
    return {
        init: function () {
            totalXP = 0;
            coinCount = 0;
            currentMin = 0;
            newRainbowTarget();
            updateLevel(totalXP);
            showIdleCube();
            updateUI(coinCount, currentMin);
            
            Quests.data.forEach(q => q.current = 0);
        },
        claimQuest: claimQuest,
        rollCube: rollCube 
    };
})();


// 5. Обработчики событий (используя экспортированные функции Game и UI)
document.querySelector('.center-gif').addEventListener('click', Game.rollCube);
document.getElementById('top-menu').addEventListener('click', showQuestMenu);
document.getElementById('quest-menu-close-btn').addEventListener('click', hideQuestMenu);

// Обработчик клика по оверлею
document.getElementById('quest-menu-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('quest-menu-overlay')) {
        hideQuestMenu();
    }
});


// 6. Финальный запуск
preload();