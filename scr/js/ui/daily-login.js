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

        const popup = document.querySelector('.daily-login-popup');
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        if (popup) {
            popup.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isDragging = true;
                popup.style.transition = 'none';
            }, { passive: true });

            popup.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    popup.style.transform = `translateY(${deltaY}px)`;
                }
            }, { passive: true });

            popup.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                popup.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                const deltaY = currentY - startY;
                if (deltaY > 100) {
                    this.close();
                } else {
                    popup.style.transform = 'translateY(0)';
                }
            });
        }
    },

    show: function (force = false) {
        if (this.claimedToday && !force) return;
        const overlay = document.getElementById('daily-login-overlay');
        if (overlay) {
            this.renderCalendar();
            overlay.classList.add('visible');
        }
    },

    close: function () {
        const overlay = document.getElementById('daily-login-overlay');
        const popup = document.querySelector('.daily-login-popup');
        if (overlay) overlay.classList.remove('visible');
        if (popup) setTimeout(() => popup.style.transform = '', 400);
    },

    renderCalendar: function () {
        const grid = document.getElementById('daily-login-grid');
        const container = document.getElementById('daily-login-roulette-container');
        if (!grid || !container) return;
        grid.innerHTML = '';
        grid.style.transition = 'none';

        const currentDayStr = this.claimedToday ? this.streak : this.streak + 1;

        // Populate items
        const numItems = this.REWARDS.length;
        this.REWARDS.forEach(reward => {
            const cell = document.createElement('div');
            cell.className = 'daily-day-cell';
            cell.dataset.day = reward.day;

            if (reward.day < currentDayStr || (reward.day === currentDayStr && this.claimedToday)) {
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

            grid.appendChild(cell);
        });

        // Center on correct day immediately
        this.centerOnDay(currentDayStr, false);

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

    centerOnDay: function (targetDay, animate = true) {
        const grid = document.getElementById('daily-login-grid');
        const container = document.getElementById('daily-login-roulette-container');
        if (!grid || !container) return;

        const cells = Array.from(grid.children);
        const itemWidth = 90; // min-width from CSS
        const gap = 16;
        const totalItemWidth = itemWidth + gap;
        const containerWidth = container.offsetWidth;

        const targetIndex = this.REWARDS.findIndex(r => r.day === targetDay) !== -1 ? this.REWARDS.findIndex(r => r.day === targetDay) : 0;

        // Offset to align center of cell with middle line
        const offset = (containerWidth / 2) - ((targetIndex * totalItemWidth) + (itemWidth / 2));

        cells.forEach(c => c.classList.remove('active-spin'));

        if (animate) {
            grid.style.transition = 'transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)';
            // Adding a little extra spin visual effect by backing up heavily
            grid.style.transform = `translateX(${offset + 800}px)`; // Spin starting point
            setTimeout(() => {
                grid.style.transform = `translateX(${offset}px)`;
            }, 50);
        } else {
            grid.style.transition = 'none';
            grid.style.transform = `translateX(${offset}px)`;
            if (cells[targetIndex]) cells[targetIndex].classList.add('active-spin');
        }

        if (animate) {
            setTimeout(() => {
                if (cells[targetIndex]) {
                    cells[targetIndex].classList.add('active-spin');
                    cells[targetIndex].classList.add('claimed');
                }
            }, 3050);
        }
    },

    claimReward: function () {
        if (this.claimedToday || this.isClaiming) return;

        this.isClaiming = true;
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
                    this.isClaiming = false;
                    return;
                }

                // Play animation first before closing
                const targetDay = this.streak + 1;
                this.centerOnDay(targetDay, true);

                setTimeout(() => {
                    this.claimedToday = true;
                    this.streak = resp.streak || this.streak;

                    if (typeof Game !== 'undefined' && Game.applyServerState) {
                        Game.applyServerState(resp);
                    }

                    this.renderCalendar();

                    setTimeout(() => {
                        this.close();
                        this.isClaiming = false;
                    }, 1000);
                }, 3100); // 3s spin + small buffer
            })
            .catch(() => {
                if (claimBtn) {
                    claimBtn.style.opacity = '1';
                    claimBtn.style.pointerEvents = 'auto';
                }
                this.isClaiming = false;
            });
    }
};
