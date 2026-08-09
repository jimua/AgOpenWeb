import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n'

register('en', () => import('./locales/en.json'))
register('uk', () => import('./locales/uk.json'))

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('seeder.lang') : null

init({
  fallbackLocale: 'en',
  initialLocale: saved || getLocaleFromNavigator() || 'en',
})

export function setLanguage(code: 'en' | 'uk') {
  localStorage.setItem('seeder.lang', code)
  locale.set(code)
}
