(function () {
    try {
        const verEl = document.querySelector('.app-version-display');
        const searchStr = window.location.search || '';
        if (verEl && !verEl.textContent.includes('1.0.9') && !searchStr.includes('cb=1.0.9')) {
            const url = new URL(window.location.href);
            url.searchParams.set('cb', '1.0.9');
            window.location.replace(url.toString());
        }
    } catch (e) { }
})();

let jwtToken = null;

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
} async function login() {
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
            return true;
        }
    } catch (e) {
        console.error('Login failed:', e);
    }
    return false;
}

async function call(endpoint, body) {
    try {
        if (!jwtToken) {
            const success = await login();
            if (!success) {
                console.error('Failed to authenticate');
                return null;
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
                return errBody;
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

window.API = {
    call: call,
    getInitData: getInitData,
};
