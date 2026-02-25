const Inventory = {
    boosts: {},

    init: function () {
        this.render();
    },

    loadFromServer: function (inventoryData) {
        this.boosts = inventoryData || {};
        this.render();
    },

    addBoost: function (boostId) {
        const boost = Shop.boosts.find(b => b.id === boostId);
        if (!boost) return;
        if (!this.boosts[boostId]) {
            this.boosts[boostId] = 0;
        }
        this.boosts[boostId]++;
        this.render();
    },

    removeBoost: function (boostId) {
        if (this.boosts[boostId]) {
            this.boosts[boostId]--;
            if (this.boosts[boostId] <= 0) {
                delete this.boosts[boostId];
            }
        }
        this.render();
    },

    getIconSVG: function (iconType) {
        return Shop.getIconSVG(iconType);
    },

    render: function () {
        const content = document.getElementById('inventory-content');
        const activeTab = document.querySelector('.inventory-tab-btn.active');

        if (!activeTab || activeTab.dataset.tab === 'skins') {
            content.innerHTML = `
                <div class="inventory-empty-state">
                    <div class="inventory-empty-text">Oops, looks like there's nothing here</div>
                </div>
            `;
            return;
        }

        const boostIds = Object.keys(this.boosts);
        if (boostIds.length === 0) {
            content.innerHTML = `
                <div class="inventory-empty-state">
                    <div class="inventory-empty-text">Oops, looks like there's nothing here</div>
                </div>
            `;
            return;
        }

        content.innerHTML = '';
        const boostsList = document.createElement('div');
        boostsList.className = 'inventory-boosts-list';
        boostsList.style.display = 'grid';

        boostIds.forEach(boostId => {
            const boost = Shop.boosts.find(b => b.id === boostId);
            if (!boost) return;

            const count = this.boosts[boostId];

            const item = document.createElement('div');
            item.className = 'inventory-boost-item';
            item.dataset.boostId = boostId;

            const countDisplay = count > 1 ? `<div class="boost-count">${count}</div>` : '';

            item.innerHTML = `
                <div class="boost-image">
                    ${this.getIconSVG(boost.icon)}
                    ${countDisplay}
                </div>
                <div class="boost-info">
                    <div class="boost-description">${boost.name}</div>
                    <button class="boost-use-btn">Use</button>
                </div>
            `;

            const useBtn = item.querySelector('.boost-use-btn');
            useBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.useBoost(boostId);
            });

            boostsList.appendChild(item);
        });

        content.appendChild(boostsList);
    },

    useBoost: function (boostId) {
        if (!this.boosts[boostId] || this.boosts[boostId] <= 0) return;

        // Call server to use boost (signed via API module)
        API.call('/api/use-boost', { boostId: boostId })
            .then(resp => {
                if (!resp || resp.error) {
                    console.error('Use boost failed:', resp ? resp.error : 'no response');
                    return;
                }
                // Apply server state
                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }
                // Activate boost locally with SERVER-provided duration
                if (typeof Game !== 'undefined' && Game.useBoost) {
                    Game.useBoost(boostId, resp.duration || 30000);
                }
                // Update inventory from server
                this.loadFromServer(resp.inventory || {});
            })
            .catch(err => {
                console.error('Use boost API error:', err);
            });
    }
};
