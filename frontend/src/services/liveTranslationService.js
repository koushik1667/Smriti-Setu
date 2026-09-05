/**
 * Live Full-Page Neural Translation Engine
 * Translates 100% of DOM content, dynamic medicine descriptions,
 * headers, buttons, and alerts on the fly into Indian languages.
 */

class LiveTranslationService {
  constructor() {
    this.isInitialized = false;
    this.currentLang = 'en';
    this.initGoogleTranslator();
  }

  /**
   * Initializes the Google Live Translate Element dynamically
   */
  initGoogleTranslator() {
    if (typeof window === 'undefined') return;

    // Check if script is already present
    if (document.getElementById('google-translate-script')) {
      this.isInitialized = true;
      return;
    }

    // Hidden container for Google Translate
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.appendChild(div);
    }

    // Callback when Google script loads
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'te,hi,ta,kn,bn,mr,en',
            autoDisplay: false
          },
          'google_translate_element'
        );
        this.isInitialized = true;

        // Apply saved language if any
        const saved = localStorage.getItem('pharmavision_lang');
        if (saved && saved !== 'en') {
          setTimeout(() => this.triggerDomTranslation(saved), 600);
        }
      } catch (e) {
        console.warn('[LiveTranslation] Init element error:', e);
      }
    };

    // Inject Google Translate script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }

  /**
   * Programmatically switches the full DOM language live
   */
  triggerDomTranslation(langCode) {
    if (typeof window === 'undefined') return;

    this.currentLang = langCode;

    // Set Google translate cookie for persistent page loads
    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      const cookieVal = `/en/${langCode}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
    }

    // Trigger select element in Google Translate iframe/combo
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      // Retry once after short delay if combo is still rendering
      setTimeout(() => {
        const retryCombo = document.querySelector('.goog-te-combo');
        if (retryCombo) {
          retryCombo.value = langCode;
          retryCombo.dispatchEvent(new Event('change'));
        }
      }, 500);
    }
  }

  /**
   * Translates arbitrary dynamic text via the backend AI endpoint with local caching
   */
  async translateText(text, targetLang = 'te') {
    if (!text || targetLang === 'en') return text;

    // Check local storage cache first for instant response
    const cacheKey = `trans_${targetLang}_${text.substring(0, 40)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.translatedText || text;
        localStorage.setItem(cacheKey, translated);
        return translated;
      }
    } catch (e) {
      console.warn('[LiveTranslationService] Remote translate error:', e.message);
    }

    return text;
  }
}

export const liveTranslationService = new LiveTranslationService();
