import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

// Helper to get connection string safely
const getConnectionString = () => {
    let url = ''
    if (typeof process !== 'undefined' && process.env?.VITE_DATABASE_URL) {
        url = process.env.VITE_DATABASE_URL
    } else 
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATABASE_URL) {
        // @ts-ignore
        url = import.meta.env.VITE_DATABASE_URL
    }
    
    console.log("[DB] Connection String present:", !!url, "Context:", typeof process !== 'undefined' ? 'Node/Server' : 'Browser')
    return url
} 

const connectionString = getConnectionString()

// Throw error on server if missing, to be explicit?
if (!connectionString && typeof window === 'undefined') {
    console.error("[DB] CRITICAL: VITE_DATABASE_URL is missing on Server!")
}

// Throw or handle empty string appropriately, but for now allow it to not crash immediately imports
const sql = neon(connectionString || 'postgres://placeholder');
export const db = drizzle(sql, { schema });

let client: ReturnType<typeof neon>

export function getClient() {
  if (!connectionString) {
    return undefined
  }
  if (!client) {
    client = neon(connectionString)
  }
  return client
}
