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
            // Stop propagation to prevent game interacting with hotkeys like WASD
            searchInput.addEventListener('keydown', (e) => {
                e.stopPropagation();
            });
        }

        // Custom Modal Overlay bindings
        let customModalOverlay = document.getElementById('custom-modal-overlay');
        if (!customModalOverlay) {
            customModalOverlay = document.createElement('div');
            customModalOverlay.className = 'custom-modal-overlay';
            customModalOverlay.id = 'custom-modal-overlay';

            const modalContent = document.createElement('div');
            modalContent.className = 'custom-modal';
            modalContent.id = 'custom-modal-content';

            customModalOverlay.appendChild(modalContent);
            document.body.appendChild(customModalOverlay);
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

        const leaveBtn = document.getElementById('squad-leave-btn');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.leaveSquad());
        }

        // --- NEW MODAL & UI BINDINGS ---
        const aboutClansBtn = document.getElementById('profile-about-clans-btn');
        if (aboutClansBtn) {
            aboutClansBtn.addEventListener('click', () => this.showMenu());
        }

        const closeMenuBtn = document.getElementById('squad-menu-close-btn');
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => this.hideMenu());
        }

        const overlay = document.getElementById('squad-menu-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideMenu();
            });
        }

        // Emoji & Color Selector Logic
        this.selectedEmoji = '👑';
        this.selectedColor = '#7c4dff';

        const emojiBtns = document.querySelectorAll('.squad-emoji-btn');
        emojiBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                emojiBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedEmoji = btn.getAttribute('data-emoji') || '👑';
            });
        });

        const colorBtns = document.querySelectorAll('.squad-color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedColor = btn.getAttribute('data-color') || '#7c4dff';
            });
        });
    },

    openCustomModal: function (message, onConfirm, isConfirmMode = false) {
        const overlay = document.getElementById('custom-modal-overlay');
        const content = document.getElementById('custom-modal-content');
        if (!overlay || !content) return;

        content.innerHTML = `
            <div class="custom-modal-title">${message}</div>
            <div class="custom-modal-actions">
                ${isConfirmMode ? '<button class="custom-modal-btn custom-modal-btn-cancel" id="custom-modal-cancel">Cancel</button>' : ''}
                <button class="custom-modal-btn custom-modal-btn-confirm" id="custom-modal-ok">OK</button>
            </div>
        `;

        overlay.classList.add('visible');

        const okBtn = document.getElementById('custom-modal-ok');
        const cancelBtn = document.getElementById('custom-modal-cancel');

        const closeAndResolve = (confirmed) => {
            overlay.classList.remove('visible');
            if (confirmed && onConfirm) onConfirm();
        };

        if (okBtn) okBtn.onclick = () => closeAndResolve(true);
        if (cancelBtn) cancelBtn.onclick = () => closeAndResolve(false);
    },

    showMenu: function () {
        const overlay = document.getElementById('squad-menu-overlay');
        if (overlay) {
            overlay.classList.add('visible');
            this.loadTopSquads();

            // Check if user has a squad; if so, load user squad details right away
            if (typeof Game !== 'undefined' && Game.state && Game.state.squad) {
                this.loadSquadInfo(Game.state.squad);
            }
        }
    },

    hideMenu: function () {
        const overlay = document.getElementById('squad-menu-overlay');
        const menu = document.querySelector('.squad-menu');

        if (overlay) {
            overlay.classList.remove('visible');
        }
    },

    showCreateForm: function () {
        const form = document.getElementById('squad-create-form');
        const createBtn = document.getElementById('squad-create-btn');
        const listContainer = document.querySelector('.squads-list-container');
        const filters = document.querySelector('.squad-filters');

        if (form) form.style.display = 'flex';
        if (createBtn) createBtn.style.opacity = '0.5';
        if (listContainer) listContainer.style.display = 'none';
        if (filters) filters.style.display = 'none';
    },

    hideCreateForm: function () {
        const form = document.getElementById('squad-create-form');
        const createBtn = document.getElementById('squad-create-btn');
        const listContainer = document.querySelector('.squads-list-container');
        const filters = document.querySelector('.squad-filters');

        if (form) form.style.display = 'none';
        if (createBtn) createBtn.style.opacity = '1';
        if (listContainer) listContainer.style.display = 'block';
        if (filters) filters.style.display = 'flex';
    },

    createSquad: function () {
        const nameInput = document.getElementById('squad-name-input');
        if (!nameInput) return;

        const name = nameInput.value.trim();
        const emoji = this.selectedEmoji || '👑';
        const color = this.selectedColor || '#7c4dff';

        if (!name || name.length < 2 || name.length > 5) {
            this.openCustomModal(i18n.t('squad_name_error') || 'Squad name must be 2–5 characters');
            return;
        }

        const submitBtn = document.getElementById('squad-submit-btn');
        if (submitBtn) {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.pointerEvents = 'none';
        }

        API.call('/api/squad-create', {
            name: name,
            avatarEmoji: emoji,
            avatarColor: color
        })
            .then(resp => {
                if (submitBtn) {
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                }
                if (!resp || resp.error) {
                    this.openCustomModal(resp ? resp.error : 'Failed to create squad');
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

        const leaveBtn = document.getElementById('squad-leave-btn');
        if (leaveBtn) leaveBtn.style.display = isOwner ? 'none' : 'flex';

        const membersContainer = document.getElementById('squad-members-container');
        const membersListEl = document.getElementById('squad-members-list');

        const formatLastOnline = (ts) => {
            if (!ts) return '';
            const mins = Math.max(0, Math.floor((Date.now() / 1000 - ts) / 60));
            if (mins < 60) return `${mins}m`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h`;
            return `${Math.floor(hrs / 24)}d`;
        };

        if (membersContainer && membersListEl) {
            membersListEl.innerHTML = '';
            if (this.squadData.memberDetails && this.squadData.memberDetails.length > 0) {
                this.squadData.memberDetails.forEach(member => {
                    const mRow = document.createElement('div');
                    mRow.className = 'squad-member-row';
                    mRow.style.display = 'flex';
                    mRow.style.alignItems = 'center';
                    mRow.style.padding = '10px 12px';
                    mRow.style.background = 'rgba(255,255,255,0.03)';
                    mRow.style.borderRadius = '12px';
                    mRow.style.gap = '12px';
                    mRow.style.width = '100%';
                    mRow.style.boxSizing = 'border-box';

                    const mAvatar = document.createElement('div');
                    mAvatar.className = 'leaderboard-avatar';
                    mAvatar.style.width = '36px';
                    mAvatar.style.height = '36px';
                    mAvatar.style.borderRadius = '50%';
                    mAvatar.style.flexShrink = '0';
                    if (member.photo_url) {
                        mAvatar.style.backgroundImage = `url(${member.photo_url})`;
                        mAvatar.style.backgroundSize = 'cover';
                    } else {
                        mAvatar.style.background = '#444';
                    }
                    mRow.appendChild(mAvatar);

                    const mInfo = document.createElement('div');
                    mInfo.style.flex = '1';
                    mInfo.style.display = 'flex';
                    mInfo.style.flexDirection = 'column';

                    const mName = document.createElement('span');
                    mName.textContent = member.name;
                    mName.style.fontSize = '0.9rem';
                    mName.style.fontWeight = '600';
                    mInfo.appendChild(mName);

                    const mView = document.createElement('span');
                    mView.innerHTML = `${member.coins} <span style="font-size:0.7em; color:rgba(255,255,255,0.5);">$LUCU</span>`;
                    mView.style.fontSize = '0.8rem';
                    mView.style.color = '#fff';
                    mInfo.appendChild(mView);

                    if (member.lastOnline) {
                        const mOnline = document.createElement('div');
                        mOnline.style.fontSize = '0.7rem';
                        mOnline.style.color = 'rgba(255,255,255,0.5)';
                        mOnline.textContent = (i18n.t('last_online') || 'Last seen: {time}').replace('{time}', formatLastOnline(member.lastOnline));
                        mInfo.appendChild(mOnline);
                    }

                    mRow.appendChild(mInfo);

                    if (isOwner && member.id !== String(tgUser?.id)) {
                        const mKick = document.createElement('button');
                        mKick.textContent = 'Kick';
                        mKick.style.background = 'rgba(220,53,69,0.2)';
                        mKick.style.color = '#ff4d4f';
                        mKick.style.border = '1px solid rgba(220,53,69,0.3)';
                        mKick.style.borderRadius = '6px';
                        mKick.style.padding = '4px 10px';
                        mKick.style.fontSize = '0.75rem';
                        mKick.style.cursor = 'pointer';
                        mKick.addEventListener('click', () => {
                            this.kickMember(member.id, member.name);
                        });
                        mRow.appendChild(mKick);
                    }

                    membersListEl.appendChild(mRow);
                });

                // Add requests if owner
                if (isOwner && this.squadData.requestDetails && this.squadData.requestDetails.length > 0) {
                    const reqTitle = document.createElement('div');
                    reqTitle.style.marginTop = '12px';
                    reqTitle.style.marginBottom = '6px';
                    reqTitle.style.fontSize = '0.85rem';
                    reqTitle.style.color = 'rgba(255,255,255,0.5)';
                    reqTitle.textContent = i18n.t('squad_applications') || 'Applications';
                    membersListEl.appendChild(reqTitle);

                    this.squadData.requestDetails.forEach(req => {
                        const rRow = document.createElement('div');
                        rRow.style.display = 'flex';
                        rRow.style.alignItems = 'center';
                        rRow.style.padding = '8px';
                        rRow.style.background = 'rgba(255,165,0,0.1)';
                        rRow.style.borderRadius = '8px';
                        rRow.style.gap = '8px';

                        const rInfo = document.createElement('div');
                        rInfo.style.flex = '1';
                        rInfo.style.display = 'flex';
                        rInfo.style.flexDirection = 'column';

                        const rName = document.createElement('span');
                        rName.textContent = req.name;
                        rName.style.fontSize = '0.9rem';
                        rName.style.fontWeight = '600';
                        rInfo.appendChild(rName);

                        const rView = document.createElement('span');
                        rView.innerHTML = `${req.coins} <span style="font-size:0.7em; color:rgba(255,255,255,0.5);">$LUCU</span>`;
                        rView.style.fontSize = '0.8rem';
                        rView.style.color = '#fff';
                        rInfo.appendChild(rView);
                        rRow.appendChild(rInfo);

                        const rReject = document.createElement('button');
                        rReject.textContent = '✖';
                        rReject.style.background = 'rgba(220,53,69,0.2)';
                        rReject.style.color = '#ff4d4f';
                        rReject.style.border = 'none';
                        rReject.style.borderRadius = '6px';
                        rReject.style.padding = '4px 8px';
                        rReject.style.cursor = 'pointer';
                        rReject.addEventListener('click', () => this.resolveRequest(req.id, 'reject'));
                        rRow.appendChild(rReject);

                        const rAccept = document.createElement('button');
                        rAccept.textContent = '✔';
                        rAccept.style.background = 'rgba(40,167,69,0.2)';
                        rAccept.style.color = '#28a745';
                        rAccept.style.border = 'none';
                        rAccept.style.borderRadius = '6px';
                        rAccept.style.padding = '4px 8px';
                        rAccept.style.cursor = 'pointer';
                        rAccept.addEventListener('click', () => this.resolveRequest(req.id, 'accept'));
                        rRow.appendChild(rAccept);

                        membersListEl.appendChild(rRow);
                    });
                }

                membersContainer.style.display = 'flex';
            } else {
                membersContainer.style.display = 'none';
            }
        }
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
        this.openCustomModal('Are you sure you want to delete your squad? This cannot be undone.', () => {
            const deleteBtn = document.getElementById('squad-delete-btn');
            if (deleteBtn) deleteBtn.style.opacity = '0.5';

            API.call('/api/squad-delete', {})
                .then(resp => {
                    if (deleteBtn) deleteBtn.style.opacity = '1';
                    if (!resp || resp.error) {
                        this.openCustomModal(resp ? resp.error : 'Failed to delete squad');
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
        }, true);
    },

    leaveSquad: function () {
        this.openCustomModal('Are you sure you want to leave this squad?', () => {
            const leaveBtn = document.getElementById('squad-leave-btn');
            if (leaveBtn) leaveBtn.style.opacity = '0.5';

            API.call('/api/squad-leave', {})
                .then(resp => {
                    if (leaveBtn) leaveBtn.style.opacity = '1';
                    if (!resp || resp.error) {
                        this.openCustomModal(resp ? resp.error : 'Failed to leave squad');
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
                    if (leaveBtn) leaveBtn.style.opacity = '1';
                });
        }, true);
    },

    kickMember: function (targetUserId, memberName) {
        this.openCustomModal(`Are you sure you want to kick ${memberName} from the squad?`, () => {
            API.call('/api/squad-kick', { targetUserId: targetUserId })
                .then(resp => {
                    if (!resp || resp.error) {
                        this.openCustomModal(resp ? resp.error : `Failed to kick ${memberName}`);
                        return;
                    }
                    // Refresh squad info to reflect kicked member
                    this.loadSquadInfo(this.squadData.id);
                })
                .catch(() => {
                    this.openCustomModal(`Error kicking ${memberName}`);
                });
        }, true);
    },

    resolveRequest: function (targetId, action) {
        API.call('/api/squad-resolve-request', { targetUserId: targetId, action: action, squadId: this.squadData.id })
            .then(resp => {
                if (!resp || resp.error) {
                    this.openCustomModal(resp ? resp.error : 'Failed to resolve request');
                    return;
                }
                this.loadSquadInfo(this.squadData.id);
            });
    },

    applyToSquad: function (squadId, btn) {
        if (btn) {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        }
        API.call('/api/squad-request-join', { squadId: squadId })
            .then(resp => {
                if (!resp || resp.error) {
                    this.openCustomModal(resp ? resp.error : 'Error sending application');
                    if (btn) {
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                    }
                    return;
                }
                if (btn) {
                    btn.textContent = 'Sent';
                }
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

            // Highlight player's current squad
            if (this.squadData && squad.id === this.squadData.id) {
                row.classList.add('leaderboard-row-me');
                row.style.border = '1px solid rgba(255,255,255,0.35)';
                row.style.background = 'rgba(255,255,255,0.08)';
            } else if (!this.squadData && typeof Game !== 'undefined' && Game.state && Game.state.squad === squad.id) {
                row.classList.add('leaderboard-row-me');
                row.style.border = '1px solid rgba(255,255,255,0.35)';
                row.style.background = 'rgba(255,255,255,0.08)';
            }

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
            avatar.style.borderRadius = '50%';
            avatar.style.aspectRatio = '1/1';
            avatar.style.width = '28px';
            avatar.style.height = '28px';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.fontSize = '14px';
            bar.appendChild(avatar);

            // Name
            const nameEl = document.createElement('div');
            nameEl.className = 'leaderboard-nickname';
            nameEl.textContent = squad.name;
            bar.appendChild(nameEl);

            // Value
            const valueEl = document.createElement('div');
            valueEl.className = 'leaderboard-value';

            const vWrap = document.createElement('div');
            vWrap.style.display = 'flex';
            vWrap.style.flexDirection = 'column';
            vWrap.style.alignItems = 'flex-end';
            vWrap.style.gap = '2px';

            if (this.currentSort === 'lucu') {
                vWrap.innerHTML = `${(squad.totalCoins || 0).toFixed(0)} <span style="font-size:0.75rem; color:rgba(255,255,255,0.5);">$LUCU</span>`;
            } else {
                vWrap.innerHTML = `${squad.memberCount || 1} <span style="font-size:0.75rem; color:rgba(255,255,255,0.5);">👤</span>`;
            }
            valueEl.appendChild(vWrap);

            // Add apply button if player is not in a squad
            if (!this.squadData && typeof Game !== 'undefined' && Game.state && !Game.state.squad) {
                const applyBtn = document.createElement('button');
                applyBtn.textContent = i18n.t('squad_apply') || 'Apply';
                applyBtn.style.background = 'rgba(255,255,255,0.1)';
                applyBtn.style.border = 'none';
                applyBtn.style.color = '#fff';
                applyBtn.style.fontSize = '0.7rem';
                applyBtn.style.padding = '4px 8px';
                applyBtn.style.borderRadius = '6px';
                applyBtn.style.cursor = 'pointer';
                applyBtn.style.marginTop = '4px';
                applyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.applyToSquad(squad.id, applyBtn);
                });
                vWrap.appendChild(applyBtn);
            }

            bar.appendChild(valueEl);

            row.appendChild(bar);
            listEl.appendChild(row);
        });
    }
};
