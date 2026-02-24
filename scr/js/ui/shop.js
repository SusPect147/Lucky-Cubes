const Shop = {
    boosts: [
        {
            id: 'extra_cube',
            name: 'Extra Cube Boost',
            description: 'Get an extra cube for 30-100 seconds',
            price: 35,
            icon: 'dice'
        },
        {
            id: 'double_cube',
            name: '+2 Cubes Boost',
            description: 'Get +2 cubes for 30-100 seconds',
            price: 55,
            icon: 'dice'
        },
        {
            id: 'rainbow_mode',
            name: 'Rainbow Mode Boost',
            description: 'Activate Rainbow Mode for 30-100 seconds',
            price: 40,
            icon: 'star'
        },
        {
            id: 'coin_surge',
            name: 'Coin Surge',
            description: 'Multiply coins earned for 2-6 minutes',
            price: 80,
            icon: 'coin'
        },
        {
            id: 'crit_roll',
            name: 'Crit Roll',
            description: 'Rare critical rolls give 3-10x XP and coins (2-6 min)',
            price: 120,
            icon: 'crit'
        },
        {
            id: 'auto_roll',
            name: 'AutoRoll',
            description: 'Automatic rolls every second for 1-5 minutes',
            price: 60,
            icon: 'auto'
        },
        {
            id: 'lucky_streak',
            name: 'Lucky Streak',
            description: 'Progressive bonuses for consecutive rolls (3-8 min)',
            price: 110,
            icon: 'streak'
        },
        {
            id: 'time_freeze',
            name: 'Time Freeze',
            description: 'Quest timers slow down or stop (2-5 min)',
            price: 90,
            icon: 'freeze'
        },
        {
            id: 'hypertap',
            name: 'HyperTap',
            description: 'Faster cube response for 5-15 seconds',
            price: 15,
            icon: 'tap'
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

        if (tab === 'skins') {
            if (skinsEmpty) skinsEmpty.style.display = 'flex';
            if (boostsList) boostsList.style.display = 'none';
        } else if (tab === 'boosts') {
            if (skinsEmpty) skinsEmpty.style.display = 'none';
            if (boostsList) {
                boostsList.style.display = 'grid';
                this.renderBoosts();
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

            item.innerHTML = `
                <div class="boost-image">
                    ${this.getIconSVG(boost.icon)}
                </div>
                <div class="boost-info">
                    <div class="boost-description">${boost.description}</div>
                    <div class="boost-price" style="color: ${priceColor};">
                        <span class="boost-price-icon">$LUCU</span>
                        <span>${format(boost.price)}</span>
                    </div>
                </div>
            `;

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
            alert('Not enough coins!');
            return;
        }

        const item = document.querySelector(`.boost-item[data-id="${boostId}"]`);
        if (!item) return;

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

        Game.addCoins(-boost.price);

        setTimeout(() => {
            if (typeof Inventory !== 'undefined') {
                Inventory.addBoost(boostId);
            }
        }, 500);
    },

    render: function () {
        const activeTab = document.querySelector('.shop-tab-btn.active');
        if (activeTab) {
            this.switchTab(activeTab.dataset.tab);
        }
    }
};

