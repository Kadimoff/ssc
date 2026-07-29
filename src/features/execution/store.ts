import { useSyncExternalStore } from 'react'
import { SESSION_KEY } from '@/data/demo-client'
import type {
  DetailedMilestone,
  ExecutionDemoState,
  ExecutionEvidence,
  MentorSession,
  OpenRole,
  PilotInquiry,
  PersonaId,
  PersonaPreset,
  ProgramApplication,
  StartupMembership,
  VerificationRequest,
} from './types'

export const EXECUTION_STORE_KEY = 'ssc.executionDemoState.v2'
const PERSONA_INITIALIZED_KEY = 'ssc.executionPersonaInitialized.v2'

export const personaPresets: PersonaPreset[] = [
  { id: 'student', label: 'Student · no startup', description: 'Explore teams, programs, and verification.', userId: 'usr_3', role: 'student' },
  { id: 'founder', label: 'Startup founder', description: 'Operate CampusCart and its evidence.', userId: 'usr_9', role: 'founder' },
  { id: 'member', label: 'Startup member', description: 'Contribute to team milestones.', userId: 'usr_10', role: 'student' },
  { id: 'mentor', label: 'Mentor', description: 'Run sessions and founder action items.', userId: 'usr_5', role: 'mentor' },
  { id: 'investor', label: 'Investor', description: 'Review evidence and request introductions.', userId: 'usr_8', role: 'investor' },
  { id: 'program_admin', label: 'University · program admin', description: 'Review applications and verification.', userId: 'usr_17', role: 'program_manager' },
  { id: 'partner', label: 'Partner operator', description: 'Track commitments and outcomes.', userId: 'usr_18', role: 'partner_admin' },
  { id: 'platform_admin', label: 'Platform administrator', description: 'Audit and govern the workspace.', userId: 'usr_19', role: 'platform_admin' },
]

const now = () => new Date().toISOString()
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

function safeArray<T>(storage: Storage, key: string): { value: T[]; corrupt: boolean } {
  const raw = storage.getItem(key)
  if (!raw) return { value: [], corrupt: false }
  try {
    const parsed = JSON.parse(raw)
    return { value: Array.isArray(parsed) ? parsed as T[] : [], corrupt: !Array.isArray(parsed) }
  } catch {
    return { value: [], corrupt: true }
  }
}

function safeRecord<T>(storage: Storage, key: string): { value: Record<string, T>; corrupt: boolean } {
  const raw = storage.getItem(key)
  if (!raw) return { value: {}, corrupt: false }
  try {
    const parsed = JSON.parse(raw)
    const valid = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    return { value: valid ? parsed as Record<string, T> : {}, corrupt: !valid }
  } catch {
    return { value: {}, corrupt: true }
  }
}

