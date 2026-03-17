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
            casesList.className = 'shop-cases-list';

            caseIds.forEach(caseId => {
                const caseDef = Shop.cases.find(c => c.id === caseId);
                if (!caseDef) return;

                const count = this.cases[caseId];

                const item = document.createElement('div');
                item.className = 'case-item';
                if (caseId === 'starter_case') item.classList.add('case-item-lucu');
                if (caseId === 'lucky_case') item.classList.add('case-item-stars');
                if (caseId === 'premium_case') item.classList.add('case-item-ton');
                item.dataset.caseId = caseId;
                item.style.position = 'relative';

                const imgDiv = document.createElement('div');
                imgDiv.className = 'case-image-container';
                imgDiv.style.width = '72px';
                imgDiv.style.height = '72px';
                imgDiv.style.minWidth = '72px';
                imgDiv.style.display = 'flex';
                imgDiv.style.alignItems = 'center';
                imgDiv.style.justifyContent = 'center';
                imgDiv.style.position = 'relative';

                if (caseDef.imageUrl) {
                    const img = document.createElement('img');
                    img.src = caseDef.imageUrl;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';
                    img.style.position = 'absolute';
                    img.style.top = '0';
                    img.style.left = '0';
                    imgDiv.appendChild(img);
                } else {
                    imgDiv.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;stroke:var(--text-tertiary);"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>';
                }

                if (count > 1) {
                    const countDiv = document.createElement('div');
                    countDiv.className = 'boost-count';
                    countDiv.style.zIndex = '10';
                    countDiv.textContent = count;
                    imgDiv.appendChild(countDiv);
                }
                item.appendChild(imgDiv);

                const infoDiv = document.createElement('div');
                infoDiv.className = 'case-info';
                infoDiv.style.flex = '1';

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
                    this.openCase(caseId, item);
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

    openCase: function (caseId, targetElement) {
        if (!this.cases[caseId] || this.cases[caseId] <= 0) return;

        const caseDef = Shop.cases.find(c => c.id === caseId);
        const caseName = caseDef ? (i18n.t(caseDef.name) || caseDef.name) : caseId;

        const confirmMsg = (i18n.t('confirm_open_case') || 'Are you sure you want to open {name}?')
            .replace('{name}', caseName);

        if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
            Squads.openCustomModal(confirmMsg, () => {
                this._executeOpenCase(caseId, targetElement);
            }, true);
        } else {
            this._executeOpenCase(caseId, targetElement);
        }
    },

    _executeOpenCase: function (caseId, targetElement) {
        if (!this.cases[caseId] || this.cases[caseId] <= 0) return;

        API.call('/api/open-case', { caseId: caseId })
            .then(resp => {
                if (!resp || resp.error) {
                    if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                        Squads.openCustomModal(resp ? resp.error : 'Failed to open case');
                    } else if (window.showToast) {
                        window.showToast(resp ? resp.error : 'Failed to open case', 'error');
                    }
                    return;
                }

                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }
                this.loadFromServer(resp);

                if (resp.reward) {
                    const typeStr = resp.reward.type === 'coins' ? '$LUCU' : (resp.reward.type === 'skin' ? 'Skin' : 'Case');
                    
                    this.showRoulette(resp.reward, caseId, () => {
                        const rewardMsg = `
                            <div style="text-align:center;">
                                <div style="font-size:2rem; margin-bottom:8px;">🎉</div>
                                <div style="font-size:1rem; font-weight:600; margin-bottom:12px;">${i18n.t('case_reward_title') || 'You unboxed:'}</div>
                                <div style="background:rgba(255,255,255,0.05); border-radius:12px; padding:14px 18px; display:inline-block;">
                                    <div style="font-size:1.8rem; font-weight:800; background:linear-gradient(135deg,#ffd54f,#ff9800); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                                        ${resp.reward.amount || resp.reward.id || ''}
                                    </div>
                                    <div style="font-size:0.8rem; color:rgba(255,255,255,0.5); margin-top:4px;">${typeStr}</div>
                                </div>
                            </div>
                        `;
                        if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                            Squads.openCustomModal(rewardMsg);
                        } else if (window.showToast) {
                            window.showToast(`Unboxed: ${resp.reward.amount || resp.reward.id} ${typeStr}!`, 'success');
                        }
                    });
                }
            })
            .catch(err => {
                console.error('Open case failed:', err);
            });
    },

    showRoulette: function(reward, caseId, callback) {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', background: 'rgba(5, 5, 8, 0.95)',
            zIndex: '9999', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        const title = document.createElement('div');
        title.innerHTML = `<h3>${i18n.t('opening_case') || 'Opening Case...'}</h3>`;
        title.style.color = '#fff';
        title.style.marginBottom = '40px';
        title.style.fontFamily = 'Inter, sans-serif';
        overlay.appendChild(title);

        const rouletteContainer = document.createElement('div');
        Object.assign(rouletteContainer.style, {
            width: '90%', maxWidth: '600px', height: '140px', background: '#1c1c20',
            border: '2px solid rgba(255,255,255,0.1)', borderRadius: '16px',
            position: 'relative', overflow: 'hidden', boxShadow: '0 0 30px rgba(0,0,0,0.5)'
        });

        const centerLine = document.createElement('div');
        Object.assign(centerLine.style, {
            position: 'absolute', top: '0', bottom: '0', left: '50%', width: '4px',
            background: '#ffca28', transform: 'translateX(-50%)', zIndex: '10',
            boxShadow: '0 0 10px #ffca28'
        });
        rouletteContainer.appendChild(centerLine);

        const track = document.createElement('div');
        Object.assign(track.style, {
            display: 'flex', height: '100%', alignItems: 'center',
            position: 'absolute', left: '0', top: '0',
            transition: 'transform 6.5s cubic-bezier(0.1, 0.85, 0.15, 1)'
        });
        
        const totalItems = 65;
        const winIndex = 55; 
        const itemWidth = 120;
        
        for (let i = 0; i < totalItems; i++) {
            const item = document.createElement('div');
            Object.assign(item.style, {
                width: `${itemWidth}px`, height: '100%', flexShrink: '0',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '10px', boxSizing: 'border-box'
            });

            let isWinner = (i === winIndex);
            let imgSrc = '';
            let text = '';
            
            if (isWinner) {
                if (reward.type === 'coins') {
                    imgSrc = 'assets/UI/images/lucu.webp';
                    text = reward.amount + ' $LUCU';
                } else if (reward.type === 'skin') {
                    const s = Shop.skins.find(sk => sk.id === reward.id);
                    if (s && s.imageUrl) {
                        imgSrc = s.imageUrl;
                    } else {
                        imgSrc = 'assets/UI/images/cubes_cubes.png'; 
                    }
                    text = s ? s.name : 'Skin';
                } else if (reward.type === 'case') {
                    const c = Shop.cases.find(cc => cc.id === reward.id);
                    if (c && c.imageUrl) imgSrc = c.imageUrl;
                    text = c ? c.name : 'Case';
                }
            } else {
                const rand = Math.random();
                if (rand < 0.6) {
                    imgSrc = 'assets/UI/images/lucu.webp';
                    text = Math.floor(Math.random() * 500 + 50) + ' $LUCU';
                } else if (rand < 0.8) {
                    imgSrc = 'assets/UI/images/cases/1-case.webp';
                    text = 'Case';
                } else {
                    imgSrc = 'assets/UI/images/cubes_cubes.png';
                    text = 'Skin';
                }
            }
            
            item.innerHTML = `
                <div style="width: 60px; height: 60px; display: flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <img src="${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;" />
                </div>
                <div style="font-size: 0.85rem; color:#fff; font-weight:bold; white-space:nowrap;">${text}</div>
            `;
            track.appendChild(item);
        }
        
        rouletteContainer.appendChild(track);
        overlay.appendChild(rouletteContainer);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        setTimeout(() => {
            const containerWidth = rouletteContainer.offsetWidth;
            const stopPos = (winIndex * itemWidth) + (itemWidth / 2) - (containerWidth / 2);
            const randOffset = (Math.random() - 0.5) * (itemWidth * 0.8);
            track.style.transform = `translateX(-${stopPos + randOffset}px)`;
        }, 100);

        setTimeout(() => {
            const flash = document.createElement('div');
            Object.assign(flash.style, {
                position: 'absolute', inset: '0', background: '#fff', opacity: '0.8',
                transition: 'opacity 0.5s ease', zIndex: '20', pointerEvents: 'none'
            });
            rouletteContainer.appendChild(flash);
            requestAnimationFrame(() => { flash.style.opacity = '0'; });

            setTimeout(() => {
                if (callback) callback();
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }, 1200);
        }, 6600);
    }
};
