const Leaderboard = {
    currentTab: 'coins',
    data: null,
    myId: null,

    init: function () {
        // Get current user ID
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
        fetch(CONFIG.API_URL + '/api/leaderboard')
            .then(r => r.json())
            .then(data => {
                this.data = data;
                this.render();
            })
            .catch(err => {
                console.error('Leaderboard load failed:', err);
            });
    },

    getPlaceHTML: function (index) {
        const rank = index + 1;
        if (rank <= 3) {
            const imgs = [
                'assets/UI/images/1-last.png',
                'assets/UI/images/2-last.png',
                'assets/UI/images/3-last.png',
            ];
            return `<div class="leaderboard-place-cell">
                <div class="leaderboard-place-cube rank-${rank}">
                    <img class="leaderboard-place-img" src="${imgs[rank - 1]}" alt="#${rank}">
                </div>
            </div>`;
        }
        return `<div class="leaderboard-place-cell">
            <div class="leaderboard-place-badge">
                <img class="leaderboard-badge-img" src="assets/UI/images/cubes_cubes.png" alt="">
                <span class="leaderboard-badge-num">${rank}</span>
            </div>
        </div>`;
    },

    getAvatarHTML: function (entry) {
        if (entry.photo_url) {
            return `<img class="leaderboard-avatar" src="${entry.photo_url}" alt="" style="object-fit:cover;" onerror="this.style.display='none'">`;
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

        // Render "Your Place" bar
        if (yourBar && this.myId) {
            const myIndex = list.findIndex(e => e.id === this.myId);
            const myEntry = list[myIndex];
            if (myEntry) {
                const yourLabel = yourBar.querySelector('.leaderboard-your-label');
                const yourScore = yourBar.querySelector('.leaderboard-your-score');
                const yourAvatar = yourBar.querySelector('.leaderboard-avatar');
                if (yourLabel) yourLabel.textContent = `#${myIndex + 1} ${myEntry.name}`;
                if (yourScore) yourScore.textContent = this.formatValue(myEntry);
                if (yourAvatar && myEntry.photo_url) {
                    // Replace the avatar div with an img
                    const img = document.createElement('img');
                    img.className = 'leaderboard-avatar';
                    img.src = myEntry.photo_url;
                    img.style.objectFit = 'cover';
                    img.onerror = function () { this.style.display = 'none'; };
                    yourAvatar.replaceWith(img);
                }
            }
        }

        // Render list
        listEl.innerHTML = '';
        list.forEach((entry, i) => {
            const isMe = entry.id === this.myId;
            const row = document.createElement('div');
            row.className = 'leaderboard-row' + (isMe ? ' leaderboard-row-me' : '');
            row.innerHTML = `
                ${this.getPlaceHTML(i)}
                <div class="leaderboard-row-bar" ${isMe ? 'style="border:1px solid rgba(220,53,69,0.3);background:rgba(220,53,69,0.08)"' : ''}>
                    ${this.getAvatarHTML(entry)}
                    <div class="leaderboard-nickname">${entry.name}</div>
                    <div class="leaderboard-value">${this.formatValue(entry)}</div>
                </div>
            `;
            listEl.appendChild(row);
        });
    },
};
