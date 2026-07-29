import { describe, expect, it } from 'vitest'
import { workspaceKindFor } from './workspace'

describe('role-aware workspace mapping', () => {
  it.each([
    ['student', undefined, 'student'],
    ['founder', undefined, 'startup'],
    ['mentor', undefined, 'mentor'],
    ['investor', undefined, 'investor'],
    ['program_manager', undefined, 'institution'],
    ['partner_admin', undefined, 'institution'],
    ['platform_admin', undefined, 'platform'],
    ['student', 'member', 'startup'],
  ] as const)('maps %s / %s to %s', (role, persona, expected) => {
    expect(workspaceKindFor(role, persona)).toBe(expected)
  })
})
