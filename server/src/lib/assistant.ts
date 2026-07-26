import { and, eq, inArray, ne } from 'drizzle-orm'
import { z } from 'zod'
import { db, sql as postgres } from '../db/client'
import {
  assistantQueries, jobs, mentorProfiles, organizations, programs, startupMembers,
  startupMilestones, startupRoles, startups, users,
} from '../db/schema'
import type { AuthUser } from './platform'
import { newId } from './platform'
import { assistantCriteria, assistantIntent } from './schemas'

export type AssistantIntent = z.infer<typeof assistantIntent>
export type AssistantCriteria = z.infer<typeof assistantCriteria>
export type AssistantEntityType = 'person' | 'mentor' | 'job' | 'startup' | 'program' | 'organization' | 'guide'

export interface AssistantResult {
  entityType: AssistantEntityType
  entityId: string
  title: string
  subtitle: string
  description: string
  href: string
  tags: string[]
  explanation: {
    totalScore: number
    confidence: 'low' | 'medium' | 'high'
    matchedSignals: string[]
    missingSignals: string[]
    scoreBreakdown: Record<string, number>
  }
}

const intentTerms: Array<[AssistantIntent, string[]]> = [
  ['find_teammate', ['teammate', 'team mate', 'team member', 'cofounder', 'takim arkadasi', 'ekip arkadasi', 'komanda yoldasi', 'komanda uzvu']],
  ['find_mentor', ['mentor', 'advisor', 'adviser', 'meslehetci', 'danisman']],
  ['find_job', ['job', 'vacancy', 'position', 'is ariyorum', 'is axtariram', 'vakansiya', 'staj', 'internship']],
  ['find_partner', ['partner organization', 'university partner', 'sponsor', 'terefdas', 'ortak kurum']],
  ['find_program', ['program', 'cohort', 'accelerator', 'sprint', 'inkubator', 'akselerator', 'proqram']],
  ['investor_discovery', ['investable', 'deal flow', 'investment thesis', 'investor', 'yatirim', 'investisiya', 'venture']],
  ['find_startup', ['startup', 'girisim', 'startap', 'layihe']],
]

const skillAliases: Record<string, string[]> = {
  Backend: ['backend', 'back end', 'server', 'node', 'nodejs', 'api', 'postgres', 'postgresql', 'python', 'django', 'java', 'golang', 'hono', 'bun'],
  Frontend: ['frontend', 'front end', 'react', 'typescript', 'javascript', 'ui engineer'],
  'AI / ML': ['ai', 'ml', 'machine learning', 'llm', 'mlops', 'artificial intelligence', 'yapay zeka', 'suni intellekt'],
  Product: ['product', 'product strategy', 'product management', 'mehsul', 'urun'],
  Design: ['design', 'designer', 'ux', 'ui', 'prototyping', 'tasarim', 'dizayn'],
  Fundraising: ['fundraising', 'raise', 'investment', 'venture capital', 'yatirim', 'investisiya'],
  Growth: ['growth', 'marketing', 'community growth', 'gtm', 'go to market'],
  Operations: ['operations', 'operation', 'operasyon', 'emeliyyat'],
  Research: ['research', 'arastirma', 'tedqiqat'],
}
const sectorAliases: Record<string, string[]> = {
  ClimateTech: ['climate', 'climatetech', 'carbon', 'energy', 'iklim', 'iqlim'],
  HealthTech: ['health', 'healthtech', 'medical', 'clinic', 'saglik', 'sehiyye'],
  EdTech: ['edtech', 'education', 'learning', 'university', 'egitim', 'tehsil'],
  AI: ['ai', 'artificial intelligence', 'llm', 'machine learning', 'yapay zeka', 'suni intellekt'],
  SaaS: ['saas', 'b2b software', 'b2b'],
}
const stageAliases: Record<string, string[]> = {
  Idea: ['idea', 'fikir'], Validating: ['validating', 'validation', 'dogrulama', 'yoxlama'],
  MVP: ['mvp', 'prototype', 'prototip'], Pilot: ['pilot', 'piloting'],
  Revenue: ['revenue', 'gelir', 'gəlir'], Seed: ['seed', 'pre seed', 'preseed', 'toxum'],
}
const stopWords = new Set([
  'a', 'an', 'and', 'are', 'for', 'find', 'i', 'im', 'in', 'is', 'looking', 'me', 'my', 'need', 'of', 'or', 'show', 'the', 'to', 'with',
  'bir', 've', 'veya', 'icin', 'ariyorum', 'bul', 'bana', 'olan', 'lazim', 'var', 'ile', 'və', 'ucun', 'axtariram', 'tap', 'mene',
])

