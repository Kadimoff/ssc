import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, sql } from './db/client'

await migrate(db, { migrationsFolder: './drizzle' })
await sql.end()
console.log('Database migrations are current.')
