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

