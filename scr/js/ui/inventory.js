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

        content.innerHTML = '';

        if (!activeTab || activeTab.dataset.tab === 'skins') {
            const divState = document.createElement('div');
            divState.className = 'inventory-empty-state';
            const divText = document.createElement('div');
            divText.className = 'inventory-empty-text';
            divText.textContent = i18n.t('empty_skins');
            divState.appendChild(divText);
            content.appendChild(divState);
            return;
        }

        const boostIds = Object.keys(this.boosts);
        if (boostIds.length === 0) {
            const divState = document.createElement('div');
            divState.className = 'inventory-empty-state';
            const divText = document.createElement('div');
            divText.className = 'inventory-empty-text';
            divText.textContent = i18n.t('empty_skins');
            divState.appendChild(divText);
            content.appendChild(divState);
            return;
        }


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

            const imgDiv = document.createElement('div');
            imgDiv.className = 'boost-image';
            imgDiv.innerHTML = this.getIconSVG(boost.icon);
            if (count > 1) {
                const countDiv = document.createElement('div');
                countDiv.className = 'boost-count';
                countDiv.textContent = count;
                imgDiv.appendChild(countDiv);
            }
            item.appendChild(imgDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'boost-info';

            const descDiv = document.createElement('div');
            descDiv.className = 'boost-description';
            descDiv.textContent = i18n.t(boost.name);
            infoDiv.appendChild(descDiv);

            const useBtn = document.createElement('button');
            useBtn.className = 'boost-use-btn';
            useBtn.textContent = 'Use';
            infoDiv.appendChild(useBtn);

            item.appendChild(infoDiv);


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

        API.call('/api/use-boost', { boostId: boostId })
            .then(resp => {
                if (!resp || resp.error) {
                    console.error('Use boost failed:', resp ? resp.error : 'no response');
                    return;
                }
                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }
                if (typeof Game !== 'undefined' && Game.useBoost) {
                    Game.useBoost(boostId, resp.duration || 30000);
                }
                this.loadFromServer(resp.inventory || {});
            })
            .catch(err => {
                console.error('Use boost API error:', err);
            });
    }
};
