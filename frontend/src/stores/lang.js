import { defineStore } from 'pinia';
import { ref } from 'vue';
import hu from '@/i18n/hu.js';
import en from '@/i18n/en.js';

const locales = { hu, en };

export const useLangStore = defineStore('lang', () => {
  const lang = ref(localStorage.getItem('aika_lang') || 'hu');

  function setLang(l) {
    lang.value = l;
    localStorage.setItem('aika_lang', l);
  }

  /** Translate key (dot notation). Supports {param} interpolation. */
  function t(key, params) {
    const locale = locales[lang.value] || locales.hu;
    let str = key.split('.').reduce((o, k) => o?.[k], locale);
    if (str === undefined || str === null) return key;
    if (params && typeof str === 'string') {
      str = str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? _);
    }
    return str;
  }

  /** Number formatter matching current locale */
  function n(num) {
    return Number(num).toLocaleString(lang.value === 'hu' ? 'hu' : 'en-US');
  }

  return { lang, setLang, t, n };
});
