function initGameEvents() {
    if (typeof Game !== 'undefined' && Game.rollCube) {
        const centerGif = document.querySelector('.center-gif');
        if (centerGif) {
            centerGif.addEventListener('click', function (e) {
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

document.getElementById('quest-menu-overlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('quest-menu-overlay')) {
        hideQuestMenu();
    }
});

document.getElementById('leaderboard-menu-btn').addEventListener('click', toggleLeaderboardScreen);
document.getElementById('profile-menu-btn').addEventListener('click', toggleProfileScreen);

function initLeaderboardFilters() {
    var list = document.getElementById('leaderboard-list');
    var btns = document.querySelectorAll('.leaderboard-filter-btn');
    if (!list || !btns.length) return;
    function formatCoins(n) {
        var s = String(Math.floor(Number(n)));
        return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    function formatNumber(n) {
        return Number(n).toFixed(5);
    }
    function updateValues(sort) {
        var isCoins = sort === 'coins';
        list.querySelectorAll('.leaderboard-value').forEach(function (el) {
            var raw = isCoins ? el.getAttribute('data-coins') : el.getAttribute('data-number');
            el.textContent = isCoins ? formatCoins(raw) : formatNumber(raw);
        });
    }
    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            btns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            updateValues(this.getAttribute('data-sort'));
            if (typeof updateLeaderboardYourScore === 'function') updateLeaderboardYourScore();
        });
    });
    updateValues(document.querySelector('.leaderboard-filter-btn.active').getAttribute('data-sort'));
}
initLeaderboardFilters();
document.getElementById('game-return-btn').addEventListener('click', returnToGame);
document.getElementById('shop-menu-btn').addEventListener('click', showShopMenu);
document.getElementById('shop-menu-close-btn').addEventListener('click', hideShopMenu);

document.getElementById('shop-menu-overlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('shop-menu-overlay')) {
        hideShopMenu();
    }
});

document.getElementById('inventory-menu-btn').addEventListener('click', showInventoryMenu);
document.getElementById('inventory-menu-close-btn').addEventListener('click', hideInventoryMenu);

document.getElementById('inventory-menu-overlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('inventory-menu-overlay')) {
        hideInventoryMenu();
    }
});

initShopTabs();
initInventoryTabs();

var profileCopyBtn = document.querySelector('#profile-screen .leaderboard-btn-copy');
var profileInviteBtn = document.querySelector('#profile-screen .leaderboard-btn-invite');

function encodeReferralId(userId) {
    try {
        var idNum = BigInt(userId);
        var salt = 4859062394851239n;
        return (idNum ^ salt).toString(36);
    } catch (e) {
        return userId;
    }
}

function getReferralLink() {
    var botUsername = (typeof CONFIG !== 'undefined' && CONFIG.BOT_USERNAME) ? CONFIG.BOT_USERNAME : 'LuckyCubesBot';
    var myId = Leaderboard && Leaderboard.myId ? Leaderboard.myId : '0';
    var encodedId = encodeReferralId(myId);
    return `https://t.me/${botUsername}/app?startapp=ref_${encodedId}`;
}

if (profileCopyBtn) {
    profileCopyBtn.addEventListener('click', function () {
        var url = getReferralLink();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
                if (typeof window.showToast === 'function') window.showToast('Referral link copied!');
            }).catch(function () { fallbackCopy(url); });
        } else {
            fallbackCopy(url);
        }
    });
}
if (profileInviteBtn) {
    profileInviteBtn.addEventListener('click', function () {
        var url = getReferralLink();
        var text = 'Join me in Lucky Cubes and start rolling for $LUCU!';
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        } else {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        }
    });
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        if (typeof window.showToast === 'function') window.showToast('Referral link copied!');
    } catch (e) { }
    document.body.removeChild(ta);
}

function initBoostTimerButton() {
    const button = document.getElementById('boost-timer-button');
    const panel = document.getElementById('boost-timers-panel');

    if (button && typeof Game !== 'undefined' && Game.toggleBoostPanel) {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            Game.toggleBoostPanel();
        });

        document.addEventListener('click', function (e) {
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

