import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export type StickerType = 'emoji' | 'image'

export interface ExportSticker {
    id: number
    x: number
    y: number
    type: StickerType
    emoji?: string      // For emoji type
    src?: string        // For image type (URL path)
    scale: number
}

interface ExportInput {
    images: string[] // base64 data URLs
    templateId: string
    stickers?: ExportSticker[]
    exportType: 'png' | 'gif'
}

export const exportPhotoboothFn = createServerFn({ method: 'POST' })
    .inputValidator((data: ExportInput) => data)
    .handler(async ({ data }: { data: ExportInput }) => {
        try {
            // Dynamic imports to isolate server code
            const { db } = await import('@/db')
            const { user, userPhoto } = await import('@/db/schema')
            const { auth } = await import('@/lib/auth')
            const { eq, sql } = await import('drizzle-orm')
            const { generatePhotoStrip, generateThumbnail } = await import('@/lib/image-generator')
            const { uploadBuffer } = await import('@/lib/gcp-storage')

            // Get request using TanStack Start utility
            const request = getRequest()
            if (!request) {
                throw new Error("Internal Server Error: Missing Request context")
            }

            // Authenticate
            const session = await auth.api.getSession({ 
                headers: request.headers
            })

            if (!session) {
                throw new Error("Unauthorized")
            }

            const userId = session.user.id
            const { images, templateId, stickers, exportType } = data

            // Check credits
            const [currentUser] = await db.select().from(user).where(eq(user.id, userId))
            
            if (!currentUser || currentUser.credits < 1) {
                throw new Error("Insufficient credits")
            }

            // Filter out null images
            const validImages = images.filter((img: string | null) => img && img.length > 0)
            
            if (validImages.length === 0) {
                throw new Error("No images provided")
            }

            console.log(`[Export] Generating ${exportType} for user ${userId}, template: ${templateId}, images: ${validImages.length}`)

            // Generate the image
            const imageBuffer = await generatePhotoStrip(validImages, { templateId, stickers })
            const contentType = 'image/png'
            const fileExtension = 'png'

            // Generate thumbnail
            const thumbnailBuffer = await generateThumbnail(imageBuffer, 200)

            // Generate unique paths
            const photoId = crypto.randomUUID()
            const storagePath = `photos/${userId}/${photoId}.${fileExtension}`
            const thumbnailPath = `photos/${userId}/${photoId}_thumb.jpg`

            // Upload to GCP
            const [photoUpload, thumbUpload] = await Promise.all([
                uploadBuffer(imageBuffer, storagePath, contentType),
                uploadBuffer(thumbnailBuffer, thumbnailPath, 'image/jpeg'),
            ])

            // Save to database
            await db.insert(userPhoto).values({
                id: photoId,
                userId: userId,
                type: exportType,
                layout: templateId,
                storageUrl: photoUpload.url,
                storagePath: photoUpload.path,
                thumbnailUrl: thumbUpload.url,
                fileSize: imageBuffer.length,
                createdAt: new Date(),
            })

            // Deduct credit
            await db.update(user)
                .set({ credits: sql`${user.credits} - 1` })
                .where(eq(user.id, userId))

            console.log(`[Export] Success! Photo ${photoId} saved, credited deducted.`)

            return { 
                success: true, 
                photoId,
                downloadUrl: photoUpload.url,
                thumbnailUrl: thumbUpload.url,
                remainingCredits: currentUser.credits - 1 
            }
        } catch (error: any) {
            console.error("[ExportFn] Error:", error.message)
            throw error
        }
    })

// Legacy function for backwards compatibility
export const deductCreditFn = createServerFn({ method: 'POST' })
    .handler(async () => {
        try {
            const { db } = await import('@/db')
            const { user, order } = await import('@/db/schema')
            const { auth } = await import('@/lib/auth')
            const { eq, sql } = await import('drizzle-orm')

            const request = getRequest()
            if (!request) {
                throw new Error("Internal Server Error: Missing Request context")
            }

            const session = await auth.api.getSession({ 
                headers: request.headers
            })

            if (!session) {
                throw new Error("Unauthorized")
            }

            const userId = session.user.id
            const [currentUser] = await db.select().from(user).where(eq(user.id, userId))
            
            if (!currentUser || currentUser.credits < 1) {
                throw new Error("Insufficient credits")
            }

            await db.update(user)
                .set({ credits: sql`${user.credits} - 1` })
                .where(eq(user.id, userId))

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