export function normalizeAssistantText(value: string) {
  return value.toLocaleLowerCase('en').replace(/ı/g, 'i').replace(/ə/g, 'e')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9%+.#\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

const includesAny = (text: string, aliases: string[]) => {
  const normalized = normalizeAssistantText(text)
  const tokens = new Set(normalized.split(/\s+/))
  return aliases.some((alias) => {
    const candidate = normalizeAssistantText(alias)
    return candidate.length <= 3 && !candidate.includes(' ') ? tokens.has(candidate) : normalized.includes(candidate)
  })
}

export function redactPromptPII(prompt: string) {
  return prompt
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '[redacted-phone]')
}

export async function fingerprintPrompt(prompt: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(prompt))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function detectAssistantIntent(prompt: string, forcedIntent?: AssistantIntent): AssistantIntent {
  if (forcedIntent) return forcedIntent
  for (const [intent, terms] of intentTerms) if (includesAny(prompt, terms)) return intent
  if (includesAny(prompt, ['developer', 'engineer', 'designer', 'gelistirici', 'muhendis', 'proqramci'])) return 'find_teammate'
  return 'platform_guidance'
}

export function extractAssistantCriteria(prompt: string): AssistantCriteria {
  const text = normalizeAssistantText(prompt)
  const collect = (aliases: Record<string, string[]>) =>
    Object.entries(aliases).filter(([, values]) => includesAny(text, values)).map(([name]) => name)
  const location = ['remote', 'baku', 'seattle', 'boston', 'san francisco', 'azerbaijan'].find((item) => text.includes(item))
  const readiness = text.match(/(?:above|over|minimum|min|at least|uzeri|ustu|yuxari|cox)\s*(\d{2,3})\s*%?/) ??
    text.match(/(\d{2,3})\s*%\s*(?:readiness|ready|hazir)/)
  return {
    skills: collect(skillAliases),
    sectors: collect(sectorAliases),
    stages: collect(stageAliases),
    location,
    minReadiness: readiness ? Math.min(100, Number(readiness[1])) : undefined,
    completeTeam: includesAny(text, ['complete team', 'full team', 'team complete', 'takim tam', 'eksiksiz ekip', 'komanda tam']),
    keywords: Array.from(new Set(text.split(/\s+/).filter((token) => token.length > 2 && !stopWords.has(token) && !/^\d+%?$/.test(token)))).slice(0, 40),
  }
}

const modelOutput = z.object({ intent: assistantIntent, criteria: assistantCriteria })

