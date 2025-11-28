const questOverlayEl = document.getElementById('quest-menu-overlay');
const questCloseBtn = document.getElementById('quest-menu-close-btn');

function showQuestMenu() {
    Quests.render(); 
    questOverlayEl.classList.add('visible');
}

function hideQuestMenu() {
    questOverlayEl.classList.remove('visible');
}

const inventoryOverlayEl = document.getElementById('inventory-menu-overlay');
const inventoryCloseBtn = document.getElementById('inventory-menu-close-btn');

function showInventoryMenu() {
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
        btn.addEventListener('click', function() {
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
    shopOverlayEl.classList.add('visible');
    Shop.render();
}

function hideShopMenu() {
    shopOverlayEl.classList.remove('visible');
}

function initShopTabs() {
    const shopTabBtns = document.querySelectorAll('.shop-tab-btn');
    shopTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            shopTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            Shop.switchTab(tab);
        });
    });
}

