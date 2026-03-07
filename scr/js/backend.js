(function () {
    try {
        const verEl = document.querySelector('.app-version-display');
        const searchStr = window.location.search || '';
        // If the version element does not contain v1.3.2, OR the URL doesn't have cb=1.3.2, reload.
        if (verEl && !verEl.textContent.includes('1.3.2') && !searchStr.includes('cb=1.3.2')) {
            const url = new URL(window.location.href);
            url.searchParams.set('cb', '1.3.2');
            window.location.replace(url.toString());
        }
    } catch (e) { }
})();

let jwtToken = null;
let loginPromise = null;

function getInitData() {
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            return window.Telegram.WebApp.initData;
        }
    } catch (e) { }
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    if (tgWebAppData) {
        return tgWebAppData;
    }
    return '';
}

async function login() {
    if (loginPromise) {
        return loginPromise;
    }

    loginPromise = (async () => {
        const initData = getInitData();
        const headers = { 'Content-Type': 'application/json' };

        try {
            const resp = await fetch(CONFIG.API_URL + '/api/login', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ initData })
            });
            if (resp.ok) {
                const data = await resp.json();
                jwtToken = data.token;

                // Cache the initial server state from login response
                if (data.state) {
                    window.initialServerState = data.state;
                }

                return true;
            }
        } catch (e) {
            console.error('Login failed:', e);
        }
        return false;
    })();

    return loginPromise;
}

async function call(endpoint, body) {
    try {
        // Fast intercept for the initial state call to avoid the RTT if we got it during login
        if (endpoint === '/api/state' && window.initialServerState) {
            const tempState = window.initialServerState;
            window.initialServerState = null; // Consume it so future calls hit the network
            return tempState;
        }

        if (!jwtToken) {
            const success = await login();
            if (!success) {
                console.error('Failed to authenticate');
                return null;
            }

            // Re-check after login since the initial state might have just been populated by the newly finished login
            if (endpoint === '/api/state' && window.initialServerState) {
                const tempState = window.initialServerState;
                window.initialServerState = null;
                return tempState;
            }
        }

        let url = CONFIG.API_URL + endpoint;
        let options;

        const headers = {
            'Authorization': `Bearer ${jwtToken}`
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
            options = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            };
        } else {
            options = {
                method: 'GET',
                headers: headers,
            };
        }

        let resp = await fetch(url, options);
        if (resp.status === 401) {
            jwtToken = null;
            const success = await login();
            if (success) {
                options.headers['Authorization'] = `Bearer ${jwtToken}`;
                resp = await fetch(url, options);
            }
        }

        if (!resp.ok) {
            console.error('API error:', resp.status);
            try {
                const errBody = await resp.json();
                if (errBody && errBody.versionMismatch) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('cb', '1.3.2');
                    window.location.replace(url.toString());
                    return null;
                }
                return errBody;
            } catch (e) {
                return null;
            }
        }

        const data = await resp.json();
        if (data && data.versionMismatch) {
            const url = new URL(window.location.href);
            url.searchParams.set('cb', '1.3.2');
            window.location.replace(url.toString());
            return null;
        }

        if (data && data.appVersion && data.appVersion !== '1.3.2') {
            const url = new URL(window.location.href);
            url.searchParams.set('cb', '1.3.2');
            window.location.replace(url.toString());
            return null;
        }

        return data;
    } catch (e) {
        console.error('API call failed:', e);
        return null;
    }
}

window.API = {
    call: call,
    getInitData: getInitData,
};
