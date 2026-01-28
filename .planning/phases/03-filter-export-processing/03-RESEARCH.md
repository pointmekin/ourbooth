# Phase 3: Filter Export Processing - Research

**Researched:** 2026-01-29
**Domain:** Node.js image processing with Sharp, parallel processing patterns
**Confidence:** HIGH

## Summary

This phase requires integrating Sharp's color manipulation operations into the existing export flow to apply filters that match CSS preview exactly. The existing codebase already has FilterUtils with `getSharpModifiers()` function that maps filter parameters to Sharp operations. The primary research focused on understanding Sharp's API for color manipulation (`modulate`, `linear`, `grayscale`), parallel processing patterns for multiple images, error handling strategies, and memory/buffer management patterns.

**Key findings:**
- Sharp 0.34.5 is already installed and used in `image-generator.ts`
- Existing `getSharpModifiers()` correctly maps to `modulate()` (saturation, brightness) and `linear()` (contrast)
- Sharp's `modulate()` uses multipliers (100 = normal), not percentages like CSS
- Buffer-based processing is slower than file I/O but necessary for in-memory data URLs
- `Promise.all()` is sufficient for parallel processing of 4 images
- Error handling should catch Sharp-specific errors and show simplified messages

**Primary recommendation:** Apply filters to individual images before compositing them into the photo strip, using `Promise.all()` for parallel processing with try-catch error handling around each image operation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sharp | 0.34.5 | High-performance Node.js image processing | Industry standard for server-side image manipulation in Node.js ecosystem. Already installed in project. Uses libvips for speed and efficiency. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-start | ^1.132.0 | Server function creation | Already used for `exportPhotoboothFn` - provides type-safe server functions |
| zustand | ^5.0.9 | State management | Already used for filter store - provides access to selected filter and intensity |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Buffer-based processing | Temporary file I/O | File I/O is 2.7x faster but adds complexity with temp file cleanup. For 4 images at once, Buffer approach is simpler and sufficient. |
| Promise.all() | Worker threads | Worker threads provide true parallelism but add significant complexity. For 4 images, Promise.all() provides adequate concurrency via Node.js event loop. |

**Installation:**
No additional packages needed - Sharp 0.34.5 already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── filter-utils.ts          # Already exists - getSharpModifiers()
│   ├── image-generator.ts       # Already exists - generatePhotoStrip()
│   └── image-processor.ts       # NEW - applyFilters(), processImageWithFilter()
├── server/
│   └── export.ts                # Modify - add filter parameter handling
└── stores/
    ├── photobooth-store.ts      # Modify - add filter state to export
    └── filter-store.ts          # Already exists - selectedFilter, intensity
```

### Pattern 1: Filter Application Pipeline
**What:** Apply filters to individual images before compositing into photo strip
**When to use:** During export flow when processing captured photos
**Example:**
```typescript
// Source: /lovell/sharp Context7 documentation
// src/lib/image-processor.ts
import sharp from 'sharp'
import { getSharpModifiers } from './filter-utils'
import type { FilterParameters } from '@/types/filters'

