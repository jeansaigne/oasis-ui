import { createI18n } from 'vue-i18n'
import fr from '@/locales/fr.json'
import en from '@/locales/en.json'

function getDefaultLocale(): string {
  const saved = localStorage.getItem('locale')
  if (saved && ['fr', 'en'].includes(saved)) return saved
  const browserLang = navigator.language
  return browserLang.startsWith('fr') ? 'fr' : 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'fr',
  messages: { fr, en },
})

export default i18n

