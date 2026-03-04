const DailyLogin = {
    REWARDS: [
        { day: 1, lucu: 100, xp: 200 },
        { day: 2, lucu: 200, xp: 400 },
        { day: 3, lucu: 300, xp: 600 },
        { day: 4, lucu: 400, xp: 800 },
        { day: 5, lucu: 500, xp: 1000 },
        { day: 6, lucu: 600, xp: 1200 },
        { day: 7, lucu: 700, xp: 1400 },
    ],

    streak: 0,
    claimedToday: false,

    init: function (dailyData) {
        if (dailyData) {
            this.streak = dailyData.streak || 0;
            this.claimedToday = dailyData.claimedToday || false;
        }
        this.bindEvents();
    },

    bindEvents: function () {
        const overlay = document.getElementById('daily-login-overlay');
        const claimBtn = document.getElementById('daily-login-claim-btn');
        const closeBtn = document.getElementById('daily-login-close-btn');

        if (claimBtn) {
            claimBtn.addEventListener('click', () => this.claimReward());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }
    },

    show: function () {
        if (this.claimedToday) return;
        const overlay = document.getElementById('daily-login-overlay');
        if (overlay) {
            this.renderCalendar();
            overlay.classList.add('visible');
        }
    },

    close: function () {
        const overlay = document.getElementById('daily-login-overlay');
        if (overlay) overlay.classList.remove('visible');
    },

    renderCalendar: function () {
        const grid = document.getElementById('daily-login-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const currentDay = this.streak + 1;

        this.REWARDS.forEach(reward => {
            const cell = document.createElement('div');
            cell.className = 'daily-day-cell';

            if (reward.day < currentDay) {
                cell.classList.add('claimed');
            } else if (reward.day === currentDay && !this.claimedToday) {
                cell.classList.add('current');
            } else if (reward.day === currentDay && this.claimedToday) {
                cell.classList.add('claimed');
            }

            const dayLabel = document.createElement('div');
            dayLabel.className = 'daily-day-label';
            dayLabel.textContent = i18n.t('daily_login_day').replace('{day}', reward.day);
            cell.appendChild(dayLabel);

            const rewardLabel = document.createElement('div');
            rewardLabel.className = 'daily-day-reward';
            rewardLabel.innerHTML = `<span class="daily-lucu">${reward.lucu}</span> $LUCU`;
            cell.appendChild(rewardLabel);

            const xpLabel = document.createElement('div');
            xpLabel.className = 'daily-day-xp';
            xpLabel.textContent = `+${reward.xp} XP`;
            cell.appendChild(xpLabel);

            if (reward.day < currentDay || (reward.day === currentDay && this.claimedToday)) {
                const check = document.createElement('div');
                check.className = 'daily-day-check';
                check.textContent = '✓';
                cell.appendChild(check);
            }

            grid.appendChild(cell);
        });

        const claimBtn = document.getElementById('daily-login-claim-btn');
        if (claimBtn) {
            if (this.claimedToday) {
                claimBtn.textContent = i18n.t('daily_login_claimed');
                claimBtn.style.opacity = '0.5';
                claimBtn.style.pointerEvents = 'none';
            } else {
                claimBtn.textContent = i18n.t('daily_login_claim');
                claimBtn.style.opacity = '1';
                claimBtn.style.pointerEvents = 'auto';
            }
        }
    },

    claimReward: function () {
        if (this.claimedToday) return;

        const claimBtn = document.getElementById('daily-login-claim-btn');
        if (claimBtn) {
            claimBtn.style.opacity = '0.5';
            claimBtn.style.pointerEvents = 'none';
        }

        API.call('/api/daily-reward', {})
            .then(resp => {
                if (!resp || resp.error) {
                    if (claimBtn) {
                        claimBtn.style.opacity = '1';
                        claimBtn.style.pointerEvents = 'auto';
                    }
                    alert(resp ? resp.error : 'Failed to claim reward');
                    return;
                }

                this.claimedToday = true;
                this.streak = resp.streak || this.streak;

                if (typeof Game !== 'undefined' && Game.applyServerState) {
                    Game.applyServerState(resp);
                }

                this.renderCalendar();

                setTimeout(() => this.close(), 1500);
            })
            .catch(() => {
                if (claimBtn) {
                    claimBtn.style.opacity = '1';
                    claimBtn.style.pointerEvents = 'auto';
                }
            });
    }
};
