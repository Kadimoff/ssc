import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./copilot.tsx', import.meta.url), 'utf8')
const appShellSource = readFileSync(new URL('../../app/app-shell.tsx', import.meta.url), 'utf8')

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

  it('supports guests through local matching without opening protected APIs', () => {
    expect(source).not.toContain('if (!user) return null')
    expect(source).toContain('user')
    expect(source).toContain('? await apiClient.assistantQuery(query)')
    expect(source).toContain(': runAssistant(query, assistantContextFromSnapshot(snapshot, startups, mentors, false))')
  })

  it('uses a single Copilot trigger beside Lets Start', () => {
    expect(appShellSource).toContain('{data && <Copilot snapshot={data} />}\n          <LetsStart />')
    expect(appShellSource).not.toContain("{ to: '/assistant', label: 'Copilot'")
    expect(source).not.toContain("className='group fixed bottom-20 right-4")
  })
})