export async function applyFiltersToImage(
  imageBuffer: Buffer,
  parameters: FilterParameters,
  intensity: number
): Promise<Buffer> {
  const modifiers = getSharpModifiers(parameters, intensity)

  let pipeline = sharp(imageBuffer)

  // Apply brightness and saturation via modulate
  if (modifiers.brightness !== 100 || modifiers.saturation !== 100) {
    pipeline = pipeline.modulate({
      brightness: modifiers.brightness / 100, // Convert to multiplier
      saturation: modifiers.saturation / 100  // Convert to multiplier
    })
  }

  // Apply contrast via linear adjustment
  if (modifiers.contrastLow !== null && modifiers.contrastHigh !== null) {
    // Calculate slope from contrast points
    const slope = (modifiers.contrastHigh - modifiers.contrastLow) / 255
    pipeline = pipeline.linear(slope, modifiers.contrastLow)
  }

  return pipeline.toBuffer()
}
```

### Pattern 2: Parallel Processing with Promise.all
**What:** Process multiple images concurrently using Promise.all()
**When to use:** Exporting photo strip with 4 images
**Example:**
```typescript
// Source: Existing codebase pattern in export.ts
export async function processImagesWithFilters(
  imageDataUrls: string[],
  filterParams: FilterParameters | null,
  intensity: number
): Promise<Buffer[]> {
  // Process all images in parallel
  const processingPromises = imageDataUrls.map(async (dataUrl) => {
    if (!dataUrl) return null

    try {
      // Convert data URL to buffer
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')

      // Apply filter if selected
      if (filterParams && intensity > 0) {
        return await applyFiltersToImage(imageBuffer, filterParams, intensity)
      }

      return imageBuffer
    } catch (error) {
      console.error('[ImageProcessor] Failed to process image:', error)
      throw new Error('Filter could not be applied to one or more images')
    }
  })

  // Wait for all images to complete processing
  return Promise.all(processingPromises)
}
```

### Pattern 3: Error Handling with Simplified Messages
**What:** Catch Sharp errors and throw user-friendly messages
**When to use:** All filter processing operations
**Example:**
```typescript
// Source: Context decisions from 03-CONTEXT.md
export async function safeApplyFilters(
  imageBuffer: Buffer,
  parameters: FilterParameters,
  intensity: number
): Promise<Buffer> {
  try {
    return await applyFiltersToImage(imageBuffer, parameters, intensity)
  } catch (error) {
    // Log technical details for debugging
    console.error('[FilterProcessor] Sharp error:', {
      error: error.message,
      parameters,
      intensity,
      imageSize: imageBuffer.length
    })

    // Throw simplified user-facing message
    throw new Error('Filter could not be applied. Try adjusting intensity or choosing a different filter.')
  }
}
```

### Anti-Patterns to Avoid
- **Applying filters after compositing:** Don't apply filters to the entire photo strip canvas. Apply to individual photos before compositing to ensure consistent filter appearance across different layouts.
- **Blocking sequential processing:** Don't process images one-by-one in a loop. Use Promise.all() for concurrent processing.
- **Exposing Sharp error details:** Don't send raw Sharp error messages to users. They contain technical internals that users can't act on.
- **Using CSS filter values directly:** Don't pass CSS filter percentages to Sharp. Sharp uses multipliers (100 = normal) while CSS uses percentages with different baselines.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color space conversion | Custom RGB/HSL math | sharp.modulate() | Sharp handles color space conversions correctly, including sRGB gamma corrections |
| Contrast adjustment | Custom histogram manipulation | sharp.linear() | Sharp's linear adjustment is optimized and handles edge cases correctly |
| Parallel processing coordination | Custom queue/worker system | Promise.all() | Node.js event loop provides sufficient concurrency for 4 images without complexity |
| Buffer operations | Custom base64 encoding | Buffer.from() | Built-in Node.js Buffer methods are optimized and handle edge cases |

**Key insight:** Sharp has already solved image processing operations correctly. Custom implementations will be slower, buggier, and fail on edge cases (like different color spaces, EXIF data, alpha channels).

## Common Pitfalls

### Pitfall 1: Mismatched Filter Values Between CSS and Sharp
**What goes wrong:** Exported images look different from CSS preview
**Why it happens:** CSS filters use percentages with different baselines (e.g., brightness: 100% = normal) while Sharp modulate uses multipliers (brightness: 1.0 = normal)
**How to avoid:** Use the existing `getSharpModifiers()` function from Phase 1, which correctly scales CSS parameter values to Sharp multipliers. Don't bypass this translation layer.
**Warning signs:** Filter preview in browser looks correct but exported image is too bright/dark/saturated

### Pitfall 2: Memory Leaks from Large Buffers
**What goes wrong:** Server memory usage grows continuously with each export
**Why it happens:** Sharp's `toBuffer()` creates new Buffer objects. If not properly scoped or awaited, buffers accumulate in memory.
**How to avoid:** Ensure all Sharp operations are properly awaited with `await` keyword. Don't create unnecessary intermediate buffers. Let Node.js garbage collect buffers after function returns.
**Warning signs:** RSS memory grows with each export operation in server monitoring

### Pitfall 3: Applying Filters to Wrong Image Stage
**What goes wrong:** Filters appear incorrectly or affect photo strip background/borders
**Why it happens:** Applying filters after compositing the photo strip, which affects the entire canvas including background, borders, and text
**How to avoid:** Apply filters to individual photo images BEFORE compositing them onto the photo strip canvas. In `image-generator.ts`, apply filters in the image processing loop (around line 211) before resizing.
**Warning signs:** Background colors, borders, or footer text have filter effects applied

### Pitfall 4: Partial Export Success
**What goes wrong:** Some images processed successfully, others failed, resulting in corrupted photo strip
**Why it happens:** Promise.all() fails fast but doesn't clean up partial work
**How to avoid:** Use try-catch around individual image processing operations. If any image fails, fail the entire export operation before uploading to GCP or saving to database.
**Warning signs:** Export completes but photo strip has missing or placeholder images

### Pitfall 5: Slow Buffer Input Performance
**What goes wrong:** Export takes significantly longer than expected
**Why it happens:** Passing Buffers as input to Sharp is 2.7x slower than file paths
**How to avoid:** While Buffer processing is necessary for data URLs, minimize the number of times buffers are passed through Sharp. Chain Sharp operations together before calling `toBuffer()`.
**Warning signs:** Export takes more than 10 seconds for 4 images

## Code Examples

Verified patterns from official sources:

### Applying Modulate Filters
```typescript
// Source: /lovell/sharp Context7 - modulate documentation
await sharp(input)
  .modulate({
    brightness: 0.5,    // Multiplicative: 0.5 = half brightness
    saturation: 1.2,    // Multiplicative: 1.2 = 20% more saturated
  })
  .toBuffer()
