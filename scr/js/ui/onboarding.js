document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main game to load before starting onboarding
    // A simple polling logic to check if #game-content is visible
    const checkGameVisible = setInterval(() => {
        const gameContent = document.getElementById('game-content');
        if (gameContent && gameContent.style.display !== 'none') {
            clearInterval(checkGameVisible);
            initOnboarding();
        }
    }, 500);
});

function initOnboarding() {
    const hasSeen = localStorage.getItem('lucu_onboarding_seen');
    if (hasSeen === 'true') return;

    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    const hole = document.getElementById('onboarding-hole');
    const tooltip = document.getElementById('onboarding-tooltip');
    const textEl = document.getElementById('onboarding-text');
    const nextBtn = document.getElementById('onboarding-next-btn');

    let currentStep = 0;
    const steps = [
        {
            targetId: 'cube-animation',
            text: 'Tap to roll the cube and start farming $LUCU!',
            margin: 20
        },
        {
            targetSelector: '.rainbow-progress-container',
            text: 'Fill the bar to unlock Rainbow Mode for huge multipliers!',
            margin: 10
        }
    ];

    function showStep(index) {
        if (index >= steps.length) {
            endOnboarding();
            return;
        }

        const step = steps[index];
        let target;
        if (step.targetSelector) {
            target = document.querySelector(step.targetSelector);
        } else {
            target = document.getElementById(step.targetId);
        }

        if (!target) {
            // fallback generic center
            hole.style.top = '50%';
            hole.style.left = '50%';
            hole.style.width = '0px';
            hole.style.height = '0px';

            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        } else {
            const rect = target.getBoundingClientRect();
            const margin = step.margin || 0;

            hole.style.top = (rect.top - margin) + 'px';
            hole.style.left = (rect.left - margin) + 'px';
            hole.style.width = (rect.width + margin * 2) + 'px';
            hole.style.height = (rect.height + margin * 2) + 'px';

            // Place tooltip below or above target depending on screen space
            const tooltipSpaceBelow = window.innerHeight - (rect.bottom + margin);
            if (tooltipSpaceBelow > 150) {
                tooltip.style.top = (rect.bottom + margin + 20) + 'px';
            } else {
                tooltip.style.top = (rect.top - margin - 100) + 'px'; // approx tooltip height
            }
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
        }

        textEl.textContent = step.text;
        nextBtn.textContent = index === steps.length - 1 ? 'Got it!' : 'Next';

        overlay.style.display = 'block';
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 50);
    }

    function endOnboarding() {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 400);
        localStorage.setItem('lucu_onboarding_seen', 'true');
    }

    nextBtn.addEventListener('click', () => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            currentStep++;
            showStep(currentStep);
        }, 300); // Wait for fade out
    });
}
