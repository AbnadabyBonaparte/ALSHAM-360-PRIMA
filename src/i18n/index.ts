import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptBR from './locales/pt-BR.json'
import enUS from './locales/en-US.json'

const LANG_KEY = 'alsham-language'

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
  },
  lng: localStorage.getItem(LANG_KEY) || 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n

export function changeLanguage(lang: string) {
  i18n.changeLanguage(lang)
  localStorage.setItem(LANG_KEY, lang)
}
