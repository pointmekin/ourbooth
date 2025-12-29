import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || (import.meta as any).env?.VITE_BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET || (import.meta as any).env?.VITE_BETTER_AUTH_SECRET,
})
