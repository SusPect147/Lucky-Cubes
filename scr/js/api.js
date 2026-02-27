let jwtToken = null;

function getInitData() {
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            return window.Telegram.WebApp.initData;
        }
    } catch (e) { }
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('startapp');
    if (startParam) {
        return `dev_mode&start_param=${startParam}`;
    }
    return 'dev_mode';
} async function login() {
    const initData = getInitData();
    const headers = { 'X-API-Key': CONFIG.API_KEY || '', 'Content-Type': 'application/json' };

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
            'X-API-Key': CONFIG.API_KEY || '',
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

        const resp = await fetch(url, options);
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
