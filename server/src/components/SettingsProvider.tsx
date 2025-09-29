'use client'
import type { Settings } from '@/utils/settings'
import { createContext, PropsWithChildren, useContext } from 'react'

export const SettingsContext = createContext<Settings | null>(null)
export function useSettings(): Settings {
  return useContext(SettingsContext)!
}

export function SettingsProvider({ value, children }: PropsWithChildren<{ value: Settings }>) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
