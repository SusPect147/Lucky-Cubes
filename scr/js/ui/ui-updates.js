let displayedProgress = 0;
let progressBarRaf = null;

const rankEl = document.getElementById('rank-text');
const xpEl = document.getElementById('xp-text');
const progressEl = document.getElementById('progress-fill');
const coinEl = document.getElementById('coin-count');
const minEl = document.getElementById('min-number');

function animateProgressBar(target) {
    const clamped = Math.max(0, Math.min(100, target));
    if (progressBarRaf !== null) {
        cancelAnimationFrame(progressBarRaf);
        progressBarRaf = null;
    }
    if (clamped < displayedProgress) {
        displayedProgress = clamped;
        progressEl.style.width = clamped + '%';
        return;
    }
    const step = () => {
        const diff = clamped - displayedProgress;
        if (Math.abs(diff) > 0.15) {
            displayedProgress += diff * 0.2;
            displayedProgress = Math.min(displayedProgress, 100);
            progressEl.style.width = displayedProgress + '%';
            progressBarRaf = requestAnimationFrame(step);
        } else {
            displayedProgress = clamped;
            progressEl.style.width = clamped + '%';
            progressBarRaf = null;
        }
    };
    progressBarRaf = requestAnimationFrame(step);
}

function updateLevel(totalXP) {
    let passed = 0;
    for (let i = 0; i < CONFIG.levels.length; i++) {
        if (totalXP >= CONFIG.levels[i].xp) passed = i + 1;
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
    animateProgressBar(Math.min(100, (have / need) * 100));
}

function updateUI(coinCount, currentMin) {
    coinEl.textContent = format(coinCount);
    const str = currentMin === 0 ? '0' : currentMin.toFixed(5).replace(/\.?0+$/, '');
    minEl.textContent = str;

    autoResizeText(coinEl);
    autoResizeText(minEl);
}

function autoResizeText(element) {
    if (!element || !element.parentElement) return;

    const parent = element.parentElement;
    const maxWidth = parent.offsetWidth;
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const minFontSize = 0.8;
    const originalFontSize = fontSize;

    element.style.fontSize = '';
    fontSize = parseFloat(window.getComputedStyle(element).fontSize);

    if (element.scrollWidth > maxWidth) {
        while (element.scrollWidth > maxWidth && fontSize > originalFontSize * minFontSize) {
            fontSize -= 0.1;
            element.style.fontSize = fontSize + 'px';
        }
    } else {
        element.style.fontSize = '';
    }
}

window.renderLevelsList = function() {
    const levelsList = document.getElementById('levels-list');
    if (!levelsList || typeof CONFIG === 'undefined' || !CONFIG.levels) return;
    levelsList.innerHTML = '';
    
    let totalXP = typeof Game !== 'undefined' && Game.getTotalXP ? Game.getTotalXP() : 0;
    
    let currentLevelIndex = 0;
    for (let i = 0; i < CONFIG.levels.length; i++) {
        if (totalXP >= CONFIG.levels[i].xp) {
            currentLevelIndex = i + 1;
        } else {
            break;
        }
    }
    currentLevelIndex = Math.min(currentLevelIndex, CONFIG.levels.length - 1);
    
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const avatarUrl = tgUser?.photo_url || '';

    CONFIG.levels.forEach((lvl, index) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '12px 15px';
        item.style.borderRadius = '12px';
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.marginBottom = '8px';
        
        let isCurrent = (index === currentLevelIndex);
        if (isCurrent) {
            item.style.background = 'rgba(255,255,255,0.08)';
            item.style.border = '1px solid rgba(255,255,255,0.35)';
        } else {
            item.style.border = '1px solid transparent';
        }

        const icon = document.createElement('div');
        icon.style.width = '32px';
        icon.style.height = '32px';
        icon.style.borderRadius = '50%';
        icon.style.background = 'var(--bg-elevated)';
        if (isCurrent && avatarUrl) {
           icon.style.background = `url(${avatarUrl}) center/cover`;
        }
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.flexShrink = '0';
        
        if (!isCurrent || !avatarUrl) {
            icon.textContent = '🌟';
        }

        const info = document.createElement('div');
        info.style.flex = '1';
        info.style.display = 'flex';
        info.style.justifyContent = 'space-between';
        info.style.alignItems = 'center';
        info.style.marginLeft = '12px';

        const name = document.createElement('div');
        name.textContent = typeof i18n !== 'undefined' ? i18n.t(lvl.name) : lvl.name;
        name.style.fontWeight = '600';
        name.style.fontSize = '0.9rem';

        const xp = document.createElement('div');
        xp.textContent = `${lvl.xp} XP`;
        xp.style.fontSize = '0.8rem';
        xp.style.opacity = '0.7';

        info.appendChild(name);
        info.appendChild(xp);

        item.appendChild(icon);
        item.appendChild(info);

        levelsList.appendChild(item);
    });
};
