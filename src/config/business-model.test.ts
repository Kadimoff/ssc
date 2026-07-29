import { describe, expect, it } from 'vitest'
import { businessPackages, trustCommitments } from './business-model'

describe('public business model', () => {
  it('publishes the five approved packages without numeric pricing', () => {
    expect(businessPackages.map((plan) => plan.publicLabel)).toEqual([
      'Students & Founders',
      'Institutional Pilot',
      'Campus Platform',
      'Multi-campus / Consortium',
      'Program Operations',
    ])
    expect(businessPackages[0].publicPrice).toBe('Free')
    expect(businessPackages.slice(1).every((plan) => !/\d|[$€£₼]/.test(plan.publicPrice))).toBe(true)
    expect(businessPackages.every((plan) => plan.active && plan.public && !plan.assumption)).toBe(true)
  })

  it('keeps prohibited monetization out of the public model', () => {
    const copy = JSON.stringify({ businessPackages, trustCommitments }).toLowerCase()

    expect(copy).toContain('no sale of student')
    expect(copy).toContain('no paid ranking')
    expect(copy).toContain('no default founder equity')
    expect(copy).not.toContain('checkout')
  })
})