export function seedExecutionState(): ExecutionDemoState {
  return {
    version: 2,
    selectedPersona: 'platform_admin',
    memberships: [
      { id: 'mem_campus_founder', startupSlug: 'campus-cart', userId: 'usr_9', name: 'Aysel Mammadova', title: 'Founder & CEO', kind: 'founder' },
      { id: 'mem_campus_mobile', startupSlug: 'campus-cart', userId: 'usr_10', name: 'Murad Hasanli', title: 'Mobile Engineer', kind: 'member' },
    ],
    openRoles: [
      { id: 'role_backend', startupSlug: 'campus-cart', title: 'Backend co-founder', department: 'Engineering', commitment: '12–16 hrs/week', skills: ['Node.js', 'PostgreSQL', 'Payments'], status: 'open' },
    ],
    milestones: [
      { id: 'ms_interviews', startupSlug: 'campus-cart', title: 'Validate seller trust model', description: 'Complete ten structured seller interviews and record the go/no-go decision.', ownerId: 'usr_9', dueAt: '2026-08-08', evidenceDefinition: '10 interview notes and one decision summary', progress: 70, status: 'in_progress' },
      { id: 'ms_checkout', startupSlug: 'campus-cart', title: 'Complete safe checkout prototype', description: 'Test the end-to-end escrow concept with five students.', ownerId: 'usr_10', dueAt: '2026-08-18', evidenceDefinition: 'Prototype link, test script, and five observations', progress: 35, status: 'in_progress' },
      { id: 'ms_pilot', startupSlug: 'campus-cart', title: 'Confirm campus pilot', description: 'Agree success metrics and operating owner with one campus.', ownerId: 'usr_9', dueAt: '2026-09-01', evidenceDefinition: 'Named partner, owner, target dates, and success metric', progress: 0, status: 'planned' },
    ],
    evidence: [
      { id: 'ev_interviews', startupSlug: 'campus-cart', milestoneId: 'ms_interviews', title: 'Seller interview synthesis', kind: 'interview', note: 'Seven interviews completed; three remaining.', status: 'pending', submittedAt: '2026-07-26T10:00:00.000Z' },
      { id: 'ev_metric', startupSlug: 'greenstack', title: 'Campus energy pilot summary', kind: 'pilot', note: 'Illustrative pilot record with two faculties.', status: 'verified', submittedAt: '2026-07-22T09:00:00.000Z' },
    ],
    verificationRequests: [
      { id: 'ver_student', userId: 'usr_3', institution: '', studentId: '', status: 'draft' },
      { id: 'ver_pending', userId: 'usr_15', institution: 'Baku Engineering University', institutionalEmail: 'demo.student@university.example', applicantRole: 'student', supportingNote: 'Illustrative participant in a university venture-validation cohort.', consentAccepted: true, studentId: 'BEU-10428', document: { name: 'student-card.pdf', size: 284000, type: 'application/pdf' }, status: 'pending', submittedAt: '2026-07-28T12:00:00.000Z' },
    ],
    mentorSessions: [
      { id: 'session_1', mentorId: 'usr_5', mentorName: 'Tarlan Yusifzade', founderId: 'usr_9', startupSlug: 'campus-cart', topic: 'Marketplace validation', goal: 'Decide which trust risk to test before building payments.', startupContext: 'CampusCart is validating trusted student-to-student marketplace transactions.', challenge: 'The team has three competing trust risks and needs to prioritize one test.', expectedOutcome: 'Choose one risk, one test and a measurable decision rule.', scheduledAt: '2026-08-01T11:00:00.000Z', durationMinutes: 45, format: 'video', status: 'scheduled', actionItems: [{ id: 'action_1', text: 'Interview three repeat sellers', milestoneId: 'ms_interviews', ownerName: 'Aysel Mammadova', dueAt: '2026-08-05', complete: false }] },
    ],
    programApplications: [
      { id: 'app_1', programId: 'prg_1', programName: 'Student Venture Validation Sprint', startupSlug: 'campus-cart', applicantId: 'usr_9', answer: 'We will validate seller trust and safe checkout before expanding.', status: 'pending', submittedAt: '2026-07-27T10:00:00.000Z' },
    ],
    notifications: [
      { id: 'note_1', userId: 'usr_9', title: 'Evidence review pending', body: 'Seller interview synthesis is ready for reviewer feedback.', href: '/startups/campus-cart', kind: 'evidence', createdAt: '2026-07-28T09:00:00.000Z', read: false },
      { id: 'note_2', userId: 'usr_5', title: 'Founder action item due', body: 'CampusCart has one open item before your next session.', href: '/mentorship', kind: 'session', createdAt: '2026-07-28T08:00:00.000Z', read: false },
    ],
    watchlist: ['mediroute', 'greenstack', 'campus-cart'],
    comparison: [],
    investorPipeline: { mediroute: 'diligence', greenstack: 'meeting', 'campus-cart': 'screening', agrivision: 'sourced' },
    investorNotes: {},
    introRequests: [],
    pilotInquiries: [],
    startupDrafts: [],
    migration: { completedAt: now(), recoveredCorruptData: false },
  }
}

