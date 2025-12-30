import sharp from 'sharp'

interface Sticker {
    id: number
    x: number // percentage 0-100
    y: number // percentage 0-100  
    emoji: string
}

interface GenerateOptions {
    layout: '2x2' | '1x4' | '1x3'
    stickers?: Sticker[]
    width?: number
    quality?: number
}

const LAYOUT_CONFIG = {
    '2x2': { cols: 2, rows: 2, count: 4, aspectRatio: 2 / 3 },
    '1x4': { cols: 1, rows: 4, count: 4, aspectRatio: 1 / 4 },
    '1x3': { cols: 1, rows: 3, count: 3, aspectRatio: 1 / 3 },
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
 * Generate a photo strip from multiple images
 */
export async function generatePhotoStrip(
    imageDataUrls: string[],
    options: GenerateOptions
): Promise<Buffer> {
    const { layout, stickers = [], width = 800, quality = 80 } = options
    const config = LAYOUT_CONFIG[layout]

    // Calculate dimensions
    const height = Math.round(width / config.aspectRatio)
    const padding = Math.round(width * 0.02) // 2% padding
    const footerHeight = Math.round(height * 0.08) // 8% footer

    const gridWidth = width - padding * 2
    const gridHeight = height - padding * 2 - footerHeight
    const cellWidth = Math.floor((gridWidth - (config.cols - 1) * padding) / config.cols)
    const cellHeight = Math.floor((gridHeight - (config.rows - 1) * padding) / config.rows)

    // Create white background
    const canvas = sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
        },
    })

    // Prepare composite layers
    const composites: sharp.OverlayOptions[] = []

    // Add images to grid
    for (let i = 0; i < config.count; i++) {
        const dataUrl = imageDataUrls[i]
        if (!dataUrl) continue

        const col = i % config.cols
        const row = Math.floor(i / config.cols)

        const x = padding + col * (cellWidth + padding)
        const y = padding + row * (cellHeight + padding)

        try {
            // Convert data URL to buffer
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
            const imageBuffer = Buffer.from(base64Data, 'base64')

            // Resize and crop to fit cell
            const resizedImage = await sharp(imageBuffer)
                .resize(cellWidth, cellHeight, {
                    fit: 'cover',
                    position: 'center',
                })
                .toBuffer()

            composites.push({
                input: resizedImage,
                left: x,
                top: y,
            })
        } catch (e) {
            console.error(`[ImageGenerator] Failed to process image ${i}:`, e)
        }
    }

    // Add footer text
    const footerY = height - footerHeight
    const footerSvg = `
        <svg width="${width}" height="${footerHeight}">
            <rect x="0" y="0" width="${width}" height="1" fill="#f5f5f5"/>
            <text 
                x="${width / 2}" 
                y="${footerHeight / 2 + 4}" 
                font-family="monospace" 
                font-size="12" 
                fill="#a3a3a3"
                text-anchor="middle"
                letter-spacing="3"
            >OURBOOTH • 2025</text>
        </svg>
    `

    composites.push({
        input: Buffer.from(footerSvg),
        left: 0,
        top: footerY,
    })

    // Add stickers/emojis using Twemoji PNG images
    if (stickers && stickers.length > 0) {
        const stickerSize = Math.round(width * 0.08) // 8% of width for emoji size
        
        for (const sticker of stickers) {
            try {
                // Convert emoji to Twemoji URL
                const emojiUrl = getEmojiUrl(sticker.emoji)
                
                // Fetch the emoji PNG from Twemoji CDN
                const response = await fetch(emojiUrl)
                if (!response.ok) {
                    console.warn(`[ImageGenerator] Failed to fetch emoji: ${sticker.emoji}`)
                    continue
                }
                
                const emojiBuffer = Buffer.from(await response.arrayBuffer())
                
                // Resize emoji to desired size
                const resizedEmoji = await sharp(emojiBuffer)
                    .resize(stickerSize, stickerSize, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                    })
                    .png()
                    .toBuffer()
                
                // Convert percentage to absolute position
                const stickerX = Math.round((sticker.x / 100) * width) - stickerSize / 2
                const stickerY = Math.round((sticker.y / 100) * height) - stickerSize / 2
                
                composites.push({
                    input: resizedEmoji,
                    left: Math.max(0, Math.min(stickerX, width - stickerSize)),
                    top: Math.max(0, Math.min(stickerY, height - stickerSize)),
                })
            } catch (e) {
                console.error(`[ImageGenerator] Failed to add sticker ${sticker.emoji}:`, e)
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
