const Squads = {
    squadData: null,
    currentSort: 'members', // 'members' or 'lucu'
    searchTimeout: null,

    init: function () {
        this.bindEvents();
        this.loadTopSquads();
    },

    bindEvents: function () {
        const createBtn = document.getElementById('squad-create-btn');
        if (createBtn) createBtn.addEventListener('click', () => this.showCreateForm());

        const submitBtn = document.getElementById('squad-submit-btn');
        if (submitBtn) submitBtn.addEventListener('click', () => this.createSquad());

        const cancelBtn = document.getElementById('squad-cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideCreateForm());

        const searchInput = document.getElementById('squad-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    if (val.length > 0) {
                        this.searchSquads(val);
                    } else {
                        this.loadTopSquads();
                    }
                }, 500);
            });
        }

        const filterMembers = document.getElementById('squad-filter-members');
        const filterLucu = document.getElementById('squad-filter-lucu');

        if (filterMembers) {
            filterMembers.addEventListener('click', () => {
                filterMembers.classList.add('active');
                if (filterLucu) filterLucu.classList.remove('active');
                this.currentSort = 'members';
                if (searchInput && searchInput.value.trim()) this.searchSquads(searchInput.value.trim());
                else this.loadTopSquads();
            });
        }

        if (filterLucu) {
            filterLucu.addEventListener('click', () => {
                filterLucu.classList.add('active');
                if (filterMembers) filterMembers.classList.remove('active');
                this.currentSort = 'lucu';
                if (searchInput && searchInput.value.trim()) this.searchSquads(searchInput.value.trim());
                else this.loadTopSquads();
            });
        }

        const shareBtn = document.getElementById('squad-share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareSquad());
        }

        const deleteBtn = document.getElementById('squad-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSquad());
        }
    },

    showCreateForm: function () {
        const form = document.getElementById('squad-create-form');
        const createBtn = document.getElementById('squad-create-btn');
        if (form) form.style.display = 'flex';
        // createBtn is small now, we can hide it or let it be
        if (createBtn) createBtn.style.opacity = '0.5';
    },

    hideCreateForm: function () {
        const form = document.getElementById('squad-create-form');
        const createBtn = document.getElementById('squad-create-btn');
        if (form) form.style.display = 'none';
        if (createBtn) createBtn.style.opacity = '1';
    },

    createSquad: function () {
        const nameInput = document.getElementById('squad-name-input');
        const linkInput = document.getElementById('squad-link-input');
        const emojiInput = document.getElementById('squad-emoji-input');
        const colorInput = document.getElementById('squad-color-input');
        if (!nameInput || !linkInput) return;

        const name = nameInput.value.trim();
        const link = linkInput.value.trim();
        const emoji = emojiInput ? (emojiInput.value.trim() || '👑') : '👑';
        const color = colorInput ? (colorInput.value.trim() || '#7c4dff') : '#7c4dff';

        if (!name || name.length < 2 || name.length > 5) {
            alert('Squad name must be 2–5 characters');
            return;
        }

        const submitBtn = document.getElementById('squad-submit-btn');
        if (submitBtn) {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.pointerEvents = 'none';
        }

        API.call('/api/squad-create', {
            name: name,
            channelLink: link,
            avatarEmoji: emoji,
            avatarColor: color
        })
            .then(resp => {
                if (submitBtn) {
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                }
                if (!resp || resp.error) {
                    alert(resp ? resp.error : 'Failed to create squad');
                    return;
                }
                this.squadData = resp.squad;

                // Immediately update game state if possible
                if (typeof Game !== 'undefined' && Game.state) {
                    Game.state.squad = resp.squad.id;
                }

                this.hideCreateForm();
                this.renderSquadInfo();
                nameInput.value = '';
                linkInput.value = '';
                this.loadTopSquads(); // refresh list
            })
            .catch(err => {
                if (submitBtn) {
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                }
            });
    },

    loadSquadInfo: function (squadId) {
        if (!squadId) {
            this.renderNoSquad();
            return;
        }
        API.call('/api/squad-info', { squadId: squadId })
            .then(resp => {
                if (resp && resp.squad) {
                    this.squadData = resp.squad;
                    this.renderSquadInfo();
                } else {
                    this.renderNoSquad();
                }
            })
            .catch(() => this.renderNoSquad());
    },

    renderSquadInfo: function () {
        const infoEl = document.getElementById('squad-info');
        const createBtn = document.getElementById('squad-create-btn');
        const formEl = document.getElementById('squad-create-form');
        const shareBtn = document.getElementById('squad-share-btn');
        const deleteBtn = document.getElementById('squad-delete-btn');
        if (!infoEl || !this.squadData) return;

        if (createBtn) createBtn.style.display = 'none';
        if (formEl) formEl.style.display = 'none';

        const nameEl = infoEl.querySelector('.squad-info-name');
        const membersEl = infoEl.querySelector('.squad-info-members');
        const iconEl = infoEl.querySelector('.squad-info-icon');

        if (nameEl) nameEl.textContent = this.squadData.name || '';
        if (iconEl) {
            iconEl.textContent = this.squadData.avatarEmoji || '👑';
            const color = this.squadData.avatarColor || '#7c4dff';
            // Extract rgb or just use hex with opacity via CSS trick or just solid background
            iconEl.style.background = `linear-gradient(135deg, ${color}cc, ${color}80)`;
        }

        if (membersEl) {
            const count = this.squadData.memberCount || 1;
            membersEl.textContent = i18n.t('squad_members').replace('{count}', count);
        }
        infoEl.style.display = 'flex';

        // Show share and delete buttons if user is the owner
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const isOwner = tgUser && this.squadData.owner === String(tgUser.id);

        if (shareBtn) shareBtn.style.display = isOwner ? 'flex' : 'none';
        if (deleteBtn) deleteBtn.style.display = isOwner ? 'flex' : 'none';
    },

    renderNoSquad: function () {
        const infoEl = document.getElementById('squad-info');
        const createBtn = document.getElementById('squad-create-btn');
        const formEl = document.getElementById('squad-create-form');
        if (infoEl) infoEl.style.display = 'none';
        if (formEl) formEl.style.display = 'none';
        if (createBtn) createBtn.style.display = 'flex';
    },

    deleteSquad: function () {
        if (!confirm('Are you sure you want to delete your squad? This cannot be undone.')) return;

        const deleteBtn = document.getElementById('squad-delete-btn');
        if (deleteBtn) deleteBtn.style.opacity = '0.5';

        API.call('/api/squad-delete', {})
            .then(resp => {
                if (deleteBtn) deleteBtn.style.opacity = '1';
                if (!resp || resp.error) {
                    alert(resp ? resp.error : 'Failed to delete squad');
                    return;
                }
                this.squadData = null;
                if (typeof Game !== 'undefined' && Game.state) {
                    Game.state.squad = null;
                }
                this.renderNoSquad();
                this.loadTopSquads();
            })
            .catch(() => {
                if (deleteBtn) deleteBtn.style.opacity = '1';
            });
    },

    shareSquad: function () {
        if (!this.squadData) return;
        if (window.Telegram && window.Telegram.WebApp) {
            const tgApp = window.Telegram.WebApp;
            const botUsername = 'my_cubes_bot'; // Replace with actual if known dynamically 
            const inviteLink = `https://t.me/${botUsername}/my_cubes?startapp=squad_${this.squadData.id}`;
            const text = `Join my squad "${this.squadData.name}" in Lucky Cubes! 🍀🎲`;

            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
            if (typeof tgApp.openTelegramLink === 'function') {
                tgApp.openTelegramLink(shareUrl);
            } else {
                window.open(shareUrl, '_blank');
            }
        }
    },

    loadTopSquads: function () {
        API.call(`/api/squads/top?sortBy=${this.currentSort}`, {}, 'GET')
            .then(squads => this.renderList(squads))
            .catch(() => { });
    },

    searchSquads: function (query) {
        API.call(`/api/squads/search?q=${encodeURIComponent(query)}`, {}, 'GET')
            .then(squads => this.renderList(squads))
            .catch(() => { });
    },

    renderList: function (squads) {
        const listEl = document.getElementById('squads-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        if (!squads || squads.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; padding: 20px; color: rgba(255,255,255,0.5); font-size: 0.9rem;">No squads found</div>';
            return;
        }

        squads.forEach((squad, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';

            // Rank
            const placeCell = document.createElement('div');
            placeCell.className = 'leaderboard-place-cell';
            const placeBadge = document.createElement('div');
            placeBadge.className = 'leaderboard-place-badge';
            const badgeNum = document.createElement('div');
            badgeNum.className = 'leaderboard-badge-num';
            badgeNum.textContent = index + 1;
            placeBadge.appendChild(badgeNum);
            placeCell.appendChild(placeBadge);
            row.appendChild(placeCell);

            // Bar
            const bar = document.createElement('div');
            bar.className = 'leaderboard-row-bar';

            // Avatar
            const avatar = document.createElement('div');
            avatar.className = 'leaderboard-avatar';
            avatar.style.fontSize = '20px';
            avatar.style.fontWeight = '700';

            const em = squad.avatarEmoji || '👑';
            const color = squad.avatarColor || '#7c4dff';

            avatar.textContent = em;
            avatar.style.background = `linear-gradient(135deg, ${color}cc, ${color}80)`;
            bar.appendChild(avatar);

            // Name
            const nameEl = document.createElement('div');
            nameEl.className = 'leaderboard-nickname';
            nameEl.textContent = squad.name;
            bar.appendChild(nameEl);

            // Value
            const valueEl = document.createElement('div');
            valueEl.className = 'leaderboard-value';
            if (this.currentSort === 'lucu') {
                valueEl.innerHTML = `${(squad.totalCoins || 0).toFixed(0)} <span style="font-size:0.75rem; color:rgba(255,255,255,0.5);">$LUCU</span>`;
            } else {
                valueEl.innerHTML = `${squad.memberCount || 1} <span style="font-size:0.75rem; color:rgba(255,255,255,0.5);">👤</span>`;
            }
            bar.appendChild(valueEl);

            row.appendChild(bar);
            listEl.appendChild(row);
        });
    }
};
