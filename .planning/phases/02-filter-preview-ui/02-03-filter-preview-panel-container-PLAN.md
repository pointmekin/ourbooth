---
phase: 02-filter-preview-ui
plan: 03
type: execute
wave: 2
depends_on: [02-01, 02-02]
files_modified:
  - src/components/photobooth/FilterPreviewPanel.tsx
  - src/components/photobooth/index.ts
autonomous: true

must_haves:
  truths:
    - User sees horizontal scrollable strip with 8 thumbnails (7 filters + Original)
    - Thumbnails use first photo from captured strip as sample
    - Empty state shows message when no photos captured
    - Intensity slider appears below thumbnails when filter selected
    - Fade gradients on left/right edges indicate scrollable content
    - Drag-to-scroll works on thumbnail strip
  artifacts:
    - path: src/components/photobooth/FilterPreviewPanel.tsx
      provides: Main container for filter UI (thumbnails + slider)
      exports: ["FilterPreviewPanel"]
      min_lines: 60
    - path: src/components/photobooth/index.ts
      provides: Barrel export for panel component
      exports: ["FilterPreviewPanel"]
  key_links:
    - from: src/components/photobooth/FilterPreviewPanel.tsx
      to: src/components/photobooth/FilterThumbnail.tsx
      via: "Import and render FilterThumbnail components"
      pattern: "FilterThumbnail"
    - from: src/components/photobooth/FilterPreviewPanel.tsx
      to: src/components/photobooth/IntensitySlider.tsx
      via: "Import and render IntensitySlider"
      pattern: "IntensitySlider"
    - from: src/components/photobooth/FilterPreviewPanel.tsx
      to: src/stores/filter-store.ts
      via: "setSelectedFilter action on thumbnail click"
      pattern: "setSelectedFilter"
    - from: src/components/photobooth/FilterPreviewPanel.tsx
      to: src/stores/photobooth-store.ts
      via: "images array for sample photo and empty state check"
      pattern: "usePhotoboothStore"
    - from: src/components/photobooth/FilterPreviewPanel.tsx
      to: src/constants/filters.ts
      via: "FILTER_PRESETS import for thumbnail iteration"
      pattern: "FILTER_PRESETS"
---

<objective>
Create FilterPreviewPanel container component that combines filter thumbnails and intensity slider into a cohesive UI.

Purpose: Provide complete filter selection interface with horizontal scrollable thumbnails, empty state handling, and integrated intensity control.

Output: FilterPreviewPanel.tsx with drag-to-scroll strip, empty state, and conditional slider display.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/components/photobooth/FilterThumbnail.tsx
@src/components/photobooth/IntensitySlider.tsx
@src/components/photobooth/TemplateGallery.tsx
@src/constants/filters.ts
@src/stores/filter-store.ts
@src/stores/photobooth-store.ts
</context>

<tasks>

<task type="auto">
  <name>Create FilterPreviewPanel container component</name>
  <files>src/components/photobooth/FilterPreviewPanel.tsx</files>
  <action>
Create the main filter preview panel container:

```tsx
import { useRef, useState, useCallback, useMemo } from 'react'
import { FilterThumbnail } from './FilterThumbnail'
import { IntensitySlider } from './IntensitySlider'
import { useFilterStore } from '@/stores/filter-store'
import { usePhotoboothStore } from '@/stores/photobooth-store'
import { FILTER_PRESETS } from '@/constants/filters'
import type { FilterType } from '@/types/filters'

// Default sample image for thumbnail previews when no photos captured
const DEFAULT_SAMPLE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23cccccc"/%3E%3Crect x="40" y="120" width="120" height="60" rx="10" fill="%23cccccc"/%3E%3C/svg%3E'

export function FilterPreviewPanel() {
  const images = usePhotoboothStore((s) => s.images)
  const setSelectedFilter = useFilterStore((s) => s.setSelectedFilter)

  // Get first captured photo as sample, or use default
  const samplePhoto = useMemo(() => {
    const firstImage = images.find((img) => img !== null)
    return firstImage || DEFAULT_SAMPLE
  }, [images])

  const hasPhotos = images.some((img) => img !== null)

  // Drag scroll state (following TemplateGallery pattern)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftStart, setScrollLeftStart] = useState(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftStart(scrollRef.current.scrollLeft)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = x - startX
    scrollRef.current.scrollLeft = scrollLeftStart - walk
  }, [isDragging, startX, scrollLeftStart])

  const handleMouseUp = useCallback(() => {
    setTimeout(() => setIsDragging(false), 0)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const hasDragged = useCallback(() => {
    if (!scrollRef.current) return false
    return Math.abs(scrollRef.current.scrollLeft - scrollLeftStart) > 5
  }, [scrollLeftStart])

  const handleFilterSelect = useCallback((filterId: FilterType | null) => {
    // Only change selection if this wasn't a drag action
    if (!hasDragged()) {
      setSelectedFilter(filterId)
    }
  }, [setSelectedFilter, hasDragged])

  if (!hasPhotos) {
    return (
      <div className="w-full p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Add photos to try filters
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 p-4">
      {/* Header */}
      <div className="px-2">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <p className="text-xs text-muted-foreground">Choose a filter to apply to all photos</p>
      </div>

      {/* Horizontal Thumbnail Strip */}
      <div className="relative">
        {/* Left Fade */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6
          bg-gradient-to-r from-background to-transparent" />
        {/* Right Fade */}
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 z-10 w-6
          bg-gradient-to-l from-background to-transparent" />

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`scrollbar-none flex gap-3 overflow-x-auto pb-2
            ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}
        >
          {/* Original (no filter) */}
          <FilterThumbnail
            filter={null}
            samplePhoto={samplePhoto}
            onSelect={handleFilterSelect}
          />

          {/* All filter presets */}
          {FILTER_PRESETS.map((filter) => (
            <FilterThumbnail
              key={filter.id}
              filter={filter}
              samplePhoto={samplePhoto}
              onSelect={handleFilterSelect}
            />
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="px-2">
        <IntensitySlider />
      </div>
    </div>
  )
}
```

Key implementation details:
- Uses first captured photo as sample for authentic preview
- Empty state when no photos captured
- Drag-to-scroll following TemplateGallery pattern
- Fade gradients on edges to indicate scrollability
- Horizontal scroll with scrollbar-none utility
- "Original" thumbnail first, followed by all 7 filter presets
  </action>
  <verify>
1. File exists at src/components/photobooth/FilterPreviewPanel.tsx
2. Component exported as named export
3. FilterThumbnail and IntensitySlider imported and used
4. Empty state renders when hasPhotos is false
5. Drag-to-scroll handlers implemented
6. First image from strip used as sample photo
  </verify>
  <done>
FilterPreviewPanel container exists with thumbnail strip, empty state, drag-to-scroll, and integrated slider.
  </done>
</task>

<task type="auto">
  <name>Export FilterPreviewPanel from barrel file</name>
  <files>src/components/photobooth/index.ts</files>
  <action>
Add FilterPreviewPanel to the barrel export file:

1. Read the existing index.ts file
2. Add FilterPreviewPanel to the export statement
3. Ensure the import path is correct

Pattern should match existing component exports
  </action>
  <verify>
1. index.ts contains FilterPreviewPanel in export list
2. Export matches the pattern of other component exports
  </verify>
  <done>
FilterPreviewPanel is exported from src/components/photobooth/index.ts for clean imports.
  </done>
</task>

</tasks>

<verification>
1. Component compiles without TypeScript errors
2. Empty state displays when images array is all null
3. Horizontal scroll works via drag and native scroll
4. Fade gradients visible on edges
5. 8 thumbnails total (Original + 7 filters)
6. IntensitySlider rendered below thumbnail strip
7. First photo from images array used as sample
</verification>

<success_criteria>
1. FilterPreviewPanel component exported from @/components/photobooth
2. Horizontal scrollable strip with 8 thumbnails
3. Empty state: "Add photos to try filters" message
4. Drag-to-scroll functionality working
5. Fade gradients on left/right edges
6. Sample photo from first captured image
7. IntensitySlider rendered below thumbnails
</success_criteria>

<output>
After completion, create `.planning/phases/02-filter-preview-ui/02-03-SUMMARY.md` with:
- Phase: 02-filter-preview-ui
- Plan: 03
- Files created/modified
- Patterns established (container component, drag-to-scroll)
- Dependencies met (02-01, 02-02)
- Duration metrics
</output>
