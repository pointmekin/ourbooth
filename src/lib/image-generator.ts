import sharp from 'sharp'
import { getTemplateById, TEMPLATES } from '@/data/templates'

export type StickerType = 'emoji' | 'image'

export interface Sticker {
    id: number
    x: number // percentage 0-100
    y: number // percentage 0-100
    type: StickerType
    emoji?: string      // For emoji type
    src?: string        // For image type (URL path like /assets/images/stickers/love/heart.webp)
    scale: number       // 0.3 to 3.0 (1.0 = default size)
}

interface GenerateOptions {
    templateId: string
    stickers?: Sticker[]
    width?: number
    quality?: number
}

/**
 * Convert emoji to Twemoji CDN URL
 * Twemoji provides high-quality PNG emoji images
 */
function getEmojiUrl(emoji: string): string {
    // Convert emoji to code points
    const codePoints = [...emoji]
        .map(char => char.codePointAt(0)?.toString(16))
        .filter(Boolean)
        .join('-')
    
    // Use Twemoji CDN (72x72 PNG)
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`
}

/**
 * Fetch a sticker image from either Twemoji CDN or local public folder
 */
async function fetchStickerImage(sticker: Sticker): Promise<Buffer | null> {
    try {
        let url: string
        
        if (sticker.type === 'emoji' && sticker.emoji) {
            url = getEmojiUrl(sticker.emoji)
        } else if (sticker.type === 'image' && sticker.src) {
            // For local images, construct the full URL
            // In production, this should be the full URL to the asset
            const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : process.env.CF_PAGES_URL || 'http://localhost:3000'
            url = `${baseUrl}${sticker.src}`
        } else {
            console.warn(`[ImageGenerator] Invalid sticker configuration:`, sticker)
            return null
        }
        
        const response = await fetch(url)
        if (!response.ok) {
            console.warn(`[ImageGenerator] Failed to fetch sticker from ${url}: ${response.status}`)
            return null
        }
        
        return Buffer.from(await response.arrayBuffer())
    } catch (e) {
        console.error(`[ImageGenerator] Failed to fetch sticker:`, e)
        return null
    }
}

/**
 * Generate a photo strip from multiple images
 */
export async function generatePhotoStrip(
    imageDataUrls: string[],
    options: GenerateOptions
): Promise<Buffer> {
    const { templateId, stickers = [], width = 800, quality = 80 } = options
    
    // Get template configuration
    const template = getTemplateById(templateId) ?? TEMPLATES[0]
    const { layout, style, footer } = template
    
    // Calculate dimensions based on aspect ratio
    const [aspectW, aspectH] = layout.aspectRatio.split('/').map(Number)
    const aspectRatio = aspectW / aspectH
    const height = Math.round(width / aspectRatio)
    
    // Use template-defined padding/gap or fallback
    const padding = style.padding ? Math.round((style.padding / 16) * (width / 50)) : Math.round(width * 0.02)
    const gap = style.gap ? Math.round((style.gap / 16) * (width / 50)) : Math.round(width * 0.01)
    const footerHeight = footer.text ? Math.round(height * 0.08) : 0
    const photoRadius = style.photoRadius ?? 0

    const gridWidth = width - padding * 2
    const gridHeight = height - padding * 2 - footerHeight
    const cellWidth = Math.floor((gridWidth - (layout.cols - 1) * gap) / layout.cols)
    const cellHeight = Math.floor((gridHeight - (layout.rows - 1) * gap) / layout.rows)

    // Parse background color (handle gradients as solid fallback for server)
    let bgColor = { r: 255, g: 255, b: 255 }
    if (style.backgroundColor.startsWith('#')) {
        const hex = style.backgroundColor.slice(1)
        bgColor = {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
        }
    }

    // Create background
    const canvas = sharp({
        create: {
            width,
            height,
            channels: 3,
            background: bgColor,
        },
    })

    // Prepare composite layers
    const composites: sharp.OverlayOptions[] = []

    // Add images to grid
    for (let i = 0; i < layout.count; i++) {
        const dataUrl = imageDataUrls[i]
        if (!dataUrl) continue

        const col = i % layout.cols
        const row = Math.floor(i / layout.cols)

        const x = padding + col * (cellWidth + gap)
        const y = padding + row * (cellHeight + gap)

        try {
            // Convert data URL to buffer
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
            const imageBuffer = Buffer.from(base64Data, 'base64')

            // Resize and crop to fit cell
            let resizedImage = await sharp(imageBuffer)
                .resize(cellWidth, cellHeight, {
                    fit: 'cover',
                    position: 'center',
                })
                .toBuffer()

            // Apply border radius if specified
            if (photoRadius > 0) {
                const scaledRadius = Math.round((photoRadius / 16) * (width / 50))
                const mask = Buffer.from(
                    `<svg width="${cellWidth}" height="${cellHeight}">
                        <rect x="0" y="0" width="${cellWidth}" height="${cellHeight}" rx="${scaledRadius}" ry="${scaledRadius}" fill="white"/>
                    </svg>`
                )
                resizedImage = await sharp(resizedImage)
                    .composite([{ input: mask, blend: 'dest-in' }])
                    .png()
                    .toBuffer()
            }

            composites.push({
                input: resizedImage,
                left: x,
                top: y,
            })
        } catch (e) {
            console.error(`[ImageGenerator] Failed to process image ${i}:`, e)
        }
    }

    // Add footer text if present
    if (footer.text) {
        const footerY = height - footerHeight
        const fontSize = footer.size ? parseInt(footer.size) : 14
        const footerSvg = `
            <svg width="${width}" height="${footerHeight}" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="${width}" height="1" fill="#f5f5f5"/>
                <text 
                    x="${width / 2}" 
                    y="${footerHeight / 2 + 4}" 
                    font-family="Arial, Helvetica, sans-serif" 
                    font-size="${fontSize}" 
                    font-weight="500"
                    fill="${footer.color}"
                    text-anchor="middle"
                    letter-spacing="2"
                >${footer.text}</text>
            </svg>
        `

        composites.push({
            input: Buffer.from(footerSvg),
            left: 0,
            top: footerY,
        })
    }

    // Add stickers (both emoji and image types)
    if (stickers && stickers.length > 0) {
        const baseStickerSize = Math.round(width * 0.06) // 6% of width as base size
        
        for (const sticker of stickers) {
            try {
                const stickerBuffer = await fetchStickerImage(sticker)
                if (!stickerBuffer) continue
                
                // Apply scale to base size
                const stickerSize = Math.round(baseStickerSize * sticker.scale)
                
                // Resize sticker to desired size
                const resizedSticker = await sharp(stickerBuffer)
                    .resize(stickerSize, stickerSize, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                    })
                    .png()
                    .toBuffer()
                
                // Convert percentage to absolute position (centered on sticker)
                const stickerX = Math.round((sticker.x / 100) * width) - stickerSize / 2
                const stickerY = Math.round((sticker.y / 100) * height) - stickerSize / 2
                
                composites.push({
                    input: resizedSticker,
                    left: Math.max(0, Math.min(Math.round(stickerX), width - stickerSize)),
                    top: Math.max(0, Math.min(Math.round(stickerY), height - stickerSize)),
                })
            } catch (e) {
                console.error(`[ImageGenerator] Failed to add sticker:`, sticker, e)
            }
        }
        
        console.log(`[ImageGenerator] Added ${stickers.length} stickers to image`)
    }

    // Generate final image
    const result = await canvas
        .composite(composites)
        .png({ quality, compressionLevel: 9 })
        .toBuffer()

    return result
}

/**
 * Generate an animated GIF from multiple images
 */
export async function generateGif(
    imageDataUrls: string[],
    options: { width?: number; delay?: number } = {}
): Promise<Buffer> {
    const { width = 400 } = options
    const height = Math.round(width * 1.5) // 2:3 aspect ratio

    // Process each frame
    const frames: Buffer[] = []

    for (const dataUrl of imageDataUrls) {
        if (!dataUrl) continue

        try {
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
            const imageBuffer = Buffer.from(base64Data, 'base64')

            const frame = await sharp(imageBuffer)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center',
                })
                .toBuffer()

            frames.push(frame)
        } catch (e) {
            console.error('[ImageGenerator] Failed to process GIF frame:', e)
        }
    }

    if (frames.length === 0) {
        throw new Error('No valid frames for GIF generation')
    }

    // Sharp doesn't natively support GIF creation with animation
    // We'll use sharp to create individual frames and return as WebP animation
    // For true GIF, we'd need gifenc or similar, but WebP is better for modern browsers

    await sharp(frames[0], { animated: true })
        .webp({
            quality: 80,
            loop: 0, // infinite loop
        })
        .toBuffer()

    // Note: For actual animated output, we concatenate frames
    // Sharp's animated WebP requires special handling
    // For now, return first frame as PNG - full GIF support needs gifenc
    
    return await sharp(frames[0]).png().toBuffer()
}

/**
 * Generate a thumbnail for gallery display
 */
export async function generateThumbnail(
    imageBuffer: Buffer,
    size: number = 200
): Promise<Buffer> {
    return await sharp(imageBuffer)
        .resize(size, size, {
            fit: 'cover',
            position: 'center',
        })
        .jpeg({ quality: 70 })
        .toBuffer()
}

/**
 * Optimize an image buffer for storage
 */
export async function optimizeForStorage(
    buffer: Buffer,
    format: 'png' | 'jpeg' | 'webp' = 'png'
): Promise<Buffer> {
    const pipeline = sharp(buffer)

    switch (format) {
        case 'jpeg':
            return pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer()
        case 'webp':
            return pipeline.webp({ quality: 80 }).toBuffer()
        case 'png':
        default:
            return pipeline.png({ quality: 80, compressionLevel: 9 }).toBuffer()
    }
}
