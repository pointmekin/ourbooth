---
phase: 04-polish-ux-enhancements
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/photobooth/IntensitySlider.tsx
autonomous: false

must_haves:
  truths:
    - Dragging slider near a preset (within 5%) snaps to that preset value
    - Snap activates smoothly with magnetic feel (not jarring)
    - User can drag past preset if intentionally moving beyond snap zone
    - Snap behavior consistent across all 5 preset positions
  artifacts:
    - path: src/components/photobooth/IntensitySlider.tsx
      provides: Slider with snap-to-preset behavior
      exports: ["IntensitySlider"]
      contains: "useSnapToPreset hook"
      min_lines: 120
  key_links:
    - from: src/components/photobooth/IntensitySlider.tsx
      to: src/stores/filter-store.ts
      via: "setIntensity action with snapped value"
      pattern: "setIntensity.*snap"
---

<objective>
Implement JavaScript snap logic that detects when slider is close to a preset value (within 5% threshold) and snaps to it.

Purpose: Provide tactile "magnetic" feel when dragging near presets for easier precise selection.

Output: IntensitySlider with useSnapToPreset hook and snap-aware onChange handler.
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
@src/stores/filter-store.ts
</context>

<tasks>

<task type="auto">
  <name>Create useSnapToPreset custom hook</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Add a custom hook inside the component file (before the main component):

```tsx
/**
 * Custom hook for snapping intensity values to nearest preset
 * @param value - Current intensity value
 * @param threshold - Distance within which snap activates
 * @returns Snapped value (or original if not near preset)
 */
function useSnapToPreset(value: number, threshold: number = SNAP_THRESHOLD) {
  return React.useMemo(() => {
    // Find nearest preset
    const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
      const currentDistance = Math.abs(value - preset)
      const nearestDistance = Math.abs(value - nearest)
      return currentDistance < nearestDistance ? preset : nearest
    }, INTENSITY_PRESETS[0])

    // Snap to preset if within threshold
    const distance = Math.abs(value - nearestPreset)
    return distance <= threshold ? nearestPreset : value
  }, [value, threshold])
}
```

This hook:
- Finds the nearest preset to the current value
- Returns the preset value if within threshold distance
- Otherwise returns the original value
- Uses useMemo for performance
  </action>
  <verify>
1. useSnapToPreset function defined inside IntensitySlider.tsx
2. Function takes value and threshold parameters
3. Returns snapped value when within threshold
4. Uses React.useMemo for performance
  </verify>
  <done>
useSnapToPreset hook created with snap logic implementation.
  </done>
</task>

<task type="auto">
  <name>Add snap state tracking for drag interaction</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Add state to track drag interaction and determine when to apply snap:

```tsx
export function IntensitySlider({ disabled = false }: IntensitySliderProps) {
  const intensity = useFilterStore((s) => s.intensity)
  const selectedFilter = useFilterStore((s) => s.selectedFilter)
  const setIntensity = useFilterStore((s) => s.setIntensity)

  // Track drag state for snap behavior
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStartValue, setDragStartValue] = React.useState(intensity)

  const handleReset = () => {
    setIntensity(DEFAULT_INTENSITY)
  }

  // Calculate snapped value for display
  const snappedIntensity = useSnapToPreset(intensity)
```

The drag state allows:
- Snap to apply during drag (magnetic feel)
- User to "break out" of snap by dragging past threshold
- Clean UX where snap doesn't feel sticky
  </action>
  <verify>
1. isDragging state variable added
2. dragStartValue state variable added
3. useSnapToPreset called with intensity
4. React imported for useState hook
  </verify>
  <done>
Drag state tracking added for snap interaction behavior.
  </done>
</task>

<task type="auto">
  <name>Implement snap-aware onChange handler</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Modify the onChange handler to apply snap during drag:

