import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import en from '@/i18n/en.js';
import hu from '@/i18n/hu.js';

const langs = { en, hu };

export const useLangStore = defineStore('lang', () => {
  const lang  = ref(localStorage.getItem('aika_lang') || 'hu');
  const theme = ref(localStorage.getItem('aika_theme') || 'dark');

  function setLang(newLang) {
    if (langs[newLang]) {
      lang.value = newLang;
      localStorage.setItem('aika_lang', newLang);
      document.documentElement.lang = newLang;
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('aika_theme', theme.value);
    document.documentElement.setAttribute('data-theme', theme.value);
  }

  function t(key, replacements = {}) {
    const keys = key.split('.');
    let text = langs[lang.value];
    for (const k of keys) {
      if (text[k] === undefined) return key;
      text = text[k];
    }
    for (const [r, v] of Object.entries(replacements)) {
      text = text.replace(`{${r}}`, v);
    }
    return text;
  }

  function n(num) {
    return num.toLocaleString(lang.value);
  }

  // Set initial attributes
  document.documentElement.lang = lang.value;
  document.documentElement.setAttribute('data-theme', theme.value);
  
  return { lang, theme, t, n, setLang, toggleTheme };
});
