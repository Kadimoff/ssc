const base = process.env.SSC_API_BASE || 'http://127.0.0.1:3443'

const health = await fetch(`${base}/health`)
if (!health.ok) throw new Error(`Health check failed: ${health.status}`)

const login = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ username: 'demo', password: 'demo123' }),
})
const authentication = await login.json()
if (!login.ok) throw new Error(`Login failed: ${JSON.stringify(authentication)}`)
const headers = { authorization: `Bearer ${authentication.token}` }

const snapshotResponse = await fetch(`${base}/snapshot`, { headers })
const snapshot = await snapshotResponse.json()
if (!snapshotResponse.ok || snapshot.version !== 3 || snapshot.startups?.length < 3 || snapshot.mentors?.length < 1) {
  throw new Error('v3 venture snapshot check failed')
}

const capabilitiesResponse = await fetch(`${base}/assistant/capabilities`, { headers })
const capabilities = await capabilitiesResponse.json()
if (!capabilitiesResponse.ok || capabilities.rawPromptStored !== false || !capabilities.deterministicFallback) {
  throw new Error('Assistant capability/privacy check failed')
}

const assistantResponse = await fetch(`${base}/assistant/query`, {
  method: 'POST',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify({ prompt: 'Find a Python backend teammate for a ClimateTech MVP', limit: 5 }),
})
const assistant = await assistantResponse.json()
if (!assistantResponse.ok || assistant.intent !== 'find_teammate' || !assistant.queryId || !Array.isArray(assistant.results)) {
  throw new Error(`Assistant query check failed: ${JSON.stringify(assistant)}`)
}
if (assistant.results.length) {
  const first = assistant.results[0]
  const feedbackResponse = await fetch(`${base}/assistant/feedback`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      queryId: assistant.queryId, resultType: first.entityType, resultId: first.entityId,
      action: 'helpful', value: 1, reason: 'Automated smoke validation',
    }),
  })
  if (feedbackResponse.status !== 204) throw new Error(`Assistant feedback check failed: ${feedbackResponse.status}`)
}

const reportResponse = await fetch(`${base}/reports/partnership-readiness`, { headers })
const report = await reportResponse.json()
if (!reportResponse.ok || report.methodologyVersion !== 'ssc-partnership-readiness-v1.0') {
  throw new Error('Readiness report check failed')
}

const investorLogin = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ username: 'investor', password: 'demo123' }),
})
const investorAuthentication = await investorLogin.json()
if (!investorLogin.ok) throw new Error(`Investor login failed: ${JSON.stringify(investorAuthentication)}`)

const [investorDashboard, adminInvestorDashboard, anonymousInvestorDashboard] = await Promise.all([
  fetch(`${base}/investor/dashboard`, { headers: { authorization: `Bearer ${investorAuthentication.token}` } }),
  fetch(`${base}/investor/dashboard`, { headers }),
  fetch(`${base}/investor/dashboard`),
])
if (!investorDashboard.ok || !adminInvestorDashboard.ok || anonymousInvestorDashboard.status !== 401) {
  throw new Error(`Investor access checks failed: investor=${investorDashboard.status}, admin=${adminInvestorDashboard.status}, anonymous=${anonymousInvestorDashboard.status}`)
}

const investorDiscovery = await fetch(`${base}/investor/discovery`, {
  method: 'POST',
  headers: { authorization: `Bearer ${investorAuthentication.token}`, 'content-type': 'application/json' },
  body: JSON.stringify({ prompt: 'MVP ClimateTech above 75% readiness', limit: 5 }),
})
const discovery = await investorDiscovery.json()
if (!investorDiscovery.ok || discovery.intent !== 'investor_discovery' || discovery.results?.[0]?.entityType !== 'startup') {
  throw new Error(`Investor discovery check failed: ${JSON.stringify(discovery)}`)
}

const memberLogin = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ username: 'nihat', password: 'demo123' }),
})
const memberAuthentication = await memberLogin.json()
if (!memberLogin.ok) throw new Error(`Member login failed: ${JSON.stringify(memberAuthentication)}`)
const forbiddenInvestorDiscovery = await fetch(`${base}/investor/discovery`, {
  method: 'POST',
  headers: { authorization: `Bearer ${memberAuthentication.token}`, 'content-type': 'application/json' },
  body: JSON.stringify({ prompt: 'Show startups', limit: 5 }),
})
if (forbiddenInvestorDiscovery.status !== 403) {
  throw new Error(`Normal-member investor restriction failed: ${forbiddenInvestorDiscovery.status}`)
}

console.log(JSON.stringify({
  health: 'ok',
  user: authentication.user.id,
  investorAccess: investorDashboard.status,
  platformAdminInvestorAccess: adminInvestorDashboard.status,
  anonymousInvestorAccess: anonymousInvestorDashboard.status,
  normalMemberInvestorAccess: forbiddenInvestorDiscovery.status,
  assistantEngine: assistant.engine,
  assistantResults: assistant.results.length,
  investorDiscoveryResults: discovery.results.length,
  organizations: snapshot.organizations.length,
  startups: snapshot.startups.length,
  mentors: snapshot.mentors.length,
  programs: snapshot.programs.length,
  reportScore: report.score,
  methodologyVersion: report.methodologyVersion,
}, null, 2))