export function loadExecutionState(storage: Storage): ExecutionDemoState {
  const raw = storage.getItem(EXECUTION_STORE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<ExecutionDemoState>
      if (parsed.version === 2) return { ...seedExecutionState(), ...parsed, version: 2 }
    } catch {
      // Continue with additive legacy migration.
    }
  }

  const seed = seedExecutionState()
  const goals = safeArray<{ title?: string; evidence?: string; done?: boolean }>(storage, 'ssc.goals.v1')
  const saved = safeArray<string>(storage, 'ssc.savedStartups.v1')
  const drafts = safeArray<ExecutionDemoState['startupDrafts'][number]>(storage, 'ssc.createdStartups.v1')
  const bookings = safeArray<string>(storage, 'ssc.mentorBookings.v1')
  const watchlist = safeArray<string>(storage, 'ssc.investorWatchlist.v1')
  const comparison = safeArray<string>(storage, 'ssc.investorCompare.v1')
  const pipeline = safeRecord<string>(storage, 'ssc.investorPipeline.v1')
  const notes = safeRecord<string>(storage, 'ssc.investorNotes.v1')
  const intros = safeArray<string>(storage, 'ssc.investorIntros.v1')
  const corrupt = [goals, saved, drafts, bookings, watchlist, comparison, pipeline, notes, intros].some((item) => item.corrupt) || Boolean(raw)

  if (goals.value.length) {
    seed.milestones = goals.value.map((goal, index) => ({
      id: `legacy_goal_${index}`,
      startupSlug: 'campus-cart',
      title: String(goal.title || 'Untitled milestone'),
      description: 'Migrated from the previous goals workspace.',
      ownerId: 'usr_9',
      dueAt: '2026-09-01',
      evidenceDefinition: String(goal.evidence || 'Evidence definition pending'),
      progress: goal.done ? 100 : 0,
      status: goal.done ? 'complete' : 'planned',
    }))
  }
  seed.watchlist = [...new Set([...seed.watchlist, ...saved.value, ...watchlist.value])]
  seed.comparison = [...new Set(comparison.value)]
  seed.investorPipeline = { ...seed.investorPipeline, ...pipeline.value }
  seed.investorNotes = notes.value
  seed.startupDrafts = drafts.value
  for (const mentorId of bookings.value) {
    if (!seed.mentorSessions.some((session) => session.mentorId === mentorId)) {
      seed.mentorSessions.push({ id: uid('session'), mentorId, mentorName: 'SSC mentor', founderId: 'usr_9', startupSlug: 'campus-cart', topic: 'Migrated booking', goal: 'Define the next decision.', scheduledAt: '2026-08-08T10:00:00.000Z', durationMinutes: 30, format: 'video', status: 'scheduled', actionItems: [] })
    }
  }
  seed.introRequests = intros.value.map((startupSlug) => ({ id: uid('intro'), investorId: 'usr_8', startupSlug, reason: 'Migrated introduction request.', status: 'requested', createdAt: now() }))
  seed.migration = { completedAt: now(), recoveredCorruptData: corrupt }
  storage.setItem(EXECUTION_STORE_KEY, JSON.stringify(seed))
  return seed
}

export class ExecutionStore {
  private state: ExecutionDemoState
  private listeners = new Set<() => void>()

  constructor(private storage: Storage) {
    this.state = loadExecutionState(storage)
  }

