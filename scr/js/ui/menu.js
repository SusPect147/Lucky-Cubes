const gameContentEl = document.getElementById('game-content');
const leaderboardScreenEl = document.getElementById('leaderboard-screen');
const profileScreenEl = document.getElementById('profile-screen');
const profileBalanceEl = document.getElementById('profile-balance');

function updateProfileBalance() {
    var coinEl = document.getElementById('coin-count');
    var minEl = document.getElementById('min-number');
    var profileMinEl = document.getElementById('profile-min-number');
    if (profileBalanceEl && coinEl) {
        profileBalanceEl.textContent = (coinEl.textContent || '0').trim() + ' $LUCU';
    }
    if (profileMinEl && minEl) {
        profileMinEl.textContent = (minEl.textContent || '0').trim();
    }
}

function updateLeaderboardYourScore() {
    var el = document.getElementById('leaderboard-your-score');
    var coinEl = document.getElementById('coin-count');
    var minEl = document.getElementById('min-number');
    if (!el) return;
    var activeBtn = document.querySelector('.leaderboard-filter-btn.active');
    var sort = activeBtn ? activeBtn.getAttribute('data-sort') : 'coins';
    if (sort === 'number' && minEl) {
        el.textContent = (minEl.textContent || '0').trim() + ' MIN';
    } else if (coinEl) {
        el.textContent = (coinEl.textContent || '0').trim().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' $LUCU';
    }
}

function showLeaderboardScreen() {
    if (!gameContentEl || !leaderboardScreenEl) return;
    hideProfileScreen();
    hideShopMenu();
    hideInventoryMenu();
    hideQuestMenu();
    updateLeaderboardYourScore();
    if (typeof Leaderboard !== 'undefined' && typeof Leaderboard.openLeaderboard === 'function') {
        Leaderboard.openLeaderboard();
    }
    gameContentEl.classList.add('leaderboard-open');
    var btn = document.getElementById('leaderboard-menu-btn');
    if (btn) btn.classList.add('active');
}

function hideLeaderboardScreen() {
    if (!gameContentEl) return;
    gameContentEl.classList.remove('leaderboard-open');
    var btn = document.getElementById('leaderboard-menu-btn');
    if (btn) btn.classList.remove('active');
}

function isLeaderboardOpen() {
    return gameContentEl && gameContentEl.classList.contains('leaderboard-open');
}

function toggleLeaderboardScreen() {
    if (isLeaderboardOpen()) {
        hideLeaderboardScreen();
    } else {
        showLeaderboardScreen();
    }
}

function showProfileScreen() {
    if (!gameContentEl || !profileScreenEl) return;
    updateProfileBalance();
    hideLeaderboardScreen();
    hideShopMenu();
    hideInventoryMenu();
    hideQuestMenu();
    gameContentEl.classList.add('profile-open');
    var btn = document.getElementById('profile-menu-btn');
    if (btn) btn.classList.add('active');
}

function hideProfileScreen() {
    if (!gameContentEl) return;
    gameContentEl.classList.remove('profile-open');
    var btn = document.getElementById('profile-menu-btn');
    if (btn) btn.classList.remove('active');
}

function isProfileOpen() {
    return gameContentEl && gameContentEl.classList.contains('profile-open');
}

function toggleProfileScreen() {
    if (isProfileOpen()) {
        hideProfileScreen();
    } else {
        showProfileScreen();
    }
}

function returnToGame() {
    hideLeaderboardScreen();
    hideProfileScreen();
}

const questOverlayEl = document.getElementById('quest-menu-overlay');
const questCloseBtn = document.getElementById('quest-menu-close-btn');

function showQuestMenu() {
    hideLeaderboardScreen();
    hideProfileScreen();
    Quests.render();
    questOverlayEl.classList.add('visible');
}

function hideQuestMenu() {
    questOverlayEl.classList.remove('visible');
}

const inventoryOverlayEl = document.getElementById('inventory-menu-overlay');
const inventoryCloseBtn = document.getElementById('inventory-menu-close-btn');

function showInventoryMenu() {
    hideLeaderboardScreen();
    hideProfileScreen();
    inventoryOverlayEl.classList.add('visible');
    if (typeof Inventory !== 'undefined') {
        Inventory.render();
    }
}

function hideInventoryMenu() {
    inventoryOverlayEl.classList.remove('visible');
}

function initInventoryTabs() {
    const inventoryTabBtns = document.querySelectorAll('.inventory-tab-btn');
    inventoryTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            inventoryTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            if (typeof Inventory !== 'undefined') {
                Inventory.render();
            }
        });
    });
}

const shopOverlayEl = document.getElementById('shop-menu-overlay');
const shopCloseBtn = document.getElementById('shop-menu-close-btn');

function showShopMenu() {
    hideLeaderboardScreen();
    hideProfileScreen();
    shopOverlayEl.classList.add('visible');
    Shop.render();
}

function hideShopMenu() {
    shopOverlayEl.classList.remove('visible');
}

function initShopTabs() {
    const shopTabBtns = document.querySelectorAll('.shop-tab-btn');
    shopTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            shopTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            Shop.switchTab(tab);
        });
    });
}

