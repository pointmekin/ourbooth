import { Storage } from '@google-cloud/storage'

let storage: Storage | null = null

function getStorage(): Storage {
    if (storage) return storage

    const projectId = process.env.GCP_PROJECT_ID
    const credentials = process.env.GCP_SERVICE_ACCOUNT_KEY

    if (!projectId || !credentials) {
        console.warn('[GCP Storage] Missing credentials. Using mock mode.')
        // Return a mock storage for development
        storage = new Storage({ projectId: 'mock-project' })
        return storage
    }

    try {
        const parsedCredentials = JSON.parse(credentials)
        storage = new Storage({
            projectId,
            credentials: parsedCredentials,
        })
    } catch (e) {
        console.error('[GCP Storage] Failed to parse credentials:', e)
        storage = new Storage({ projectId: 'mock-project' })
    }

    return storage
}

function getBucketName(): string {
    return process.env.GCP_BUCKET_NAME || 'ourbooth-photos'
}

export async function uploadBuffer(
    buffer: Buffer,
    path: string,
    contentType: string
): Promise<{ url: string; path: string }> {
    const bucketName = getBucketName()
    
    // Check if credentials are configured
    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_SERVICE_ACCOUNT_KEY) {
        console.warn('[GCP Storage] Credentials not configured. Skipping upload.')
        // Return a placeholder URL for development
        return {
            url: `https://storage.googleapis.com/${bucketName}/${path}`,
            path: path,
        }
    }

    const storage = getStorage()
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(path)

    await file.save(buffer, {
        contentType,
        metadata: {
            cacheControl: 'public, max-age=31536000', // 1 year cache
        },
    })

    // Generate a signed URL for download (valid for 7 days)
    const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return {
        url: signedUrl,
        path: path,
    }
}

export async function deleteObject(path: string): Promise<void> {
    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_SERVICE_ACCOUNT_KEY) {
        console.warn('[GCP Storage] Credentials not configured. Skipping delete.')
        return
    }

    const storage = getStorage()
    const bucket = storage.bucket(getBucketName())
    const file = bucket.file(path)

    try {
        await file.delete()
    } catch (e) {
        console.error('[GCP Storage] Failed to delete:', path, e)
    }
}

export async function getSignedUrl(
    path: string,
    expiresInMs: number = 3600000 // 1 hour default
): Promise<string> {
    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_SERVICE_ACCOUNT_KEY) {
        return `https://storage.googleapis.com/${getBucketName()}/${path}`
    }

    const storage = getStorage()
    const bucket = storage.bucket(getBucketName())
    const file = bucket.file(path)

    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMs,
    })

    return url
}
