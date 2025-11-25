// Глобальные переменные: CONFIG, format, Game (будет доступен после загрузки game.js), hideQuestMenu доступны
// Переменные состояния UI
let displayedProgress = 0;

// Ссылки на DOM-элементы (сделаны глобальными)
const rankEl = document.getElementById('rank-text');
const xpEl = document.getElementById('xp-text');
const progressEl = document.getElementById('progress-fill');
const coinEl = document.getElementById('coin-count');
const minEl = document.getElementById('min-number');

const topMenuEl = document.getElementById('top-menu');
const questOverlayEl = document.getElementById('quest-menu-overlay');
const questCloseBtn = document.getElementById('quest-menu-close-btn');

// Функции обновления UI (сделаны глобальными, принимают данные от объекта Game)
function animateProgressBar(target) {
    const step = () => {
        const diff = target - displayedProgress;
        if (Math.abs(diff) > 0.1) {
            displayedProgress += diff * 0.15;
            progressEl.style.width = displayedProgress + '%';
            requestAnimationFrame(step);
        } else {
            displayedProgress = target;
            progressEl.style.width = target + '%';
        }
    };
    step();
}

function updateLevel(totalXP) { // Принимает XP от объекта Game
    let passed = 0;
    for (let i = 0; i < CONFIG.levels.length; i++) {
        if (totalXP >= CONFIG.levels[i].xp) passed++;
        else break;
    }

    if (passed >= CONFIG.levels.length) {
        rankEl.textContent = CONFIG.levels[CONFIG.levels.length - 1].name;
        xpEl.textContent = 'MAX LEVEL';
        animateProgressBar(100);
        return;
    }

    const current = CONFIG.levels[passed];
    const prevXP = passed === 0 ? 0 : CONFIG.levels[passed - 1].xp;
    const have = totalXP - prevXP;
    const need = current.xp - prevXP;

    rankEl.textContent = current.name;
    xpEl.textContent = `${have.toFixed(1)}/${need} XP`;
    animateProgressBar((have / need) * 100);
}

function updateUI(coinCount, currentMin) { // Принимает состояние от объекта Game
    // format доступен глобально из utils.js
    coinEl.textContent = format(coinCount);
    const str = currentMin === 0 ? '0' : currentMin.toFixed(5).replace(/\.?0+$/, '');
    minEl.textContent = str;
}


// Логика квестов (Quests)
const Quests = {
    // Копирование данных для сохранения состояния квестов
    data: JSON.parse(JSON.stringify(CONFIG.QUESTS)), 
    listEl: document.getElementById('quest-list'),
    
    getIconSVG: function(iconType) {
        if (iconType === 'dice') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>';
        if (iconType === 'star') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        if (iconType === 'user') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
        if (iconType === 'heart') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.86 18.14A2 2 0 0 0 3.71 21h16.58a2 2 0 0 0 1.85-2.86L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>'; 
    },

    render: function() {
        this.listEl.innerHTML = '';
        
        const activeQuests = this.data.filter(q => !q.claimed || !q.social); 
        const itemsToCheck = [];
        
        activeQuests.forEach(q => {
            
            const currentProgress = q.social ? 0 : q.current;
            const progress = q.social ? (q.completed ? 100 : 0) : Math.min(100, (currentProgress / q.target) * 100);
            
            if (progress >= 100 && !q.completed) {
                q.completed = true;
            }
            
            const item = document.createElement('div');
            item.className = 'quest-item';
            item.dataset.id = q.id;
            if (q.completed && !q.claimed) {
                item.classList.add('completed');
                
                // Обработчик вызывает Game.claimQuest, который будет определен в game.js
                item.addEventListener('click', (e) => {
                    if (e.currentTarget === item) {
                        if (typeof Game !== 'undefined' && Game.claimQuest) {
                            Game.claimQuest(q.id);
                        }
                    }
                });
            }
            
            const nameText = q.name.replace('{target}', q.target);
            const xpText = `(+${q.xp} xp)`;
            const percentageText = `${progress.toFixed(0)}%`;
            
            item.innerHTML = `
                <div class="quest-icon-placeholder">${this.getIconSVG(q.icon)}</div>
                <div class="quest-info">
                    <div class="quest-name">
                        <div class="quest-description-marquee">
                            <div class="quest-marquee-content-wrapper">
                                <span class="quest-text">${nameText}</span>
                                <span class="quest-text duplicate">${nameText}</span>
                            </div>
                        </div>
                        <div class="quest-xp-container">${xpText}</div>
                    </div>
                    <div class="quest-progress-bar-container">
                        <div class="quest-progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>
                <div class="quest-percentage">${percentageText}</div>
            `;
            this.listEl.appendChild(item);
            itemsToCheck.push(item);
        });
        
        
        if (itemsToCheck.length > 0) {
            
            setTimeout(() => {
                itemsToCheck.forEach(item => {
                    const marqueeContainer = item.querySelector('.quest-description-marquee');
                    const marqueeWrapper = item.querySelector('.quest-marquee-content-wrapper');
                    const originalTextSpan = item.querySelector('.quest-text:not(.duplicate)');
                    
                    if (!originalTextSpan || !marqueeContainer) return;
                    
                    
                    marqueeWrapper.classList.remove('marquee-active');
                    
                    
                    
                    const textWidth = originalTextSpan.offsetWidth;
                    const containerWidth = marqueeContainer.offsetWidth;
                    
                    
                    if (textWidth > containerWidth) {
                        
                        marqueeWrapper.classList.add('marquee-active');
                    } 
                    
                });
            }, 0); 
        }
    },
    
    // updateProgress вызывается из Game.rollCube
    updateProgress: function(type, amount = 1) {
        let didUpdate = false;
        this.data.forEach(q => {
            if (q.type === type && !q.claimed) {
                q.current += amount;
                if (q.current >= q.target && !q.completed) {
                    q.completed = true;
                    didUpdate = true;
                }
            }
        });
        
        if (didUpdate) this.render();
    },
};

// Функции для меню квестов
function showQuestMenu() {
    Quests.render(); 
    questOverlayEl.classList.add('visible');
}

function hideQuestMenu() {
    questOverlayEl.classList.remove('visible');
}

// Анимация космической пыли
const dust = document.querySelector('.cosmic-dust-layer');
function dustCycle() {
    dust.classList.add('active');
    const dur = 28000 + Math.random() * 15000;
    setTimeout(() => {
        dust.classList.remove('active');
        setTimeout(dustCycle, 5000 + Math.random() * 8000);
    }, dur);
}
dustCycle();