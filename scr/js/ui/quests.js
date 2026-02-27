const Quests = {
    data: JSON.parse(JSON.stringify(CONFIG.QUESTS)),
    listEl: document.getElementById('quest-list'),

    getIconSVG: function (iconType) {
        if (iconType === 'dice') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>';
        if (iconType === 'star') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
        if (iconType === 'user') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
        if (iconType === 'heart') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.86 18.14A2 2 0 0 0 3.71 21h16.58a2 2 0 0 0 1.85-2.86L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>';
    },

    render: function () {
        this.listEl.innerHTML = '';

        const activeQuests = this.data.filter(q => {
            if (q.social) return true;
            return true;
        });
        const itemsToCheck = [];

        activeQuests.forEach(q => {
            const currentProgress = q.social ? 0 : q.current;
            const progress = q.social ? (q.completed ? 100 : 0) : Math.min(100, (currentProgress / q.target) * 100);

            if (!q.claimed && !q.social && (progress >= 100 || q.current >= q.target)) {
                q.completed = true;
            }

            const item = document.createElement('div');
            item.className = 'quest-item';
            item.dataset.id = q.id;
            item.setAttribute('data-text-claimed', i18n.t('quest_claimed'));
            item.setAttribute('data-text-claim', i18n.t('quest_claim'));
            item.setAttribute('data-text-unavailable', i18n.t('quest_unavailable'));

            const nameText = i18n.t(q.name, { target: q.target });
            const xpText = `(+${q.xp} xp)`;

            let percentageText = `${progress.toFixed(0)}%`;

            if (q.claimed && q.social) {
                item.classList.add('claimed');
                percentageText = '';
            } else if (q.id === 'subscribe_rayan' || q.id === 'donate_100') {
                item.classList.add('disabled-quest');
                percentageText = '';
            } else if (q.completed && !q.claimed) {
                item.classList.add('completed');
                percentageText = '';
            } else if (q.social && !q.completed) {
                item.classList.add('social-active');
                percentageText = 'GO';
            }

            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'quest-icon-placeholder';
            placeholderDiv.innerHTML = this.getIconSVG(q.icon); // safe
            item.appendChild(placeholderDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'quest-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'quest-name';

            const marqueeDiv = document.createElement('div');
            marqueeDiv.className = 'quest-description-marquee';
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'quest-marquee-content-wrapper';

            const span1 = document.createElement('span');
            span1.className = 'quest-text';
            span1.textContent = nameText;
            const span2 = document.createElement('span');
            span2.className = 'quest-text duplicate';
            span2.textContent = nameText;

            wrapperDiv.appendChild(span1);
            wrapperDiv.appendChild(span2);
            marqueeDiv.appendChild(wrapperDiv);
            nameDiv.appendChild(marqueeDiv);

            const xpDiv = document.createElement('div');
            xpDiv.className = 'quest-xp-container';
            xpDiv.textContent = xpText;
            nameDiv.appendChild(xpDiv);
            infoDiv.appendChild(nameDiv);

            const progressContainer = document.createElement('div');
            progressContainer.className = 'quest-progress-bar-container';
            const progressFill = document.createElement('div');
            progressFill.className = 'quest-progress-bar-fill';
            progressFill.style.width = `${progress}%`;
            progressContainer.appendChild(progressFill);
            infoDiv.appendChild(progressContainer);

            item.appendChild(infoDiv);

            const pctDiv = document.createElement('div');
            pctDiv.className = 'quest-percentage' + ((!q.claimed && (q.completed || (q.social && !q.completed))) ? ' quest-claim-ready' : '');
            pctDiv.textContent = percentageText;
            item.appendChild(pctDiv);

            if (!q.claimed && q.id !== 'subscribe_rayan' && q.id !== 'donate_100') {
                if (q.completed || q.social) {
                    const clickHandler = (e) => {
                        if (e.currentTarget === item) {
                            item.removeEventListener('click', clickHandler);

                            if (q.social && !q.completed) {
                                if (q.id === 'subscribe_lucky') {
                                    let url = "https://t.me/my_cubes_channel";
                                    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
                                        window.Telegram.WebApp.openTelegramLink(url);
                                    } else {
                                        window.open(url, '_blank');
                                    }
                                }
                            }

                            if (typeof Game !== 'undefined' && Game.claimQuest) {
                                Game.claimQuest(q.id);
                            }
                            setTimeout(() => item.addEventListener('click', clickHandler), 2000);
                        }
                    };
                    item.addEventListener('click', clickHandler);
                }
            }
            this.listEl.appendChild(item);
            itemsToCheck.push(item);
        });

        if (itemsToCheck.length > 0) {
            setTimeout(() => {
                itemsToCheck.forEach(item => {
                    const marqueeContainer = item.querySelector('.quest-description-marquee');
                    const marqueeWrapper = item.querySelector('.quest-marquee-content-wrapper');
                    const originalTextSpan = item.querySelector('.quest-text:not(.duplicate)');

                    if (!originalTextSpan || !marqueeContainer) return;

                    marqueeWrapper.classList.remove('marquee-active');

                    const textWidth = originalTextSpan.offsetWidth;
                    const containerWidth = marqueeContainer.offsetWidth;

                    if (textWidth > containerWidth) {
                        marqueeWrapper.classList.add('marquee-active');
                    }
                });
            }, 0);
        }
    },

    updateProgress: function (type, amount = 1) {
        let actualAmount = amount;
        if (typeof Game !== 'undefined' && Game.getActiveBoosts) {
            const activeBoosts = Game.getActiveBoosts();
            const timeFreezeBoost = activeBoosts.find(b => b.id === 'time_freeze');
            if (timeFreezeBoost) {
                actualAmount = 0;
            }
        }

        let didUpdate = false;
        this.data.forEach(q => {
            if (q.type === type && !q.claimed) {
                q.current += actualAmount;
                if (q.current >= q.target && !q.completed) {
                    q.completed = true;
                    didUpdate = true;
                }
            }
        });

        if (didUpdate) this.render();
    },
};
