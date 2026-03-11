const Leaderboard = {
    currentTab: 'coins',
    data: null,
    myId: null,
    lastLoadTime: 0,

    init: function () {
        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
                const user = window.Telegram.WebApp.initDataUnsafe.user;
                if (user) this.myId = String(user.id);
            }
        } catch (e) { }

        this.bindFilterButtons();
        this.load();
    },

    bindFilterButtons: function () {
        const btns = document.querySelectorAll('.leaderboard-filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = btn.dataset.filter || 'coins';
                this.render();
            });
        });
    },

    load: function () {
        if (typeof API === 'undefined' || !API.call) {
            console.error('Leaderboard load failed: API is not defined yet');
            return;
        }

        API.call('/api/leaderboard', null)
            .then(data => {
                if (!data) {
                    console.error('Leaderboard load failed: no data');
                    return;
                }
                this.data = data;
                this.lastLoadTime = Date.now();
                this.render();
            })
            .catch(err => {
                console.error('Leaderboard load failed:', err);
            });
    },

    openLeaderboard: function () {
        const now = Date.now();

        if (!this.data || now - this.lastLoadTime > 60000) {
            this.load();
        } else {
            this.render();
        }
    },

    getPlaceHTML: function (index) {
        const rank = index + 1;
        return `<div class="leaderboard-place-cell">
            <div class="leaderboard-place-badge">
                <img class="leaderboard-badge-img" src="assets/UI/images/badge-n.webp" alt="">
                <span class="leaderboard-badge-num">${rank}</span>
            </div>
        </div>`;
    },

    getAvatarHTML: function (entry) {
        if (entry.photo_url) {
            const img = document.createElement('img');
            img.className = 'leaderboard-avatar';
            img.src = entry.photo_url;
            img.alt = '';
            img.style.objectFit = 'cover';
            img.onerror = function () { this.style.display = 'none'; };
            return img.outerHTML;
        }
        return `<div class="leaderboard-avatar"></div>`;
    },

    formatValue: function (entry) {
        if (this.currentTab === 'coins') {
            return `${entry.coins.toFixed(2)} $LUCU`;
        }
        if (entry.min === 0) return '—';
        if (entry.min < 0.001) return entry.min.toExponential(2);
        return entry.min.toFixed(6);
    },

    render: function () {
        if (!this.data) return;

        const list = this.currentTab === 'coins' ? this.data.byCoins : this.data.byMin;
        const listEl = document.querySelector('.leaderboard-list');
        const totalEl = document.querySelector('.leaderboard-total');
        const yourBar = document.querySelector('.leaderboard-your-bar');

        if (!listEl) return;

        if (totalEl) {
            totalEl.textContent = `${list.length}`;
        }

        if (yourBar && this.myId) {
            const myIndex = list.findIndex(e => e.id === this.myId);
            const myEntry = list[myIndex];
            if (myEntry) {
                const yourLabel = yourBar.querySelector('.leaderboard-your-label');
                const yourScore = yourBar.querySelector('.leaderboard-your-score');
                const yourAvatar = yourBar.querySelector('.leaderboard-avatar');
                if (yourLabel) yourLabel.textContent = i18n.t('leaderboard_your_rank', { rank: myIndex + 1, name: myEntry.name });
                if (yourScore) yourScore.textContent = this.formatValue(myEntry);
                if (yourAvatar && myEntry.photo_url) {
                    const img = document.createElement('img');
                    img.className = 'leaderboard-avatar';
                    img.src = myEntry.photo_url;
                    img.style.objectFit = 'cover';
                    img.onerror = function () { this.style.display = 'none'; };
                    yourAvatar.replaceWith(img);
                }
            }
        }

        // Build all rows in a DocumentFragment to avoid per-row reflows
        const fragment = document.createDocumentFragment();
        list.forEach((entry, i) => {
            const isMe = entry.id === this.myId;
            const row = document.createElement('div');
            row.className = 'leaderboard-row' + (isMe ? ' leaderboard-row-me' : '');

            const placeCell = document.createElement('div');
            placeCell.innerHTML = this.getPlaceHTML(i);

            const rowBar = document.createElement('div');
            rowBar.className = 'leaderboard-row-bar';
            if (isMe) {
                rowBar.style.border = '1px solid rgba(255,255,255,0.35)';
                rowBar.style.background = 'rgba(255,255,255,0.08)';
            }

            if (entry.photo_url) {
                const img = document.createElement('img');
                img.className = 'leaderboard-avatar';
                img.src = entry.photo_url;
                img.alt = '';
                img.style.objectFit = 'cover';
                img.loading = 'lazy';
                img.onerror = function () { this.style.display = 'none'; };
                rowBar.appendChild(img);
            } else {
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'leaderboard-avatar';
                rowBar.appendChild(avatarDiv);
            }

            const nicknameDiv = document.createElement('div');
            nicknameDiv.className = 'leaderboard-nickname';
            nicknameDiv.textContent = entry.name;
            rowBar.appendChild(nicknameDiv);

            const valueDiv = document.createElement('div');
            valueDiv.className = 'leaderboard-value';
            valueDiv.textContent = this.formatValue(entry);
            rowBar.appendChild(valueDiv);

            row.appendChild(placeCell.firstElementChild || placeCell);
            row.appendChild(rowBar);
            fragment.appendChild(row);
        });
        
        // Single DOM operation: clear and append
        listEl.textContent = '';
        listEl.appendChild(fragment);
    },
};
