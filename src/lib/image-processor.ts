import sharp from 'sharp'
import { getSharpModifiers } from './filter-utils'
import type { FilterParameters } from '@/types/filters'

/**
 * Apply color filters to an image buffer using Sharp operations
 *
 * This function applies the selected filter to an individual photo BEFORE compositing.
 * Filters are applied via Sharp's modulate() and linear() operations, matching CSS preview.
 *
 * IMPORTANT: Apply filters to individual images, NOT the composited photo strip.
 * Applying after compositing would affect background, borders, and text.
 *
 * @param imageBuffer - Input image as buffer (base64-decoded data URL)
 * @param parameters - Filter parameters from selected preset
 * @param intensity - Filter intensity (0-100)
 * @returns Processed image buffer with filter applied
 * @throws Error with user-friendly message if Sharp processing fails
 */
export async function applyFiltersToImage(
  imageBuffer: Buffer,
  parameters: FilterParameters,
  intensity: number
): Promise<Buffer> {
  // Zero intensity means no filter - return original
  if (intensity <= 0 || !parameters) {
    return imageBuffer
  }

  try {
    // Get Sharp modifiers using existing utility from Phase 1
    const modifiers = getSharpModifiers(parameters, intensity)

    // Build Sharp pipeline
    let pipeline = sharp(imageBuffer)

    // Apply brightness and saturation via modulate()
    // Sharp modulate uses multipliers: 100 = normal (not percentages like CSS)
    if (modifiers.brightness !== 100 || modifiers.saturation !== 100) {
      pipeline = pipeline.modulate({
        brightness: modifiers.brightness / 100,  // Convert to multiplier
        saturation: modifiers.saturation / 100   // Convert to multiplier
      })
    }

    // Apply contrast via linear adjustment
    // Sharp linear() uses slope/intercept: a * input + b
    if (modifiers.contrastLow !== null && modifiers.contrastHigh !== null) {
      const slope = (modifiers.contrastHigh - modifiers.contrastLow) / 255
      pipeline = pipeline.linear(slope, modifiers.contrastLow)
    }

    // Return processed buffer
    return await pipeline.toBuffer()
  } catch (error) {
    // Log technical details for debugging
    console.error('[ImageProcessor] Sharp processing failed:', {
      error: error instanceof Error ? error.message : String(error),
      parameters,
      intensity,
      bufferSize: imageBuffer.length
    })

    // Throw user-friendly error message
    throw new Error('Filter could not be applied. Try adjusting intensity or choosing a different filter.')
  }
}
