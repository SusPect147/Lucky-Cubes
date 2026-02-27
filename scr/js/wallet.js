(function () {
    'use strict';

    let tonConnectUI = null;
    let isInitialized = false;

    const MANIFEST_URL = 'https://suspect147.github.io/Lucky-Cubes/tonconnect-manifest.json';
    const DONATE_ADDRESS = 'UQBPHPJsnXJut6zzXtrVdUbUwga5F8_KfBn0fK8G4U7D_H_U';

    function truncateAddress(address) {
        if (!address) return '—';
        if (address.length <= 12) return address;
        return address.slice(0, 6) + '…' + address.slice(-4);
    }

    function updateWalletUI(wallet) {
        const strip = document.getElementById('profile-wallet-strip');
        const addressEl = document.getElementById('profile-wallet-address');
        const connectBtn = document.getElementById('profile-connect-wallet-btn');
        const disconnectBtn = document.getElementById('wallet-disconnect-btn');
        const donateToggle = document.getElementById('wallet-donate-toggle');
        const donatePanel = document.getElementById('wallet-donate-panel');
        if (!strip) return;

        if (wallet && wallet.account) {
            const addr = wallet.account.address || '';
            addressEl.textContent = truncateAddress(addr);
            strip.classList.add('connected');
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            if (donateToggle) donateToggle.style.display = 'inline-block';
        } else {
            addressEl.textContent = '—';
            strip.classList.remove('connected');
            if (connectBtn) connectBtn.style.display = '';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (donateToggle) {
                donateToggle.style.display = 'none';
                donateToggle.classList.remove('open');
            }
            if (donatePanel) donatePanel.style.display = 'none';
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindEvents();
            setTimeout(initTonConnect, 500);
        });
    } else {
        bindEvents();
        setTimeout(initTonConnect, 500);
    }
})();