```

### Applying Linear Contrast Adjustment
```typescript
// Source: /lovell/sharp Context7 - linear documentation
// Increase contrast: slope > 1
const slope = 1.15  // 15% contrast increase
await sharp(input)
  .linear(slope, 0)  // a * input + b formula
  .toBuffer()
```

### Grayscale Conversion
```typescript
// Source: /lovell/sharp Context7 - grayscale documentation
await sharp(input)
  .grayscale()
  .toBuffer()
```

### Parallel Image Processing
```typescript
// Source: WebSearch "Parallel operations with Promise.all"
const images = await Promise.all([
  processImage(image1),
  processImage(image2),
  processImage(image3),
  processImage(image4),
])
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jimp (pure JS) | Sharp (libvips bindings) | ~2018 | Sharp is 4-5x faster due to native libvips |
| ImageMagick CLI | Sharp Node API | ~2016 | Sharp provides better Node.js integration and memory management |
| Sequential processing | Promise.all() parallel | ~2019 | Modern Node.js (v10+) handles async operations efficiently |

**Deprecated/outdated:**
- **child_process for image processing:** Too slow due to process spawn overhead
- **gm (GraphicsMagick) wrapper:** Unmaintained, slower than Sharp
- **Applying filters via CSS filters on canvas:** Not server-side compatible, doesn't export to image files

## Open Questions

1. **Tint/Sepia implementation detail**
   - What we know: Sharp has `.tint()` operation for color casts
   - What's unclear: Whether `.tint()` or `modulate({saturation})` approach better matches sepia CSS filter
   - Recommendation: Current `getSharpModifiers()` uses saturation reduction for sepia. Test against CSS preview. If mismatch, experiment with `.tint(160, 120, 60)` (sepia tone RGB values).

2. **Grayscale with warmth**
   - What we know: Noir filter combines grayscale with brightness/contrast adjustments
   - What's unclear: Whether to use `.grayscale()` or saturation = 0 via modulate
   - Recommendation: Current implementation uses saturation = 0 via modulate. This is consistent with CSS `grayscale(100%)`. `.grayscale()` is equivalent but mixing modulate operations is preferred for consistency.

3. **Memory management for 4K ultra resolution**
   - What we know: Ultra resolution (4x multiplier) creates very large images (~6400px wide)
   - What's unclear: Whether memory limits will be hit on serverless platforms
   - Recommendation: Monitor memory usage during testing. If issues arise, add intermediate `.toBuffer()` calls to free memory, or limit max resolution to 2x (high) for serverless deployment.

## Sources

### Primary (HIGH confidence)
- /lovell/sharp - modulate, linear, grayscale, tint operations API documentation
- /lovell/sharp - composite operations for overlaying images
- Existing codebase - `/src/lib/filter-utils.ts` (Phase 1 implementation)
- Existing codebase - `/src/lib/image-generator.ts` (current export flow)
- Existing codebase - `/src/server/export.ts` (server function structure)

### Secondary (MEDIUM confidence)
- [Unleashing Parallel Processing with Node.js Worker Threads](https://dev.to/sarvabharan/unleashing-parallel-processing-with-nodejs-worker-threads-4dab) - Worker thread patterns (verified worker threads are overkill for this use case)
- [Preventing Memory Issues in Node.js Sharp: A Journey](https://www.brand.dev/blog/preventing-memory-issues-in-node-js-sharp-a-journey) - Memory management best practices (2025)
- [Day 37: Image Processing in Node.js Using Sharp](https://blog.stackademic.com/day-37-image-processing-in-node-js-using-sharp-50b7038d017f) - Security validation patterns (2025)

### Tertiary (LOW confidence)
- [How To Process Images in Node.js with Sharp](https://www.digitalocean.com/community/tutorials/how-to-process-images-in-node-js-with-sharp) - General tutorial (older, 2021)
- [Build an Image Processing API with Express, Multer, Potrace, and Sharp](https://dev.to/blamsa0mine/build-an-image-processing-api-with-express-multer-and-sharp-43l4) - Express-specific patterns (not directly applicable to TanStack Start server functions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Sharp 0.34.5 is industry standard, already installed, well-documented
- Architecture: HIGH - Based on existing codebase patterns and verified Context7 documentation
- Pitfalls: HIGH - Identified from known Sharp issues (buffer performance, CSS/Sharp value mismatch) and existing codebase structure

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (60 days - Sharp API is stable, Node.js patterns evolve slowly)
