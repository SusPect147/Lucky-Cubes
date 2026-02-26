/**
 * Shared API module — HMAC-signed requests to prevent console forgery.
 * Every API call includes: initData, nonce, timestamp, and HMAC signature.
 * All requests include X-API-Key header for server-side validation.
 */
const API = (function () {
    // App salt — NOT a secret per se, but makes brute-forcing harder
    const _S = 'LuckyCubes$2026$xK9m';

    function getInitData() {
        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                return window.Telegram.WebApp.initData;
            }
        } catch (e) { }
        // Attempt to mock start_param in dev mode
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp');
        if (startParam) {
            return `dev_mode&start_param=${startParam}`;
        }
        return 'dev_mode';
        return 'dev_mode';
    }

    function generateNonce() {
        const a = new Uint8Array(16);
        crypto.getRandomValues(a);
        return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    }

    // Derive a signing key from initData + salt using SHA-256
    async function _deriveKey(initData) {
        const enc = new TextEncoder();
        const material = enc.encode(initData + '::' + _S);
        const hash = await crypto.subtle.digest('SHA-256', material);
        return await crypto.subtle.importKey(
            'raw', hash, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        );
    }

    // Sign a canonical string
    async function _sign(key, message) {
        const enc = new TextEncoder();
        const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
        return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
    }

    // Build canonical string for signing (sorted key=value pairs)
    function _canonical(obj) {
        const keys = Object.keys(obj).filter(k => k !== 'signature').sort();
        return keys.map(k => {
            const v = obj[k];
            return k + '=' + (typeof v === 'object' ? JSON.stringify(v) : String(v));
        }).join('&');
    }

    /**
     * Make an API call with HMAC signing and API key.
     * @param {string} endpoint - e.g. '/api/roll'
     * @param {object|null} body - POST body (null = GET)
     * @returns {Promise<object|null>}
     */
    async function call(endpoint, body) {
        try {
            const initData = getInitData();
            const nonce = generateNonce();
            const ts = Math.floor(Date.now() / 1000);

            let url = CONFIG.API_URL + endpoint;
            let options;

            // Common headers with API key
            const headers = {
                'X-API-Key': CONFIG.API_KEY || '',
            };

            if (body) {
                body.initData = initData;
                body.nonce = nonce;
                body.ts = ts;

                // Sign the payload
                const key = await _deriveKey(initData);
                const canonical = _canonical(body);
                body.signature = await _sign(key, canonical);

                headers['Content-Type'] = 'application/json';

                options = {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                };
            } else {
                // GET — sign query params
                const params = { initData, nonce, ts };
                const key = await _deriveKey(initData);
                const canonical = _canonical(params);
                const signature = await _sign(key, canonical);

                const qs = `initData=${encodeURIComponent(initData)}&nonce=${nonce}&ts=${ts}&signature=${signature}`;
                url += (url.includes('?') ? '&' : '?') + qs;
                options = {
                    method: 'GET',
                    headers: headers,
                };
            }

            const resp = await fetch(url, options);
            if (!resp.ok) {
                console.error('API error:', resp.status);
                try {
                    const errBody = await resp.json();
                    return errBody; // return the JSON so game.js can read .error
                } catch (e) {
                    return null;
                }
            }
            return await resp.json();
        } catch (e) {
            console.error('API call failed:', e);
            return null;
        }
    }

    return {
        call: call,
        getInitData: getInitData,
    };
})();
