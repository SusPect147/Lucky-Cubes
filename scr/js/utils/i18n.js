const i18n = (function () {
    let currentLang = 'en';

    function init() {
        let langCode = 'en';

        // Read language_code from initDataUnsafe first (which might be cached by Telegram)
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            langCode = window.Telegram.WebApp.initDataUnsafe.user.language_code;
        }

        // Override with navigator.language because it updates immediately when the app language changes, avoiding the WebApp initData cache
        if (navigator.language) {
            langCode = navigator.language.toLowerCase().substring(0, 2);
        }

        if (langCode === 'ru' || langCode === 'be' || langCode === 'uk' || langCode === 'kk') {
            currentLang = 'ru';
        } else {
            currentLang = 'en';
        }

        document.documentElement.setAttribute('lang', currentLang);
        applyTranslationsToDOM();
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
