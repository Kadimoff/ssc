import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ecosystemMetrics, featuredMembers } from './data/landing-content'

describe('execution-first landing page', () => {
  it('renders the approved information hierarchy before community', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const sections = [
      'hero',
      'workflow',
      'stakeholders',
      'workspace-preview',
      'evidence',
      'programs',
      'institutional',
      'investor',
      'community',
      'business-model',
      'pilot',
      'final-cta',
      'demo-disclaimer',
      'footer',
    ]
    const positions = sections.map((section) => source.indexOf(`data-landing-section='${section}'`))

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
  })

  it('states the execution promise, free access, buyer and pilot path', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Turn university ideas into')
    expect(source).toContain('Free for students')
    expect(source).toContain('A model that keeps SSC free for students.')
    expect(source).toContain('Institutions, program operators, consortiums and partner organizations')
    expect(source).toContain('Start with one program, not a platform-wide rollout.')
    expect(source).toContain('8–12 week')
    expect(source).toContain('saves locally and does not transmit data')
  })

  it('labels demo proof visibly and removes unsupported public traction metrics', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')

    expect(source).toContain("label='Illustrative workspace'")
    expect(source).toContain("data-landing-section='demo-disclaimer'")
    expect(source).not.toMatch(/1,200\+|18 universities|45\+|trusted by/i)
    expect(ecosystemMetrics.every((metric) => !/^\d/.test(metric.value))).toBe(true)
  })

  it('uses only local portraits and an explicit initials fallback', () => {
    const urls = featuredMembers.map((member) => member.avatarUrl).filter(Boolean)

    expect(urls.every((url) => !/^https?:/i.test(url))).toBe(true)
    expect(new Set(urls).size).toBe(urls.length)
    expect(featuredMembers.some((member) => !member.avatarUrl)).toBe(true)
  })

  it('keeps the responsive mobile menu and reduced-motion styling', () => {
    const source = readFileSync(new URL('./pages/landing/index.tsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

    expect(source).toContain("title='Explore SSC'")
    expect(source).toContain("aria-label='Mobile landing navigation'")
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toContain('.responsive-dialog')
  })
})
