export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'ssc.theme.v1'
export const THEME_CHANGE_EVENT = 'ssc-theme-change'

export function resolveTheme(value: string | null | undefined): Theme {
  return value === 'light' ? 'light' : 'dark'
}

export function readTheme(storage: Pick<Storage, 'getItem'> = window.localStorage): Theme {
  try {
    return resolveTheme(storage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function setTheme(theme: Theme) {
  applyTheme(theme)
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The visual choice still applies when browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }))
}

export function toggleTheme(current: Theme) {
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
