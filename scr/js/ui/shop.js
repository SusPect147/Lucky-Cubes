const Shop = {
    boosts: [
        {
            id: 'extra_cube',
            name: 'Extra Cube Boost',
            description: 'Get an extra cube for 30-100 seconds',
            price: 12,
            icon: 'dice'
        },
        {
            id: 'double_cube',
            name: '+2 Cubes Boost',
            description: 'Get +2 cubes for 30-100 seconds',
            price: 20,
            icon: 'dice'
        },
        {
            id: 'rainbow_mode',
            name: 'Rainbow Mode Boost',
            description: 'Activate Rainbow Mode for 30-100 seconds',
            price: 28,
            icon: 'star'
        },
        {
            id: 'coin_surge',
            name: 'Coin Surge',
            description: 'Multiply coins earned for 2-6 minutes',
            price: 18,
            icon: 'coin'
        },
        {
            id: 'crit_roll',
            name: 'Crit Roll',
            description: 'Rare critical rolls give 3-10x XP and coins (2-6 min)',
            price: 25,
            icon: 'crit'
        },
        {
            id: 'auto_roll',
            name: 'AutoRoll',
            description: 'Automatic rolls every second for 1-5 minutes',
            price: 15,
            icon: 'auto'
        },
        {
            id: 'lucky_streak',
            name: 'Lucky Streak',
            description: 'Progressive bonuses for consecutive rolls (3-8 min)',
            price: 40,
            icon: 'streak'
        },
        {
            id: 'time_freeze',
            name: 'Time Freeze',
            description: 'Quest timers slow down or stop (2-5 min)',
            price: 30,
            icon: 'freeze'
        },
        {
            id: 'hypertap',
            name: 'HyperTap',
            description: 'Faster cube response for 5-15 seconds',
            price: 5,
            icon: 'tap'
        }
    ],

    cases: [
        {
            id: 'starter_case',
            name: 'Starter Case',
            price: 50,
            currency: 'lucu',
            imageUrl: 'assets/UI/images/cases/1-case.webp',
            drops: { min: 30, max: 250, type: '$LUCU' }
        },
        {
            id: 'lucky_case',
            name: 'Lucky Case',
            price: 20,
            currency: 'stars',
            imageUrl: 'assets/UI/images/cases/2-case.webp',
            drops: { min: 200, max: 800, type: '$LUCU' }
        },
        {
            id: 'premium_case',
            name: 'Premium Case',
            price: 0.6,
            currency: 'ton',
            imageUrl: 'assets/UI/images/cases/3-case.webp',
            drops: { min: 800, max: 4000, type: '$LUCU' }
        }
    ],

    skins: [
        {
            id: 'default',
            name: 'Classic',
            bonus: 'None',
            price: 0,
            currency: 'lucu',
            folder: 'classic_skins'
        },
        {
            id: 'gold_skin',
            name: 'Negative Glow',
            bonus: '+15% Coins',
            price: 2500,
            currency: 'lucu',
            folder: 'negative_skins'
        },
        {
            id: 'lucky_skin',
            name: 'Scary Shadow',
            bonus: 'Extra Luck (Min reductions)',
            price: 4000,
            currency: 'lucu',
            folder: 'scary_skins'
        },
        {
            id: 'rainbow_skin',
            name: 'Scratch Master',
            bonus: 'Chance for Random Rainbow Roll',
            price: 500,
            currency: 'stars',
            folder: 'scratch_skins'
        },
        {
            id: 'ton_skin',
            name: 'Toxic Waste',
            bonus: 'Permanent Min Reduction (-10%)',
            price: 2,
            currency: 'ton',
            folder: 'toxic_skins'
        },
        {
            id: 'woman_skin',
            name: 'Mysterious Lady',
            bonus: 'Mysterious Aura',
            price: 5000,
            currency: 'lucu',
            folder: 'woman_skins'
        }
    ],

    getIconSVG: function (iconType) {
        if (iconType === 'dice') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>';
        if (iconType === 'star') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        if (iconType === 'coin') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>';
        if (iconType === 'crit') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/><path d="M12 8v4M12 16h.01"/></svg>';
        if (iconType === 'auto') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        if (iconType === 'streak') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
        if (iconType === 'freeze') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M8 12h8"/></svg>';
        if (iconType === 'tap') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.86 18.14A2 2 0 0 0 3.71 21h16.58a2 2 0 0 0 1.85-2.86L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>';
    },

    switchTab: function (tab) {
        const skinsEmpty = document.getElementById('shop-skins-empty');
        const boostsList = document.getElementById('shop-boosts-list');
        const casesList = document.getElementById('shop-cases-list');
        const skinsList = document.getElementById('shop-skins-list');

        if (tab === 'skins') {
            if (skinsEmpty) skinsEmpty.style.display = 'none';
            if (boostsList) boostsList.style.display = 'none';
            if (casesList) casesList.style.display = 'none';
            
            if (skinsList) {
                skinsList.style.display = 'flex';
            }
            this.renderSkins();
        } else if (tab === 'boosts') {
            if (skinsEmpty) skinsEmpty.style.display = 'none';
            if (skinsList) skinsList.style.display = 'none';
            if (boostsList) {
                boostsList.style.display = 'grid';
                this.renderBoosts();
            }
            if (casesList) casesList.style.display = 'none';
        } else if (tab === 'cases') {
            if (skinsEmpty) skinsEmpty.style.display = 'none';
            if (skinsList) skinsList.style.display = 'none';
            if (boostsList) boostsList.style.display = 'none';
            if (casesList) {
                casesList.style.display = 'flex';
                this.renderCases();
            }
        }
    },

    renderBoosts: function () {
        const boostsList = document.getElementById('shop-boosts-list');
        if (!boostsList) {
            console.error('shop-boosts-list not found');
            return;
        }
        boostsList.innerHTML = '';
        boostsList.style.display = 'grid';

        this.boosts.forEach(boost => {
            const item = document.createElement('div');
            item.className = 'boost-item';
            item.dataset.id = boost.id;

            let currentCoins = 0;
            if (typeof Game !== 'undefined' && Game.getCoinCount) {
                currentCoins = Game.getCoinCount();
            }
            const canAfford = currentCoins >= boost.price;
            const priceColor = canAfford ? '#00c88c' : '#dc3545';

            const imgDiv = document.createElement('div');
            imgDiv.className = 'boost-image';
            imgDiv.innerHTML = this.getIconSVG(boost.icon);
            item.appendChild(imgDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'boost-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'boost-name';
            nameDiv.textContent = i18n.t(boost.name);
            infoDiv.appendChild(nameDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'boost-description';
            descDiv.textContent = i18n.t(boost.description);
            infoDiv.appendChild(descDiv);

            const priceDiv = document.createElement('div');
            priceDiv.className = 'boost-price';
            priceDiv.style.color = priceColor;

            const coinIcon = document.createElement('span');
            coinIcon.className = 'boost-price-icon';
            coinIcon.textContent = '$LUCU';
            priceDiv.appendChild(coinIcon);

            const priceSpan = document.createElement('span');
            priceSpan.textContent = format(boost.price);
            priceDiv.appendChild(priceSpan);

            infoDiv.appendChild(priceDiv);
            item.appendChild(infoDiv);

            item.addEventListener('click', () => {
                this.buyBoost(boost.id);
            });

            boostsList.appendChild(item);
        });
    },

    buyBoost: function (boostId) {
        const boost = this.boosts.find(b => b.id === boostId);
        if (!boost) return;

        if (typeof Game === 'undefined' || !Game.getCoinCount) {
            console.error('Game not initialized');
            return;
        }

        const currentCoins = Game.getCoinCount();
        if (currentCoins < boost.price) {
            if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                Squads.openCustomModal(i18n.t('not_enough_coins') || 'Not enough coins!');
            } else if (window.showToast) {
                window.showToast('Not enough coins!', 'error');
            }
            return;
        }

        const item = document.querySelector(`.boost-item[data-id="${boostId}"]`);
        if (!item) return;

        API.call('/api/buy-boost', { boostId: boostId })
            .then(resp => {
                if (!resp || resp.error) {
                    if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                        Squads.openCustomModal(resp ? resp.error : 'Request failed');
                    } else if (window.showToast) {
                        window.showToast(resp ? resp.error : 'Request failed', 'error');
                    }
                    return;
                }

                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }

                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                for (let i = 0; i < 30; i++) {
                    const p = document.createElement('div');
                    p.style.position = 'fixed';
                    p.style.left = `${centerX + (Math.random() - 0.5) * rect.width * 0.4}px`;
                    p.style.top = `${centerY + (Math.random() - 0.5) * rect.height * 0.4}px`;
                    p.style.width = '5px';
                    p.style.height = '5px';
                    p.style.borderRadius = '50%';
                    p.style.background = '#dc3545';
                    p.style.zIndex = '100';
                    p.style.transition = 'all 0.8s ease-out';
                    p.style.opacity = '1';
                    document.body.appendChild(p);
                    setTimeout(() => {
                        p.style.transform = `translate(${(Math.random() - 0.5) * 150}px, ${(Math.random() - 0.5) * 150}px) scale(0)`;
                        p.style.opacity = '0';
                    }, 50);
                    setTimeout(() => p.remove(), 1000);
                }

                this.renderBoosts();
                setTimeout(() => {
                    if (typeof Inventory !== 'undefined') {
                        Inventory.loadFromServer(resp);
                    }
                }, 500);
            })
            .catch(err => {
                console.error('Buy boost failed:', err);
            });
    },

    showCaseInfo: function (caseItem) {
        if (!caseItem || !caseItem.drops) return;
        const dropInfo = caseItem.drops;
        const title = i18n.t(caseItem.name) || caseItem.name;
        const message = `
            <div style="text-align:center;">
                <div style="font-size:1.1rem; font-weight:700; margin-bottom:12px;">${title}</div>
                <div style="font-size:0.85rem; color:rgba(255,255,255,0.6); margin-bottom:16px;">
                    ${i18n.t('case_drop_info') || 'Possible drops:'}
                </div>
                <div style="background:rgba(255,255,255,0.05); border-radius:12px; padding:14px 18px; display:inline-block;">
                    <div style="font-size:1.5rem; font-weight:800; background:linear-gradient(135deg,#ffd54f,#ff9800); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                        ${dropInfo.min} — ${dropInfo.max}
                    </div>
                    <div style="font-size:0.8rem; color:rgba(255,255,255,0.5); margin-top:4px;">${dropInfo.type}</div>
                </div>
            </div>
        `;
        if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
            Squads.openCustomModal(message);
        }
    },

    buyCase: function (caseId) {
        const caseItem = this.cases.find(c => c.id === caseId);
        if (!caseItem) return;

        // Build confirmation message
        let priceStr = '';
        if (caseItem.currency === 'lucu') priceStr = caseItem.price + ' $LUCU';
        else if (caseItem.currency === 'stars') priceStr = '⭐ ' + caseItem.price + ' Stars';
        else if (caseItem.currency === 'ton') priceStr = caseItem.price + ' TON';

        const caseName = i18n.t(caseItem.name) || caseItem.name;
        const confirmMsg = (i18n.t('confirm_buy_case') || 'Are you sure you want to buy {name} for {price}?')
            .replace('{name}', caseName)
            .replace('{price}', priceStr);

        if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
            Squads.openCustomModal(confirmMsg, () => {
                this._executeBuyCase(caseId);
            }, true);
        } else {
            this._executeBuyCase(caseId);
        }
    },

    _executeBuyCase: function (caseId) {
        const caseItem = this.cases.find(c => c.id === caseId);
        if (!caseItem) return;

        const processResponse = (resp, targetElement) => {
            if (!resp || resp.error) {
                if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                    Squads.openCustomModal(resp ? resp.error : 'Request failed');
                } else if (window.showToast) {
                    window.showToast(resp ? resp.error : 'Request failed', 'error');
                }
                return;
            }

            if (resp.invoiceUrl) {
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openInvoice) {
                    window.Telegram.WebApp.openInvoice(resp.invoiceUrl, function (status) {
                        if (status === 'paid') {
                            if (window.showToast) window.showToast('Success! Case purchased.', 'success');

                            if (typeof Inventory !== 'undefined') {
                                Inventory.cases[caseId] = (Inventory.cases[caseId] || 0) + 1;
                                Inventory.render();
                            }

                            setTimeout(() => {
                                if (window.API && window.API.call) {
                                    window.API.call('/api/state', null).then(st => {
                                        if (st && window.Game && window.Game.applyServerState) {
                                            window.Game.applyServerState(st);
                                            if (typeof Inventory !== 'undefined') Inventory.loadFromServer(st);
                                        }
                                    }).catch(() => { });
                                }
                            }, 2000);
                        }
                    });
                } else {
                    window.open(resp.invoiceUrl, '_blank');
                }
                return;
            }

            if (typeof Game !== 'undefined' && Game.applyServerState) {
                Game.applyServerState(resp);
                if (typeof Inventory !== 'undefined') Inventory.loadFromServer(resp);
            }

            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                for (let i = 0; i < 30; i++) {
                    const p = document.createElement('div');
                    p.style.position = 'fixed';
                    p.style.left = `${centerX + (Math.random() - 0.5) * rect.width * 0.4}px`;
                    p.style.top = `${centerY + (Math.random() - 0.5) * rect.height * 0.4}px`;
                    p.style.width = '6px';
                    p.style.height = '6px';
                    p.style.borderRadius = '50%';
                    let pColor = '#ffffff';
                    if (caseId === 'starter_case') pColor = '#dc3545';
                    if (caseId === 'lucky_case') pColor = '#ffd54f';
                    if (caseId === 'premium_case') pColor = '#4fc3f7';
                    p.style.background = pColor;
                    p.style.zIndex = '100';
                    p.style.transition = 'all 0.8s ease-out';
                    p.style.opacity = '1';
                    document.body.appendChild(p);
                    setTimeout(() => {
                        p.style.transform = `translate(${(Math.random() - 0.5) * 150}px, ${(Math.random() - 0.5) * 150}px) scale(0)`;
                        p.style.opacity = '0';
                    }, 50);
                    setTimeout(() => p.remove(), 1000);
                }
            }
        };

        const targetCard = document.querySelector(`.case-item[data-id="${caseId}"]`);

        if (caseItem.currency === 'ton') {
            if (typeof window.buyTonCase === 'function') {
                window.buyTonCase(caseItem.price, caseId)
                    .then(resp => processResponse(resp, targetCard))
                    .catch(e => console.error('Buy ton case failed:', e));
            } else {
                if (window.showToast) window.showToast('Wallet integration not ready', 'error');
            }
        } else {
            if (caseItem.currency === 'lucu' && typeof Game !== 'undefined' && Game.getCoinCount() < caseItem.price) {
                if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                    Squads.openCustomModal(i18n.t('not_enough_coins') || 'Not enough coins!');
                } else if (window.showToast) {
                    window.showToast('Not enough coins!', 'error');
                }
                return;
            }
            API.call('/api/buy-case', { caseId: caseId })
                .then(resp => processResponse(resp, targetCard))
                .catch(err => {
                    console.error('Buy case failed:', err);
                });
        }
    },

    render: function () {
        const activeTab = document.querySelector('.shop-tab-btn.active');
        if (activeTab) {
            this.switchTab(activeTab.dataset.tab);
        }
    },

    renderCases: function () {
        const casesList = document.getElementById('shop-cases-list');
        if (!casesList) return;
        casesList.innerHTML = '';

        this.cases.forEach(caseItem => {
            const card = document.createElement('div');
            card.className = 'case-item';
            if (caseItem.id === 'starter_case') card.classList.add('case-item-lucu');
            if (caseItem.id === 'lucky_case') card.classList.add('case-item-stars');
            if (caseItem.id === 'premium_case') card.classList.add('case-item-ton');
            card.dataset.id = caseItem.id;

            const imgDiv = document.createElement('div');
            imgDiv.className = 'case-image-container';
            imgDiv.style.width = '72px';
            imgDiv.style.height = '72px';
            imgDiv.style.minWidth = '72px';
            imgDiv.style.display = 'flex';
            imgDiv.style.alignItems = 'center';
            imgDiv.style.justifyContent = 'center';
            imgDiv.style.position = 'relative';
            imgDiv.style.background = 'transparent';

            if (caseItem.imageUrl) {
                const img = document.createElement('img');
                img.src = caseItem.imageUrl;
                img.alt = caseItem.name;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';
                img.style.background = 'transparent';
                imgDiv.appendChild(img);
            } else {
                imgDiv.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;stroke:var(--text-tertiary);"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>';
            }
            card.appendChild(imgDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'case-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'case-name';
            nameDiv.textContent = i18n.t(caseItem.name);
            infoDiv.appendChild(nameDiv);

            const priceDiv = document.createElement('div');
            priceDiv.className = 'case-prices';
            let priceTag = '';
            if (caseItem.currency === 'lucu') {
                priceTag = `<span class="case-price-tag case-price-lucu">${caseItem.price} $LUCU</span>`;
            } else if (caseItem.currency === 'stars') {
                priceTag = `<span class="case-price-tag case-price-stars">⭐ ${caseItem.price} Stars</span>`;
            } else if (caseItem.currency === 'ton') {
                priceTag = `<span class="case-price-tag case-price-ton">${caseItem.price} TON</span>`;
            }
            priceDiv.innerHTML = priceTag;
            infoDiv.appendChild(priceDiv);

            card.appendChild(infoDiv);

            // "?" Info button on the right
            const infoBtn = document.createElement('button');
            infoBtn.className = 'case-info-btn';
            infoBtn.textContent = '?';
            infoBtn.title = i18n.t('case_drop_info') || 'Drop info';
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showCaseInfo(caseItem);
            });
            card.appendChild(infoBtn);

            card.addEventListener('click', () => {
                this.buyCase(caseItem.id);
            });

            casesList.appendChild(card);
        });
    },

    renderSkins: function () {
        let skinsList = document.getElementById('shop-skins-list');
        if (!skinsList) {
            const content = document.querySelector('.shop-content');
            if (!content) return;
            skinsList = document.createElement('div');
            skinsList.id = 'shop-skins-list';
            skinsList.className = 'shop-cases-list'; // Reuse case list layout
            content.appendChild(skinsList);
        }
        
        skinsList.innerHTML = '';
        skinsList.style.display = 'flex';

        this.skins.forEach(skin => {
            const card = document.createElement('div');
            card.className = 'skin-item';
            card.dataset.id = skin.id;

            const imgDiv = document.createElement('div');
            imgDiv.className = 'skin-image-container';
            imgDiv.style.width = '100px';
            imgDiv.style.height = '100px';
            imgDiv.style.margin = '0 auto';
            imgDiv.style.display = 'flex';
            imgDiv.style.justifyContent = 'center';
            imgDiv.style.alignItems = 'center';

            if (skin.folder) {
                const animContainer = document.createElement('div');
                animContainer.className = 'lottie-cube';
                animContainer.style.width = '100px';
                animContainer.style.height = '100px';
                imgDiv.appendChild(animContainer);
                
                const tgsPath = CONFIG.assetsPath + skin.folder + '/first-cubic.tgs';
                if (typeof loadTGS !== 'undefined') {
                    loadTGS(tgsPath).then(data => {
                        if (data && animContainer.parentNode) {
                            lottie.loadAnimation({
                                container: animContainer,
                                renderer: 'canvas',
                                loop: true,
                                autoplay: true,
                                animationData: data
                            });
                        }
                    });
                }
            } else if (skin.imageUrl) {
                const img = document.createElement('img');
                img.src = skin.imageUrl;
                img.alt = skin.name;
                img.style.objectFit = 'contain';
                img.style.width = '100%';
                img.style.height = '100%';
                imgDiv.appendChild(img);
            }
            card.appendChild(imgDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'skin-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'skin-name';
            nameDiv.textContent = i18n.t(skin.name) || skin.name;
            infoDiv.appendChild(nameDiv);

            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'skin-bonus';
            bonusDiv.textContent = skin.bonus;
            infoDiv.appendChild(bonusDiv);

            const isOwned = (typeof Inventory !== 'undefined' && Inventory.ownedSkins && Inventory.ownedSkins.includes(skin.id));
            const isEquipped = (typeof Inventory !== 'undefined' && Inventory.equippedSkin === skin.id);

            const priceDiv = document.createElement('div');
            priceDiv.className = 'skin-prices';
            
            if (isEquipped) {
                priceDiv.innerHTML = `<button class="skin-btn skin-equipped-btn">Equipped</button>`;
            } else if (isOwned) {
                priceDiv.innerHTML = `<button class="skin-btn skin-equip-btn" onclick="Shop.equipSkin('${skin.id}', event)">Equip</button>`;
            } else {
                let priceText = '';
                if (skin.currency === 'lucu') priceText = `${skin.price} $LUCU`;
                else if (skin.currency === 'stars') priceText = `⭐ ${skin.price} Stars`;
                else if (skin.currency === 'ton') priceText = `${skin.price} TON`;
                
                priceDiv.innerHTML = `<button class="skin-btn skin-buy-btn" onclick="Shop.buySkin('${skin.id}', event)">${priceText}</button>`;
            }
            infoDiv.appendChild(priceDiv);
            card.appendChild(infoDiv);
            skinsList.appendChild(card);
        });
    },

    buySkin: function (skinId, event) {
        if (event) event.stopPropagation();
        
        const skinItem = this.skins.find(s => s.id === skinId);
        if (!skinItem) return;

        let priceStr = '';
        if (skinItem.currency === 'lucu') priceStr = skinItem.price + ' $LUCU';
        else if (skinItem.currency === 'stars') priceStr = '⭐ ' + skinItem.price + ' Stars';
        else if (skinItem.currency === 'ton') priceStr = skinItem.price + ' TON';

        const confirmMsg = (i18n.t('confirm_buy_skin') || 'Are you sure you want to buy {name} for {price}?')
            .replace('{name}', skinItem.name)
            .replace('{price}', priceStr);

        if (skinItem.currency === 'lucu' && typeof Game !== 'undefined' && Game.getCoinCount() < skinItem.price) {
            if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
                Squads.openCustomModal(i18n.t('not_enough_coins') || 'Not enough coins!');
            } else if (window.showToast) {
                window.showToast('Not enough coins!', 'error');
            }
            return;
        }

        if (typeof Squads !== 'undefined' && Squads.openCustomModal) {
            Squads.openCustomModal(confirmMsg, () => {
                this._executeBuySkin(skinId);
            }, true);
        } else {
            this._executeBuySkin(skinId);
        }
    },

    _executeBuySkin: function (skinId) {
        const skinItem = this.skins.find(s => s.id === skinId);
        if (!skinItem) return;

        const processResponse = (resp) => {
            if (!resp || resp.error) {
                if (typeof window.showToast !== 'undefined') {
                    window.showToast(resp ? resp.error : 'Request failed', 'error');
                }
                return;
            }

            if (resp.invoiceUrl) {
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openInvoice) {
                    window.Telegram.WebApp.openInvoice(resp.invoiceUrl, function (status) {
                        if (status === 'paid') {
                            if (window.showToast) window.showToast('Success! Skin purchased.', 'success');
                            setTimeout(() => {
                                if (window.API && window.API.call) {
                                    window.API.call('/api/state', null).then(st => {
                                        if (st && window.Game && window.Game.applyServerState) {
                                            window.Game.applyServerState(st);
                                            if (typeof Inventory !== 'undefined') Inventory.loadFromServer(st);
                                            Shop.renderSkins();
                                        }
                                    }).catch(() => { });
                                }
                            }, 2000);
                        }
                    });
                }
                return;
            }

            if (typeof Game !== 'undefined' && Game.applyServerState) {
                Game.applyServerState(resp);
            }
            if (typeof Inventory !== 'undefined') {
                if (!Inventory.ownedSkins) Inventory.ownedSkins = [];
                if (!Inventory.ownedSkins.includes(skinId)) Inventory.ownedSkins.push(skinId);
                Inventory.equippedSkin = skinId;
                Inventory.render();
            }
            this.renderSkins();
        };

        if (skinItem.currency === 'ton') {
            if (typeof window.showToast !== 'undefined') {
                 window.showToast('TON wallet not implemented', 'error');
            }
        } else {
            API.call('/api/buy-skin', { skinId: skinId })
                .then(resp => processResponse(resp))
                .catch(err => {
                    console.error('Buy skin failed:', err);
                });
        }
    },

    equipSkin: function (skinId, event) {
        if (event) event.stopPropagation();
        
        API.call('/api/equip-skin', { skinId: skinId })
            .then(resp => {
                if (!resp || resp.error) {
                    if (typeof window.showToast !== 'undefined') {
                        window.showToast(resp ? resp.error : 'Request failed', 'error');
                    }
                    return;
                }
                
                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }
                if (typeof Inventory !== 'undefined') {
                    Inventory.equippedSkin = skinId;
                }
                this.renderSkins();
                if (typeof window.showToast !== 'undefined') {
                    window.showToast('Skin equipped!', 'success');
                }
            })
            .catch(err => console.error('Equip skin failed', err));
    }
};
