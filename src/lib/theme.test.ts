import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readTheme, resolveTheme, THEME_STORAGE_KEY } from './theme'

describe('persistent theme preference', () => {
  it('uses dark only when no explicit valid light choice exists', () => {
    expect(resolveTheme(null)).toBe('dark')
    expect(resolveTheme('dark')).toBe('dark')
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('unexpected')).toBe('dark')
  })

  it('reads the saved browser preference', () => {
    expect(readTheme({ getItem: (key) => key === THEME_STORAGE_KEY ? 'light' : null })).toBe('light')
    expect(readTheme({ getItem: () => 'dark' })).toBe('dark')
  })

  it('applies the stored theme before the application renders', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    expect(html).toContain("localStorage.getItem('ssc.theme.v1')")
    expect(html.indexOf("localStorage.getItem('ssc.theme.v1')")).toBeLessThan(html.indexOf('<script type="module"'))
    expect(html).not.toContain('<html lang="en" class="dark">')
  })
})
