import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client, CreateBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client'
import { evidenceArtifacts } from '../db/schema'
import { audit, auth, newId, requireRoles, type Variables } from '../lib/platform'
import { id, verificationStatus } from '../lib/schemas'

const bucket = process.env.MINIO_BUCKET ?? 'ssc-evidence'
const endpoint = process.env.MINIO_ENDPOINT
const s3 = new S3Client({
  region: 'us-east-1', endpoint, forcePathStyle: true,
  credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY ?? '', secretAccessKey: process.env.MINIO_SECRET_KEY ?? '' },
})
let bucketReady = false
async function ensureBucket() {
  if (bucketReady) return
  try { await s3.send(new HeadBucketCommand({ Bucket: bucket })) }
  catch { await s3.send(new CreateBucketCommand({ Bucket: bucket })) }
  bucketReady = true
}

export const evidenceRoutes = new Hono<{ Variables: Variables }>()
evidenceRoutes.use('*', auth)
evidenceRoutes.post('/upload-url', zValidator('json', z.object({
  filename: z.string().min(1).max(255), contentType: z.string().min(3).max(100),
  ownerType: z.enum(['user', 'startup', 'organization', 'program', 'outcome']), ownerId: id,
})), async (context) => {
  await ensureBucket()
  const input = context.req.valid('json'), evidenceId = newId('evd')
  const objectKey = `${input.ownerType}/${input.ownerId}/${evidenceId}/${input.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: input.contentType }), { expiresIn: 900 })
  return context.json({ evidenceId, objectKey, uploadUrl, expiresIn: 900 })
})
evidenceRoutes.post('/', zValidator('json', z.object({
  id, type: z.enum(['task', 'milestone', 'mentor_note', 'contribution', 'attendance', 'submission', 'review', 'introduction', 'agreement', 'file', 'link']),
  title: z.string().min(2).max(255), description: z.string().max(3000),
  ownerType: z.enum(['user', 'startup', 'organization', 'program', 'outcome']), ownerId: id,
  objectKey: z.string().max(1000), contentHash: z.string().regex(/^[a-fA-F0-9]{64}$/),
})), async (context) => {
  const input = context.req.valid('json'), actor = context.get('user')
  const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT ?? endpoint ?? ''
  await db.insert(evidenceArtifacts).values({
    id: input.id, type: input.type, title: input.title, description: input.description,
    ownerType: input.ownerType, ownerId: input.ownerId, url: `${publicEndpoint}/${bucket}/${input.objectKey}`,
    contentHash: input.contentHash.toLowerCase(), verificationStatus: 'pending', submittedBy: actor.id,
  })
  await audit(actor.id, 'evidence.submitted', 'evidence', input.id, `Submitted evidence ${input.title}.`)
  return context.json({ id: input.id }, 201)
})
evidenceRoutes.post('/:id/verification', requireRoles('program_manager'), zValidator('json', z.object({ status: verificationStatus })), async (context) => {
  const id = context.req.param('id'), actor = context.get('user'), status = context.req.valid('json').status
  await db.update(evidenceArtifacts).set({ verificationStatus: status, verifiedBy: actor.id }).where(eq(evidenceArtifacts.id, id))
  await audit(actor.id, 'evidence.verification_changed', 'evidence', id, `Set evidence verification to ${status}.`)
  return context.body(null, 204)
})
evidenceRoutes.get('/:id/download-url', async (context) => {
  await ensureBucket()
  const [item] = await db.select().from(evidenceArtifacts).where(eq(evidenceArtifacts.id, context.req.param('id'))).limit(1)
  if (!item) return context.json({ error: 'Evidence not found' }, 404)
  const marker = `/${bucket}/`, objectKey = item.url.split(marker)[1]
  if (!objectKey) return context.json({ error: 'Evidence object is unavailable' }, 409)
  return context.json({ url: await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: objectKey }), { expiresIn: 300 }) })
})
