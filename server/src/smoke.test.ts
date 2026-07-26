import { describe, expect, test } from 'bun:test'
import { organization, outcome } from './lib/schemas'

describe('partnership contracts', () => {
  test('rejects an organization without a country code', () => {
    expect(organization.safeParse({ type: 'company', legalName: 'A', displayName: 'A', slug: 'a' }).success).toBe(false)
  })
  test('requires evidence for reportable outcomes', () => {
    expect(outcome.safeParse({
      programId: 'prg_1', type: 'mvp_completed', attributionMode: 'shared',
      supportingPartnerIds: [], confidenceScore: 0.8, evidenceIds: [], achievedAt: '2026-01-01',
    }).success).toBe(false)
  })
})
