---
phase: 03-filter-export-processing
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/image-processor.ts
autonomous: true

must_haves:
  truths:
    - "Image processor module can apply Sharp filters to a single image buffer"
    - "Filters use existing getSharpModifiers() for CSS/Sharp consistency"
    - "Processor applies modulate (brightness/saturation) and linear (contrast) operations"
    - "Function throws user-friendly error when Sharp processing fails"
  artifacts:
    - path: "src/lib/image-processor.ts"
      provides: "Filter application via Sharp operations"
      exports: ["applyFiltersToImage"]
      min_lines: 50
  key_links:
    - from: "src/lib/image-processor.ts"
      to: "src/lib/filter-utils.ts"
      via: "import getSharpModifiers"
      pattern: "getSharpModifiers"
---

<objective>
Create a standalone image processor module that applies color filters to individual images using Sharp operations. This module bridges the filter state (from Phase 2) with the export pipeline, ensuring exported photo strips include filter effects that match CSS preview exactly.

Purpose: Enable server-side filter application during export by wrapping Sharp operations in a reusable function. The module uses existing FilterUtils for consistent CSS/Sharp mapping.

Output: New `src/lib/image-processor.ts` with `applyFiltersToImage()` function
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-filter-export-processing/03-RESEARCH.md
@.planning/STATE.md

# Prior Phase Summary (Phase 1)
@.planning/phases/01-filter-foundations/01-03-filter-utilities-SUMMARY.md

# Source Code
@src/lib/filter-utils.ts
@src/types/filters.ts
</context>

<tasks>

<task type="auto">
  <name>Create image processor module with filter application function</name>
  <files>src/lib/image-processor.ts</files>
  <action>
Create new file `src/lib/image-processor.ts` with the following implementation:

```typescript
import sharp from 'sharp'
import { getSharpModifiers, type SharpModifiers } from './filter-utils'
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
```

Key implementation notes:
1. Zero intensity check - returns original buffer without processing
2. Uses existing `getSharpModifiers()` from Phase 1 for CSS/Sharp consistency
3. Converts Sharp modifier values (100-based) to multipliers for modulate()
4. Applies contrast using linear() with calculated slope from contrastLow/contrastHigh
5. Try-catch with console.error logging for technical details
6. Throws simplified user-facing error (not Sharp internals)
  </action>
  <verify>
File exists at src/lib/image-processor.ts
Export named applyFiltersToImage is present
File imports getSharpModifiers from filter-utils
File imports FilterParameters from types/filters
</verify>
  <done>
Module exports applyFiltersToImage that accepts (Buffer, FilterParameters, number) and returns Promise<Buffer>
Function uses getSharpModifiers for parameter conversion
Function has try-catch with user-friendly error message
</done>
</task>

</tasks>

<verification>
1. Check file exists: `ls src/lib/image-processor.ts`
2. Verify exports: `grep -E "export.*applyFiltersToImage" src/lib/image-processor.ts`
3. Verify imports: `grep "getSharpModifiers\|FilterParameters" src/lib/image-processor.ts`
4. TypeScript compiles: `npx tsc --noEmit` (if project has tsc)
</verification>

<success_criteria>
Module is created and exported. TypeScript compiles without errors. Function signature matches: applyFiltersToImage(imageBuffer: Buffer, parameters: FilterParameters, intensity: number): Promise<Buffer>
</success_criteria>

<output>
After completion, create `.planning/phases/03-filter-export-processing/03-01-SUMMARY.md` with:
- Tech stack added: Sharp filter processing (existing dependency)
- Key files: src/lib/image-processor.ts
- Exports: applyFiltersToImage
- Dependencies on: Phase 1 (getSharpModifiers)
</output>
