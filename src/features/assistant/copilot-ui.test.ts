import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./copilot.tsx', import.meta.url), 'utf8')

describe('SSC Copilot interaction shell', () => {
  it('renders outside the blurred header and keeps an accessible viewport-fixed panel', () => {
    expect(source).toContain('createPortal')
    expect(source).toContain('document.body')
    expect(source).toContain("role='dialog'")
    expect(source).toContain("aria-modal='false'")
  })

  it('supports a persistent multi-turn conversation with retry and clearing', () => {
    expect(source).toContain('readCopilotConversation')
    expect(source).toContain("turn.status === 'loading'")
    expect(source).toContain("turn.status === 'complete'")
    expect(source).toContain("turn.status === 'error'")
    expect(source).toContain('retry(turn)')
    expect(source).toContain('clearConversation')
  })

  it('provides orb morph animation and reduced-motion behavior', () => {
    expect(source).toContain("transformOrigin: 'bottom right'")
    expect(source).toContain("ease: 'expo.out'")
    expect(source).toContain('useReducedMotion')
    expect(source).toContain("event.key === 'Escape'")
  })
})
