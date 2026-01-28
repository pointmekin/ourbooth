---
phase: 03-filter-export-processing
plan: 03
type: execute
wave: 2
depends_on: ["03-01"]
files_modified:
  - src/server/export.ts
autonomous: true

must_haves:
  truths:
    - "Export function accepts filter parameters from client"
    - "Filter parameters are passed to generatePhotoStrip()"
    - "Filter state is optional (null/undefined for no filter)"
    - "TypeScript types enforce filter type from FilterType union"
  artifacts:
    - path: "src/server/export.ts"
      provides: "Server function with filter parameter support"
      exports: ["exportPhotoboothFn"]
      contains: "filterType"
  key_links:
    - from: "src/server/export.ts"
      to: "src/lib/image-generator.ts"
      via: "generatePhotoStrip() call with filter options"
      pattern: "filterType.*filterIntensity"
---

<objective>
Update the export server function to accept and pass filter parameters from the client UI. This connects the filter state (from Phase 2) to the image generation pipeline (from Plan 02).

Purpose: Enable the export API to receive filter selection from the UI and forward it to photo strip generation. Without this, filters selected in UI won't affect the exported image.

Output: Modified ExportInput interface and exportPhotoboothFn handler
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-filter-export-processing/03-RESEARCH.md
@.planning/phases/03-filter-export-processing/03-01-filter-processor-module-SUMMARY.md

# Source Code
@src/server/export.ts
@src/types/filters.ts
</context>

<tasks>

<task type="auto">
  <name>Add filter parameters to export server function</name>
  <files>src/server/export.ts</files>
  <action>
Modify `src/server/export.ts` to accept and pass filter parameters:

1. Add import for FilterType at top of file (if not already present):
```typescript
import type { FilterType } from '@/types/filters'
```

2. Extend the ExportInput interface to include filter parameters:
```typescript
interface ExportInput {
    images: string[]
    templateId: string
    stickers?: ExportSticker[]
    exportType: 'png' | 'gif'
    previewWidth?: number
    previewHeight?: number
    scaleFactor?: number
    customFooterText?: string
    // NEW: Filter parameters from UI
    filterType?: FilterType | null
    filterIntensity?: number
}
```

3. Pass filter parameters to generatePhotoStrip() in the handler:

Find the generatePhotoStrip call (around line 78-84):
```typescript
const imageBuffer = await generatePhotoStrip(validImages, {
    templateId,
    stickers,
    width: exportWidth,
    scaleFactor,
    customFooterText: data.customFooterText,
})
```

Update to:
```typescript
const imageBuffer = await generatePhotoStrip(validImages, {
    templateId,
    stickers,
    width: exportWidth,
    scaleFactor,
    customFooterText: data.customFooterText,
    filterType: data.filterType,
    filterIntensity: data.filterIntensity,
})
```

4. Add logging for filter application (optional but helpful):
After line 71 (the existing console.log), add:
```typescript
console.log(`[Export] Filter: ${data.filterType || 'none'}, intensity: ${data.filterIntensity || 0}`)
```
</action>
  <verify>
ExportInput interface includes filterType and filterIntensity
generatePhotoStrip call includes filterType and filterIntensity
File imports FilterType from types/filters
</verify>
  <done>
exportPhotoboothFn accepts filterType and filterIntensity in input data
Filter parameters are passed through to generatePhotoStrip()
Null/undefined values are handled (no filter applied when not provided)
</done>
</task>

</tasks>

<verification>
1. Check interface: `grep -A15 "interface ExportInput" src/server/export.ts | grep -E "filterType|filterIntensity"`
2. Check function call: `grep -A6 "generatePhotoStrip" src/server/export.ts | grep -E "filterType|filterIntensity"`
3. Check imports: `grep "FilterType" src/server/export.ts`
4. TypeScript compiles: `npx tsc --noEmit`
</verification>

<success_criteria>
ExportInput interface has filterType and filterIntensity fields. generatePhotoStrip() receives these values. Export function is ready to receive filter data from client UI.
</success_criteria>

<output>
After completion, create `.planning/phases/03-filter-export-processing/03-03-SUMMARY.md` with:
- Modified: src/server/export.ts
- ExportInput now includes filterType, filterIntensity
- Server function passes filter state to image generator
</output>
