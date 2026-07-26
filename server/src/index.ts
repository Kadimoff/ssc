import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { sql } from './db/client'
import { authRoutes } from './routes/auth'
import { assistantRoutes } from './routes/assistant'
import { evidenceRoutes } from './routes/evidence'
import { integrationRoutes } from './routes/integrations'
import { investorRoutes } from './routes/investor'
import { partnershipRoutes } from './routes/partnerships'
import { reportRoutes } from './routes/reports'
import { snapshotRoutes } from './routes/snapshot'
import { socialRoutes } from './routes/social'
import { ventureRoutes } from './routes/ventures'
import { rateLimit, type Variables } from './lib/platform'

const app = new Hono<{ Variables: Variables }>()
app.use('*', secureHeaders())
app.use('*', cors({
  origin: process.env.CORS_ORIGIN?.split(',').map((item) => item.trim()) ?? ['http://127.0.0.1:5173'],
  allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: false,
  maxAge: 86400,
}))
app.use('*', rateLimit)
app.get('/health', (context) => context.json({ status: 'ok', service: 'ssc-partnership-api' }))
app.get('/ready', async (context) => {
  try { await sql`select 1`; return context.json({ status: 'ready' }) }
  catch { return context.json({ status: 'not_ready' }, 503) }
})
app.route('/auth', authRoutes)
app.route('/assistant', assistantRoutes)
app.route('/snapshot', snapshotRoutes)
app.route('/', socialRoutes)
app.route('/', partnershipRoutes)
app.route('/evidence', evidenceRoutes)
app.route('/integrations', integrationRoutes)
app.route('/investor', investorRoutes)
app.route('/reports', reportRoutes)
app.route('/', ventureRoutes)
app.notFound((context) => context.json({ error: 'Route not found' }, 404))
app.onError((error, context) => {
  console.error(error)
  return context.json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, 500)
})

export default { port: Number(process.env.PORT ?? 3443), fetch: app.fetch }
