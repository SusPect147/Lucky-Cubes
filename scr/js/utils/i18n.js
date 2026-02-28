const i18n = (function () {
    let currentLang = 'en';
    let tgLangCode = 'unknown';

    function init() {
        const tg = window.Telegram?.WebApp;
        let langCode = tg?.initDataUnsafe?.user?.language_code;

        if (!langCode) {
            langCode = 'en'; // По умолчанию 'en'
            try {
                // Fallback parsing...
                let rawInitData = '';
                if (window.location.hash && window.location.hash.includes('tgWebAppData=')) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    rawInitData = hashParams.get('tgWebAppData');
                } else if (window.location.search && window.location.search.includes('tgWebAppData=')) {
                    const searchParams = new URLSearchParams(window.location.search);
                    rawInitData = searchParams.get('tgWebAppData');
                }

                if (rawInitData) {
                    const urlParams = new URLSearchParams(rawInitData);
                    const userStr = urlParams.get('user');
                    if (userStr) {
                        try {
                            const userObj = JSON.parse(decodeURIComponent(userStr));
                            if (userObj?.language_code) langCode = userObj.language_code;
                        } catch (e) {
                            try {
                                const userObj = JSON.parse(userStr);
                                if (userObj?.language_code) langCode = userObj.language_code;
                            } catch (e2) { }
                        }
                    }
                }
            } catch (e) {
                console.error("Error detecting language:", e);
            }
        }

        console.log(langCode);

        tgLangCode = langCode;

        if (langCode === 'ru' || langCode === 'be' || langCode === 'uk' || langCode === 'kk') {
            currentLang = 'ru';
        } else {
            currentLang = 'en';
        }

        document.documentElement.setAttribute('lang', currentLang);
        applyTranslationsToDOM();
        updateVersionDisplay();
    }

    function updateVersionDisplay() {
        const versionEl = document.querySelector('.app-version-display');
        if (versionEl) {
            let versionText = versionEl.textContent;
            if (versionText.includes('○')) {
                versionText = versionText.split('○').pop().trim();
            } else {
                versionText = versionText.trim();
            }
            versionEl.textContent = `${currentLang.toUpperCase()} ○ ${tgLangCode.toUpperCase()} ○ ${versionText}`;
        }
    }

    function translate(key, params = {}) {
        const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
        let text = dict[key];

        if (text === undefined) {
            text = TRANSLATIONS['en'][key] || key;
        }

        for (const [param, value] of Object.entries(params)) {
            text = text.replace(new RegExp(`{${param}}`, 'g'), value);
        }

        return text;
    }

    function applyTranslationsToDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');


            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translate(key);
            } else if (el.tagName.toLowerCase() === 'input' && el.type === 'placeholder') {
                el.placeholder = translate(key);
            } else {
                el.textContent = translate(key);
            }
        });
    }

    return {
        init: init,
        t: translate,
        getLang: () => currentLang
    };
})();
