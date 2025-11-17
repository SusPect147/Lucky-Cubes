(function () {
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0')) e.preventDefault();
        if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
    });
    document.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (evt) {
        document.addEventListener(evt, function (e) { e.preventDefault(); }, { passive: false });
    });

    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    const gameContent = document.getElementById('game-content');
    const animationCache = {};
    let loadedCount = 0;

    async function loadTGS(path) {
        try {
            const r = await fetch(path);
            if (!r.ok) throw new Error();
            const buf = await r.arrayBuffer();
            const uint8 = new Uint8Array(buf);
            const inflated = pako.inflate(uint8);
            const text = new TextDecoder().decode(inflated);
            return JSON.parse(text);
        } catch (e) {
            console.error("Ошибка загрузки TGS:", path);
            return null;
        }
    }

    async function preload() {
        const first = await loadTGS(CONFIG.assetsPath + CONFIG.assets[0]);
        if (first) {
            lottie.loadAnimation({
                container: document.getElementById('loading-cube'),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: first
            });
            animationCache['начальный-кубик'] = first;
            loadedCount++;
            loadingText.textContent = loadedCount + '/' + CONFIG.assets.length + ' loaded';
        }

        for (let i = 1; i < CONFIG.assets.length; i++) {
            const data = await loadTGS(CONFIG.assetsPath + CONFIG.assets[i]);
            if (data) animationCache[CONFIG.assets[i].replace('.tgs', '')] = data;
            loadedCount++;
            loadingText.textContent = loadedCount + '/' + CONFIG.assets.length + ' loaded';
        }

        loadingScreen.style.opacity = '0';
        setTimeout(function () {
            loadingScreen.style.display = 'none';
            gameContent.style.display = 'block';
            Game.init();
        }, 600);
    }

    const Game = (function () {
        let totalXP = 0;
        let coinCount = 0;
        let currentMin = 0;
        let rollsToRainbow = 0;
        let targetRainbow = 0;
        let isRainbow = false;
        let isRolling = false;
        let currentAnim = null;

        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let w = canvas.width = innerWidth;
        let h = canvas.height = innerHeight;
        window.addEventListener('resize', function () { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });

        const particles = [];
        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = 0.3 + Math.random() * 0.9;
                this.speedX = (0.05 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
                this.speedY = (0.05 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
                this.opacity = 0.05 + Math.random() * 0.2;
                this.angle = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - 0.5) * 0.02;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.angle += this.spin;
                if (this.x < -50) this.x = w + 50;
                if (this.x > w + 50) this.x = -50;
                if (this.y < -50) this.y = h + 50;
                if (this.y > h + 50) this.y = -50;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                const pts = 5;
                const out = this.size;
                const inn = this.size * 0.4;
                const step = Math.PI / pts;
                ctx.moveTo(out, 0);
                for (let i = 1; i < pts * 2; i++) {
                    const r = i % 2 === 0 ? out : inn;
                    ctx.lineTo(r * Math.cos(i * step), r * Math.sin(i * step));
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
        for (let i = 0; i < CONFIG.particleCount; i++) particles.push(new Particle());
        (function anim() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(function (p) { p.update(); p.draw(); });
            requestAnimationFrame(anim);
        })();

        function format(n) {
            if (n >= 1e12) return (n / 1e12).toFixed(2) + 't';
            if (n >= 1e9) return (n / 1e9).toFixed(2) + 'b';
            if (n >= 1e6) return (n / 1e6).toFixed(2) + 'm';
            if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
            return n.toFixed(2).replace(/\.?0+$/, '');
        }

        const rankEl = document.getElementById('rank-text');
        const xpEl = document.getElementById('xp-text');
        const progressEl = document.getElementById('progress-fill');
        let displayed = 0;
        let target = 0;

        function updateLevel() {
            let lvl = 0;
            for (let i = 0; i < CONFIG.levels.length; i++) {
                if (totalXP >= CONFIG.levels[i].xp) lvl = i + 1;
                else break;
            }
            lvl = Math.min(lvl, CONFIG.levels.length);
            const cur = CONFIG.levels[lvl - 1] || CONFIG.levels[CONFIG.levels.length - 1];
            const next = CONFIG.levels[lvl] || cur;

            if (lvl >= CONFIG.levels.length) {
                rankEl.textContent = cur.name;
                xpEl.textContent = 'MAX LEVEL';
                target = 100;
                return;
            }

            const from = lvl > 0 ? CONFIG.levels[lvl - 1].xp : 0;
            const need = next.xp - from;
            const have = totalXP - from;
            rankEl.textContent = cur.name;
            xpEl.textContent = have + '/' + need + ' XP';
            target = (have / need) * 100;
        }

        function animateBar() {
            function step() {
                const diff = target - displayed;
                if (Math.abs(diff) > 0.1) {
                    displayed += diff * 0.12;
                    progressEl.style.width = displayed + '%';
                    requestAnimationFrame(step);
                } else {
                    displayed = target;
                    progressEl.style.width = target + '%';
                }
            }
            step();
        }

        function addXP(v) {
            totalXP += v;
            updateLevel();
            animateBar();
        }

        const rainbowOverlay = document.getElementById('rainbow-overlay');
        const rainbowFill = document.getElementById('rainbow-progress-fill');
        const rainbowText = document.getElementById('rainbow-text');

        function newRainbowTarget() {
            targetRainbow = CONFIG.rainbowRollsMin + Math.floor(Math.random() * (CONFIG.rainbowRollsMax - CONFIG.rainbowRollsMin + 1));
            rollsToRainbow = 0;
            rainbowFill.style.width = '0%';
            rainbowText.textContent = '0/' + targetRainbow + ' rolls to Rainbow Mode';
        }
        newRainbowTarget();

        function generateMin() {
            const lambda = isRainbow ? CONFIG.rainbowLambda : CONFIG.baseLambda;
            return Math.max(0.00001, -Math.log(1 - Math.random()) / lambda);
        }

        const coinEl = document.getElementById('coin-count');
        const minEl = document.getElementById('min-number');

        function updateUI() {
            coinEl.textContent = format(coinCount);
            const str = currentMin.toFixed(5).replace(/\.?0+$/, '');
            minEl.textContent = str === '0' ? '0' : str;
        }

        function showIdleCube() {
            const name = isRainbow ? 'супер-начальный-кубик' : 'начальный-кубик';
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

            const roll = Math.floor(Math.random() * 6) + 1;
            const rollAnimData = animationCache[roll + '-кубик'];
            if (!rollAnimData) {
                isRolling = false;
                return;
            }

            if (currentAnim) currentAnim.destroy();

            currentAnim = lottie.loadAnimation({
                container: document.getElementById('cube-animation'),
                renderer: 'svg',
                loop: false,
                autoplay: true,
                animationData: rollAnimData
            });

            currentAnim.addEventListener('complete', function handler() {
                currentAnim.removeEventListener('complete', handler);

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
                    rainbowText.textContent = rollsToRainbow + '/' + targetRainbow + ' rolls to Rainbow Mode';

                    if (rollsToRainbow >= targetRainbow) {
                        isRainbow = true;
                        rainbowOverlay.classList.add('active');
                        rainbowText.textContent = 'Rainbow Mode Active!';
                        showIdleCube();
                    }
                } else {
                    isRainbow = false;
                    rainbowOverlay.classList.remove('active');
                    newRainbowTarget();
                    showIdleCube();
                }

                updateUI();
                isRolling = false;
            });
        }

        document.querySelector('.center-gif').addEventListener('click', rollCube);

        const dust = document.querySelector('.cosmic-dust-layer');
        function dustCycle() {
            dust.classList.add('active');
            const dur = 28000 + Math.random() * 15000;
            setTimeout(function () {
                dust.classList.remove('active');
                setTimeout(dustCycle, 5000 + Math.random() * 8000);
            }, dur);
        }
        dustCycle();

        return {
            init: function () {
                displayed = 0;
                target = 0;
                progressEl.style.width = '0%';
                updateLevel();
                showIdleCube();
                updateUI();
            }
        };
    })();

    preload();
})();