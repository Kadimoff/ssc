import type { AssistantContext, AssistantCriteria, AssistantIntent, AssistantResponse, AssistantResult, MatchConfidence } from './types'

const intentTerms: Array<[AssistantIntent, string[]]> = [
  ['find_teammate', ['teammate', 'team mate', 'team member', 'cofounder', 'co founder', 'takim arkadasi', 'ekip arkadasi', 'komanda yoldasi', 'komanda uzvu', 'ortaq qurucu']],
  ['find_mentor', ['mentor', 'advisor', 'adviser', 'mentoring', 'meslehətci', 'meslehetci', 'danisman']],
  ['find_job', ['job', 'role', 'vacancy', 'position', 'is ariyorum', 'is axtariram', 'vakansiya', 'staj', 'internship']],
  ['find_partner', ['partner organization', 'university partner', 'sponsor', 'terefdas', 'terefdash', 'ortak kurum']],
  ['find_program', ['program', 'cohort', 'accelerator', 'sprint', 'inkubator', 'akselerator', 'proqram']],
  ['investor_discovery', ['investable', 'deal flow', 'investment thesis', 'investor', 'yatirim', 'yatirimlik', 'investisiya', 'startup ara', 'venture']],
  ['find_startup', ['startup', 'venture', 'girisim', 'startap', 'layihe']],
]

const skillAliases: Record<string, string[]> = {
  Backend: ['backend', 'back end', 'server', 'node', 'nodejs', 'api', 'apis', 'postgres', 'postgresql', 'python', 'django', 'java', 'golang', 'hono', 'bun'],
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
  Idea: ['idea', 'fikir'],
  Validating: ['validating', 'validation', 'dogrulama', 'yoxlama'],
  MVP: ['mvp', 'prototype', 'prototip'],
  Pilot: ['pilot', 'piloting'],
  Revenue: ['revenue', 'gelir', 'gelirli', 'gelir elde', 'gəlir'],
  Seed: ['seed', 'pre seed', 'preseed', 'toxum'],
}

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'for', 'find', 'i', 'im', 'in', 'is', 'looking', 'me', 'my', 'need', 'of', 'or', 'show', 'the', 'to', 'with',
  'bir', 've', 'veya', 'icin', 'ariyorum', 'bul', 'bana', 'olan', 'lazim', 'lazimdir', 'var', 'ile',
  'və', 've', 'ucun', 'axtariram', 'tap', 'mene', 'lazimdir', 'olan',
])

export function normalizeAssistantText(value: string) {
  return value
    .toLocaleLowerCase('en')
    .replace(/ı/g, 'i').replace(/ə/g, 'e')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9%+.#\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const includesAny = (text: string, aliases: string[]) => {
  const normalizedText = normalizeAssistantText(text)
  const tokens = new Set(normalizedText.split(/\s+/))
  return aliases.some((alias) => {
    const normalizedAlias = normalizeAssistantText(alias)
    return normalizedAlias.length <= 3 && !normalizedAlias.includes(' ') ? tokens.has(normalizedAlias) : normalizedText.includes(normalizedAlias)
  })
}

export function detectAssistantIntent(prompt: string, forcedIntent?: AssistantIntent): AssistantIntent {
  if (forcedIntent) return forcedIntent
  const text = normalizeAssistantText(prompt)
  for (const [intent, terms] of intentTerms) if (includesAny(text, terms)) return intent
  if (includesAny(text, ['developer', 'engineer', 'designer', 'gelistirici', 'muhendis', 'proqramci'])) return 'find_teammate'
  if (includesAny(text, ['help', 'how do', 'where is', 'yardim', 'nece', 'harada', 'nasil'])) return 'platform_guidance'
  return 'platform_guidance'
}