async function extractWithModel(redactedPrompt: string, fallbackIntent: AssistantIntent, fallbackCriteria: AssistantCriteria) {
  if (process.env.AI_ENABLED !== 'true' || !process.env.AI_BASE_URL || !process.env.AI_MODEL) {
    return { intent: fallbackIntent, criteria: fallbackCriteria, engine: 'deterministic' as const }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS ?? 5000))
  try {
    const response = await fetch(`${process.env.AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AI_API_KEY ? { Authorization: `Bearer ${process.env.AI_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'Extract search intent and filters only. Return strict JSON with intent and criteria. Never choose, rank, or invent records.',
          },
          { role: 'user', content: redactedPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('provider_error')
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const parsed = modelOutput.parse(JSON.parse(payload.choices?.[0]?.message?.content ?? ''))
    return { ...parsed, engine: 'hybrid' as const }
  } catch {
    return { intent: fallbackIntent, criteria: fallbackCriteria, engine: 'deterministic' as const, degradedReason: 'model_adapter_unavailable' }
  } finally {
    clearTimeout(timeout)
  }
}

const lexicalRatio = (criteria: AssistantCriteria, text: string) => {
  if (!criteria.keywords.length) return 0
  const normalized = normalizeAssistantText(text)
  return criteria.keywords.filter((word) => normalized.includes(word)).length / criteria.keywords.length
}
const aliasMatch = (text: string, canonical: string, aliases: Record<string, string[]>) =>
  includesAny(text, aliases[canonical] ?? [canonical])

function makeResult(
  base: Omit<AssistantResult, 'explanation'>, breakdown: Record<string, number>,
  matched: string[], missing: string[], criteria: AssistantCriteria,
): AssistantResult {
  const requested = criteria.skills.length + criteria.sectors.length + criteria.stages.length +
    Number(Boolean(criteria.location)) + Number(criteria.minReadiness !== undefined) + Number(criteria.completeTeam)
  const totalScore = Math.max(0, Math.min(100, Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0))))
  return {
    ...base,
    explanation: {
      totalScore,
      confidence: requested >= 2 && matched.length >= 2 ? 'high' : requested >= 1 && matched.length >= 1 ? 'medium' : 'low',
      matchedSignals: [...new Set(matched)],
      missingSignals: [...new Set(missing)],
      scoreBreakdown: breakdown,
    },
  }
}

