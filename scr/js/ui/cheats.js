const Cheats = {
    initialized: false,
    
    init: function() {
        this.setupLevelSelect();
        this.setupEventListeners();
        this.initialized = true;
    },

    setupLevelSelect: function() {
        const levelSelect = document.getElementById('cheat-level-select');
        if (!levelSelect) return;
        
        levelSelect.innerHTML = '<option value="">Select Level</option>';
        
        if (typeof CONFIG !== 'undefined' && CONFIG.levels) {
            CONFIG.levels.forEach((level, index) => {
                const option = document.createElement('option');
                option.value = level.xp;
                option.textContent = `${index + 1}. ${level.name} (${level.xp} XP)`;
                levelSelect.appendChild(option);
            });
        }
    },

    setupEventListeners: function() {
        const coinsBtn = document.getElementById('cheat-coins-btn');
        const xpBtn = document.getElementById('cheat-xp-btn');
        const levelBtn = document.getElementById('cheat-level-btn');
        const rainbowBtn = document.getElementById('cheat-rainbow-btn');
        const rainbowActivateBtn = document.getElementById('cheat-rainbow-activate-btn');
        const minBtn = document.getElementById('cheat-min-btn');
        const boostBtn = document.getElementById('cheat-boost-btn');
        const resetBtn = document.getElementById('cheat-reset-btn');
        
        if (!coinsBtn || !xpBtn || !levelBtn || !rainbowBtn || !rainbowActivateBtn || !minBtn || !boostBtn || !resetBtn) {
            console.error('Cheats: Some elements not found');
            return;
        }
        
        coinsBtn.addEventListener('click', () => {
            const input = document.getElementById('cheat-coins-input');
            const amount = parseFloat(input.value);
            if (!isNaN(amount) && amount > 0) {
                this.addCoins(amount);
                input.value = '';
                this.showSuccess(coinsBtn);
            }
        });

        xpBtn.addEventListener('click', () => {
            const input = document.getElementById('cheat-xp-input');
            const amount = parseFloat(input.value);
            if (!isNaN(amount) && amount > 0) {
                this.addXP(amount);
                input.value = '';
                this.showSuccess(xpBtn);
            }
        });

        levelBtn.addEventListener('click', () => {
            const select = document.getElementById('cheat-level-select');
            const xp = parseFloat(select.value);
            if (!isNaN(xp) && xp >= 0) {
                this.setLevel(xp);
                this.showSuccess(levelBtn);
            }
        });

        rainbowBtn.addEventListener('click', () => {
            const input = document.getElementById('cheat-rainbow-input');
            const rolls = parseInt(input.value);
            if (!isNaN(rolls) && rolls >= 0) {
                this.setRainbowProgress(rolls);
                input.value = '';
                this.showSuccess(rainbowBtn);
            }
        });

        rainbowActivateBtn.addEventListener('click', () => {
            this.activateRainbowMode();
            this.showSuccess(rainbowActivateBtn);
        });

        minBtn.addEventListener('click', () => {
            const input = document.getElementById('cheat-min-input');
            const value = parseFloat(input.value);
            if (!isNaN(value) && value >= 0) {
                this.setMinNumber(value);
                input.value = '';
                this.showSuccess(minBtn);
            }
        });

        boostBtn.addEventListener('click', () => {
            const select = document.getElementById('cheat-boost-select');
            const boostId = select.value;
            if (boostId) {
                this.addBoost(boostId);
                this.showSuccess(boostBtn);
            }
        });

        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
                this.resetGame();
            }
        });

        document.querySelectorAll('.cheat-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const button = input.parentElement.querySelector('.cheat-button');
                    if (button) button.click();
                }
            });
        });
    },

    addCoins: function(amount) {
        if (typeof Game !== 'undefined' && Game.addCoins) {
            Game.addCoins(amount);
        } else {
            const coinEl = document.getElementById('coin-count');
            const current = parseFloat(coinEl.textContent.replace(/[^0-9.]/g, '')) || 0;
            const newAmount = current + amount;
            coinEl.textContent = format(newAmount);
        }
    },

    addXP: function(amount) {
        if (typeof Game !== 'undefined' && Game.addXP) {
            Game.addXP(amount);
        } else if (typeof updateLevel === 'function') {
            const currentXP = this.getCurrentXP();
            updateLevel(currentXP + amount);
        }
    },

    getCurrentXP: function() {
        if (typeof Game !== 'undefined' && Game.getTotalXP) {
            return Game.getTotalXP();
        }
        const xpEl = document.getElementById('xp-text');
        const text = xpEl.textContent;
        if (text === 'MAX LEVEL') {
            return CONFIG.levels[CONFIG.levels.length - 1].xp;
        }
        const match = text.match(/(\d+\.?\d*)\/(\d+)/);
        if (match) {
            const current = parseFloat(match[1]);
            const needed = parseFloat(match[2]);
            let totalXP = 0;
            for (let i = 0; i < CONFIG.levels.length; i++) {
                if (i === CONFIG.levels.length - 1) {
                    totalXP = CONFIG.levels[i].xp + current;
                    break;
                }
                if (CONFIG.levels[i + 1].xp > totalXP + needed) {
                    totalXP = CONFIG.levels[i].xp + current;
                    break;
                }
            }
            return totalXP;
        }
        return 0;
    },

    setLevel: function(targetXP) {
        if (typeof Game !== 'undefined' && Game.setXP) {
            Game.setXP(targetXP);
        } else if (typeof updateLevel === 'function') {
            updateLevel(targetXP);
        }
    },

    setRainbowProgress: function(rolls) {
        if (typeof Game !== 'undefined' && Game.setRainbowProgress) {
            Game.setRainbowProgress(rolls);
        } else {
            const rainbowFill = document.getElementById('rainbow-progress-fill');
            const rainbowText = document.getElementById('rainbow-text');
            const targetRainbow = 7;
            const percent = Math.min(100, (rolls / targetRainbow) * 100);
            rainbowFill.style.width = percent + '%';
            rainbowText.textContent = `${rolls}/${targetRainbow} rolls to Rainbow Mode`;
        }
    },

    activateRainbowMode: function() {
        if (typeof Game !== 'undefined' && Game.activateRainbowMode) {
            Game.activateRainbowMode();
        } else {
            const rainbowOverlay = document.getElementById('rainbow-overlay');
            const rainbowText = document.getElementById('rainbow-text');
            rainbowOverlay.classList.add('active');
            rainbowText.textContent = 'Rainbow Mode Active!';
        }
    },

    setMinNumber: function(value) {
        if (typeof Game !== 'undefined' && Game.setMinNumber) {
            Game.setMinNumber(value);
        } else {
            const minEl = document.getElementById('min-number');
            const str = value === 0 ? '0' : value.toFixed(5).replace(/\.?0+$/, '');
            minEl.textContent = str;
        }
    },

    addBoost: function(boostId) {
        if (typeof Inventory !== 'undefined' && Inventory.addBoost) {
            Inventory.addBoost(boostId);
        } else if (typeof Game !== 'undefined' && Game.useBoost) {
            Game.useBoost(boostId);
        } else {
            console.log(`Added boost: ${boostId}`);
        }
    },

    resetGame: function() {
        if (typeof Game !== 'undefined' && Game.init) {
            Game.init();
        }
        
        document.getElementById('coin-count').textContent = '0';
        document.getElementById('min-number').textContent = '0';
        document.getElementById('rainbow-progress-fill').style.width = '0%';
        document.getElementById('rainbow-text').textContent = '0/7 rolls to Rainbow Mode';
        document.getElementById('rainbow-overlay').classList.remove('active');
        
        updateLevel(0);
        
        if (typeof Quests !== 'undefined' && Quests.data) {
            Quests.data.forEach(q => {
                q.current = 0;
                q.completed = false;
                q.claimed = false;
            });
            Quests.render();
        }
    },

    showSuccess: function(button) {
        const originalText = button.textContent;
        button.classList.add('cheat-button-success');
        button.textContent = '✓';
        
        setTimeout(() => {
            button.classList.remove('cheat-button-success');
            button.textContent = originalText;
        }, 1000);
    }
};