export function extractAssistantCriteria(prompt: string): AssistantCriteria {
  const text = normalizeAssistantText(prompt)
  const skills = Object.entries(skillAliases).filter(([, aliases]) => includesAny(text, aliases)).map(([name]) => name)
  const sectors = Object.entries(sectorAliases).filter(([, aliases]) => includesAny(text, aliases)).map(([name]) => name)
  const stages = Object.entries(stageAliases).filter(([, aliases]) => includesAny(text, aliases)).map(([name]) => name)
  const location = ['remote', 'baku', 'seattle', 'boston', 'san francisco', 'azerbaijan'].find((item) => text.includes(item))
  const readinessMatch = text.match(/(?:above|over|minimum|min|at least|uzeri|ustu|yuxari|cox)\s*(\d{2,3})\s*%?/) ?? text.match(/(\d{2,3})\s*%\s*(?:readiness|ready|hazir)/)
  const minReadiness = readinessMatch ? Math.min(100, Number(readinessMatch[1])) : undefined
  const completeTeam = includesAny(text, ['complete team', 'full team', 'team complete', 'takim tam', 'eksiksiz ekip', 'komanda tam'])
  const keywords = Array.from(new Set(text.split(/\s+/).filter((token: string) => token.length > 2 && !stopWords.has(token) && !/^\d+%?$/.test(token))))
  return { skills, sectors, stages, location, minReadiness, completeTeam, keywords }
}

function confidenceFor(criteria: AssistantCriteria, matchedCount: number): MatchConfidence {
  const requested = criteria.skills.length + criteria.sectors.length + criteria.stages.length + Number(Boolean(criteria.location)) + Number(criteria.minReadiness !== undefined) + Number(criteria.completeTeam)
  if (requested >= 2 && matchedCount >= 2) return 'high'
  if (requested >= 1 && matchedCount >= 1) return 'medium'
  return 'low'
}

function aliasesMatch(text: string, canonical: string, aliases: Record<string, string[]>) {
  return includesAny(normalizeAssistantText(text), aliases[canonical] ?? [canonical])
}

function lexicalRatio(criteria: AssistantCriteria, text: string) {
  if (criteria.keywords.length === 0) return 0
  const normalized = normalizeAssistantText(text)
  return criteria.keywords.filter((word) => normalized.includes(word)).length / criteria.keywords.length
}

function result(
  base: Omit<AssistantResult, 'explanation'>,
  scoreBreakdown: Record<string, number>,
  matchedSignals: string[],
  missingSignals: string[],
  criteria: AssistantCriteria,
): AssistantResult {
  const totalScore = Math.max(0, Math.min(100, Math.round(Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0))))
  return {
    ...base,
    explanation: {
      totalScore,
      confidence: confidenceFor(criteria, matchedSignals.length),
      matchedSignals: [...new Set(matchedSignals)],
      missingSignals: [...new Set(missingSignals)],
      scoreBreakdown,
    },
  }
}

function scorePeople(context: AssistantContext, criteria: AssistantCriteria): AssistantResult[] {
  return context.users.filter((user) => user.id !== context.currentUser?.id && user.activeRole !== 'investor').map((user) => {
    const text = `${user.title} ${user.skills} ${user.about} ${user.industry}`
    const matchedSkills = criteria.skills.filter((skill) => aliasesMatch(text, skill, skillAliases))
    const skillScore = criteria.skills.length ? 40 * matchedSkills.length / criteria.skills.length : Math.min(30, lexicalRatio(criteria, text) * 40)
    const roleScore = includesAny(normalizeAssistantText(text), ['engineer', 'developer', 'designer', 'product', 'founder', 'student']) ? 20 : 10
    const available = includesAny(normalizeAssistantText(user.availability), ['open', 'available', 'collaborate', 'project', 'weekly'])
    const availabilityScore = available ? 15 : user.availability ? 7 : 0
    const verificationScore = user.verificationStatus === 'verified' ? 15 : user.verificationStatus === 'pending' ? 5 : 0
    const locationMatch = !criteria.location || normalizeAssistantText(user.location).includes(criteria.location)
    const contextScore = criteria.location ? (locationMatch ? 10 : 0) : 5
    const matched = [...matchedSkills.map((skill) => `${skill} skills`), ...(available ? ['Available to collaborate'] : []), ...(user.verificationStatus === 'verified' ? ['Verified profile'] : []), ...(criteria.location && locationMatch ? [`Location: ${user.location}`] : [])]
    const missing = [...(matchedSkills.length === 0 && criteria.skills.length ? [`Requested skills not explicit: ${criteria.skills.join(', ')}`] : []), ...(!available ? ['Availability is not explicitly open'] : []), ...(user.verificationStatus !== 'verified' ? ['Profile is not verified'] : [])]
    return result({
      entityType: 'person', entityId: user.id, title: user.name, subtitle: `${user.title} · ${user.location}`,
      description: user.about || user.skills, href: `/people/${user.username}`,
      tags: user.skills.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4),
    }, { skills: skillScore, role: roleScore, availability: availabilityScore, verification: verificationScore, context: contextScore }, matched, missing, criteria)
  })
}

