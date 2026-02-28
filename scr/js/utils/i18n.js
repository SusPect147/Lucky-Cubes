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

        if (!langCode) {
            langCode = 'en'; // По умолчанию 'en'
        }

        console.debug("User language detected:", langCode);

        tgLangCode = langCode || 'en';

        const overrideLang = localStorage.getItem('user_lang_override');
        if (overrideLang && (overrideLang === 'ru' || overrideLang === 'en')) {
            currentLang = overrideLang;
        } else {
            const normalizedLang = tgLangCode.split('-')[0].toLowerCase();
            if (normalizedLang === 'ru' || normalizedLang === 'be' || normalizedLang === 'uk' || normalizedLang === 'kk') {
                currentLang = 'ru';
            } else {
                currentLang = 'en';
            }
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
        const allTranslations = (typeof TRANSLATIONS !== 'undefined') ? TRANSLATIONS : {};
        const dict = allTranslations[currentLang] || allTranslations['en'] || {};
        let text = dict[key];

        if (text === undefined) {
            text = (allTranslations['en'] && allTranslations['en'][key]) ? allTranslations['en'][key] : key;
        }

        if (typeof text !== 'string') {
            return text;
        }

        // Безопасная подстановка параметров без RegExp инъекций
        for (const [param, value] of Object.entries(params)) {
            text = text.split(`{${param}}`).join(value);
        }

        return text;
    }

    function setLang(lang) {
        if (lang === 'ru' || lang === 'en') {
            localStorage.setItem('user_lang_override', lang);
            currentLang = lang;
            document.documentElement.setAttribute('lang', currentLang);
            applyTranslationsToDOM();
            updateVersionDisplay();
        }
    }

    function applyTranslationsToDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');

            // Чтение JSON параметров
            let params = {};
            const paramsAttr = el.getAttribute('data-i18n-params');
            if (paramsAttr) {
                try { params = JSON.parse(paramsAttr); } catch (e) { }
            }

            const translatedText = translate(key, params);

            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translatedText;
            } else if (el.hasAttribute('placeholder') || el.tagName.toLowerCase() === 'textarea') {
                el.placeholder = translatedText;
            } else if (el.tagName.toLowerCase() === 'input' && el.type === 'placeholder') {
                // Старая логика в fallback
                el.placeholder = translatedText;
            } else {
                el.textContent = translatedText;
            }
        });
    }

    return {
        init: init,
        t: translate,
        getLang: () => currentLang,
        setLang: setLang,
        refresh: applyTranslationsToDOM
    };
})();
