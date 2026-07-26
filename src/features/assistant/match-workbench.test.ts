import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { seedState } from '@/data/demo-client'
import { mentors, startups } from '@/data/platform-content'
import { buildContextualMatchPrompt } from './match-context'
import { runAssistant } from './engine'
import { assistantContextFromSnapshot } from './types'

describe('AI Match workbench', () => {
  it('combines startup context with multiple independent requirements', () => {
    const startup = startups.find((item) => item.slug === 'campus-cart')
    const prompt = buildContextualMatchPrompt(startup, [
      'Backend developer with Node.js and PostgreSQL',
      'Open to a co-founder role',
      'Baku or remote',
    ])
    expect(prompt).toContain('Startup context: CampusCart')
    expect(prompt).toContain('Backend Engineer')
    expect(prompt).toContain('Open to a co-founder role')
    expect(prompt).toContain('Baku or remote')
  })

  it('uses the combined context to rank a relevant teammate', () => {
    const state = seedState()
    const snapshot = { ...state, currentUser: state.users.find((user) => user.id === 'usr_9') ?? null }
    const prompt = buildContextualMatchPrompt(
      startups.find((item) => item.slug === 'campus-cart'),
      ['Backend developer', 'Node.js and PostgreSQL', 'Open to startup projects'],
    )
    const response = runAssistant(prompt, assistantContextFromSnapshot(snapshot, startups, mentors, false), 'find_teammate')
    expect(response.criteria.skills).toContain('Backend')
    expect(response.results.slice(0, 5).some((result) => ['Orkhan Nabiyev', 'Samir Rustamli'].includes(result.title))).toBe(true)
  })

  it('is embedded only in relevant discovery workflows', () => {
    for (const path of [
      '../../pages/network/index.tsx',
      '../../pages/startups/index.tsx',
      '../../pages/mentorship/index.tsx',
      '../../pages/jobs/index.tsx',
      '../../pages/search/index.tsx',
    ]) {
      expect(readFileSync(new URL(path, import.meta.url), 'utf8')).toContain('<MatchWorkbench')
    }
    const investor = readFileSync(new URL('../../pages/investors/index.tsx', import.meta.url), 'utf8')
    expect(investor).toContain('Deal pipeline')
    expect(investor).toContain('verifiedEvidenceOnly')
    expect(investor).toContain('InvestorPipeline')
  })
})
