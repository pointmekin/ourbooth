import { createServerFn } from '@tanstack/react-start'

export const deductCreditFn = createServerFn({ method: 'POST' })
    .handler(async (ctx: any) => {
        try {
            // Dynamic imports to isolate server code
            const { db } = await import('@/db')
            const { user, order } = await import('@/db/schema')
            const { auth } = await import('@/lib/auth')
            const { eq, sql } = await import('drizzle-orm')

            // Extract request from the context passed by TanStack Start
            // Context structure might vary, but 'request' is usually top-level in the payload
            const request = ctx.request as Request;

            if (!request) {
                 throw new Error("Internal Server Error: Missing Request context")
            }

            const headers = request.headers
            const session = await auth.api.getSession({ 
                headers: headers
            })

            if (!session) {
                throw new Error("Unauthorized")
            }

            const userId = session.user.id
            
            // Check credits
            const [currentUser] = await db.select().from(user).where(eq(user.id, userId))
            
            if (!currentUser || currentUser.credits < 1) {
                throw new Error("Insufficient credits")
            }

            // Deduct credit
            await db.update(user)
                .set({ credits: sql`${user.credits} - 1` })
                .where(eq(user.id, userId))

            // Create Order Record
            await db.insert(order).values({
                id: crypto.randomUUID(),
                userId: userId,
                type: 'digital',
                status: 'completed',
                amount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            })

            return { success: true, remainingCredits: currentUser.credits - 1 }
        } catch (error: any) {
            console.error("[ExportFn] Error:", error.message)
            throw error
        }
    })
