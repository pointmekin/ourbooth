---
phase: 03-filter-export-processing
plan: 02
type: execute
wave: 2
depends_on: ["03-01"]
files_modified:
  - src/lib/image-generator.ts
autonomous: true

must_haves:
  truths:
    - "Photo strip generation applies filters to individual images before compositing"
    - "Filters are applied AFTER EXIF rotation but BEFORE resize"
    - "All images in strip are processed in parallel using Promise.all()"
    - "Filter processing failure throws error and blocks entire export"
  artifacts:
    - path: "src/lib/image-generator.ts"
      provides: "Photo strip generation with filter support"
      exports: ["generatePhotoStrip"]
      contains: "applyFiltersToImage"
  key_links:
    - from: "src/lib/image-generator.ts"
      to: "src/lib/image-processor.ts"
      via: "import applyFiltersToImage"
      pattern: "applyFiltersToImage"
    - from: "src/lib/image-generator.ts"
      to: "src/lib/filter-utils.ts"
      via: "import getFilterById"
      pattern: "getFilterById"
---

<objective>
Integrate filter processing into the photo strip generation pipeline. Modify generatePhotoStrip() to accept filter parameters and apply filters to individual images before compositing them onto the strip.

Purpose: Enable exported photo strips to include the filter effects users see in CSS preview. Filters must be applied BEFORE compositing to avoid affecting background, borders, and text.

Output: Modified `generatePhotoStrip()` function with filter parameter and parallel processing
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-filter-export-processing/03-RESEARCH.md
@.planning/phases/03-filter-export-processing/03-01-filter-processor-module-SUMMARY.md

# Source Code
@src/lib/image-generator.ts
@src/lib/image-processor.ts
@src/constants/filters.ts
</context>

<tasks>

<task type="auto">
  <name>Integrate filter processing into photo strip generation</name>
  <files>src/lib/image-generator.ts</files>
  <action>
Modify `src/lib/image-generator.ts` to add filter support:

1. Add imports at top of file:
```typescript
import { applyFiltersToImage } from './image-processor'
import { getFilterById } from '@/constants/filters'
import type { FilterType } from '@/types/filters'
```

2. Extend GenerateOptions interface to include filter parameters:
```typescript
interface GenerateOptions {
    templateId: string
    stickers?: Sticker[]
    width?: number
    quality?: number
    scaleFactor?: number
    customFooterText?: string
    // NEW: Filter support
    filterType?: FilterType | null
    filterIntensity?: number
}
```

3. In the image processing loop (around line 194-241), AFTER the buffer conversion and BEFORE the resize operation, add filter application:

Find this block:
```typescript
// Convert data URL to buffer
const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
const imageBuffer = Buffer.from(base64Data, 'base64')
```

Add filter processing immediately after:
```typescript
// Apply filter if selected (before resize and composite)
if (options.filterType && options.filterIntensity && options.filterIntensity > 0) {
    const filterPreset = getFilterById(options.filterType)
    if (filterPreset) {
        try {
            imageBuffer = await applyFiltersToImage(
                imageBuffer,
                filterPreset.parameters,
                options.filterIntensity
            )
        } catch (error) {
            // Log but don't fail entire export for single image
            console.error(`[ImageGenerator] Failed to apply filter to image ${i}:`, error)
            // Re-throw to block entire export as per requirements
            throw error
        }
    }
}
```

4. Update the function to handle the new filter parameters properly - ensure the imageBuffer variable is declared with `let` instead of `const` to allow reassignment after filter processing.

IMPORTANT: Apply filters AFTER base64 decode but BEFORE sharp().rotate().resize() chain. This ensures:
- Filters work on the original image data
- EXIF rotation happens on filtered image
- Resize happens last for optimal performance
</action>
  <verify>
File imports applyFiltersToImage from image-processor
File imports getFilterById from constants/filters
GenerateOptions interface has filterType and filterIntensity fields
Filter processing happens in image loop (grep for "applyFiltersToImage")
Filter processing happens before resize (grep for "rotate" after filter code)
</verify>
  <done>
generatePhotoStrip accepts filterType and filterIntensity in options
Filters are applied to individual images before compositing
Filter processing is placed between buffer conversion and resize operation
Error handling throws to block entire export on failure
</done>
</task>

</tasks>

<verification>
1. Check imports: `grep -E "applyFiltersToImage|getFilterById|FilterType" src/lib/image-generator.ts`
2. Check interface: `grep -A2 "filterType\|filterIntensity" src/lib/image-generator.ts`
3. Check filter application: `grep -A5 "applyFiltersToImage" src/lib/image-generator.ts`
4. TypeScript compiles: `npx tsc --noEmit`
</verification>

<success_criteria>
generatePhotoStrip() accepts optional filterType and filterIntensity parameters. Filters are applied to individual images before resize/compositing. Export passes filters correctly from server function.
</success_criteria>

<output>
After completion, create `.planning/phases/03-filter-export-processing/03-02-SUMMARY.md` with:
- Modified: src/lib/image-generator.ts
- GenerateOptions now includes filterType, filterIntensity
- Filters applied before compositing (not after)
- Error handling blocks entire export on failure
</output>
