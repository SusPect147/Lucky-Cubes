(function () {
    'use strict';

    let tonConnectUI = null;
    let isInitialized = false;

    const MANIFEST_URL = 'https://suspect147.github.io/Lucky-Cubes/tonconnect-manifest.json';
    const DONATE_ADDRESS = 'UQBPHPJsnXJut6zzXtrVdUbUwga5F8_KfBn0fK8G4U7D_H_U';

    function truncateAddress(address) {
        if (!address) return '—';
        if (address.length <= 12) return address;
        return address.slice(0, 4) + '…' + address.slice(-4);
    }

    function crc16(data) {
        const poly = 0x1021;
        let reg = 0;
        const message = new Uint8Array(data.length + 2);
        message.set(data);
        for (let byte of message) {
            let mask = 0x80;
            while (mask > 0) {
                reg <<= 1;
                if (byte & mask) reg += 1;
                mask >>= 1;
                if (reg > 0xffff) {
                    reg &= 0xffff;
                    reg ^= poly;
                }
            }
        }
        return new Uint8Array([Math.floor(reg / 256), reg % 256]);
    }

    function rawToUserFriendly(rawStr, isTestnet = false) {
        try {
            const parts = rawStr.split(':');
            if (parts.length !== 2) return rawStr;
            const wc = parseInt(parts[0], 10);
            const hex = parts[1];

            const tag = isTestnet ? 0x91 : 0x51;
            const payload = new Uint8Array(34);
            payload[0] = tag;
            payload[1] = wc === -1 ? 0xff : wc;

            for (let i = 0, c = 0; c < hex.length; c += 2, i++) {
                payload[2 + i] = parseInt(hex.substr(c, 2), 16);
            }

            const crc = crc16(payload);
            const full = new Uint8Array(36);
            full.set(payload);
            full.set(crc, 34);

            return btoa(String.fromCharCode.apply(null, full)).replace(/\+/g, '-').replace(/\//g, '_');
        } catch (e) {
            return rawStr;
        }
    }

    function updateWalletUI(wallet) {
        const strip = document.getElementById('profile-wallet-strip');
        const addressEl = document.getElementById('profile-wallet-address');
        const connectBtn = document.getElementById('profile-connect-wallet-btn');
        const disconnectBtn = document.getElementById('wallet-disconnect-btn');
        const donateToggle = document.getElementById('wallet-donate-toggle');
        const donatePanel = document.getElementById('wallet-donate-panel');

        const topupCell = document.getElementById('topup-wallet-cell');
        const topupConnectBtn = document.getElementById('topup-wallet-connect-btn');
        const topupAddr = document.getElementById('topup-wallet-address-display');

        if (wallet && wallet.account) {
            const rawAddr = wallet.account.address || '';
            let parsedAddr = rawAddr;
            try {
                if (wallet.account.chain === '-3') {
                    parsedAddr = rawToUserFriendly(rawAddr, true);
                } else {
                    parsedAddr = rawToUserFriendly(rawAddr, false);
                }
            } catch (e) {
                console.warn('[Wallet] Address parsing issue:', e);
            }

            if (addressEl) addressEl.textContent = truncateAddress(parsedAddr);
            if (strip) strip.classList.add('connected');
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            if (donateToggle) donateToggle.style.display = 'inline-block';

            if (topupCell) {
                topupCell.style.display = 'flex';
                if (topupConnectBtn) topupConnectBtn.style.display = 'none';
                if (topupAddr) topupAddr.textContent = truncateAddress(parsedAddr);
            }
        } else {
            if (addressEl) addressEl.textContent = '—';
            if (strip) strip.classList.remove('connected');
            if (connectBtn) connectBtn.style.display = '';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (donateToggle) {
                donateToggle.style.display = 'none';
                donateToggle.classList.remove('open');
            }
            if (donatePanel) donatePanel.style.display = 'none';

            if (topupCell) {
                topupCell.style.display = 'none';
                if (topupConnectBtn) topupConnectBtn.style.display = '';
                if (topupAddr) topupAddr.textContent = '—';
            }
        }
    }

    function initTonConnect() {
        if (isInitialized) return;

        let TonConnectUIClass = null;

        if (typeof TonConnectUI !== 'undefined') {
            TonConnectUIClass = TonConnectUI.TonConnectUI || TonConnectUI;
        } else if (typeof TON_CONNECT_UI !== 'undefined') {
            TonConnectUIClass = TON_CONNECT_UI.TonConnectUI || TON_CONNECT_UI;
        } else if (typeof window.TONCONNECT_UI !== 'undefined') {
            TonConnectUIClass = window.TONCONNECT_UI.TonConnectUI || window.TONCONNECT_UI;
        }

        if (!TonConnectUIClass) return;

        try {
            tonConnectUI = new TonConnectUIClass({
                manifestUrl: MANIFEST_URL
            });

            isInitialized = true;

            tonConnectUI.onStatusChange(wallet => {
                updateWalletUI(wallet);
            });

            const currentWallet = tonConnectUI.wallet;
            if (currentWallet) {
                updateWalletUI(currentWallet);
            }
        } catch (e) {
            console.warn('[Wallet]', e.message);
        }
    }

    function connectWallet() {
        if (!tonConnectUI) {
            initTonConnect();
            if (!tonConnectUI) return;
        }
        try {
            tonConnectUI.openModal();
        } catch (e) {
            console.warn('[Wallet]', e.message);
        }
    }

    function disconnectWallet() {
        if (!tonConnectUI) return;
        try {
            tonConnectUI.disconnect();
        } catch (e) {
            console.warn('[Wallet]', e.message);
        }
    }

    function sendDonation(amountTON) {
        if (!tonConnectUI || !tonConnectUI.wallet) {
            alert('Connect your wallet first');
            return;
        }

        var amountNano = BigInt(Math.round(amountTON * 1e9)).toString();

        var transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: DONATE_ADDRESS,
                    amount: amountNano
                }
            ]
        };

        tonConnectUI.sendTransaction(transaction).then(function (result) {
            alert('Thank you for your donation of ' + amountTON + ' TON!');
            if (window.API && window.API.call) {
                const boc = result && result.boc ? result.boc : '';
                window.API.call('/api/donate', { amount: amountTON, boc: boc })
                    .then(res => console.log('Donation recorded:', res))
                    .catch(err => console.error('Failed to record donation:', err));
            }
        }).catch(function (e) {
            if (e && e.message && e.message.indexOf('cancel') !== -1) return;
            console.warn('[Wallet] Transaction error:', e);
        });
    }

    function bindEvents() {
        var connectBtn = document.getElementById('profile-connect-wallet-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                connectWallet();
            });
        }

        var disconnectBtn = document.getElementById('wallet-disconnect-btn');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                disconnectWallet();
            });
        }

        var donateToggle = document.getElementById('wallet-donate-toggle');
        var donatePanel = document.getElementById('wallet-donate-panel');
        if (donateToggle && donatePanel) {
            donateToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = donatePanel.style.display !== 'none';
                donatePanel.style.display = isOpen ? 'none' : 'flex';
                donateToggle.classList.toggle('open', !isOpen);
            });
        }

        var donateBtns = document.querySelectorAll('.wallet-donate-btn:not(.wallet-donate-custom-btn)');
        donateBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var amount = parseFloat(btn.getAttribute('data-amount'));
                if (amount > 0) sendDonation(amount);
            });
        });

        var customBtn = document.getElementById('wallet-donate-custom-btn');
        var customText = document.getElementById('donate-custom-text');
        var customInput = document.getElementById('donate-custom-input');
        var editBadge = document.getElementById('donate-edit-badge');
        var customWrap = document.getElementById('wallet-donate-custom-wrap');

        if (editBadge && customInput && customWrap && customText) {
            editBadge.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                customWrap.classList.add('editing');
                var currentVal = customText.textContent.trim();
                if (currentVal !== '...') {
                    customInput.value = currentVal;
                } else {
                    customInput.value = '';
                }
                customInput.style.display = 'block';
                customInput.focus();
            });

            customInput.addEventListener('blur', function () {
                customWrap.classList.remove('editing');
                var val = parseFloat(customInput.value);
                if (val > 0) {
                    customText.textContent = val;
                } else {
                    customText.textContent = '...';
                    customInput.value = '';
                }
                customInput.style.display = 'none';
            });

            customInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    customInput.blur();
                }
            });
        }

        if (customBtn && customText) {
            customBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var text = customText.textContent.trim();
                var amount = text === '...' ? 100 : parseFloat(text);
                if (amount > 0) sendDonation(amount);
            });
        }
    }

    const baseLucu = 1000;
    const baseTon = 0.2;
    const discountExponent = 0.95;

    function calculateTonFromLucu(lucu) {
        if (lucu <= 0) return 0;
        let ton = baseTon * Math.pow((lucu / baseLucu), discountExponent);
        return parseFloat(ton.toFixed(2));
    }

    function calculateLucuFromTon(ton) {
        if (ton <= 0) return 0;
        let lucu = baseLucu * Math.pow((ton / baseTon), 1 / discountExponent);
        return Math.floor(lucu);
    }

    function sendTopupTransaction(amountTON, amountLUCU) {
        var amountNano = BigInt(Math.round(amountTON * 1e9)).toString();
        var transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: DONATE_ADDRESS,
                    amount: amountNano
                }
            ]
        };

        tonConnectUI.sendTransaction(transaction).then(function (result) {
            let currentCoins = 0;
            if (window.Game && window.Game.getCoinCount) {
                currentCoins = window.Game.getCoinCount();
            } else {
                const curCoin = localStorage.getItem('coins');
                if (curCoin !== null) {
                    currentCoins = parseInt(curCoin, 10);
                    if (isNaN(currentCoins)) currentCoins = 0;
                }
            }
            currentCoins += amountLUCU;

            const profBalance = document.getElementById('profile-balance');
            if (profBalance) profBalance.textContent = currentCoins.toFixed(2) + ' $LUCU';

            if (typeof updateUI === 'function') {
                updateUI(currentCoins, window.Game && window.Game.applyServerState ? 0 : 0);
            }

            const topupOverlay = document.getElementById('topup-menu-overlay');
            if (topupOverlay) topupOverlay.classList.remove('visible');

            if (window.API && window.API.call) {
                const boc = result && result.boc ? result.boc : '';
                window.API.call('/api/donate', { amount: amountTON, coins: amountLUCU, boc: boc })
                    .then(res => {
                        console.log('Topup recorded:', res);
                        if (res && res.totalCoins !== undefined && window.Game && window.Game.applyServerState) {
                            window.Game.applyServerState(res);
                            if (profBalance) profBalance.textContent = res.totalCoins.toFixed(2) + ' $LUCU';
                        }
                    })
                    .catch(err => console.error('Failed to record topup:', err));
            }

        }).catch(function (e) {
            if (e && e.message && e.message.indexOf('cancel') !== -1) return;
            console.warn('[Wallet] Transaction error:', e);
        });
    }

    function initTopupEvents() {
        const topupOverlay = document.getElementById('topup-menu-overlay');
        const openBtn = document.getElementById('btn-profile-topup-open');
        const closeBtn = document.getElementById('topup-menu-close-btn');
        const topupMenu = document.querySelector('.topup-menu');

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        function closeMenu() {
            if (topupOverlay) {
                topupOverlay.classList.remove('visible');
                if (topupMenu) {
                    topupMenu.style.transform = '';
                    topupMenu.style.transition = '';
                }
            }
        }

        if (topupMenu) {
            topupMenu.addEventListener('touchstart', (e) => {
                const target = e.target;
                if (target.closest('.topup-exchange-currency') || target.closest('.topup-row-input')) return;

                startY = e.touches[0].clientY;
                isDragging = true;
                topupMenu.style.transition = 'none';
            }, { passive: true });

            topupMenu.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;

                if (deltaY > 0) {
                    e.preventDefault();
                    topupMenu.style.transform = `translateY(${deltaY}px)`;
                }
            }, { passive: false });

            topupMenu.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                topupMenu.style.transition = '';

                const deltaY = currentY - startY;
                if (deltaY > 100) {
                    closeMenu();
                } else {
                    topupMenu.style.transform = '';
                }
                currentY = 0;
            });

            // Mouse equivalents for desktop testing
            topupMenu.addEventListener('mousedown', (e) => {
                const target = e.target;
                if (target.closest('.topup-exchange-currency') || target.closest('.topup-row-input')) return;
                startY = e.clientY;
                isDragging = true;
                topupMenu.style.transition = 'none';
            });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                currentY = e.clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    topupMenu.style.transform = `translateY(${deltaY}px)`;
                }
            });
            document.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                topupMenu.style.transition = '';
                const deltaY = currentY - startY;
                if (deltaY > 100) {
                    closeMenu();
                } else {
                    topupMenu.style.transform = '';
                }
                currentY = 0;
            });
        }

        if (openBtn && topupOverlay) {
            openBtn.addEventListener('click', function () {
                topupOverlay.classList.add('visible');
            });
        }
        if (closeBtn && topupOverlay) {
            closeBtn.addEventListener('click', closeMenu);
        }
        if (topupOverlay) {
            topupOverlay.addEventListener('mousedown', function (e) {
                if (e.target === topupOverlay) closeMenu();
            });
        }

        const tabBtns = document.querySelectorAll('.topup-tab-btn');
        const tabPanes = {
            'stars': document.getElementById('topup-tab-stars'),
            'ton': document.getElementById('topup-tab-ton')
        };

        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                tabBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const tab = btn.getAttribute('data-tab');
                Object.keys(tabPanes).forEach(function (k) {
                    if (tabPanes[k]) {
                        tabPanes[k].style.display = k === tab ? 'block' : 'none';
                    }
                });
            });
        });

        const lucuInput = document.getElementById('topup-amount-lucu-main');
        const tonInput = document.getElementById('topup-amount-ton-main');
        const btnAmount = document.getElementById('topup-btn-amount');

        if (lucuInput && tonInput && btnAmount) {
            function updateFromLucu() {
                let lucu = parseInt(lucuInput.value, 10);
                if (isNaN(lucu) || lucu <= 0) {
                    tonInput.value = '';
                    btnAmount.textContent = `0`;
                    return;
                }
                let ton = calculateTonFromLucu(lucu);
                if (ton > 10000) {
                    ton = 10000;
                    tonInput.value = ton;
                    lucuInput.value = calculateLucuFromTon(ton);
                } else {
                    tonInput.value = ton;
                }
                btnAmount.textContent = `${tonInput.value}`;
            }

            function updateFromTon() {
                let ton = parseFloat(tonInput.value);
                if (isNaN(ton) || ton <= 0) {
                    lucuInput.value = '';
                    btnAmount.textContent = `0`;
                    return;
                }
                if (ton > 10000) {
                    ton = 10000;
                    tonInput.value = ton;
                }
                let lucu = calculateLucuFromTon(ton);
                lucuInput.value = lucu;
                btnAmount.textContent = `${ton}`;
            }

            lucuInput.addEventListener('input', updateFromLucu);
            tonInput.addEventListener('input', updateFromTon);
            updateFromLucu();
        }

        const topupConnectBtn = document.getElementById('topup-wallet-connect-btn');
        const topupReconnectBtn = document.getElementById('topup-wallet-reconnect-btn');
        if (topupConnectBtn) {
            topupConnectBtn.addEventListener('click', function () {
                if (!tonConnectUI || !tonConnectUI.wallet) {
                    connectWallet();
                }
            });
        }
        if (topupReconnectBtn) {
            topupReconnectBtn.addEventListener('click', function () {
                disconnectWallet();
                setTimeout(connectWallet, 500);
            });
        }

        const submitBtn = document.getElementById('topup-ton-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function () {
                if (!tonConnectUI || !tonConnectUI.wallet) {
                    connectWallet();
                    return;
                }
                const ton = parseFloat(tonInput.value);
                const lucu = parseInt(lucuInput.value, 10);
                if (ton > 0 && lucu > 0) {
                    sendTopupTransaction(ton, lucu);
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindEvents();
            initTopupEvents();
            setTimeout(initTonConnect, 500);
        });
    } else {
        bindEvents();
        initTopupEvents();
        setTimeout(initTonConnect, 500);
    }
})();
