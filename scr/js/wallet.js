(function () {
    'use strict';

    let tonConnectUI = null;
    let isInitialized = false;

    const MANIFEST_URL = 'https://suspect147.github.io/Lucky-Cubes/tonconnect-manifest.json';

    function truncateAddress(address) {
        if (!address) return '—';
        if (address.length <= 12) return address;
        return address.slice(0, 6) + '…' + address.slice(-4);
    }

    function updateWalletUI(wallet) {
        const strip = document.getElementById('profile-wallet-strip');
        const addressEl = document.getElementById('profile-wallet-address');
        if (!strip) return;

        if (wallet && wallet.account) {
            const addr = wallet.account.address || '';
            addressEl.textContent = truncateAddress(addr);
            strip.classList.add('connected');
        } else {
            addressEl.textContent = '—';
            strip.classList.remove('connected');
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

    function bindConnectButton() {
        const connectBtn = document.getElementById('profile-connect-wallet-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                connectWallet();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindConnectButton();
            setTimeout(initTonConnect, 500);
        });
    } else {
        bindConnectButton();
        setTimeout(initTonConnect, 500);
    }
})();
