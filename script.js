document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0')) e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
});
document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
['gesturestart', 'gesturechange', 'gestureend'].forEach(evt =>
    document.addEventListener(evt, e => e.preventDefault(), { passive: false })
);

const basePath = 'UI/кубики/классический%20скин/';
const assetsToPreload = [
    'начальный-кубик.tgs',
    'супер-начальный-кубик.tgs',
    '1-кубик.tgs',
    '2-кубик.tgs',
    '3-кубик.tgs',
    '4-кубик.tgs',
    '5-кубик.tgs',
    '6-кубик.tgs'
];

let loadedCount = 0;
const totalAssets = assetsToPreload.length;
const loadingText = document.getElementById('loading-text');
const loadingScreen = document.getElementById('loading-screen');
const gameContent = document.getElementById('game-content');
let loadingAnimation = null;

const animationCache = {};

async function loadTGSAnimation(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Network error');
        const arrayBuffer = await response.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const inflated = pako.inflate(uint8);
        const text = new TextDecoder().decode(inflated);
        return JSON.parse(text);
    } catch (err) {
        console.error("Ошибка загрузки TGS:", path, err);
        return null;
    }
}

async function preloadAssets() {
    const initialData = await loadTGSAnimation(`${basePath}начальный-кубик.tgs`);
    if (initialData) {
        loadingAnimation = lottie.loadAnimation({
            container: document.getElementById('loading-cube'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: initialData
        });
        animationCache['начальный-кубик'] = initialData;
    }

    for (const file of assetsToPreload) {
        if (file === 'начальный-кубик.tgs') {
            loadedCount++;
            loadingText.textContent = `${loadedCount}/${totalAssets} loaded`;
            continue;
        }
        const data = await loadTGSAnimation(`${basePath}${file}`);
        if (data) {
            const key = file.replace('.tgs', '');
            animationCache[key] = data;
        }
        loadedCount++;
        loadingText.textContent = `${loadedCount}/${totalAssets} loaded`;
    }

    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameContent.style.display = 'block';
        initGame();
    }, 600);
}

