---
phase: 02-filter-preview-ui
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/photobooth/IntensitySlider.tsx
  - src/components/photobooth/index.ts
autonomous: true

must_haves:
  truths:
    - User sees slider control with range 0-100%
    - Current intensity value displayed next to slider
    - Slider updates filter preview in real-time during drag
    - Reset button returns intensity to default (75%)
    - Slider shows visual feedback for active state
  artifacts:
    - path: src/components/photobooth/IntensitySlider.tsx
      provides: Native range input slider for intensity control
      exports: ["IntensitySlider"]
      min_lines: 40
    - path: src/components/photobooth/index.ts
      provides: Barrel export for slider component
      exports: ["IntensitySlider"]
  key_links:
    - from: src/components/photobooth/IntensitySlider.tsx
      to: src/stores/filter-store.ts
      via: "useFilterStore selectors for intensity and selectedFilter"
      pattern: "useFilterStore"
    - from: src/components/photobooth/IntensitySlider.tsx
      to: src/stores/filter-store.ts
      via: "setIntensity action to update state"
      pattern: "setIntensity"
---

<objective>
Create an IntensitySlider component using native HTML range input for real-time filter intensity adjustment.

Purpose: Provide smooth, hardware-accelerated intensity control with visual feedback and reset capability.

Output: IntensitySlider.tsx component with native range input, live value display, and reset button.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/stores/filter-store.ts
@src/components/ui/button.tsx
@src/components/ui/label.tsx
</context>

<tasks>

<task type="auto">
  <name>Create IntensitySlider component with native range input</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Create a slider component for filter intensity control:

```tsx
import { useFilterStore } from '@/stores/filter-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RotateCcw } from 'lucide-react'

const DEFAULT_INTENSITY = 75
const MIN_INTENSITY = 0
const MAX_INTENSITY = 100

interface IntensitySliderProps {
  disabled?: boolean
}

export function IntensitySlider({ disabled = false }: IntensitySliderProps) {
  const intensity = useFilterStore((s) => s.intensity)
  const selectedFilter = useFilterStore((s) => s.selectedFilter)
  const setIntensity = useFilterStore((s) => s.setIntensity)

  const handleReset = () => {
    setIntensity(DEFAULT_INTENSITY)
  }

  const isAtDefault = intensity === DEFAULT_INTENSITY
  const hasFilter = selectedFilter !== null

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header: Label + Value + Reset */}
      <div className="flex items-center justify-between gap-4">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Intensity
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums min-w-[3rem] text-right">
            {Math.round(intensity)}%
          </span>
          {hasFilter && !isAtDefault && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleReset}
              className="h-7 w-7 shrink-0"
              title="Reset to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={MIN_INTENSITY}
          max={MAX_INTENSITY}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          disabled={disabled || !hasFilter}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Hint when no filter selected */}
      {!hasFilter && (
        <p className="text-xs text-muted-foreground text-center">
          Select a filter to adjust intensity
        </p>
      )}
    </div>
  )
}
```

Key implementation details:
- Native input type="range" for hardware-accelerated performance
- Direct onChange updates (no debouncing) for real-time preview
- Custom Tailwind classes for webkit and moz slider thumbs
- Reset button only shows when filter selected and not at default
- Disabled state when no filter is selected
- Tabular nums for value display to prevent layout shift
  </action>
  <verify>
1. File exists at src/components/photobooth/IntensitySlider.tsx
2. Component exported as named export
3. Uses native input type="range"
4. Subscribes to intensity and selectedFilter via selectors
5. setIntensity action called on onChange
6. Reset button shows conditionally
  </verify>
  <done>
IntensitySlider component exists with native range input, real-time updates, value display, and reset functionality.
  </done>
</task>

<task type="auto">
  <name>Export IntensitySlider from barrel file</name>
  <files>src/components/photobooth/index.ts</files>
  <action>
Add IntensitySlider to the barrel export file:

1. Read the existing index.ts file
2. Add IntensitySlider to the export statement
3. Ensure the import path is correct

Pattern should match existing component exports
  </action>
  <verify>
1. index.ts contains IntensitySlider in export list
2. Export matches the pattern of other component exports
  </verify>
  <done>
IntensitySlider is exported from src/components/photobooth/index.ts for clean imports.
  </done>
</task>

</tasks>

<verification>
1. Component compiles without TypeScript errors
2. Range input responds to drag with real-time updates
3. Value display shows percentage with tabular nums
4. Reset button appears only when filter selected and intensity != 75
5. Slider is visually disabled when no filter selected
6. Custom styling applied to slider thumb (webkits and moz variants)
</verification>

<success_criteria>
1. IntensitySlider component exported from @/components/photobooth
2. Native range input with min=0, max=100
3. Real-time preview during slider drag (no debounce)
4. Reset button restores default intensity (75%)
5. Disabled state when no filter selected
6. Custom thumb styling with hover scale effect
</success_criteria>

<output>
After completion, create `.planning/phases/02-filter-preview-ui/02-02-SUMMARY.md` with:
- Phase: 02-filter-preview-ui
- Plan: 02
- Files created/modified
- Tech stack patterns (native range input, custom slider styling)
- Duration metrics
</output>