```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = Number(e.target.value)

  // Apply snap when dragging
  if (isDragging) {
    const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
      const currentDistance = Math.abs(rawValue - preset)
      const nearestDistance = Math.abs(rawValue - nearest)
      return currentDistance < nearestDistance ? preset : nearest
    }, INTENSITY_PRESETS[0])

    const distance = Math.abs(rawValue - nearestPreset)

    // Check if we're "breaking out" of a snap (moving away from preset)
    if (Math.abs(intensity - nearestPreset) < SNAP_THRESHOLD && distance > SNAP_THRESHOLD) {
      // Breaking out - use raw value
      setIntensity(rawValue)
    } else if (distance <= SNAP_THRESHOLD) {
      // Within snap zone - snap to preset
      setIntensity(nearestPreset)
    } else {
      // Not near any preset - use raw value
      setIntensity(rawValue)
    }
  } else {
    setIntensity(rawValue)
  }
}
```

Then update the input element to use this handler and drag events:

```tsx
<input
  type="range"
  min={MIN_INTENSITY}
  max={MAX_INTENSITY}
  value={snappedIntensity} // Display snapped value visually
  onChange={handleInputChange}
  onMouseDown={() => {
    setIsDragging(true)
    setDragStartValue(intensity)
  }}
  onMouseUp={() => setIsDragging(false)}
  onMouseLeave={() => setIsDragging(false)}
  disabled={disabled || !hasFilter}
  list="intensity-presets"
  className="..."
/>
```

Key behavior:
- Snaps to preset when within threshold during drag
- Allows "breaking out" by continuing to drag past threshold
- Displays snapped value for visual feedback
- Tracks drag state with mouse events
  </action>
  <verify>
1. handleInputChange function defined
2. Input uses handleInputChange for onChange
3. Input has onMouseDown, onMouseUp, onMouseLeave handlers
4. isDragging state updated correctly
5. snappedIntensity used for value prop
6. Snap logic applies SNAP_THRESHOLD (5%)
  </verify>
  <done>
Snap-aware onChange handler implemented with drag state tracking.
  </done>
</task>

<task type="auto">
  <name>Update tick mark active state to use snapped intensity</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Update the tick mark active check in the tick marks overlay:

Find this line:
```tsx
const isActive = Math.abs(intensity - preset) < SNAP_THRESHOLD
```

Replace with:
```tsx
const isActive = Math.abs(snappedIntensity - preset) < 1
```

This ensures:
- Tick highlights when slider is snapped to that preset
- Uses < 1 tolerance since snapped value equals preset exactly
- Visual feedback matches snap behavior
  </action>
  <verify>
1. Tick mark active check uses snappedIntensity
2. Tolerance changed to < 1 (exact match with snapped value)
3. Active tick highlights when at preset
  </verify>
  <done>
Tick mark active state synchronized with snap behavior.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Slider with snap-to-preset behavior during drag</what-built>
  <how-to-verify>
1. Start dev server: npm run dev
2. Navigate to create route and open filter panel
3. Select any filter
4. Drag slider slowly toward 25% - should snap when close
5. Continue dragging past 25% - should release from snap
6. Test all presets (0, 25, 50, 75, 100)
7. Verify snap feels magnetic, not jarring
8. Verify tick mark highlights when snapped
9. Verify can still set any value between presets
  </how-to-verify>
  <resume-signal>Type "approved" or describe snap behavior issues</resume-signal>
</task>

</tasks>

<verification>
1. useSnapToPreset hook calculates nearest preset
2. Snap threshold of 5% applied consistently
3. Drag state tracked (isDragging, dragStartValue)
4. handleInputChange applies snap during drag
5. Can "break out" of snap by continuing to drag
6. Tick highlight synchronized with snapped value
7. Snap activates smoothly without jarring behavior
</verification>

<success_criteria>
1. Dragging within 5% of preset snaps to that preset
2. Snap feels magnetic (smooth, not jarring)
3. User can drag past preset to exit snap
4. Tick mark highlights when snapped to preset
5. All preset values (0, 25, 50, 75, 100) snap correctly
6. Non-preset values still accessible
</success_criteria>

<output>
After completion, create `.planning/phases/04-polish-ux-enhancements/04-02-snap-logic-SUMMARY.md` with:
- Phase: 04-polish-ux-enhancements
- Plan: 02
- Files modified (IntensitySlider.tsx)
- Tech stack patterns (custom hook, drag state tracking)
- Snap threshold value (5%)
- User verification results
- Duration metrics
</output>