async function fullTextIds(intent: AssistantIntent, criteria: AssistantCriteria) {
  const query = criteria.keywords.slice(0, 10).join(' ')
  if (!query || intent === 'platform_guidance') return new Set<string>()
  const searches: Partial<Record<AssistantIntent, () => Promise<Array<{ id: string }>>>> = {
    find_teammate: () => postgres<Array<{ id: string }>>`
      select id from users where to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(title,'') || ' ' || coalesce(skills,'') || ' ' || coalesce(about,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
    find_job: () => postgres<Array<{ id: string }>>`
      select id from jobs where to_tsvector('simple', coalesce(role,'') || ' ' || coalesce(company,'') || ' ' || coalesce(skills,'') || ' ' || coalesce(description,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
    find_startup: () => postgres<Array<{ id: string }>>`
      select id from startups where to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(sector,'') || ' ' || coalesce(stage,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(full_description,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
    investor_discovery: () => postgres<Array<{ id: string }>>`
      select id from startups where to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(sector,'') || ' ' || coalesce(stage,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(full_description,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
    find_program: () => postgres<Array<{ id: string }>>`
      select id from programs where to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(type,'') || ' ' || coalesce(description,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
    find_partner: () => postgres<Array<{ id: string }>>`
      select id from organizations where to_tsvector('simple', coalesce(display_name,'') || ' ' || coalesce(type,'') || ' ' || coalesce(summary,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
    find_mentor: () => postgres<Array<{ id: string }>>`
      select id from mentor_profiles where to_tsvector('simple', coalesce(company,'') || ' ' || coalesce(bio,'') || ' ' || coalesce(focus_stage,''))
      @@ websearch_to_tsquery('simple', ${query}) limit 50`,
  }
  try {
    return new Set((await searches[intent]?.() ?? []).map((row) => row.id))
  } catch {
    return new Set<string>()
  }
}

function guidance(prompt: string, criteria: AssistantCriteria) {
  const text = normalizeAssistantText(prompt)
  return [
    ['network', 'Find collaborators', 'People and skills', 'Search member profiles and connect around a specific goal.', '/network', ['People', 'Skills'], ['team', 'people', 'connect']],
    ['startups', 'Explore startup workspaces', 'Teams and execution', 'Review ventures, milestones, open roles, and evidence.', '/startups', ['Startups', 'Evidence'], ['startup', 'venture', 'milestone']],
    ['mentorship', 'Book focused mentorship', 'Goal-led sessions', 'Find mentors by expertise and book a goal-led session.', '/mentorship', ['Mentors', 'Sessions'], ['mentor', 'advice', 'help']],
    ['programs', 'Browse joint programs', 'Cohorts and milestones', 'See partner-led programs, eligibility, and outcomes.', '/programs', ['Programs', 'Partners'], ['program', 'cohort', 'partner']],
  ].map(([id, title, subtitle, description, href, tags, terms]) => {
    const direct = (terms as string[]).some((term) => text.includes(term))
    return makeResult({
      entityType: 'guide', entityId: id as string, title: title as string, subtitle: subtitle as string,
      description: description as string, href: href as string, tags: tags as string[],
    }, { relevance: direct ? 70 : 35, actionability: 20 }, direct ? ['Relevant platform workflow'] : ['Available workspace'], [], criteria)
  })
}

async function retrieveAndScore(intent: AssistantIntent, criteria: AssistantCriteria, actor: AuthUser) {
  const fts = await fullTextIds(intent, criteria)
  const boost = (id: string) => fts.has(id) ? 15 : 0
  if (intent === 'platform_guidance') return guidance(criteria.keywords.join(' '), criteria)

  if (intent === 'find_teammate') {
    const rows = await db.select().from(users).where(ne(users.id, actor.id)).limit(100)
    return rows.filter((row) => !row.roles.includes('investor')).map((row) => {
      const text = `${row.title} ${row.skills} ${row.about} ${row.industry}`
      const matched = criteria.skills.filter((skill) => aliasMatch(text, skill, skillAliases))
      const available = includesAny(row.availability, ['open', 'available', 'collaborate', 'project'])
      const location = !criteria.location || normalizeAssistantText(row.location).includes(criteria.location)
      return makeResult({
        entityType: 'person', entityId: row.id, title: row.name, subtitle: `${row.title} · ${row.location}`,
        description: row.about || row.skills, href: `/people/${row.username}`,
        tags: row.skills.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4),
      }, {
        skills: criteria.skills.length ? 40 * matched.length / criteria.skills.length : lexicalRatio(criteria, text) * 35,
        availability: available ? 20 : 7, verification: row.verificationStatus === 'verified' ? 15 : 5,
        location: criteria.location ? (location ? 10 : 0) : 5, search: boost(row.id), role: 10,
      }, [...matched.map((item) => `${item} skills`), ...(available ? ['Available to collaborate'] : []), ...(location && criteria.location ? [`Location: ${row.location}`] : [])],
      [...(!matched.length && criteria.skills.length ? ['Requested skills are not explicit'] : []), ...(!location ? [`Location differs: ${row.location}`] : [])], criteria)
    })
  }

  if (intent === 'find_mentor') {
    const rows = await db.select({ profile: mentorProfiles, user: users }).from(mentorProfiles)
      .innerJoin(users, eq(mentorProfiles.userId, users.id)).where(ne(mentorProfiles.status, 'suspended')).limit(100)
    return rows.map(({ profile, user }) => {
      const text = `${user.title} ${profile.expertise.join(' ')} ${profile.bio} ${profile.focusStage}`
      const matched = criteria.skills.filter((skill) => aliasMatch(text, skill, skillAliases))
      return makeResult({
        entityType: 'mentor', entityId: profile.id, title: user.name, subtitle: `${user.title} · ${profile.focusStage}`,
        description: profile.bio, href: '/mentorship', tags: profile.expertise,
      }, {
        expertise: criteria.skills.length ? 40 * matched.length / criteria.skills.length : lexicalRatio(criteria, text) * 40,
        status: profile.status === 'active' ? 15 : 7, quality: profile.rating / 5 * 15,
        experience: Math.min(15, profile.sessions / 4), search: boost(profile.id), context: 5,
      }, [...matched.map((item) => `${item} expertise`), `${profile.sessions} recorded sessions`],
      profile.status === 'active' ? [] : ['Mentor approval is pending'], criteria)
    })
  }

  if (intent === 'find_job') {
    const rows = await db.select().from(jobs).limit(100)
    return rows.map((row) => {
      const text = `${row.role} ${row.company} ${row.skills} ${row.description}`
      const matched = criteria.skills.filter((skill) => aliasMatch(text, skill, skillAliases))
      const location = !criteria.location || normalizeAssistantText(row.location).includes(criteria.location)
      return makeResult({
        entityType: 'job', entityId: row.id, title: row.role, subtitle: `${row.company} · ${row.location}`,
        description: row.description, href: `/jobs/${row.id}`, tags: row.skills.split(',').map((item) => item.trim()),
      }, {
        skills: criteria.skills.length ? 45 * matched.length / criteria.skills.length : lexicalRatio(criteria, text) * 40,
        location: criteria.location ? (location ? 15 : 0) : 8, curation: row.featured ? 12 : 5,
        search: boost(row.id), actionability: 15,
      }, matched.map((item) => `${item} fit`), location ? [] : [`Location differs: ${row.location}`], criteria)
    })
  }

  if (intent === 'find_startup' || intent === 'investor_discovery') {
    const [rows, members, roles, milestones] = await Promise.all([
      db.select().from(startups).where(eq(startups.status, 'active')).limit(100),
      db.select().from(startupMembers).where(eq(startupMembers.status, 'active')),
      db.select().from(startupRoles).where(eq(startupRoles.status, 'open')),
      db.select().from(startupMilestones),
    ])
    return rows.filter((row) => criteria.minReadiness === undefined || row.readinessScore >= criteria.minReadiness)
      .filter((row) => !criteria.location || normalizeAssistantText(row.location).includes(criteria.location))
      .map((row) => {
        const text = `${row.name} ${row.sector} ${row.stage} ${row.summary} ${row.fullDescription}`
        const sector = criteria.sectors.some((item) => aliasMatch(text, item, sectorAliases))
        const stage = criteria.stages.some((item) => normalizeAssistantText(row.stage).includes(normalizeAssistantText(item)))
        const teamCount = members.filter((item) => item.startupId === row.id).length
        const openCount = roles.filter((item) => item.startupId === row.id).length
        const doneCount = milestones.filter((item) => item.startupId === row.id && item.status === 'done').length
        return makeResult({
          entityType: 'startup', entityId: row.slug, title: row.name, subtitle: `${row.sector} · ${row.stage}`,
          description: row.summary, href: `/startups/${row.slug}`,
          tags: [`${row.readinessScore}% readiness`, `${teamCount} team`, `${openCount} open roles`],
        }, {
          sector: criteria.sectors.length ? (sector ? 20 : 0) : 10,
          stage: criteria.stages.length ? (stage ? 20 : 0) : 10,
          execution: row.readinessScore * .25, evidence: Math.min(15, doneCount * 5),
          team: Math.min(10, teamCount * 3 - openCount + 3), search: boost(row.id), activity: 5,
        }, [...(sector ? [`Sector: ${row.sector}`] : []), ...(stage ? [`Stage: ${row.stage}`] : []), `Readiness: ${row.readinessScore}%`, `${doneCount} completed milestones`],
        [...(openCount ? [`${openCount} open team roles`] : []), ...(criteria.completeTeam && openCount ? ['Team is not complete'] : [])], criteria)
      })
  }

  if (intent === 'find_program') {
    const rows = await db.select().from(programs).limit(100)
    return rows.map((row) => {
      const text = `${row.name} ${row.type} ${row.description} ${row.eligibilityRules.join(' ')}`
      const active = row.status === 'active' || row.status === 'open'
      return makeResult({
        entityType: 'program', entityId: row.id, title: row.name, subtitle: `${row.type.replace(/_/g, ' ')} · ${row.status}`,
        description: row.description, href: '/programs', tags: row.milestoneLabels.slice(0, 3),
      }, { relevance: lexicalRatio(criteria, text) * 50, availability: active ? 20 : 8, structure: Math.min(20, row.milestoneLabels.length * 4), search: boost(row.id), context: 5 },
      active ? ['Open or active program'] : [], active ? [] : [`Program status: ${row.status}`], criteria)
    })
  }

  const rows = await db.select().from(organizations).limit(100)
  return rows.map((row) => {
    const text = `${row.displayName} ${row.type} ${row.summary} ${row.contributionAreas.join(' ')}`
    const active = row.partnershipStatus === 'active', verified = row.verificationStatus === 'verified'
    return makeResult({
      entityType: 'organization', entityId: row.id, title: row.displayName,
      subtitle: `${row.type.replace(/_/g, ' ')} · ${row.partnershipStatus}`,
      description: row.summary, href: '/partnerships', tags: row.contributionAreas.slice(0, 3),
    }, { relevance: lexicalRatio(criteria, text) * 50, availability: active ? 15 : 7, verification: verified ? 15 : 5, search: boost(row.id), context: 10 },
    [...(active ? ['Active partnership'] : []), ...(verified ? ['Verified organization'] : [])],
    [...(!active ? [`Partnership status: ${row.partnershipStatus}`] : []), ...(!verified ? [`Verification: ${row.verificationStatus}`] : [])], criteria)
  })
}

export async function runAssistantQuery(input: {
  prompt: string
  limit: number
  actor: AuthUser
  forcedIntent?: AssistantIntent
}) {
  const started = Date.now()
  const redacted = redactPromptPII(input.prompt)
  const fallbackIntent = detectAssistantIntent(redacted, input.forcedIntent)
  const fallbackCriteria = extractAssistantCriteria(redacted)
  const extracted = await extractWithModel(redacted, fallbackIntent, fallbackCriteria)
  const intent = input.forcedIntent ?? extracted.intent
  const allowed = input.actor.roles.includes('platform_admin') || (
    intent === 'investor_discovery' ? input.actor.roles.includes('investor') :
      intent === 'find_partner' ? input.actor.roles.some((role) => ['partner_admin', 'program_manager'].includes(role)) :
        true
  )
  if (!allowed) return { denied: true as const, intent }

  const results = (await retrieveAndScore(intent, extracted.criteria, input.actor))
    .filter((item) => item.explanation.totalScore > 20)
    .sort((a, b) => b.explanation.totalScore - a.explanation.totalScore)
    .slice(0, input.limit)
  const queryId = newId('aiq')
  const labels: Record<AssistantIntent, string> = {
    find_teammate: 'collaborator', find_mentor: 'mentor', find_job: 'opportunity', find_startup: 'venture',
    investor_discovery: 'venture', find_program: 'program', find_partner: 'partner', platform_guidance: 'workspace',
  }
  const summary = results.length
    ? `Found ${results.length} ${labels[intent]} match${results.length === 1 ? '' : 'es'} using available profile and evidence fields.`
    : `No ${labels[intent]} matches met the current criteria. Try removing a skill, stage, or location constraint.`
  await db.insert(assistantQueries).values({
    id: queryId, userId: input.actor.id, intent, criteria: extracted.criteria,
    resultIds: results.map((item) => `${item.entityType}:${item.entityId}`),
    engine: extracted.engine, status: 'completed', latencyMs: Date.now() - started,
    promptFingerprint: await fingerprintPrompt(input.prompt),
  })
  return {
    denied: false as const, queryId, engine: extracted.engine, degradedReason: extracted.degradedReason,
    intent, criteria: extracted.criteria, summary, results,
  }
}

export async function ownsAssistantQuery(queryId: string, userId: string) {
  const [row] = await db.select({ id: assistantQueries.id }).from(assistantQueries)
    .where(and(eq(assistantQueries.id, queryId), eq(assistantQueries.userId, userId))).limit(1)
  return Boolean(row)
}