function initGame() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const particleCount = 120;
    const particles = [];
    const minSize = 0.3, maxSize = 1.2, minSpeed = 0.05, maxSpeed = 0.3;
    const opacityMin = 0.05, opacityMax = 0.25;

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = minSize + Math.random() * (maxSize - minSize);
            this.speedX = minSpeed + Math.random() * (maxSpeed - minSpeed) * (Math.random() > 0.5 ? 1 : -1);
            this.speedY = minSpeed + Math.random() * (maxSpeed - minSpeed) * (Math.random() > 0.5 ? 1 : -1);
            this.opacity = opacityMin + Math.random() * (opacityMax - opacityMin);
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = (Math.random() - 0.5) * 0.02;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY; this.angle += this.angularSpeed;
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            const points = 5, outerRadius = this.size, innerRadius = this.size * 0.4;
            const angleStep = Math.PI / points;
            ctx.moveTo(outerRadius, 0);
            for (let i = 1; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = radius * Math.cos(i * angleStep);
                const y = radius * Math.sin(i * angleStep);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    });

    function formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 't';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'b';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'm';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'k';
        return num.toFixed(2).replace(/\.?0+$/, '');
    }

    const levels = [
        { name: "Roller Novice", xp: 100 },
        { name: "Dice Toss Apprentice", xp: 700 },
        { name: "Game Player", xp: 1500 },
        { name: "Lucky One", xp: 2400 },
        { name: "Combo Master", xp: 3700 },
        { name: "High Roller", xp: 4500 },
        { name: "Ace Thrower", xp: 6800 },
        { name: "Dice Mage", xp: 8888 },
        { name: "Lord of Dice", xp: 10000 },
        { name: "Luck Overlord", xp: 15000 }
    ];

    let totalXP = 0;
    let currentLevel = 0;
    let currentDisplayedPercent = 0;
    let targetPercent = 0;
    let isAnimating = false;

    const rankText = document.getElementById('rank-text');
    const xpText = document.getElementById('xp-text');
    const progressFill = document.getElementById('progress-fill');

    function getLevelXPRequirement(level) {
        return level < levels.length ? levels[level].xp : levels[levels.length - 1].xp;
    }

    function updateCurrentLevel() {
        let newLevel = 0;
        for (let i = 0; i < levels.length; i++) {
            if (totalXP >= levels[i].xp) {
                newLevel = i + 1;
            } else {
                break;
            }
        }
        currentLevel = Math.min(newLevel, levels.length - 1);
    }

    function updateLevelDisplay() {
        if (currentLevel >= levels.length - 1 && totalXP >= levels[levels.length - 1].xp) {
            rankText.textContent = levels[levels.length - 1].name;
            xpText.textContent = `MAX LEVEL`;
            progressFill.style.width = '100%';
            currentDisplayedPercent = 100;
            targetPercent = 100;
            return;
        }

        const requiredXP = getLevelXPRequirement(currentLevel);
        const xpInLevel = totalXP;
        const xpNeeded = requiredXP;

        rankText.textContent = levels[currentLevel].name;
        xpText.textContent = `${xpInLevel}/${xpNeeded} XP`;

        targetPercent = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 0;
        targetPercent = Math.min(100, Math.max(0, targetPercent));
    }

    function animateProgress() {
        if (isAnimating) return;
        isAnimating = true;

        function step() {
            const diff = targetPercent - currentDisplayedPercent;
            if (Math.abs(diff) > 0.1) {
                currentDisplayedPercent += diff * 0.12;
                progressFill.style.width = `${currentDisplayedPercent}%`;
                requestAnimationFrame(step);
            } else {
                currentDisplayedPercent = targetPercent;
                progressFill.style.width = `${targetPercent}%`;

                if (targetPercent >= 100 && currentLevel < levels.length - 1) {
                    setTimeout(() => {
                        currentLevel++;
                        updateLevelDisplay();
                        currentDisplayedPercent = 0;
                        progressFill.style.width = '0%';
                        isAnimating = false;
                        animateProgress();
                    }, 500);
                } else {
                    isAnimating = false;
                }
            }
        }
        step();
    }

    function addXP(amount) {
        totalXP += amount;
        updateCurrentLevel();
        updateLevelDisplay();
        animateProgress();
    }

    let rollsCount = 0;
    const maxRolls = 10;
    let isRainbowMode = false;

    const rainbowOverlay = document.getElementById('rainbow-overlay');
    const rainbowProgressFill = document.getElementById('rainbow-progress-fill');
    const rainbowText = document.getElementById('rainbow-text');

    function enterRainbowMode() {
        isRainbowMode = true;
        rainbowOverlay.classList.add('active');
        rainbowProgressFill.classList.add('rainbow-active');
        rainbowText.textContent = "Rainbow Mode Active!";
        loadCubeAnimation('супер-начальный-кубик', false);
    }

    function exitRainbowMode() {
        isRainbowMode = false;
        rainbowOverlay.classList.remove('active');
        rainbowProgressFill.classList.remove('rainbow-active');
        setTimeout(() => {
            rollsCount = 0;
            updateRainbowProgress();
        }, 150);
        loadCubeAnimation('начальный-кубик', false);
    }

    function updateRainbowProgress() {
        const percent = (rollsCount / maxRolls) * 100;
        rainbowProgressFill.style.width = `${percent}%`;
        rainbowText.textContent = `${rollsCount}/${maxRolls} rolls to Rainbow Mode`;
        if (rollsCount >= maxRolls && !isRainbowMode) {
            enterRainbowMode();
        }
    }

    const cubeContainer = document.getElementById('cube-animation');
    let currentAnimation = null;
    let isCubeAnimating = false;
    let coinCount = 0;
    let currentMin = 0;
    const xpPerRoll = 0.5;

    function loadCubeAnimation(tgsName, isRoll = false) {
        const key = tgsName.replace('.tgs', '');
        const json = animationCache[key];
        if (!json) {
            console.error("Анимация не найдена:", tgsName);
            return;
        }

        if (currentAnimation) {
            currentAnimation.destroy();
        }

        currentAnimation = lottie.loadAnimation({
            container: cubeContainer,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: json
        });

        if (isRoll) {
            currentAnimation.addEventListener('complete', () => {
                applyRollResult();
                loadCubeAnimation(isRainbowMode ? 'супер-начальный-кубик' : 'начальный-кубик');
                isCubeAnimating = false;
            });
        } else {
            currentAnimation.setLoop(tgsName.includes('начальный'));
        }
    }

    const coinCountEl = document.getElementById('coin-count');
    const minNumberEl = document.getElementById('min-number');

    function updateDisplay() {
        coinCountEl.textContent = formatNumber(coinCount);
        const minStr = currentMin.toFixed(5).replace(/\.?0+$/, '');
        minNumberEl.textContent = minStr === '0' ? '0' : minStr;
    }

    function generateMinNumber() {
        const lambda = isRainbowMode ? 0.0005 : 0.001;
        const u = Math.random();
        let value = -Math.log(1 - u) / lambda;
        return Math.max(0.00001, Math.min(1000, value));
    }

    const dustLayer = document.querySelector('.cosmic-dust-layer');
    const cube = document.querySelector('.center-gif');

    function startRandomDustCycle() {
        dustLayer.classList.add('active');
        const cycleDuration = 28000 + Math.random() * 15000;
        setTimeout(() => {
            dustLayer.classList.remove('active');
            setTimeout(startRandomDustCycle, 5000 + Math.random() * 8000);
        }, cycleDuration);
    }

    function applyRollResult() {
        const roll = Math.floor(Math.random() * 6) + 1;
        let coinsToAdd = roll / 10;
        if (isRainbowMode) coinsToAdd *= 2;

        coinCount += coinsToAdd;

        const minValue = generateMinNumber();
        if (minValue < currentMin || currentMin === 0) {
            currentMin = minValue;
        }

        addXP(xpPerRoll);

        if (!isRainbowMode) {
            rollsCount++;
            updateRainbowProgress();
        } else {
            exitRainbowMode();
        }

        updateDisplay();
    }

    cube.addEventListener('click', async () => {
        if (isCubeAnimating) return;

        isCubeAnimating = true;
        const roll = Math.floor(Math.random() * 6) + 1;
        await loadCubeAnimation(`${roll}-кубик`, true);
    });

    loadCubeAnimation('начальный-кубик');
    updateCurrentLevel();
    updateLevelDisplay();
    updateDisplay();
    startRandomDustCycle();
}

preloadAssets();