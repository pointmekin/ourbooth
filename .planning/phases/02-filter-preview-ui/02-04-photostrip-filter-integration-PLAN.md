---
phase: 02-filter-preview-ui
plan: 04
type: execute
wave: 2
depends_on: [02-01, 02-02, 02-03]
files_modified:
  - src/components/photobooth/PhotoStrip.tsx
autonomous: true

must_haves:
  truths:
    - All photos in strip show selected filter effect when filter applied
    - Filter updates in real-time as intensity slider moves
    - No filter applied when selectedFilter is null
    - Filter uses CSS style attribute (not inline classes)
    - Each photo image element has filter style applied individually
  artifacts:
    - path: src/components/photobooth/PhotoStrip.tsx
      provides: Photo strip with CSS filter preview integration
      contains: "useFilterStore"
      contains: "getCssFilterValue"
  key_links:
    - from: src/components/photobooth/PhotoStrip.tsx
      to: src/stores/filter-store.ts
      via: "useFilterStore for selectedFilter and intensity"
      pattern: "useFilterStore"
    - from: src/components/photobooth/PhotoStrip.tsx
      to: src/lib/filter-utils.ts
      via: "getCssFilterValue for CSS filter string generation"
      pattern: "getCssFilterValue"
    - from: src/components/photobooth/PhotoStrip.tsx
      to: src/constants/filters.ts
      via: "getFilterById to retrieve filter preset"
      pattern: "getFilterById"
---

<objective>
Integrate CSS filter preview into PhotoStrip component so selected filters appear on all photos in the strip.

Purpose: Apply selected filter effect to all photos in real-time preview using CSS filters.

Output: Modified PhotoStrip.tsx with filter style applied to all photo images.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/components/photobooth/PhotoStrip.tsx
@src/stores/filter-store.ts
@src/lib/filter-utils.ts
@src/constants/filters.ts
</context>

<tasks>

<task type="auto">
  <name>Add CSS filter preview to PhotoStrip images</name>
  <files>src/components/photobooth/PhotoStrip.tsx</files>
  <action>
Modify PhotoStrip component to apply CSS filter preview to all photos:

1. Add imports:
```tsx
import { useMemo } from 'react'
import { useFilterStore } from '@/stores/filter-store'
import { getCssFilterValue } from '@/lib/filter-utils'
import { getFilterById } from '@/constants/filters'
```

2. Inside PhotoStrip component, before the return statement, add filter logic:
```tsx
export function PhotoStrip({ /* existing props */ }: PhotoStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)

  // ADD: Filter state and computed style
  const { selectedFilter, intensity } = useFilterStore((s) => ({
    selectedFilter: s.selectedFilter,
    intensity: s.intensity
  }))

  // ADD: Compute filter style (memoized for performance)
  const filterStyle = useMemo(() => {
    if (!selectedFilter) return {}
    const preset = getFilterById(selectedFilter)
    if (!preset) return {}

    const cssFilter = getCssFilterValue(preset.parameters, intensity)
    return { filter: cssFilter }
  }, [selectedFilter, intensity])

  // ... rest of existing component code
```

3. Apply the filter style to the img element:
Find the img element (around line 127-131) and modify:
```tsx
{images[i] ? (
  <img
    src={images[i]!}
    alt={`Slot ${i}`}
    className="w-full h-full object-cover"
    style={filterStyle}  // ADD THIS LINE
  />
) : (
  // ... empty state unchanged
)}
```

Key implementation details:
- Selector subscribes to both selectedFilter and intensity (intentional - we WANT re-renders here)
- useMemo prevents recalculating filter string when unrelated state changes
- Returns empty object {} when no filter selected (no style applied)
- getCssFilterValue handles zero intensity by returning 'none'
- Filter applies to individual img elements, not container
  </action>
  <verify>
1. PhotoStrip.tsx imports useFilterStore, getCssFilterValue, getFilterById
2. useFilterStore called with selector for selectedFilter and intensity
3. useMemo computes filterStyle based on selectedFilter and intensity
4. img element has style={filterStyle} prop
5. Component compiles without TypeScript errors
6. Filter updates in real-time during slider drag
  </verify>
  <done>
PhotoStrip component applies CSS filter preview to all photos based on selectedFilter and intensity state.
  </done>
</task>

</tasks>

<verification>
1. Filter effect visible on all photos in strip when filter selected
2. Filter updates smoothly during slider drag (real-time preview)
3. No filter applied when selectedFilter is null
4. Each image in the grid has individual filter style
5. Performance remains smooth during slider interaction
6. Component re-renders only on filter/intensity changes (not unrelated state)
</verification>

<success_criteria>
1. useFilterStore imported and used with selector pattern
2. filterStyle computed via useMemo with dependencies on selectedFilter, intensity
3. img element receives style={filterStyle} prop
4. No visual artifacts when no filter selected
5. Real-time preview during slider drag (60fps target)
6. All photos in strip update together (global filter application)
</success_criteria>

<output>
After completion, create `.planning/phases/02-filter-preview-ui/02-04-SUMMARY.md` with:
- Phase: 02-filter-preview-ui
- Plan: 04
- Files modified
- Integration pattern (CSS filter on img elements)
- Dependencies met (02-01, 02-02, 02-03)
- Duration metrics
</output>
