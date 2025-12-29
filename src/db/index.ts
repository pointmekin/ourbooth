import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema.ts'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
    console.warn("DATABASE_URL is missing!")
}
const sql = neon(databaseUrl!)
export const db = drizzle(sql, { schema })
