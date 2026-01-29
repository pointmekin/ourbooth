---
phase: 04-polish-ux-enhancements
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/photobooth/IntensitySlider.tsx
autonomous: false

must_haves:
  truths:
    - User sees 5 tick marks on slider track at 0%, 25%, 50%, 75%, 100%
    - Tick marks are subtle/faint with minimal visual weight
    - Tick mark at active preset value grows taller when slider is at that position
    - Clicking on any tick mark jumps slider directly to that preset value
    - Tick marks render correctly across Safari, Chrome, and Firefox
  artifacts:
    - path: src/components/photobooth/IntensitySlider.tsx
      provides: Enhanced slider with preset tick marks
      exports: ["IntensitySlider"]
      min_lines: 100
    - path: src/components/photobooth/IntensitySlider.module.css
      provides: Fallback CSS for tick mark styling
      exports: ["tick-mark", "tick-mark-active"]
  key_links:
    - from: src/components/photobooth/IntensitySlider.tsx
      to: src/stores/filter-store.ts
      via: "setIntensity action on tick click"
      pattern: "setIntensity"
---

<objective>
Add visual preset tick marks (0%, 25%, 50%, 75%, 100%) to the IntensitySlider component with click-to-jump functionality.

Purpose: Provide visual guides and quick preset access for common intensity values.

Output: Enhanced IntensitySlider with HTML5 datalist tick marks and CSS fallback styling.
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
  <name>Add intensity preset constants and datalist configuration</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Add preset configuration at top of file after existing constants:

```tsx
const INTENSITY_PRESETS = [0, 25, 50, 75, 100] as const
type IntensityPreset = typeof INTENSITY_PRESETS[number]

// Snap threshold: distance in percentage where snap activates
const SNAP_THRESHOLD = 5
```

These constants define:
- The 5 preset positions (0%, 25%, 50%, 75%, 100%)
- The snap threshold (5%) used in plan 04-02 for snap logic
- TypeScript type for preset values
  </action>
  <verify>
1. INTENSITY_PRESETS constant defined with 5 values
2. SNAP_THRESHOLD constant set to 5
3. IntensityPreset type exported
  </verify>
  <done>
Preset constants defined and ready for use in datalist and snap logic.
  </done>
</task>

<task type="auto">
  <name>Add HTML5 datalist with tick mark labels</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Modify the slider input element to include datalist:

1. Add `list="intensity-presets"` attribute to input
2. Add datalist element after input with same ID

```tsx
<input
  type="range"
  min={MIN_INTENSITY}
  max={MAX_INTENSITY}
  value={intensity}
  onChange={(e) => setIntensity(Number(e.target.value))}
  disabled={disabled || !hasFilter}
  list="intensity-presets"
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
<datalist id="intensity-presets">
  {INTENSITY_PRESETS.map((preset) => (
    <option key={preset} value={preset} />
  ))}
</datalist>
```

Note: HTML5 datalist provides native tick mark rendering in most browsers.
  </action>
  <verify>
1. Input has list="intensity-presets" attribute
2. datalist element with matching id exists
3. datalist renders 5 option elements with preset values
  </verify>
  <done>
HTML5 datalist added to slider for native tick mark rendering.
  </done>
</task>

<task type="auto">
  <name>Add custom tick mark container with click handlers</name>
  <files>src/components/photobooth/IntensitySlider.tsx</files>
  <action>
Add custom tick mark overlay container positioned over the slider track:

```tsx
{/* Tick marks overlay */}
<div
  className="absolute inset-0 pointer-events-none flex justify-between items-center px-1"
  aria-hidden="true"
>
  {INTENSITY_PRESETS.map((preset) => {
    const isActive = Math.abs(intensity - preset) < SNAP_THRESHOLD
    return (
      <button
        key={preset}
        type="button"
        onClick={() => setIntensity(preset)}
        disabled={disabled || !hasFilter}
        className="pointer-events-auto group relative"
        aria-label={`Set intensity to ${preset}%`}
      >
        <div
          className={`
            w-0.5 bg-muted-foreground/30 transition-all duration-150
            ${isActive ? 'h-4 bg-foreground' : 'h-2 group-hover:bg-muted-foreground/50'}
          `}
          style={{ marginTop: isActive ? '-2px' : '0' }}
        />
      </button>
    )
  })}
</div>
```

Place this inside the relative div that contains the input element.

Key implementation details:
- Custom tick marks for consistent cross-browser appearance
- Click handler jumps directly to preset value
- Active tick grows taller (h-4 vs h-2) when at that preset
- Hover effect for discoverability
- Positioned absolute over slider track
  </action>
  <verify>
1. Tick mark container exists with 5 buttons
2. Each button has onClick calling setIntensity with preset value
3. Active tick styling (h-4 vs h-2) applied based on SNAP_THRESHOLD
4. Buttons disabled when slider disabled
5. Aria labels present for accessibility
  </verify>
  <done>
Custom tick marks with click-to-jump functionality rendered over slider.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>IntensitySlider with preset tick marks at 0%, 25%, 50%, 75%, 100%</what-built>
  <how-to-verify>
1. Start dev server: npm run dev
2. Navigate to create route
3. Open filter panel
4. Select any filter
5. Verify tick marks are visible on slider track
6. Click each tick mark and verify slider jumps to that value
7. Verify active tick mark grows taller when at that position
8. Test across browsers (Safari, Chrome, Firefox) if available
9. Verify tick marks are subtle/faint as specified
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues with tick mark appearance or behavior</resume-signal>
</task>

</tasks>

<verification>
1. INTENSITY_PRESETS constant defined with [0, 25, 50, 75, 100]
2. HTML5 datalist added as fallback/primary rendering
3. Custom tick mark container with click handlers
4. Active tick height increases (h-4 vs h-2) when at preset
5. Click on tick mark jumps slider to preset value
6. Tick marks styled subtle (bg-muted-foreground/30)
7. Hover effect on tick marks for discoverability
</verification>

<success_criteria>
1. Five tick marks visible at 0%, 25%, 50%, 75%, 100%
2. Clicking tick mark sets intensity to preset value
3. Active tick mark grows taller visually
4. Tick marks are subtle/faint as per context decisions
5. Cross-browser compatibility (Safari, Chrome, Firefox)
</success_criteria>

<output>
After completion, create `.planning/phases/04-polish-ux-enhancements/04-01-intensity-presets-ui-SUMMARY.md` with:
- Phase: 04-polish-ux-enhancements
- Plan: 01
- Files modified (IntensitySlider.tsx)
- Tech stack patterns (HTML5 datalist, custom tick overlay)
- User verification results
- Duration metrics
</output>
