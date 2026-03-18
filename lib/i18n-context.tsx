'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from '@/messages/en.json'
import rw from '@/messages/rw.json'
import fr from '@/messages/fr.json'

export type Locale = 'en' | 'rw' | 'fr'

const messages = { en, rw, fr } as const

type Messages = typeof en
type DeepKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? DeepKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`
}[keyof T]

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
})

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current === undefined || current === null) return path
    current = current[key]
  }
  return typeof current === 'string' ? current : path
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('rdc-locale') as Locale | null
    if (saved && ['en', 'rw', 'fr'].includes(saved)) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('rdc-locale', newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const t = useCallback((key: string): string => {
    return getNestedValue(messages[locale], key) || getNestedValue(messages.en, key) || key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
