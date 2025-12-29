import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema.ts'

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || (import.meta as any).env?.VITE_DATABASE_URL
if (!databaseUrl) {
    console.error("CRITICAL: DATABASE_URL is missing! Auth and DB operations will fail.");
}
const sql = neon(databaseUrl!)
export const db = drizzle(sql, { schema })
