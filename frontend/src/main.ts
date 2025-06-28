import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import scrollFade from './directives/scroll-fade'
import './assets/css/main.css'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import it from './locales/it.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import { watch } from 'vue'

const savedLocale = localStorage.getItem('fw-locale');
const getBrowserLocale = () => {
  const lang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  return lang.split('-')[0];
};
const supported = ['en', 'it', 'fr', 'de'];
const browserLocale = getBrowserLocale();
const defaultLocale = savedLocale && supported.includes(savedLocale)
  ? savedLocale
  : (supported.includes(browserLocale) ? browserLocale : 'en');

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en: en as any,
    it: it as any,
    fr: fr as any,
    de: de as any
  }
})

// Persist locale on change
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.directive('scroll-fade', scrollFade)
app.use(router)
app.use(i18n)

// Watch for language changes and persist
watch(i18n.global.locale, (newLocale) => {
  localStorage.setItem('fw-locale', newLocale)
})

app.mount('#app')
