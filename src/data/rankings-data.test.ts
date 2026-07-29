import { describe, expect, it } from 'vitest'
import { normalizeRankingEntry, startupRankings } from './rankings-data'

describe('ranking data normalization', () => {
  it('clamps invalid scores and supplies explicit metadata fallbacks', () => {
    const entry = normalizeRankingEntry({
      slug: 'safe-row',
      name: 'Safe Row',
      score: Number.NaN,
      change: Number.POSITIVE_INFINITY,
      periodScores: { '30d': 140, quarter: -10, all: Number.NaN },
    })

    expect(entry).toMatchObject({
      score: 0,
      change: 0,
      university: 'University not recorded',
      sector: 'Uncategorized',
      stage: 'Not recorded',
      periodScores: { '30d': 100, quarter: 0, all: 0 },
    })
  })

  it('removes records that cannot render a stable venture identity', () => {
    expect(normalizeRankingEntry({ slug: '', name: 'Missing slug' })).toBeNull()
    expect(normalizeRankingEntry({ slug: 'missing-name', name: '  ' })).toBeNull()
    expect(startupRankings.every((entry) => entry.slug.length > 0 && entry.name.length > 0)).toBe(true)
  })
})
