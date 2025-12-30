import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export const getUserPhotosFn = createServerFn({ method: 'GET' })
    .handler(async () => {
        try {
            const { db } = await import('@/db')
            const { userPhoto } = await import('@/db/schema')
            const { auth } = await import('@/lib/auth')
            const { eq, desc } = await import('drizzle-orm')

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

            const photos = await db
                .select()
                .from(userPhoto)
                .where(eq(userPhoto.userId, session.user.id))
                .orderBy(desc(userPhoto.createdAt))

            return { 
                success: true, 
                photos: photos.map(p => ({
                    id: p.id,
                    type: p.type,
                    layout: p.layout,
                    url: p.storageUrl,
                    thumbnailUrl: p.thumbnailUrl,
                    fileSize: p.fileSize,
                    createdAt: p.createdAt.toISOString(),
                }))
            }
        } catch (error: any) {
            console.error("[GetUserPhotos] Error:", error.message)
            throw error
        }
    })

interface DeletePhotoInput {
    photoId: string
}

export const deleteUserPhotoFn = createServerFn({ method: 'POST' })
    .inputValidator((data: DeletePhotoInput) => data)
    .handler(async ({ data }: { data: DeletePhotoInput }) => {
        try {
            const { db } = await import('@/db')
            const { userPhoto } = await import('@/db/schema')
            const { auth } = await import('@/lib/auth')
            const { eq, and } = await import('drizzle-orm')
            const { deleteObject } = await import('@/lib/gcp-storage')

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

            const { photoId } = data

            // Get photo to verify ownership and get storage path
            const [photo] = await db
                .select()
                .from(userPhoto)
                .where(and(
                    eq(userPhoto.id, photoId),
                    eq(userPhoto.userId, session.user.id)
                ))

            if (!photo) {
                throw new Error("Photo not found")
            }

            // Delete from GCP storage
            await deleteObject(photo.storagePath)
            
            // Delete thumbnail if exists
            if (photo.thumbnailUrl) {
                const thumbPath = photo.storagePath.replace(/\.[^.]+$/, '_thumb.jpg')
                await deleteObject(thumbPath)
            }

            // Delete from database
            await db
                .delete(userPhoto)
                .where(eq(userPhoto.id, photoId))

            return { success: true }
        } catch (error: any) {
            console.error("[DeleteUserPhoto] Error:", error.message)
            throw error
        }
    })
