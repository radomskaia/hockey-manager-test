import { createI18n } from 'vue-i18n'

import { en } from '@/locales/en'
import { ru } from '@/locales/ru'

const messages = { ru, en }

export type AppLocale = keyof typeof messages

export const LOCALES = Object.keys(messages) as AppLocale[]

export const i18n = createI18n({
  legacy: false,
  locale: 'ru' satisfies AppLocale,
  fallbackLocale: 'en' satisfies AppLocale,
  messages,
})
