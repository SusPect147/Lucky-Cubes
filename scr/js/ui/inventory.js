const Inventory = {
    boosts: {},
    cases: {},

    init: function () {
        this.render();
    },

    loadFromServer: function (serverState) {
        if (!serverState) return;
        this.boosts = serverState.inventory || {};
        this.cases = serverState.cases || {};
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

        if (activeTab.dataset.tab === 'cases') {
            const caseIds = Object.keys(this.cases);
            if (caseIds.length === 0) {
                const divState = document.createElement('div');
                divState.className = 'inventory-empty-state';
                const divText = document.createElement('div');
                divText.className = 'inventory-empty-text';
                divText.textContent = i18n.t('empty_cases');
                divState.appendChild(divText);
                content.appendChild(divState);
                return;
            }

            const casesList = document.createElement('div');
            casesList.className = 'inventory-cases-list';
            casesList.style.display = 'grid';

            caseIds.forEach(caseId => {
                const caseDef = Shop.cases.find(c => c.id === caseId);
                if (!caseDef) return;

                const count = this.cases[caseId];

                const item = document.createElement('div');
                item.className = 'inventory-case-item';
                item.dataset.caseId = caseId;
                item.style.position = 'relative';

                const imgDiv = document.createElement('div');
                imgDiv.className = 'case-image';
                if (caseDef.imageUrl) {
                    const img = document.createElement('img');
                    img.src = caseDef.imageUrl;
                    imgDiv.appendChild(img);
                } else {
                    imgDiv.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>';
                }

                if (count > 1) {
                    const countDiv = document.createElement('div');
                    countDiv.className = 'boost-count';
                    countDiv.textContent = count;
                    imgDiv.appendChild(countDiv);
                }
                item.appendChild(imgDiv);

                const infoDiv = document.createElement('div');
                infoDiv.className = 'case-info';

                const nameDiv = document.createElement('div');
                nameDiv.className = 'case-name';
                nameDiv.textContent = i18n.t(caseDef.name);
                infoDiv.appendChild(nameDiv);

                const useBtn = document.createElement('button');
                useBtn.className = 'boost-use-btn case-use-btn';
                useBtn.textContent = 'Open';
                infoDiv.appendChild(useBtn);

                item.appendChild(infoDiv);

                useBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openCase(caseId);
                });

                casesList.appendChild(item);
            });

            content.appendChild(casesList);
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
                this.loadFromServer(resp);
            })
            .catch(err => {
                console.error('Use boost API error:', err);
            });
    },

    openCase: function (caseId) {
        if (!this.cases[caseId] || this.cases[caseId] <= 0) return;

        API.call('/api/open-case', { caseId: caseId })
            .then(resp => {
                if (!resp || resp.error) {
                    alert(resp ? resp.error : 'Failed to open case');
                    return;
                }

                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }
                this.loadFromServer(resp);

                if (resp.reward) {
                    const typeStr = resp.reward.type === 'coins' ? '$LUCU' : resp.reward.type;
                    alert(`Unboxed: ${resp.reward.amount} ${typeStr}!`);
                }
            })
            .catch(err => {
                console.error('Open case failed:', err);
            });
    }
};