function scoreMentors(context: AssistantContext, criteria: AssistantCriteria): AssistantResult[] {
  return context.mentors.filter((mentor) => mentor.status !== 'suspended').map((mentor) => {
    const text = `${mentor.title} ${mentor.expertise.join(' ')} ${mentor.bio} ${mentor.focusStage}`
    const matchedSkills = criteria.skills.filter((skill) => aliasesMatch(text, skill, skillAliases))
    const domainScore = criteria.skills.length ? 40 * matchedSkills.length / criteria.skills.length : Math.min(40, lexicalRatio(criteria, text) * 55)
    const stageMatch = criteria.stages.some((stage) => normalizeAssistantText(mentor.focusStage).includes(normalizeAssistantText(stage)))
    const contextScore = criteria.stages.length ? (stageMatch ? 10 : 0) : 5
    const activeScore = mentor.status === 'active' ? 15 : 7
    const qualityScore = Math.min(15, mentor.rating / 5 * 15)
    const experienceScore = Math.min(20, 8 + mentor.sessions / 5)
    const matched = [...matchedSkills.map((skill) => `${skill} expertise`), ...(stageMatch ? [`Stage focus: ${mentor.focusStage}`] : []), ...(mentor.status === 'active' ? ['Active mentor'] : []), `${mentor.sessions} recorded sessions`]
    const missing = [...(criteria.skills.length > 0 && matchedSkills.length === 0 ? ['Requested expertise is not explicit'] : []), ...(mentor.status !== 'active' ? ['Mentor approval is pending'] : [])]
    return result({
      entityType: 'mentor', entityId: mentor.id, title: mentor.name, subtitle: `${mentor.title} · ${mentor.focusStage}`,
      description: mentor.bio, href: '/mentorship', tags: mentor.expertise,
    }, { expertise: domainScore, role: experienceScore, availability: activeScore, quality: qualityScore, context: contextScore }, matched, missing, criteria)
  })
}

function scoreJobs(context: AssistantContext, criteria: AssistantCriteria): AssistantResult[] {
  return context.jobs.map((job) => {
    const text = `${job.role} ${job.skills} ${job.description} ${job.company}`
    const matchedSkills = criteria.skills.filter((skill) => aliasesMatch(text, skill, skillAliases))
    const skillScore = criteria.skills.length ? 45 * matchedSkills.length / criteria.skills.length : Math.min(40, lexicalRatio(criteria, text) * 55)
    const roleScore = lexicalRatio(criteria, job.role) > 0 ? 20 : 10
    const locationMatch = !criteria.location || normalizeAssistantText(job.location).includes(criteria.location)
    const locationScore = criteria.location ? (locationMatch ? 15 : 0) : 8
    const evidenceScore = job.featured ? 10 : 5
    const actionScore = job.applied ? 5 : 10
    return result({
      entityType: 'job', entityId: job.id, title: job.role, subtitle: `${job.company} · ${job.location}`,
      description: job.description, href: `/jobs/${job.id}`, tags: job.skills.split(',').map((item) => item.trim()),
    }, { skills: skillScore, role: roleScore, location: locationScore, curation: evidenceScore, actionable: actionScore },
    [...matchedSkills.map((skill) => `${skill} fit`), ...(locationMatch && criteria.location ? [`Location: ${job.location}`] : []), ...(job.featured ? ['Featured opportunity'] : [])],
    [...(criteria.skills.length && !matchedSkills.length ? ['Requested skills are not explicit'] : []), ...(!locationMatch ? [`Location differs: ${job.location}`] : [])], criteria)
  })
}