  getSnapshot = () => this.state
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }

  private commit(next: ExecutionDemoState) {
    this.state = next
    this.storage.setItem(EXECUTION_STORE_KEY, JSON.stringify(next))
    this.listeners.forEach((listener) => listener())
  }

  update(recipe: (state: ExecutionDemoState) => ExecutionDemoState) {
    this.commit(recipe(this.state))
  }

  selectPersona(persona: PersonaId) {
    const preset = personaPresets.find((item) => item.id === persona)
    if (!preset) return
    this.storage.setItem(SESSION_KEY, preset.userId)
    this.commit({ ...this.state, selectedPersona: persona })
  }

  addMembership(input: Omit<StartupMembership, 'id'>) {
    this.commit({ ...this.state, memberships: [...this.state.memberships, { ...input, id: uid('member') }] })
  }
  removeMembership(id: string) {
    this.commit({ ...this.state, memberships: this.state.memberships.filter((item) => item.id !== id) })
  }
  updateMembership(id: string, patch: Partial<StartupMembership>) {
    this.commit({ ...this.state, memberships: this.state.memberships.map((item) => item.id === id ? { ...item, ...patch } : item) })
  }
  addRole(input: Omit<OpenRole, 'id'>) {
    this.commit({ ...this.state, openRoles: [...this.state.openRoles, { ...input, id: uid('role') }] })
  }
  updateRole(id: string, patch: Partial<OpenRole>) {
    this.commit({ ...this.state, openRoles: this.state.openRoles.map((item) => item.id === id ? { ...item, ...patch } : item) })
  }
  addMilestone(input: Omit<DetailedMilestone, 'id'>) {
    this.commit({ ...this.state, milestones: [...this.state.milestones, { ...input, id: uid('milestone') }] })
  }
  updateMilestone(id: string, patch: Partial<DetailedMilestone>) {
    this.commit({ ...this.state, milestones: this.state.milestones.map((item) => item.id === id ? { ...item, ...patch, progress: Math.min(100, Math.max(0, patch.progress ?? item.progress)) } : item) })
  }
  addEvidence(input: Omit<ExecutionEvidence, 'id' | 'submittedAt'>) {
    this.commit({ ...this.state, evidence: [...this.state.evidence, { ...input, id: uid('evidence'), submittedAt: now() }] })
  }
  reviewEvidence(id: string, status: ExecutionEvidence['status'], reviewerNote: string) {
    this.commit({ ...this.state, evidence: this.state.evidence.map((item) => item.id === id ? { ...item, status, reviewerNote } : item) })
  }
  upsertVerification(request: VerificationRequest) {
    const exists = this.state.verificationRequests.some((item) => item.id === request.id)
    this.commit({ ...this.state, verificationRequests: exists ? this.state.verificationRequests.map((item) => item.id === request.id ? request : item) : [...this.state.verificationRequests, request] })
  }
  addSession(input: Omit<MentorSession, 'id' | 'status' | 'actionItems'>) {
    this.commit({ ...this.state, mentorSessions: [...this.state.mentorSessions, { ...input, id: uid('session'), status: 'scheduled', actionItems: [] }] })
  }
  updateSession(id: string, patch: Partial<MentorSession>) {
    this.commit({ ...this.state, mentorSessions: this.state.mentorSessions.map((item) => item.id === id ? { ...item, ...patch } : item) })
  }
  addApplication(input: Omit<ProgramApplication, 'id' | 'status' | 'submittedAt'>) {
    this.commit({ ...this.state, programApplications: [...this.state.programApplications, { ...input, id: uid('application'), status: 'pending', submittedAt: now() }] })
  }
  saveApplicationDraft(input: Omit<ProgramApplication, 'id' | 'status' | 'submittedAt'>) {
    const existing = this.state.programApplications.find((item) => item.programId === input.programId && item.applicantId === input.applicantId && item.startupSlug === input.startupSlug)
    if (existing) {
      this.commit({ ...this.state, programApplications: this.state.programApplications.map((item) => item.id === existing.id ? { ...item, ...input, status: 'draft' } : item) })
      return
    }
    this.commit({ ...this.state, programApplications: [...this.state.programApplications, { ...input, id: uid('application'), status: 'draft', submittedAt: now() }] })
  }
  updateApplication(id: string, patch: Partial<ProgramApplication>) {
    this.commit({ ...this.state, programApplications: this.state.programApplications.map((item) => item.id === id ? { ...item, ...patch } : item) })
  }
  reviewApplication(id: string, status: ProgramApplication['status'], reviewerNote: string) {
    this.commit({ ...this.state, programApplications: this.state.programApplications.map((item) => item.id === id ? { ...item, status, reviewerNote } : item) })
  }
  toggleWatch(slug: string) {
    const watchlist = this.state.watchlist.includes(slug) ? this.state.watchlist.filter((item) => item !== slug) : [...this.state.watchlist, slug]
    this.commit({ ...this.state, watchlist })
  }
  toggleCompare(slug: string) {
    const comparison = this.state.comparison.includes(slug) ? this.state.comparison.filter((item) => item !== slug) : this.state.comparison.length < 3 ? [...this.state.comparison, slug] : this.state.comparison
    this.commit({ ...this.state, comparison })
  }
  requestIntro(investorId: string, startupSlug: string, reason: string) {
    if (this.state.introRequests.some((item) => item.investorId === investorId && item.startupSlug === startupSlug)) return
    this.commit({ ...this.state, introRequests: [...this.state.introRequests, { id: uid('intro'), investorId, startupSlug, reason, status: 'requested', createdAt: now() }] })
  }
  savePilotInquiry(input: Omit<PilotInquiry, 'id' | 'createdAt' | 'storage'>) {
    this.commit({ ...this.state, pilotInquiries: [...this.state.pilotInquiries, { ...input, id: uid('pilot'), createdAt: now(), storage: 'local_demo' }] })
  }
  markNotification(id: string) {
    this.commit({ ...this.state, notifications: this.state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })
  }
}

let browserStore: ExecutionStore | undefined
export function getExecutionStore() {
  if (!browserStore) {
    browserStore = new ExecutionStore(window.localStorage)
    const demoMode = window.localStorage.getItem('studentStartupCommunityMode') !== 'api'
    if (demoMode && !window.localStorage.getItem(PERSONA_INITIALIZED_KEY)) {
      const preset = personaPresets.find((item) => item.id === browserStore?.getSnapshot().selectedPersona)
      if (preset) window.localStorage.setItem(SESSION_KEY, preset.userId)
      window.localStorage.setItem(PERSONA_INITIALIZED_KEY, '1')
    }
  }
  return browserStore
}

export function useExecutionStore() {
  const store = getExecutionStore()
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return { state, store }
}
