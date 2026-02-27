const i18n = (function () {
    let currentLang = 'en';

    function init() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            const langCode = window.Telegram.WebApp.initDataUnsafe.user.language_code;
            if (langCode === 'ru' || langCode === 'be' || langCode === 'uk' || langCode === 'kk') {
                currentLang = 'ru';
            } else {
                currentLang = 'en';
            }
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