export function startupSignalBreakdown(startup: AssistantContext['startups'][number], criteria: AssistantCriteria) {
  const text = `${startup.name} ${startup.sector} ${startup.stage} ${startup.summary} ${startup.fullDesc}`
  const sectorMatch = criteria.sectors.some((sector) => aliasesMatch(text, sector, sectorAliases))
  const stageMatch = criteria.stages.some((stage) => normalizeAssistantText(startup.stage).includes(normalizeAssistantText(stage)))
  const sector = criteria.sectors.length ? (sectorMatch ? 20 : 0) : 10
  const stage = criteria.stages.length ? (stageMatch ? 20 : 0) : 10
  const execution = startup.score * .25
  const doneMilestones = startup.milestones.filter((milestone) => milestone.status === 'done').length
  const evidenceRaw = Math.min(100, doneMilestones * 30 + startup.milestones.filter((milestone) => milestone.status === 'current').length * 20 + startup.backedBy.length * 10)
  const evidence = evidenceRaw * .2
  const teamRaw = Math.max(0, Math.min(100, startup.team.length * 30 - startup.openRoles.length * 8 + 25))
  const team = teamRaw * .1
  const activity = startup.milestones.some((milestone) => milestone.status === 'current') ? 5 : 1
  return { sector, stage, execution, evidence, team, activity, sectorMatch, stageMatch, evidenceRaw, teamRaw }
}

function scoreStartups(context: AssistantContext, criteria: AssistantCriteria): AssistantResult[] {
  return context.startups
    .filter((startup) =>
      (criteria.minReadiness === undefined || startup.score >= criteria.minReadiness) &&
      (!criteria.location || normalizeAssistantText(startup.location).includes(criteria.location))
    )
    .map((startup) => {
      const breakdown = startupSignalBreakdown(startup, criteria)
      const matched = [
        ...(breakdown.sectorMatch ? [`Sector: ${startup.sector}`] : []),
        ...(breakdown.stageMatch ? [`Stage: ${startup.stage}`] : []),
        `Readiness: ${startup.score}%`,
        `${startup.milestones.filter((milestone) => milestone.status === 'done').length} completed milestones`,
        `${startup.team.length} team members`,
        ...(criteria.completeTeam && startup.openRoles.length === 0 ? ['No open team roles'] : []),
        ...(criteria.location ? [`Location: ${startup.location}`] : []),
      ]
      const missing = [
        ...(criteria.sectors.length && !breakdown.sectorMatch ? [`Sector differs: ${startup.sector}`] : []),
        ...(criteria.stages.length && !breakdown.stageMatch ? [`Stage differs: ${startup.stage}`] : []),
        ...(startup.openRoles.length ? [`${startup.openRoles.length} open team roles`] : []),
        ...(criteria.completeTeam && startup.openRoles.length ? ['Team is not yet complete'] : []),
        ...(breakdown.evidenceRaw < 50 ? ['Limited structured evidence'] : []),
      ]
      return result({
        entityType: 'startup', entityId: startup.slug, title: startup.name, subtitle: `${startup.sector} · ${startup.stage}`,
        description: startup.summary, href: `/startups/${startup.slug}`,
        tags: [`${startup.score}% readiness`, `${startup.team.length} team`, `${startup.openRoles.length} open roles`],
      }, { sector: breakdown.sector, stage: breakdown.stage, execution: breakdown.execution, evidence: breakdown.evidence, team: breakdown.team, activity: breakdown.activity }, matched, missing, criteria)
    })
}

function scorePrograms(context: AssistantContext, criteria: AssistantCriteria): AssistantResult[] {
  return context.programs.map((program) => {
    const text = `${program.name} ${program.type} ${program.description} ${program.eligibilityRules.join(' ')} ${program.milestoneLabels.join(' ')}`
    const relevance = Math.min(50, lexicalRatio(criteria, text) * 65)
    const active = program.status === 'active' || program.status === 'open'
    const structure = Math.min(25, program.milestoneLabels.length * 4 + program.outcomesFramework.length * 3)
    return result({
      entityType: 'program', entityId: program.id, title: program.name, subtitle: `${program.type.replace(/_/g, ' ')} · ${program.status}`,
      description: program.description, href: '/programs', tags: program.milestoneLabels.slice(0, 3),
    }, { relevance, availability: active ? 20 : 8, structure, context: 5 },
    [...(relevance > 0 ? ['Prompt terms appear in program scope'] : []), ...(active ? ['Open or active program'] : []), `${program.milestoneLabels.length} defined milestones`],
    [...(!active ? [`Program status: ${program.status}`] : []), ...(relevance === 0 ? ['No direct topic match'] : [])], criteria)
  })
}

