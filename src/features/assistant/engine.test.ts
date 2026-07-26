import { describe, expect, it } from 'vitest'
import { seedState } from '@/data/demo-client'
import { mentors, startups } from '@/data/platform-content'
import { assistantContextFromSnapshot } from './types'
import { detectAssistantIntent, extractAssistantCriteria, runAssistant } from './engine'

function context(includeOrganizations = false) {
  const state = seedState()
  return assistantContextFromSnapshot({ ...state, currentUser: state.users[0] }, startups, mentors, includeOrganizations)
}

describe('SSC assistant matching', () => {
  it('understands Turkish teammate requests and ranks backend-capable profiles first', () => {
    const response = runAssistant('Backend developer takım arkadaşı arıyorum', context())
    expect(response.intent).toBe('find_teammate')
    expect(response.criteria.skills).toContain('Backend')
    expect(response.results[0]?.title).toBe('Kamran Vali')
    expect(response.results[0]?.explanation.matchedSignals).toContain('Backend skills')
  })

  it('understands Azerbaijani mentor requests', () => {
    const response = runAssistant('Fundraising üzrə mentor lazımdır', context())
    expect(response.intent).toBe('find_mentor')
    expect(response.criteria.skills).toEqual(['Fundraising'])
    expect(response.results[0]?.title).toBe('Tarlan Yusifzade')
  })

  it('extracts an investor thesis and explains the strongest venture', () => {
    const response = runAssistant('MVP ClimateTech venture above 80% readiness', context(), 'investor_discovery')
    expect(response.criteria.sectors).toContain('ClimateTech')
    expect(response.criteria.stages).toContain('MVP')
    expect(response.criteria.minReadiness).toBe(80)
    expect(response.criteria.completeTeam).toBe(false)
    expect(response.results[0]?.title).toBe('GreenStack')
    expect(response.results[0]?.explanation.scoreBreakdown).toHaveProperty('evidence')
  })

  it('does not expose organization matches when partnership access is unavailable', () => {
    const response = runAssistant('Find a university partner', context(false))
    expect(response.intent).toBe('find_partner')
    expect(response.results).toHaveLength(0)
  })

  it('normalizes multilingual text without changing deterministic intent', () => {
    expect(detectAssistantIntent('Komanda yoldaşı tap')).toBe('find_teammate')
    expect(detectAssistantIntent('Yatırım için startup ara')).toBe('investor_discovery')
    expect(extractAssistantCriteria('Remote AI mühendisi')).toMatchObject({ skills: ['AI / ML'], location: 'remote' })
    expect(extractAssistantCriteria('MVP startup with a complete team')).toMatchObject({ stages: ['MVP'], completeTeam: true })
  })
})
