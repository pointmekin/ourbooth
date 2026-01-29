---
phase: 04-polish-ux-enhancements
plan: 03
type: execute
wave: 2
depends_on: ["04-01", "04-02"]
files_modified:
  - src/components/photobooth/IntensitySlider.tsx
  - src/components/photobooth/FilterPreviewPanel.tsx
autonomous: false

must_haves:
  truths:
    - Preview updates remain non-blocking during rapid slider adjustments
    - Target 60fps performance achieved on Safari with filter applied
    - No UI jank when dragging slider quickly
    - Filter preview updates feel responsive and smooth
  artifacts:
    - path: src/components/photobooth/IntensitySlider.tsx
      provides: Optimized slider with useTransition
      exports: ["IntensitySlider"]
      contains: "useTransition"
    - path: src/components/photobooth/FilterPreviewPanel.tsx
      provides: Optimized filter preview with transition boundary
      exports: ["FilterPreviewPanel"]
      contains: "startTransition"
  key_links:
    - from: src/components/photobooth/IntensitySlider.tsx
      to: "React 19 useTransition"
      via: "Import from 'react'"
      pattern: "useTransition"
    - from: src/components/photobooth/IntensitySlider.tsx
      to: src/stores/filter-store.ts
      via: "startTransition wrapped setIntensity calls"
      pattern: "startTransition.*setIntensity"
---

<objective>
Optimize filter preview performance using React 19 useTransition for non-blocking updates during slider interaction.

Purpose: Maintain 60fps smoothness on Safari while providing real-time filter preview feedback.

Output: Optimized IntensitySlider and FilterPreviewPanel with useTransition boundaries.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/components/photobooth/IntensitySlider.tsx
@src/components/photobooth/FilterPreviewPanel.tsx
@src/stores/filter-store.ts
</context>

<tasks>

<task type="auto">
  <name>Add React 19 useTransition import and setup</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Add useTransition import from React and set up in component:

1. Update imports to include useTransition (if React is already imported):
```tsx
import React, { useState, useTransition } from 'react'
```

Or if React was imported as default:
```tsx
import React, { useState, useTransition } from 'react'
```

2. Add useTransition hook call in component:
```tsx
export function IntensitySlider({ disabled = false }: IntensitySliderProps) {
  const intensity = useFilterStore((s) => s.intensity)
  const selectedFilter = useFilterStore((s) => s.selectedFilter)
  const setIntensity = useFilterStore((s) => s.setIntensity)

  // React 19 useTransition for non-blocking updates
  const [isPending, startTransition] = useTransition()

  // Track drag state for snap behavior
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartValue, setDragStartValue] = useState(intensity)
```

Note: React 19 is already in package.json (v19.2.0), so useTransition is available.
  </action>
  <verify>
1. useTransition imported from React
2. [isPending, startTransition] destructured from useTransition
3. Hook called at component top level (not conditionally)
  </verify>
  <done>
React 19 useTransition hook imported and initialized.
  </done>
</task>

<task type="auto">
  <name>Wrap setIntensity calls with startTransition for non-blocking updates</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Update all setIntensity calls to use startTransition:

1. Update handleInputChange function:
```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = Number(e.target.value)

  // Apply snap when dragging - use transition for smooth non-blocking updates
  if (isDragging) {
    const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
      const currentDistance = Math.abs(rawValue - preset)
      const nearestDistance = Math.abs(rawValue - nearest)
      return currentDistance < nearestDistance ? preset : nearest
    }, INTENSITY_PRESETS[0])

    const distance = Math.abs(rawValue - nearestPreset)

    // Check if we're "breaking out" of a snap
    if (Math.abs(intensity - nearestPreset) < SNAP_THRESHOLD && distance > SNAP_THRESHOLD) {
      startTransition(() => setIntensity(rawValue))
    } else if (distance <= SNAP_THRESHOLD) {
      startTransition(() => setIntensity(nearestPreset))
    } else {
      startTransition(() => setIntensity(rawValue))
    }
  } else {
    startTransition(() => setIntensity(rawValue))
  }
}
```

2. Update handleReset function:
```tsx
const handleReset = () => {
  startTransition(() => setIntensity(DEFAULT_INTENSITY))
}
```

3. Update tick mark onClick:
```tsx
onClick={() => startTransition(() => setIntensity(preset))}
```

Key behavior:
- All intensity updates wrapped in startTransition
- UI remains responsive during filter re-renders
- Slider doesn't lag while preview updates
  </action>
  <verify>
1. All setIntensity calls wrapped in startTransition
2. handleInputChange uses startTransition
3. handleReset uses startTransition
4. Tick onClick uses startTransition
5. No direct setIntensity calls remaining
  </verify>
  <done>
All intensity updates wrapped with startTransition for non-blocking behavior.
  </done>
</task>

<task type="auto">
  <name>Add pending state visual feedback (optional)</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Add subtle visual feedback when transition is pending:

Update the value display span to show opacity during pending state:

```tsx
<span className={`text-sm font-semibold tabular-nums min-w-[3rem] text-right transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}>
  {Math.round(intensity)}%
</span>
```

This provides:
- Subtle feedback that update is in progress
- 70% opacity during transition (not distracting)
- Smooth transition back to 100% when complete
- User confidence that changes are applying
  </action>
  <verify>
1. Value span includes conditional opacity class
2. isPending state controls opacity
3. transition-opacity class added for smooth effect
4. Visual feedback is subtle (not distracting)
  </verify>
  <done>
Pending state visual feedback added to value display.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Performance-optimized slider with React 19 useTransition</what-built>
  <how-to-verify>
1. Start dev server: npm run dev
2. Open Safari browser (critical for performance testing)
3. Navigate to create route and open filter panel
4. Select a filter with visible effect (e.g., Noir or Vivid)
5. Drag slider rapidly back and forth
6. Verify slider thumb moves smoothly without lag
7. Verify preview updates smoothly (no jank)
8. Test on mobile device if available (touch performance)
9. Verify value display shows subtle opacity change during updates

Expected: Smooth 60fps slider movement with responsive filter preview.
  </how-to-verify>
  <resume-signal>Type "approved" if performance is smooth, or describe jank/lag issues</resume-signal>
</task>

</tasks>

<verification>
1. useTransition imported and used from React 19
2. All setIntensity calls wrapped in startTransition
3. isPending state used for visual feedback
4. Slider remains responsive during rapid changes
5. Filter preview updates smoothly
6. No UI blocking or jank during drag
7. Safari performance meets 60fps target
</verification>

<success_criteria>
1. Slider updates are non-blocking (useTransition applied)
2. Preview performance smooth at 60fps on Safari
3. No visible lag during rapid slider adjustments
4. Value display shows subtle pending feedback
5. All interaction paths use transition (drag, click, reset)
</success_criteria>

<output>
After completion, create `.planning/phases/04-polish-ux-enhancements/04-03-performance-optimization-SUMMARY.md` with:
- Phase: 04-polish-ux-enhancements
- Plan: 03
- Files modified (IntensitySlider.tsx)
- Tech stack patterns (React 19 useTransition, startTransition)
- Performance results (60fps on Safari)
- User verification results
- Duration metrics
</output>
