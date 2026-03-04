const Squads = {
    squadData: null,

    init: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        const createBtn = document.getElementById('squad-create-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateForm());
        }
        const submitBtn = document.getElementById('squad-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.createSquad());
        }
        const cancelBtn = document.getElementById('squad-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideCreateForm());
        }
    },

    showCreateForm: function () {
        const form = document.getElementById('squad-create-form');
        const createBtn = document.getElementById('squad-create-btn');
        if (form) form.style.display = 'flex';
        if (createBtn) createBtn.style.display = 'none';
    },

    hideCreateForm: function () {
        const form = document.getElementById('squad-create-form');
        const createBtn = document.getElementById('squad-create-btn');
        if (form) form.style.display = 'none';
        if (createBtn) createBtn.style.display = '';
    },

    createSquad: function () {
        const nameInput = document.getElementById('squad-name-input');
        const linkInput = document.getElementById('squad-link-input');
        if (!nameInput || !linkInput) return;

        const name = nameInput.value.trim();
        const link = linkInput.value.trim();

        if (!name || name.length < 2 || name.length > 32) {
            alert('Squad name must be 2–32 characters');
            return;
        }

        if (link && !link.match(/^https?:\/\/(t\.me|telegram\.me)\//)) {
            alert('Please enter a valid Telegram channel link');
            return;
        }

        const submitBtn = document.getElementById('squad-submit-btn');
        if (submitBtn) {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.pointerEvents = 'none';
        }

        API.call('/api/squad-create', { name: name, channelLink: link })
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
                this.hideCreateForm();
                this.renderSquadInfo();
                nameInput.value = '';
                linkInput.value = '';
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
        if (!infoEl || !this.squadData) return;

        if (createBtn) createBtn.style.display = 'none';
        if (formEl) formEl.style.display = 'none';

        const nameEl = infoEl.querySelector('.squad-info-name');
        const membersEl = infoEl.querySelector('.squad-info-members');
        if (nameEl) nameEl.textContent = this.squadData.name || '';
        if (membersEl) {
            const count = this.squadData.memberCount || 1;
            membersEl.textContent = i18n.t('squad_members').replace('{count}', count);
        }
        infoEl.style.display = 'flex';
    },

    renderNoSquad: function () {
        const infoEl = document.getElementById('squad-info');
        const createBtn = document.getElementById('squad-create-btn');
        if (infoEl) infoEl.style.display = 'none';
        if (createBtn) createBtn.style.display = '';
    }
};