function scoreOrganizations(context: AssistantContext, criteria: AssistantCriteria): AssistantResult[] {
  if (!context.includeOrganizations) return []
  return context.organizations.map((organization) => {
    const text = `${organization.displayName} ${organization.type} ${organization.summary} ${organization.contributionAreas.join(' ')}`
    const relevance = Math.min(50, lexicalRatio(criteria, text) * 65)
    const verified = organization.verificationStatus === 'verified'
    const active = organization.partnershipStatus === 'active'
    return result({
      entityType: 'organization', entityId: organization.id, title: organization.displayName,
      subtitle: `${organization.type.replace(/_/g, ' ')} · ${organization.partnershipStatus}`,
      description: organization.summary, href: '/partnerships', tags: organization.contributionAreas.slice(0, 3),
    }, { relevance, role: 15, availability: active ? 15 : 7, verification: verified ? 15 : 5, context: 5 },
    [...(relevance ? ['Contribution areas match the request'] : []), ...(active ? ['Active partnership'] : []), ...(verified ? ['Verified organization'] : [])],
    [...(!verified ? [`Verification: ${organization.verificationStatus}`] : []), ...(!active ? [`Partnership status: ${organization.partnershipStatus}`] : [])], criteria)
  })
}

function platformGuidance(prompt: string, criteria: AssistantCriteria): AssistantResult[] {
  const text = normalizeAssistantText(prompt)
  const guides = [
    { id: 'network', title: 'Find collaborators', subtitle: 'People and skills', description: 'Search verified member profiles and connect around a specific goal.', href: '/network', tags: ['People', 'Skills'], terms: ['team', 'people', 'member', 'connect', 'teammate', 'takim', 'komanda'] },
    { id: 'startups', title: 'Explore startup workspaces', subtitle: 'Teams and execution', description: 'Review ventures, milestones, open roles, and current evidence.', href: '/startups', tags: ['Startups', 'Evidence'], terms: ['startup', 'venture', 'milestone', 'startap'] },
    { id: 'mentorship', title: 'Book focused mentorship', subtitle: 'Goal-led sessions', description: 'Find mentors by expertise and book a session with a defined goal.', href: '/mentorship', tags: ['Mentors', 'Sessions'], terms: ['mentor', 'advice', 'help', 'yardim'] },
    { id: 'programs', title: 'Browse joint programs', subtitle: 'Cohorts and milestones', description: 'See partner-led programs, eligibility, and outcome frameworks.', href: '/programs', tags: ['Programs', 'Partners'], terms: ['program', 'cohort', 'partner', 'proqram'] },
  ]
  return guides.map((guide) => {
    const relevance = guide.terms.filter((term) => text.includes(term)).length
    return result({ entityType: 'guide', entityId: guide.id, title: guide.title, subtitle: guide.subtitle, description: guide.description, href: guide.href, tags: guide.tags },
      { relevance: relevance ? 70 : 35, actionability: 20 }, relevance ? ['Relevant platform workflow'] : ['Available workspace'], [], criteria)
  })
}

export function runAssistant(prompt: string, context: AssistantContext, forcedIntent?: AssistantIntent): AssistantResponse {
  const intent = detectAssistantIntent(prompt, forcedIntent)
  const criteria = extractAssistantCriteria(prompt)
  const resultsByIntent: Record<AssistantIntent, () => AssistantResult[]> = {
    find_teammate: () => scorePeople(context, criteria),
    find_mentor: () => scoreMentors(context, criteria),
    find_job: () => scoreJobs(context, criteria),
    find_startup: () => scoreStartups(context, criteria),
    investor_discovery: () => scoreStartups(context, criteria),
    find_program: () => scorePrograms(context, criteria),
    find_partner: () => scoreOrganizations(context, criteria),
    platform_guidance: () => platformGuidance(prompt, criteria),
  }
  const results = resultsByIntent[intent]()
    .filter((item) => item.explanation.totalScore > 20)
    .sort((a, b) => b.explanation.totalScore - a.explanation.totalScore)
  const labels: Record<AssistantIntent, string> = {
    find_teammate: 'collaborator', find_mentor: 'mentor', find_job: 'opportunity', find_startup: 'venture',
    investor_discovery: 'venture', find_program: 'program', find_partner: 'partner', platform_guidance: 'workspace',
  }
  return {
    intent,
    criteria,
    summary: results.length
      ? `Found ${results.length} ${labels[intent]} match${results.length === 1 ? '' : 'es'} using available profile and evidence fields.`
      : `No ${labels[intent]} matches met the current criteria. Try removing a skill, stage, or location constraint.`,
    results,
  }
}
