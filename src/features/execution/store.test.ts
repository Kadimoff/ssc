import { describe, expect, it } from 'vitest'
import { SESSION_KEY } from '@/data/demo-client'
import { EXECUTION_STORE_KEY, ExecutionStore, loadExecutionState } from './store'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('execution demo store', () => {
  it('starts a fresh MVP demo with the platform persona', () => {
    const store = new ExecutionStore(new MemoryStorage())

    expect(store.getSnapshot().selectedPersona).toBe('platform_admin')
  })

  it('migrates legacy workflow keys additively', () => {
    const storage = new MemoryStorage()
    storage.setItem('ssc.goals.v1', JSON.stringify([{ title: 'Ship pilot', evidence: 'Signed scope', done: true }]))
    storage.setItem('ssc.savedStartups.v1', JSON.stringify(['routewise']))
    storage.setItem('ssc.investorCompare.v1', JSON.stringify(['greenstack']))
    storage.setItem('ssc.investorNotes.v1', JSON.stringify({ greenstack: 'Review pilot' }))

    const state = loadExecutionState(storage)

    expect(state.version).toBe(2)
    expect(state.milestones[0]).toMatchObject({ title: 'Ship pilot', progress: 100, status: 'complete' })
    expect(state.watchlist).toContain('routewise')
    expect(state.comparison).toEqual(['greenstack'])
    expect(state.investorNotes.greenstack).toBe('Review pilot')
    expect(storage.getItem(EXECUTION_STORE_KEY)).toBeTruthy()
  })

  it('falls back safely when current or legacy data is corrupt', () => {
    const storage = new MemoryStorage()
    storage.setItem(EXECUTION_STORE_KEY, '{broken')
    storage.setItem('ssc.goals.v1', 'not-json')

    const state = loadExecutionState(storage)

    expect(state.migration.recoveredCorruptData).toBe(true)
    expect(state.milestones.length).toBeGreaterThan(0)
  })

  it('persists persona selection and switches the seeded demo session', () => {
    const storage = new MemoryStorage()
    const store = new ExecutionStore(storage)

    store.selectPersona('investor')

    expect(store.getSnapshot().selectedPersona).toBe('investor')
    expect(storage.getItem(SESSION_KEY)).toBe('usr_8')
    expect(new ExecutionStore(storage).getSnapshot().selectedPersona).toBe('investor')
  })

  it('persists milestone, evidence, team, watch, compare, and intro transitions', () => {
    const storage = new MemoryStorage()
    const store = new ExecutionStore(storage)
    store.addMilestone({ startupSlug: 'campus-cart', title: 'Test transition', description: 'Test', ownerId: 'usr_9', dueAt: '2026-08-01', evidenceDefinition: 'One record', progress: 0, status: 'planned' })
    const milestone = store.getSnapshot().milestones[store.getSnapshot().milestones.length - 1]
    store.updateMilestone(milestone.id, { progress: 120, status: 'complete' })
    store.addEvidence({ startupSlug: 'campus-cart', milestoneId: milestone.id, title: 'Test evidence', kind: 'metric', note: 'One record', status: 'pending' })
    const evidence = store.getSnapshot().evidence[store.getSnapshot().evidence.length - 1]
    store.reviewEvidence(evidence.id, 'verified', 'Definition met')
    store.addMembership({ startupSlug: 'campus-cart', userId: 'local', name: 'Local Member', title: 'Engineer', kind: 'member' })
    store.toggleWatch('routewise')
    store.toggleCompare('greenstack')
    store.requestIntro('usr_8', 'campus-cart', 'Evidence and thesis align')

    const refreshed = new ExecutionStore(storage).getSnapshot()
    expect(refreshed.milestones.find((item) => item.id === milestone.id)?.progress).toBe(100)
    expect(refreshed.evidence.find((item) => item.id === evidence.id)).toMatchObject({ status: 'verified', reviewerNote: 'Definition met' })
    expect(refreshed.memberships.some((item) => item.userId === 'local')).toBe(true)
    expect(refreshed.watchlist).toContain('routewise')
    expect(refreshed.comparison).toContain('greenstack')
    expect(refreshed.introRequests).toHaveLength(1)
  })

  it('persists verification, mentor feedback, and program review decisions', () => {
    const storage = new MemoryStorage()
    const store = new ExecutionStore(storage)
    store.upsertVerification({ id: 'ver_test', userId: 'usr_3', institution: 'Test University', studentId: 'T-1', status: 'pending', submittedAt: '2026-07-29T00:00:00.000Z' })
    const session = store.getSnapshot().mentorSessions[0]
    store.updateSession(session.id, { status: 'complete', rating: 5, feedback: 'Clear next decision' })
    const application = store.getSnapshot().programApplications[0]
    store.reviewApplication(application.id, 'needs_changes', 'Add the source metric')

    const refreshed = new ExecutionStore(storage).getSnapshot()
    expect(refreshed.verificationRequests.find((item) => item.id === 'ver_test')?.status).toBe('pending')
    expect(refreshed.mentorSessions.find((item) => item.id === session.id)).toMatchObject({ status: 'complete', rating: 5 })
    expect(refreshed.programApplications.find((item) => item.id === application.id)).toMatchObject({ status: 'needs_changes', reviewerNote: 'Add the source metric' })
  })

  it('persists locally saved pilot inquiries and application drafts without changing the v2 key', () => {
    const storage = new MemoryStorage()
    const store = new ExecutionStore(storage)

    store.savePilotInquiry({ organization: 'Demo Innovation Office', role: 'Program lead', email: 'lead@example.edu', useCase: 'University entrepreneurship pilot', notes: 'Validate one cohort.' })
    store.saveApplicationDraft({ programId: 'prg_draft', programName: 'Demo program', startupSlug: 'campus-cart', applicantId: 'usr_9', answer: 'Draft evidence context' })

    const refreshed = new ExecutionStore(storage).getSnapshot()
    expect(refreshed.version).toBe(2)
    expect(refreshed.pilotInquiries[0]).toMatchObject({ organization: 'Demo Innovation Office', storage: 'local_demo' })
    expect(refreshed.programApplications.find((item) => item.programId === 'prg_draft')?.status).toBe('draft')
  })

  it('uses distinct seeded sessions for institutional demo personas', () => {
    const storage = new MemoryStorage()
    const store = new ExecutionStore(storage)
    const sessions: string[] = []

    for (const persona of ['program_admin', 'partner', 'platform_admin'] as const) {
      store.selectPersona(persona)
      sessions.push(storage.getItem(SESSION_KEY) ?? '')
    }

    expect(new Set(sessions).size).toBe(3)
  })
})
