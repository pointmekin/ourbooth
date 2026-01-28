---
phase: 02-filter-preview-ui
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/photobooth/FilterThumbnail.tsx
  - src/components/photobooth/index.ts
autonomous: true

must_haves:
  truths:
    - User sees 8 thumbnail buttons (7 filters + "Original") showing filter effects on sample photo
    - Each thumbnail has a text label below showing filter name
    - Selected filter has visual indication (solid colored border with ring)
    - Thumbnails use React.memo to prevent re-renders during slider drag
    - Thumbnail hover shows scale effect and border highlight
  artifacts:
    - path: src/components/photobooth/FilterThumbnail.tsx
      provides: Memoized filter thumbnail component
      exports: ["FilterThumbnail"]
      min_lines: 40
    - path: src/components/photobooth/index.ts
      provides: Barrel export for filter components
      exports: ["FilterThumbnail"]
  key_links:
    - from: src/components/photobooth/FilterThumbnail.tsx
      to: src/constants/filters.ts
      via: "FILTER_PRESETS import for filter definitions"
      pattern: "from '@/constants/filters'"
    - from: src/components/photobooth/FilterThumbnail.tsx
      to: src/lib/filter-utils.ts
      via: "getCssFilterValue for CSS filter generation"
      pattern: "getCssFilterValue"
    - from: src/components/photobooth/FilterThumbnail.tsx
      to: src/stores/filter-store.ts
      via: "useFilterStore selector for selectedFilter only"
      pattern: "useFilterStore\\(\\(s\\) => s\\.selectedFilter\\)"
---

<objective>
Create a memoized FilterThumbnail component that displays individual filter previews with tap-to-select functionality.

Purpose: Provide reusable thumbnail component for filter selection that minimizes re-renders during slider interaction by subscribing only to selectedFilter state (not intensity).

Output: FilterThumbnail.tsx component with React.memo optimization, CSS filter preview, and visual selection state.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/types/filters.ts
@src/constants/filters.ts
@src/lib/filter-utils.ts
@src/stores/filter-store.ts
@src/components/photobooth/TemplateGallery.tsx
</context>

<tasks>

<task type="auto">
  <name>Create FilterThumbnail component with React.memo</name>
  <files>src/components/photobooth/FilterThumbnail.tsx</files>
  <action>
Create a memoized thumbnail component for filter selection:

```tsx
import { memo, useMemo } from 'react'
import { useFilterStore } from '@/stores/filter-store'
import { getCssFilterValue } from '@/lib/filter-utils'
import type { FilterPreset, FilterType } from '@/types/filters'

interface FilterThumbnailProps {
  filter: FilterPreset | null  // null for "Original" thumbnail
  samplePhoto: string
  onSelect: (filterId: FilterType | null) => void
}

const THUMBNAIL_INTENSITY = 75  // Fixed intensity for thumbnail previews

export const FilterThumbnail = memo(function FilterThumbnail({
  filter,
  samplePhoto,
  onSelect
}: FilterThumbnailProps) {
  // Subscribe ONLY to selectedFilter - prevents re-render on intensity change
  const selectedFilter = useFilterStore((s) => s.selectedFilter)
  const isSelected = filter ? selectedFilter === filter.id : selectedFilter === null

  // Memoize filter style - only recalculates when filter changes
  const filterStyle = useMemo(() => {
    if (!filter) return {}
    return {
      filter: getCssFilterValue(filter.parameters, THUMBNAIL_INTENSITY)
    }
  }, [filter])

  return (
    <button
      onClick={() => onSelect(filter?.id ?? null)}
      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden
        border-2 transition-all duration-200 shrink-0
        ${isSelected
          ? 'border-primary ring-2 ring-primary/50 scale-105 shadow-lg'
          : 'border-transparent hover:border-border hover:scale-105'
        }`}
    >
      <img
        src={samplePhoto}
        alt={filter?.name ?? 'Original'}
        style={filterStyle}
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white
        text-[10px] md:text-xs text-center backdrop-blur-sm py-1">
        {filter?.name ?? 'Original'}
      </span>
    </button>
  )
})
```

Key implementation details:
- Uses React.memo to skip re-renders when props unchanged
- Selector pattern: subscribes only to selectedFilter, not intensity
- useMemo on filterStyle to prevent recalculating filter string
- Fixed intensity (75%) for consistent thumbnail previews
- Supports null filter for "Original" (no filter) option
- Responsive sizing: 80px mobile, 96px desktop
  </action>
  <verify>
1. File exists at src/components/photobooth/FilterThumbnail.tsx
2. Component is exported as named export
3. React.memo wrapper is present
4. Uses selector pattern for selectedFilter only
5. getCssFilterValue is imported and used
6. Handles null filter case for "Original"
  </verify>
  <done>
FilterThumbnail component exists with memoization, CSS filter preview, visual selection state, and null filter support for "Original" option.
  </done>
</task>

<task type="auto">
  <name>Export FilterThumbnail from barrel file</name>
  <files>src/components/photobooth/index.ts</files>
  <action>
Add FilterThumbnail to the barrel export file:

1. Read the existing index.ts file
2. Add FilterThumbnail to the export statement alongside existing components
3. Ensure the import path is correct

Pattern should match existing exports (PhotoStrip, CameraView, PropertiesPanel, etc.)
  </action>
  <verify>
1. index.ts contains FilterThumbnail in export list
2. Export matches the pattern of other component exports
  </verify>
  <done>
FilterThumbnail is exported from src/components/photobooth/index.ts for clean imports.
  </done>
</task>

</tasks>

<verification>
1. Component compiles without TypeScript errors
2. React.memo is correctly applied (check component source)
3. Selector pattern subscribes only to selectedFilter
4. "Original" case handled (null filter prop)
5. CSS filter applied via style attribute using getCssFilterValue
6. Visual state shows border+ring when selected, scale on hover
</verification>

<success_criteria>
1. FilterThumbnail component exported and importable from @/components/photobooth
2. Component accepts filter, samplePhoto, onSelect props
3. Memoized with React.memo - verifies props-based optimization
4. Selector pattern used - will not re-render on intensity changes
5. Visual states: selected (border-primary ring-2 scale-105), hover (scale-105)
6. "Original" thumbnail supported via null filter prop
</success_criteria>

<output>
After completion, create `.planning/phases/02-filter-preview-ui/02-01-SUMMARY.md` with:
- Phase: 02-filter-preview-ui
- Plan: 01
- Files created/modified
- Tech stack added (React.memo, selector pattern)
- Patterns established (thumbnail component pattern)
- Duration metrics
</output>
