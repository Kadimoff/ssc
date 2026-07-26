import { describe, expect, test } from 'bun:test'

process.env.DATABASE_URL ??= 'postgres://ssc:ssc_dev_password@127.0.0.1:5432/ssc'
process.env.JWT_SECRET ??= 'test-only-secret-that-is-at-least-32-characters'

const {
  detectAssistantIntent, extractAssistantCriteria, fingerprintPrompt, redactPromptPII,
} = await import('./lib/assistant')

describe('assistant privacy and deterministic extraction', () => {
  test('redacts email addresses and phone numbers before provider use', () => {
    const value = redactPromptPII('Contact me at founder@example.com or +994 50 123 45 67 for a backend teammate')
    expect(value).not.toContain('founder@example.com')
    expect(value).not.toContain('+994 50 123 45 67')
    expect(value).toContain('[redacted-email]')
    expect(value).toContain('[redacted-phone]')
  })

  test('detects Turkish and Azerbaijani teammate searches', () => {
    expect(detectAssistantIntent('Backend ekip arkadaşı arıyorum')).toBe('find_teammate')
    expect(detectAssistantIntent('Komanda yoldaşı və Python developer axtarıram')).toBe('find_teammate')
  })

  test('extracts bounded structured criteria without retaining the sentence', () => {
    const criteria = extractAssistantCriteria('Baku’da Python backend teammate for a ClimateTech MVP above 75%')
    expect(criteria.skills).toContain('Backend')
    expect(criteria.sectors).toContain('ClimateTech')
    expect(criteria.stages).toContain('MVP')
    expect(criteria.minReadiness).toBe(75)
    expect(criteria.location).toBe('baku')
    expect(criteria).not.toHaveProperty('prompt')
  })

  test('creates a stable one-way fingerprint', async () => {
    const first = await fingerprintPrompt('private query')
    expect(first).toHaveLength(64)
    expect(await fingerprintPrompt('private query')).toBe(first)
    expect(first).not.toContain('private query')
  })
})
