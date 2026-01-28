---
phase: 03-filter-export-processing
plan: 04
type: execute
wave: 3
depends_on: ["03-03"]
files_modified:
  - src/components/photobooth/ExportSheet.tsx
autonomous: true

must_haves:
  truths:
    - "Export button reads filter state from useFilterStore"
    - "Selected filter and intensity are sent with export request"
    - "Export button shows 'Processing...' text during export"
    - "Button is disabled while export is in progress"
  artifacts:
    - path: "src/components/photobooth/ExportSheet.tsx"
      provides: "UI integration with filter export"
      contains: "useFilterStore"
  key_links:
    - from: "src/components/photobooth/ExportSheet.tsx"
      to: "src/stores/filter-store.ts"
      via: "import useFilterStore"
      pattern: "useFilterStore"
    - from: "src/components/photobooth/ExportSheet.tsx"
      to: "src/server/export.ts"
      via: "exportPhotoboothFn data parameter"
      pattern: "filterType.*filterIntensity"
---

<objective>
Connect the filter UI state (from Phase 2) to the export API. Update ExportSheet to read the selected filter and intensity from the filter store, then send these values with the export request. Also update the button text to show "Processing..." during export.

Purpose: Complete the end-to-end flow: user selects filter in UI -> filter state stored -> export includes filter -> Sharp applies filter to exported image.

Output: Modified ExportSheet with filter store integration and loading state
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-filter-export-processing/03-RESEARCH.md
@.planning/phases/03-filter-export-processing/03-03-export-filter-integration-SUMMARY.md

# Source Code
@src/components/photobooth/ExportSheet.tsx
@src/stores/filter-store.ts
</context>

<tasks>

<task type="auto">
  <name>Connect filter store to export and update loading UI</name>
  <files>src/components/photobooth/ExportSheet.tsx</files>
  <action>
Modify `src/components/photobooth/ExportSheet.tsx` to integrate filter state:

1. Add import for filter store at top of file:
```typescript
import { useFilterStore } from '@/stores/filter-store'
```

2. In the ExportSheet component, read filter state:
Find the existing usePhotoboothStore call (around line 26-35) and add filter store after it:
```typescript
const { selectedFilter, intensity } = useFilterStore()
```

3. Update the exportPhotoboothFn call to include filter parameters:

Find this block (around line 62-81):
```typescript
const result = await exportPhotoboothFn({
  data: {
    images: validImages,
    templateId: selectedTemplate?.id ?? 'classic-2x2',
    stickers: stickers.map(s => ({
      id: s.id,
      x: s.x,
      y: s.y,
      type: s.type,
      emoji: s.emoji,
      src: s.src,
      scale: s.scale,
    })),
    exportType: exportType,
    previewWidth,
    previewHeight,
    scaleFactor,
    customFooterText: customFooterText || undefined,
  }
})
```

Add filter parameters:
```typescript
const result = await exportPhotoboothFn({
  data: {
    images: validImages,
    templateId: selectedTemplate?.id ?? 'classic-2x2',
    stickers: stickers.map(s => ({
      id: s.id,
      x: s.x,
      y: s.y,
      type: s.type,
      emoji: s.emoji,
      src: s.src,
      scale: s.scale,
    })),
    exportType: exportType,
    previewWidth,
    previewHeight,
    scaleFactor,
    customFooterText: customFooterText || undefined,
    // NEW: Send filter state with export
    filterType: selectedFilter,
    filterIntensity: intensity,
  }
})
```

4. Update the export button text to show "Processing...":

Find the button content (around line 222-232):
```typescript
{isExporting ? (
  <>
    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
    Creating magic...
  </>
) : (
  <>
    <Download className="w-5 h-5 mr-2" />
    Export {exportType.toUpperCase()}
  </>
)}
```

Change to:
```typescript
{isExporting ? (
  <>
    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
    Processing...
  </>
) : (
  <>
    <Download className="w-5 h-5 mr-2" />
    Export {exportType.toUpperCase()}
  </>
)}
```
  </action>
  <verify>
File imports useFilterStore from filter-store
Component destructures selectedFilter and intensity from useFilterStore
exportPhotoboothFn call includes filterType and filterIntensity
Button shows "Processing..." instead of "Creating magic..." when isExporting is true
</verify>
  <done>
ExportSheet reads filter state from useFilterStore
Filter parameters are sent with export request
Button text is "Processing..." during export
Button is disabled during export (existing behavior maintained)
</done>
</task>

</tasks>

<verification>
1. Check import: `grep "useFilterStore" src/components/photobooth/ExportSheet.tsx`
2. Check store usage: `grep -E "selectedFilter|intensity.*useFilterStore" src/components/photobooth/ExportSheet.tsx`
3. Check export data: `grep -A15 "exportPhotoboothFn" src/components/photobooth/ExportSheet.tsx | grep -E "filterType|filterIntensity"`
4. Check button text: `grep "Processing\.\.\." src/components/photobooth/ExportSheet.tsx`
5. TypeScript compiles: `npx tsc --noEmit`
</verification>

<success_criteria>
ExportSheet sends filterType and filterIntensity with every export. Selected filter from UI is applied to exported images. Loading state shows "Processing..." text.
</success_criteria>

<output>
After completion, create `.planning/phases/03-filter-export-processing/03-04-SUMMARY.md` with:
- Modified: src/components/photobooth/ExportSheet.tsx
- Filter state (selectedFilter, intensity) sent to export API
- Button shows "Processing..." during export
- End-to-end filter export flow complete
</output>
