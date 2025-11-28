function initGameEvents() {
    if (typeof Game !== 'undefined' && Game.rollCube) {
        const centerGif = document.querySelector('.center-gif');
        if (centerGif) {
            centerGif.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof Game !== 'undefined' && Game.rollCube) {
                    try {
                        Game.rollCube();
                    } catch (error) {
                        console.error('Error in rollCube:', error);
                        if (typeof Game !== 'undefined' && Game.resetRollingState) {
                            Game.resetRollingState();
                        }
                    }
                }
            });
        }
    } else {
        setTimeout(initGameEvents, 50);
    }
}
initGameEvents();
document.getElementById('top-menu').addEventListener('click', showQuestMenu);
document.getElementById('quest-menu-close-btn').addEventListener('click', hideQuestMenu);

document.getElementById('quest-menu-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('quest-menu-overlay')) {
        hideQuestMenu();
    }
});

document.getElementById('shop-menu-btn').addEventListener('click', showShopMenu);
document.getElementById('shop-menu-close-btn').addEventListener('click', hideShopMenu);

document.getElementById('shop-menu-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('shop-menu-overlay')) {
        hideShopMenu();
    }
});

document.getElementById('inventory-menu-btn').addEventListener('click', showInventoryMenu);
document.getElementById('inventory-menu-close-btn').addEventListener('click', hideInventoryMenu);

document.getElementById('inventory-menu-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('inventory-menu-overlay')) {
        hideInventoryMenu();
    }
});

initShopTabs();
initInventoryTabs();

function initCheatsMenu() {
    if (window.innerWidth >= 1100) {
        if (typeof Cheats !== 'undefined' && !Cheats.initialized) {
            try {
                Cheats.init();
                Cheats.initialized = true;
            } catch (e) {
                console.error('Error initializing cheats:', e);
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initCheatsMenu, 100);
    });
} else {
    setTimeout(initCheatsMenu, 100);
}

window.addEventListener('resize', initCheatsMenu);

function initBoostTimerButton() {
    const button = document.getElementById('boost-timer-button');
    const panel = document.getElementById('boost-timers-panel');
    
    if (button && typeof Game !== 'undefined' && Game.toggleBoostPanel) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            Game.toggleBoostPanel();
        });
        
        document.addEventListener('click', function(e) {
            if (panel && panel.classList.contains('visible')) {
                if (!panel.contains(e.target) && !button.contains(e.target)) {
                    panel.classList.remove('visible');
                    button.classList.remove('active');
                }
            }
        });
    } else if (button) {
        setTimeout(initBoostTimerButton, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBoostTimerButton);
} else {
    setTimeout(initBoostTimerButton, 100);
}

