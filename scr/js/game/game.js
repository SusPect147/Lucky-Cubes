const Game = (function () {
    let totalXP = 0;
    let coinCount = 0;
    let currentMin = 0;
    let rollsToRainbow = 0;
    let targetRainbow = 0;
    let isRainbow = false;
    let isRainbowFromBoost = false;
    let isRolling = false;
    let currentAnim = null;
    let extraCubes = 0;
    let extraCubeAnims = [];

    let activeBoosts = [];
    let autoRollInterval = null;
    let consecutiveRolls = 0;
    let lastRollTime = 0;

    function getInitData() {
        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                return window.Telegram.WebApp.initData;
            }
        } catch (e) { }
        return 'dev_mode';
    }

    async function apiCall(endpoint, body) {
        try {
            const resp = await fetch(CONFIG.API_URL + endpoint, {
                method: body ? 'POST' : 'GET',
                headers: body ? { 'Content-Type': 'application/json' } : {},
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!resp.ok) {
                console.error('API error:', resp.status);
                return null;
            }
            return await resp.json();
        } catch (e) {
            console.error('API call failed:', e);
            return null;
        }
    }

    let extraCubesTimer = null;
    let rainbowBoostTimer = null;
    let extraCubesEndTime = 0;
    let rainbowBoostEndTime = 0;
    let lastRolls = [];


    function newRainbowTarget() {
        const rainbowFill = document.getElementById('rainbow-progress-fill');
        const rainbowText = document.getElementById('rainbow-text');

        targetRainbow = CONFIG.rainbowRollsMin + Math.floor(Math.random() * (CONFIG.rainbowRollsMax - CONFIG.rainbowRollsMin + 1));
        rollsToRainbow = 0;
        if (rainbowFill) {
            rainbowFill.style.width = '0%';
            rainbowFill.classList.remove('rainbow-active');
        }
        if (rainbowText) rainbowText.textContent = `0/${targetRainbow} rolls to Rainbow Mode`;
    }

    // generateMin removed — now computed on server

    function addXP(amount) {
        totalXP += amount;
        updateLevel(totalXP);
    }

    function showLastFrameCubes(rolls) {
        if (!rolls || rolls.length === 0) return;
        const mainRoll = rolls[rolls.length - 1];
        const mainData = animationCache[mainRoll + '-cubic'];
        const cubeAnimationContainer = document.getElementById('cube-animation');
        if (mainData && cubeAnimationContainer) {
            if (currentAnim) currentAnim.destroy();
            currentAnim = lottie.loadAnimation({
                container: cubeAnimationContainer,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                animationData: mainData
            });
            currentAnim.addEventListener('DOMLoaded', function () {
                const lastFrame = Math.max(0, (currentAnim.totalFrames || 1) - 1);
                currentAnim.goToAndStop(lastFrame, true);
            });
            if (currentAnim.totalFrames) currentAnim.goToAndStop(Math.max(0, currentAnim.totalFrames - 1), true);
        }
        extraCubeAnims.forEach(({ anim, element }, index) => {
            if (index >= rolls.length - 1) return;
            const roll = rolls[index];
            const animData = animationCache[roll + '-cubic'];
            const container = element && element.querySelector('.lottie-cube');
            if (!animData || !container) return;
            if (anim) anim.destroy();
            const newAnim = lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                animationData: animData
            });
            extraCubeAnims[index].anim = newAnim;
            newAnim.addEventListener('DOMLoaded', function () {
                const lastFrame = Math.max(0, (newAnim.totalFrames || 1) - 1);
                newAnim.goToAndStop(lastFrame, true);
            });
            if (newAnim.totalFrames) newAnim.goToAndStop(Math.max(0, newAnim.totalFrames - 1), true);
        });
    }

    function showIdleCube() {
        if (extraCubes > 0) {
            const name = isRainbow ? 'super-first-cubic' : 'first-cubic';
            const data = animationCache[name];
            const cubeAnimationContainer = document.getElementById('cube-animation');
            if (isRainbow && data && cubeAnimationContainer) {
                if (currentAnim) currentAnim.destroy();
                currentAnim = lottie.loadAnimation({
                    container: cubeAnimationContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: data
                });
                extraCubeAnims.forEach(({ anim, element }, index) => {
                    const container = element && element.querySelector('.lottie-cube');
                    if (!data || !container) return;
                    if (anim) anim.destroy();
                    const newAnim = lottie.loadAnimation({
                        container: container,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        animationData: data
                    });
                    extraCubeAnims[index].anim = newAnim;
                });
            } else if (!isRainbow && lastRolls && lastRolls.length > 0) {
                showLastFrameCubes(lastRolls);
            } else {
                if (data && cubeAnimationContainer) {
                    if (currentAnim) currentAnim.destroy();
                    currentAnim = lottie.loadAnimation({
                        container: cubeAnimationContainer,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        animationData: data
                    });
                }
            }
            return;
        }
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
        const hypertapBoost = activeBoosts.find(b => b.id === 'hypertap');
        if (isRolling && !hypertapBoost) return;

        if (isRolling && hypertapBoost) {
            return;
        }

        if (extraCubes > 0) {
            Game.rollExtraCubes();
            return;
        }

        isRolling = true;

        Quests.updateProgress('roll', 1);

        // Ask server for the roll result
        const boostIds = activeBoosts.map(b => b.id);
        apiCall('/api/roll', {
            initData: getInitData(),
            isRainbow: isRainbow,
            activeBoosts: boostIds,
        }).then(serverResult => {
            if (!serverResult || serverResult.error) {
                console.error('Server roll failed:', serverResult);
                isRolling = false;
                return;
            }

            const roll = serverResult.roll;
            const animData = animationCache[roll + '-cubic'];
            if (!animData) {
                isRolling = false;
                return;
            }

            const safetyTimeout = setTimeout(() => {
                if (isRolling) {
                    console.warn('RollCube timeout - resetting state');
                    isRolling = false;
                }
            }, 10000);

            const animationSpeed = hypertapBoost ? 2.0 : 1.0;

            if (currentAnim) currentAnim.destroy();
            currentAnim = lottie.loadAnimation({
                container: document.getElementById('cube-animation'),
                renderer: 'svg',
                loop: false,
                autoplay: true,
                animationData: animData,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid meet'
                }
            });

            if (currentAnim && animationSpeed !== 1.0) {
                currentAnim.setSpeed(animationSpeed);
            }

            currentAnim.addEventListener('complete', function handler() {
                currentAnim.removeEventListener('complete', handler);
                clearTimeout(safetyTimeout);

                const rainbowFill = document.getElementById('rainbow-progress-fill');
                const rainbowText = document.getElementById('rainbow-text');
                const rainbowOverlay = document.getElementById('rainbow-overlay');

                // Apply server-computed values
                coinCount = serverResult.totalCoins;
                currentMin = serverResult.currentMin;
                totalXP = serverResult.totalXP;
                updateLevel(totalXP);

                rollsToRainbow = serverResult.rollsToRainbow;
                targetRainbow = serverResult.targetRainbow;

                if (serverResult.rainbowTriggered) {
                    isRainbow = true;
                    isRainbowFromBoost = false;
                    if (rainbowText) rainbowText.textContent = 'Rainbow Mode Active!';
                    if (rainbowOverlay) rainbowOverlay.classList.add('active');
                    const rf = document.getElementById('rainbow-progress-fill');
                    if (rf) {
                        rf.style.width = '100%';
                        rf.classList.add('rainbow-active');
                    }
                    showIdleCube();
                    if (extraCubes > 0) Game.updateCubeLayout();
                    Quests.updateProgress('rainbow', 1);
                } else if (!isRainbow) {
                    const percent = (rollsToRainbow / targetRainbow) * 100;
                    if (rainbowFill) rainbowFill.style.width = percent + '%';
                    if (rainbowText) rainbowText.textContent = `${rollsToRainbow}/${targetRainbow} rolls to Rainbow Mode`;
                } else if (isRainbow && !isRainbowFromBoost) {
                    isRainbow = false;
                    if (rainbowOverlay) rainbowOverlay.classList.remove('active');
                    const rf = document.getElementById('rainbow-progress-fill');
                    if (rf) rf.classList.remove('rainbow-active');
                    newRainbowTarget();
                    showIdleCube();
                }

                updateUI(coinCount, currentMin);
                isRolling = false;
            });
        }).catch(err => {
            console.error('Roll API error:', err);
            isRolling = false;
        });
    }

    function claimQuest(id) {

        const quest = Quests.data.find(q => q.id === id);
        if (!quest || !quest.completed || quest.claimed) return;

        addXP(quest.xp);
        quest.claimed = true;

        const questEl = document.querySelector(`.quest-item[data-id="${id}"]`);

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

    return {
        init: function () {
            // Load state from server
            const initData = getInitData();
            apiCall('/api/state?initData=' + encodeURIComponent(initData)).then(state => {
                if (state && !state.error) {
                    coinCount = state.coins || 0;
                    currentMin = state.min || 0;
                    totalXP = state.xp || 0;
                    rollsToRainbow = state.rollsToRainbow || 0;
                    targetRainbow = state.targetRainbow || 7;
                } else {
                    totalXP = 0;
                    coinCount = 0;
                    currentMin = 0;
                    newRainbowTarget();
                }
                updateLevel(totalXP);
                showIdleCube();
                updateUI(coinCount, currentMin);
                // Update rainbow progress bar
                const rainbowFill = document.getElementById('rainbow-progress-fill');
                const rainbowText = document.getElementById('rainbow-text');
                if (rainbowFill && rainbowText) {
                    const percent = (rollsToRainbow / targetRainbow) * 100;
                    rainbowFill.style.width = percent + '%';
                    rainbowText.textContent = `${rollsToRainbow}/${targetRainbow} rolls to Rainbow Mode`;
                }
            }).catch(() => {
                totalXP = 0;
                coinCount = 0;
                currentMin = 0;
                newRainbowTarget();
                updateLevel(totalXP);
                showIdleCube();
                updateUI(coinCount, currentMin);
            });

            Quests.data.forEach(q => q.current = 0);
        },
        claimQuest: claimQuest,
        rollCube: rollCube,
        resetRollingState: function () {
            isRolling = false;
            const centerGif = document.querySelector('.center-gif');
            if (centerGif) {
                centerGif.style.pointerEvents = 'auto';
            }
            extraCubeAnims.forEach(({ element }) => {
                if (element) {
                    element.style.pointerEvents = 'auto';
                }
            });
        },
        addCoins: function (amount) {
            coinCount += amount;
            updateUI(coinCount, currentMin);
        },
        addXP: function (amount) {
            totalXP += amount;
            updateLevel(totalXP);
        },
        setXP: function (xp) {
            totalXP = xp;
            updateLevel(totalXP);
        },
        setRainbowProgress: function (rolls) {
            rollsToRainbow = rolls;
            const rainbowFill = document.getElementById('rainbow-progress-fill');
            const rainbowText = document.getElementById('rainbow-text');
            const percent = Math.min(100, (rollsToRainbow / targetRainbow) * 100);
            rainbowFill.style.width = percent + '%';
            rainbowText.textContent = `${rollsToRainbow}/${targetRainbow} rolls to Rainbow Mode`;
        },
        activateRainbowMode: function () {
            isRainbow = true;
            const rainbowOverlay = document.getElementById('rainbow-overlay');
            const rainbowText = document.getElementById('rainbow-text');
            rainbowOverlay.classList.add('active');
            rainbowText.textContent = 'Rainbow Mode Active!';
            showIdleCube();
            if (extraCubes > 0) {
                this.updateCubeLayout();
            }
        },
        activateRainbowModeFromBoost: function (duration) {
            if (rainbowBoostTimer) {
                clearTimeout(rainbowBoostTimer);
                rainbowBoostTimer = null;
            }

            isRainbow = true;
            isRainbowFromBoost = true;
            const rainbowOverlay = document.getElementById('rainbow-overlay');
            const rainbowText = document.getElementById('rainbow-text');
            const rainbowFill = document.getElementById('rainbow-progress-fill');
            rainbowOverlay.classList.add('active');
            rainbowText.textContent = 'Rainbow Mode Active!';
            if (rainbowFill) {
                rainbowFill.style.width = '100%';
                rainbowFill.classList.add('rainbow-active');
            }
            showIdleCube();
            if (extraCubes > 0) {
                this.updateCubeLayout();
            }

            if (duration) {
                rainbowBoostEndTime = Date.now() + duration;
                rainbowBoostTimer = setTimeout(() => {
                    if (isRainbowFromBoost) {
                        isRainbow = false;
                        isRainbowFromBoost = false;
                        rainbowBoostEndTime = 0;
                        const rainbowOverlay = document.getElementById('rainbow-overlay');
                        const rainbowText = document.getElementById('rainbow-text');
                        const rainbowFill = document.getElementById('rainbow-progress-fill');
                        if (rainbowOverlay) rainbowOverlay.classList.remove('active');
                        if (rainbowFill) rainbowFill.classList.remove('rainbow-active');
                        if (rainbowText) newRainbowTarget();
                        showIdleCube();
                        if (extraCubes > 0) {
                            this.updateCubeLayout();
                        }
                    }
                    rainbowBoostTimer = null;
                }, duration);
                this.updateBoostUI();
            }
        },
        setMinNumber: function (value) {
            currentMin = value;
            updateUI(coinCount, currentMin);
        },
        getTotalXP: function () {
            return totalXP;
        },
        getCoinCount: function () {
            return coinCount;
        },
        useBoost: function (boostId) {
            if (boostId === 'rainbow_mode') {
                const duration = (30 + Math.random() * 70) * 1000;
                this.activateRainbowModeFromBoost(duration);
            } else if (boostId === 'extra_cube') {
                const duration = (30 + Math.random() * 70) * 1000;
                this.addExtraCube(1, duration);
            } else if (boostId === 'double_cube') {
                const duration = (30 + Math.random() * 70) * 1000;
                this.addExtraCube(2, duration);
            } else if (boostId === 'coin_surge') {
                const duration = (2 + Math.random() * 4) * 60 * 1000;
                this.activateBoost('coin_surge', duration);
            } else if (boostId === 'crit_roll') {
                const duration = (2 + Math.random() * 4) * 60 * 1000;
                this.activateBoost('crit_roll', duration);
            } else if (boostId === 'auto_roll') {
                const duration = (1 + Math.random() * 4) * 60 * 1000;
                this.activateAutoRoll(duration);
            } else if (boostId === 'lucky_streak') {
                const duration = (3 + Math.random() * 5) * 60 * 1000;
                this.activateBoost('lucky_streak', duration);
            } else if (boostId === 'time_freeze') {
                const duration = (2 + Math.random() * 3) * 60 * 1000;
                this.activateBoost('time_freeze', duration);
            } else if (boostId === 'hypertap') {
                const duration = (5 + Math.random() * 10) * 1000;
                this.activateHyperTap(duration);
            }
        },

        activateBoost: function (boostId, duration) {
            const existingBoost = activeBoosts.find(b => b.id === boostId);

            if (existingBoost) {
                existingBoost.endTime += duration;
                clearTimeout(existingBoost.timeoutId);
                existingBoost.timeoutId = setTimeout(() => {
                    const index = activeBoosts.findIndex(b => b.id === boostId && b.startTime === existingBoost.startTime);
                    if (index !== -1) {
                        activeBoosts.splice(index, 1);
                        this.updateBoostUI();
                    }
                }, existingBoost.endTime - Date.now());
            } else {
                const boost = {
                    id: boostId,
                    startTime: Date.now(),
                    endTime: Date.now() + duration
                };

                activeBoosts.push(boost);

                boost.timeoutId = setTimeout(() => {
                    const index = activeBoosts.findIndex(b => b.id === boostId && b.startTime === boost.startTime);
                    if (index !== -1) {
                        activeBoosts.splice(index, 1);
                        this.updateBoostUI();
                    }
                }, duration);
            }

            this.updateBoostUI();
        },

        activateAutoRoll: function (duration) {
            const existingBoost = activeBoosts.find(b => b.id === 'auto_roll');
            const totalDuration = existingBoost ? (existingBoost.endTime - Date.now() + duration) : duration;

            if (autoRollInterval) {
                clearInterval(autoRollInterval);
            }

            this.activateBoost('auto_roll', duration);

            autoRollInterval = setInterval(() => {
                if (!isRolling && extraCubes === 0) {
                    rollCube();
                } else if (!isRolling && extraCubes > 0) {
                    this.rollExtraCubes();
                }
            }, 1000);

            const boost = activeBoosts.find(b => b.id === 'auto_roll');
            if (boost && boost.timeoutId) {
                clearTimeout(boost.timeoutId);
            }

            const timeoutId = setTimeout(() => {
                if (autoRollInterval) {
                    clearInterval(autoRollInterval);
                    autoRollInterval = null;
                }
                const index = activeBoosts.findIndex(b => b.id === 'auto_roll');
                if (index !== -1) {
                    activeBoosts.splice(index, 1);
                    this.updateBoostUI();
                }
            }, totalDuration);

            if (boost) {
                boost.timeoutId = timeoutId;
            }
        },

        activateHyperTap: function (duration) {
            this.activateBoost('hypertap', duration);
        },

        updateBoostUI: function () {
            const rainbowFill = document.getElementById('rainbow-progress-fill');
            if (rainbowFill && isRainbow) {
                rainbowFill.style.width = '100%';
                if (!rainbowFill.classList.contains('rainbow-active')) {
                    rainbowFill.classList.add('rainbow-active');
                }
            }

            let boostList = document.getElementById('boost-timers-list');
            if (!boostList) return;

            boostList.innerHTML = '';

            let hasActiveBoosts = false;

            activeBoosts.forEach(boost => {
                const remaining = Math.ceil((boost.endTime - Date.now()) / 1000);
                if (remaining <= 0) return;

                hasActiveBoosts = true;
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                const boostData = Shop.boosts.find(b => b.id === boost.id);
                if (!boostData) return;

                const iconSVG = typeof Shop !== 'undefined' && Shop.getIconSVG ? Shop.getIconSVG(boostData.icon) : '';

                const boostEl = document.createElement('div');
                boostEl.className = 'boost-timer-item';
                boostEl.innerHTML = `
                    <div class="boost-timer-icon">
                        ${iconSVG}
                    </div>
                    <div class="boost-timer-text">
                        <div class="boost-timer-name">${boostData.name}</div>
                        <div class="boost-timer-time">${timeText}</div>
                    </div>
                `;

                boostList.appendChild(boostEl);
            });

            if (extraCubes > 0 && extraCubesEndTime > Date.now()) {
                const remaining = Math.ceil((extraCubesEndTime - Date.now()) / 1000);
                if (remaining > 0) {
                    hasActiveBoosts = true;
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    const boostName = extraCubes === 1 ? 'Extra Cube' : '+2 Cubes';

                    const iconSVG = typeof Shop !== 'undefined' && Shop.getIconSVG ? Shop.getIconSVG('dice') : '';

                    const boostEl = document.createElement('div');
                    boostEl.className = 'boost-timer-item';
                    boostEl.innerHTML = `
                        <div class="boost-timer-icon">
                            ${iconSVG}
                        </div>
                        <div class="boost-timer-text">
                            <div class="boost-timer-name">${boostName}</div>
                            <div class="boost-timer-time">${timeText}</div>
                        </div>
                    `;

                    boostList.appendChild(boostEl);
                }
            }

            if (isRainbowFromBoost && rainbowBoostEndTime > Date.now()) {
                const remaining = Math.ceil((rainbowBoostEndTime - Date.now()) / 1000);
                if (remaining > 0) {
                    hasActiveBoosts = true;
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                    const iconSVG = typeof Shop !== 'undefined' && Shop.getIconSVG ? Shop.getIconSVG('star') : '';

                    const boostEl = document.createElement('div');
                    boostEl.className = 'boost-timer-item';
                    boostEl.innerHTML = `
                        <div class="boost-timer-icon">
                            ${iconSVG}
                        </div>
                        <div class="boost-timer-text">
                            <div class="boost-timer-name">Rainbow Mode</div>
                            <div class="boost-timer-time">${timeText}</div>
                        </div>
                    `;

                    boostList.appendChild(boostEl);
                }
            }

            if (!hasActiveBoosts) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'boost-timers-empty';
                emptyEl.textContent = 'Haha, activate a boost to be cooler';
                boostList.appendChild(emptyEl);
            }

            const panel = document.getElementById('boost-timers-panel');
            if (panel && panel.classList.contains('visible')) {
                setTimeout(() => this.updateBoostUI(), 1000);
            }
        },

        toggleBoostPanel: function () {
            const panel = document.getElementById('boost-timers-panel');
            const button = document.getElementById('boost-timer-button');
            if (!panel || !button) return;

            if (panel.classList.contains('visible')) {
                panel.classList.remove('visible');
                button.classList.remove('active');
            } else {
                panel.classList.add('visible');
                button.classList.add('active');
                this.updateBoostUI();
                const updateInterval = setInterval(() => {
                    if (!panel.classList.contains('visible')) {
                        clearInterval(updateInterval);
                        return;
                    }
                    this.updateBoostUI();
                }, 1000);
            }
        },

        getActiveBoosts: function () {
            return activeBoosts;
        },
        addExtraCube: function (count, duration) {
            if (extraCubesTimer) {
                clearTimeout(extraCubesTimer);
                extraCubesTimer = null;
            }

            extraCubes = count;
            if (duration) {
                extraCubesEndTime = Date.now() + duration;
            }
            showIdleCube();
            this.updateCubeLayout();
            this.updateBoostUI();

            if (duration) {
                extraCubesTimer = setTimeout(() => {
                    if (extraCubes === count) {
                        this.removeExtraCubes();
                    }
                    extraCubesTimer = null;
                }, duration);
            }
        },

        updateCubeLayout: function () {
            const centerGif = document.querySelector('.center-gif');
            if (!centerGif) return;

            extraCubeAnims.forEach(({ anim, element }) => {
                if (anim) anim.destroy();
                if (element && element.parentNode) {
                    element.remove();
                }
            });
            extraCubeAnims = [];

            const leftCube = document.getElementById('extra-cube-left');
            const rightCube = document.getElementById('extra-cube-right');
            if (leftCube && leftCube.parentNode) {
                const animContainer = leftCube.querySelector('.lottie-cube');
                if (animContainer && animContainer._lottie) {
                    animContainer._lottie.destroy();
                }
                leftCube.remove();
            }
            if (rightCube && rightCube.parentNode) {
                const animContainer = rightCube.querySelector('.lottie-cube');
                if (animContainer && animContainer._lottie) {
                    animContainer._lottie.destroy();
                }
                rightCube.remove();
            }

            centerGif.style.position = 'absolute';
            centerGif.style.top = '50%';
            centerGif.style.transform = 'translate(-50%, -50%)';
            centerGif.style.pointerEvents = 'auto';

            if (extraCubes === 1) {
                centerGif.style.left = 'calc(50% + 90px)';
                this.createExtraCube('left');
            } else if (extraCubes === 2) {
                centerGif.style.left = '50%';
                this.createExtraCube('left');
                this.createExtraCube('right');
            } else {
                centerGif.style.left = '50%';
            }
        },

        updateOrCreateExtraCube: function (position) {
            const existing = document.getElementById(`extra-cube-${position}`);
            if (existing) {
                const animContainer = existing.querySelector('.lottie-cube');
                if (animContainer) {
                    const animIndex = extraCubeAnims.findIndex(item => item.element === existing);
                    if (animIndex !== -1 && extraCubeAnims[animIndex].anim) {
                        extraCubeAnims[animIndex].anim.destroy();
                    }

                    if (animContainer._lottie) {
                        animContainer._lottie.destroy();
                    }

                    animContainer.innerHTML = '';

                    const name = isRainbow ? 'super-first-cubic' : 'first-cubic';
                    const data = animationCache[name];
                    if (data) {
                        const anim = lottie.loadAnimation({
                            container: animContainer,
                            renderer: 'svg',
                            loop: true,
                            autoplay: true,
                            animationData: data
                        });
                        animContainer._lottie = anim;
                        if (animIndex !== -1) {
                            extraCubeAnims[animIndex].anim = anim;
                        } else {
                            extraCubeAnims.push({ anim, element: existing });
                        }
                    }
                }
            } else {
                this.createExtraCube(position);
            }
        },
        createExtraCube: function (position) {
            const existing = document.getElementById(`extra-cube-${position}`);
            if (existing) {
                const animIndex = extraCubeAnims.findIndex(item => item.element === existing);
                if (animIndex !== -1) {
                    if (extraCubeAnims[animIndex].anim) {
                        extraCubeAnims[animIndex].anim.destroy();
                    }
                    extraCubeAnims.splice(animIndex, 1);
                }
                existing.remove();
            }

            const centerGif = document.querySelector('.center-gif');
            const cube = document.createElement('div');
            cube.id = `extra-cube-${position}`;
            cube.className = 'center-gif extra-cube';
            cube.style.position = 'absolute';
            cube.style.top = '50%';
            cube.style.width = '180px';
            cube.style.height = '180px';
            cube.style.transform = 'translate(-50%, -50%)';
            cube.style.zIndex = '4';
            cube.style.pointerEvents = 'auto';
            cube.style.transition = 'all 0.3s ease';
            cube.style.cursor = 'pointer';

            if (position === 'left') {
                cube.style.left = 'calc(50% - 140px)';
            } else {
                cube.style.left = 'calc(50% + 140px)';
            }

            const animContainer = document.createElement('div');
            animContainer.className = 'lottie-cube';
            animContainer.style.width = '180px';
            animContainer.style.height = '180px';
            cube.appendChild(animContainer);

            centerGif.parentElement.appendChild(cube);

            const name = isRainbow ? 'super-first-cubic' : 'first-cubic';
            const data = animationCache[name];
            if (data) {
                const anim = lottie.loadAnimation({
                    container: animContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: data
                });
                animContainer._lottie = anim;
                extraCubeAnims.push({ anim, element: cube });
            }

            cube.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof Game !== 'undefined' && Game.rollExtraCubes) {
                    Game.rollExtraCubes();
                }
            });
        },
        removeExtraCubes: function () {
            extraCubeAnims.forEach(({ anim, element }) => {
                if (anim) anim.destroy();
                if (element) element.remove();
            });
            extraCubeAnims = [];
            extraCubes = 0;
            extraCubesEndTime = 0;
            lastRolls = [];

            const centerGif = document.querySelector('.center-gif');
            if (centerGif) {
                centerGif.style.left = '50%';
                centerGif.style.transition = 'left 0.5s ease';
            }

            this.updateCubeLayout();
            this.updateBoostUI();
        },
        processExtraCubeRolls: function (rolls, serverResult) {
            const rainbowFill = document.getElementById('rainbow-progress-fill');
            const rainbowText = document.getElementById('rainbow-text');
            const rainbowOverlay = document.getElementById('rainbow-overlay');

            // Apply server-computed values
            coinCount = serverResult.totalCoins;
            currentMin = serverResult.currentMin;
            totalXP = serverResult.totalXP;
            updateLevel(totalXP);

            rollsToRainbow = serverResult.rollsToRainbow;
            targetRainbow = serverResult.targetRainbow;

            if (serverResult.rainbowTriggered) {
                isRainbow = true;
                isRainbowFromBoost = false;
                if (rainbowText) rainbowText.textContent = 'Rainbow Mode Active!';
                if (rainbowOverlay) rainbowOverlay.classList.add('active');
                if (rainbowFill) {
                    rainbowFill.style.width = '100%';
                    rainbowFill.classList.add('rainbow-active');
                }
                showIdleCube();
                if (extraCubes > 0) this.updateCubeLayout();
                Quests.updateProgress('rainbow', 1);
            } else if (!isRainbow) {
                const percent = (rollsToRainbow / targetRainbow) * 100;
                if (rainbowFill) rainbowFill.style.width = percent + '%';
                if (rainbowText) rainbowText.textContent = `${rollsToRainbow}/${targetRainbow} rolls to Rainbow Mode`;
            } else if (isRainbow && !isRainbowFromBoost) {
                isRainbow = false;
                if (rainbowOverlay) rainbowOverlay.classList.remove('active');
                if (rainbowFill) rainbowFill.classList.remove('rainbow-active');
                newRainbowTarget();
                showIdleCube();
            }

            updateUI(coinCount, currentMin);

            isRolling = false;
            lastRolls = rolls.slice();
            showIdleCube();
            const centerGif = document.querySelector('.center-gif');
            if (centerGif) {
                centerGif.style.pointerEvents = 'auto';
            }
            extraCubeAnims.forEach(({ element }) => {
                if (element) {
                    element.style.pointerEvents = 'auto';
                }
            });
        },
        animateExtraCubesOut: function () {
            isRolling = false;
            showIdleCube();
            const centerGif = document.querySelector('.center-gif');
            if (centerGif) {
                centerGif.style.pointerEvents = 'auto';
            }
        },
        rollExtraCubes: function () {
            if (isRolling || extraCubes === 0) return;
            isRolling = true;

            const centerGif = document.querySelector('.center-gif');
            if (centerGif) {
                centerGif.style.pointerEvents = 'none';
            }
            extraCubeAnims.forEach(({ element }) => {
                if (element) element.style.pointerEvents = 'none';
            });

            const safetyTimeout = setTimeout(() => {
                if (isRolling) {
                    console.warn('Roll timeout - resetting state');
                    isRolling = false;
                    if (centerGif) {
                        centerGif.style.pointerEvents = 'auto';
                    }
                    extraCubeAnims.forEach(({ element }) => {
                        if (element) element.style.pointerEvents = 'auto';
                    });
                }
            }, 10000);

            const totalCubes = extraCubes + 1; // extra + main
            Quests.updateProgress('roll', 1);

            // Ask server for multi-roll result
            apiCall('/api/roll-multi', {
                initData: getInitData(),
                isRainbow: isRainbow,
                cubeCount: totalCubes,
            }).then(serverResult => {
                if (!serverResult || serverResult.error) {
                    console.error('Server multi-roll failed:', serverResult);
                    clearTimeout(safetyTimeout);
                    isRolling = false;
                    if (centerGif) centerGif.style.pointerEvents = 'auto';
                    extraCubeAnims.forEach(({ element }) => {
                        if (element) element.style.pointerEvents = 'auto';
                    });
                    return;
                }

                const rolls = serverResult.rolls;
                const mainRoll = rolls[rolls.length - 1];

                const hypertapBoost = activeBoosts.find(b => b.id === 'hypertap');
                const animationSpeed = hypertapBoost ? 2.0 : 1.0;

                const mainAnimData = animationCache[mainRoll + '-cubic'];
                const cubeAnimationContainer = document.getElementById('cube-animation');

                if (!mainAnimData || !cubeAnimationContainer) {
                    clearTimeout(safetyTimeout);
                    isRolling = false;
                    if (centerGif) {
                        centerGif.style.pointerEvents = 'auto';
                    }
                    extraCubeAnims.forEach(({ element }) => {
                        if (element) element.style.pointerEvents = 'auto';
                    });
                    return;
                }

                if (currentAnim) {
                    currentAnim.destroy();
                }
                currentAnim = lottie.loadAnimation({
                    container: cubeAnimationContainer,
                    renderer: 'svg',
                    loop: false,
                    autoplay: true,
                    animationData: mainAnimData
                });
                if (currentAnim && animationSpeed !== 1.0) {
                    currentAnim.setSpeed(animationSpeed);
                }

                const extraCubeUpdates = [];
                extraCubeAnims.forEach(({ anim, element }, index) => {
                    if (index < rolls.length - 1) {
                        const roll = rolls[index];
                        const animData = animationCache[roll + '-cubic'];
                        if (animData && anim && element) {
                            const container = element.querySelector('.lottie-cube');
                            if (container) {
                                extraCubeUpdates.push({ anim, container, animData, index });
                            }
                        }
                    }
                });

                extraCubeUpdates.forEach(({ anim, container, animData, index }) => {
                    if (anim) anim.destroy();
                    const newAnim = lottie.loadAnimation({
                        container: container,
                        renderer: 'svg',
                        loop: false,
                        autoplay: true,
                        animationData: animData
                    });
                    if (newAnim && animationSpeed !== 1.0) {
                        newAnim.setSpeed(animationSpeed);
                    }
                    extraCubeAnims[index].anim = newAnim;
                });

                let completedCount = 0;
                const totalAnims = rolls.length;
                const handlers = [];

                const checkAllComplete = () => {
                    completedCount++;
                    if (completedCount >= totalAnims) {
                        handlers.forEach(clear => clear());
                        clearTimeout(safetyTimeout);
                        this.processExtraCubeRolls(rolls, serverResult);
                    }
                };

                if (currentAnim) {
                    const handler = () => {
                        try {
                            currentAnim.removeEventListener('complete', handler);
                        } catch (e) { }
                        checkAllComplete();
                    };
                    try {
                        currentAnim.addEventListener('complete', handler);
                        handlers.push(() => {
                            try {
                                currentAnim.removeEventListener('complete', handler);
                            } catch (e) { }
                        });
                    } catch (e) {
                        completedCount++;
                    }
                } else {
                    completedCount++;
                }

                extraCubeAnims.forEach(({ anim }, index) => {
                    if (index < rolls.length - 1) {
                        if (anim) {
                            const handler = () => {
                                try {
                                    anim.removeEventListener('complete', handler);
                                } catch (e) { }
                                checkAllComplete();
                            };
                            try {
                                anim.addEventListener('complete', handler);
                                handlers.push(() => {
                                    try {
                                        anim.removeEventListener('complete', handler);
                                    } catch (e) { }
                                });
                            } catch (e) {
                                completedCount++;
                            }
                        } else {
                            completedCount++;
                        }
                    }
                });

                if (completedCount >= totalAnims) {
                    handlers.forEach(clear => {
                        try {
                            clear();
                        } catch (e) { }
                    });
                    clearTimeout(safetyTimeout);
                    this.processExtraCubeRolls(rolls, serverResult);
                } else {
                    const fallbackTimeout = setTimeout(() => {
                        if (isRolling) {
                            console.warn('Animation fallback - forcing completion');
                            handlers.forEach(clear => {
                                try {
                                    clear();
                                } catch (e) { }
                            });
                            clearTimeout(safetyTimeout);
                            this.processExtraCubeRolls(rolls, serverResult);
                        }
                    }, 5000);
                    handlers.push(() => clearTimeout(fallbackTimeout));
                }

            }).catch(err => {
                console.error('Multi-roll API error:', err);
                clearTimeout(safetyTimeout);
                isRolling = false;
                if (centerGif) centerGif.style.pointerEvents = 'auto';
                extraCubeAnims.forEach(({ element }) => {
                    if (element) element.style.pointerEvents = 'auto';
                });
            });
        },
    };
})();

