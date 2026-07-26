import { and, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { integrationConnections, integrationDeliveries } from '../db/schema'
import { newId } from './platform'

async function hmac(secret: string, body: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function dispatchIntegrationEvent(organizationId: string, eventType: string, data: Record<string, unknown>) {
  const connections = await db.select().from(integrationConnections).where(and(
    eq(integrationConnections.organizationId, organizationId), eq(integrationConnections.enabled, true),
  ))
  for (const connection of connections.filter((item) => item.eventTypes.includes(eventType) || item.eventTypes.includes('*'))) {
    const event = { id: newId('evt'), type: eventType, occurredAt: new Date().toISOString(), data }
    const raw = JSON.stringify(event)
    try {
      const body = connection.provider === 'slack' ? JSON.stringify({ text: `SSC event: ${eventType}`, blocks: [], sscEvent: event })
        : connection.provider === 'discord' ? JSON.stringify({ content: `SSC event: **${eventType}**`, sscEvent: event })
          : raw
      const response = await fetch(connection.endpointUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-ssc-signature': `sha256=${await hmac(connection.signingSecret, raw)}` },
        body, signal: AbortSignal.timeout(8_000),
      })
      await db.insert(integrationDeliveries).values({ id: newId('idl'), integrationId: connection.id, eventType, status: response.ok ? 'delivered' : 'failed', responseCode: response.status, error: response.ok ? '' : `HTTP ${response.status}` })
    } catch (error) {
      await db.insert(integrationDeliveries).values({ id: newId('idl'), integrationId: connection.id, eventType, status: 'failed', error: error instanceof Error ? error.message.slice(0, 1000) : 'Delivery failed' })
    }
  }
}
