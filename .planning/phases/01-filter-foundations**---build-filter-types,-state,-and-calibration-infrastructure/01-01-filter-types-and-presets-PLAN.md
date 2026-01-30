---
phase: 01-filter-foundations
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/constants/filters.ts
  - src/types/filters.ts
autonomous: true

must_haves:
  truths:
    - "All 7 filter presets (Noir, Sepia, Vintage, Warm, Cool, Vivid, Muted) are defined with matching CSS and Sharp parameters"
    - "Each filter has grayscale, sepia, saturation, brightness, and contrast values defined"
    - "Filter types are exported and usable by other modules"
  artifacts:
    - path: src/types/filters.ts
      provides: "Filter type definitions and interfaces"
      exports: ["FilterType", "FilterPreset", "FilterParameters"]
      contains: "interface FilterParameters"
    - path: src/constants/filters.ts
      provides: "7 filter preset definitions with CSS/Sharp parameters"
      exports: ["FILTER_TYPES", "FILTER_PRESETS"]
  key_links:
    - from: "src/constants/filters.ts"
      to: "src/stores/filter-store.ts"
      via: "import FILTER_PRESETS"
      pattern: "FILTER_PRESETS"
---

<objective>
Define filter types and create 7 filter presets (Noir, Sepia, Vintage, Warm, Cool, Vivid, Muted) with matching CSS and Sharp parameters. This creates the single source of truth for filter definitions that Phase 2 (UI) and Phase 3 (Export) will depend on.

Purpose: Establish the data model for the entire filter system. All filters use a unified parameter set (grayscale, sepia, saturation, brightness, contrast) that maps to both CSS filters for preview and Sharp operations for export.
Output: Type definitions file and constants file with 7 filter presets.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/01-filter-foundations---build-filter-types,-state,-and-calibration-infrastructure/01-CONTEXT.md

Reference existing patterns:
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/data/templates.ts
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/stores/photobooth-store.ts
</context>

<tasks>

<task type="auto">
  <name>Create filter type definitions</name>
  <files>src/types/filters.ts</files>
  <action>
Create a new file at src/types/filters.ts with the following interfaces:

1. FilterType - literal union of the 7 filter names:
   export type FilterType = 'noir' | 'sepia' | 'vintage' | 'warm' | 'cool' | 'vivid' | 'muted'

2. FilterParameters - unified parameter set for all filters:
   - grayscale: number (0-100) - CSS grayscale() percentage
   - sepia: number (0-100) - CSS sepia() percentage
   - saturation: number (0-200) - CSS saturate() multiplier (100 = normal, <100 = desaturated, >100 = saturated)
   - brightness: number (50-150) - CSS brightness() multiplier (100 = normal, <100 = darker, >100 = brighter)
   - contrast: number (50-150) - CSS contrast() multiplier (100 = normal)

3. FilterPreset - combines filter metadata with parameters:
   - id: FilterType
   - name: string (display name)
   - category: 'bw' | 'color' | 'vintage' (for UI organization in Phase 2)
   - parameters: FilterParameters

Do NOT create any implementation code - only type definitions.
  </action>
  <verify>File exists at src/types/filters.ts with exports FilterType, FilterParameters, FilterPreset</verify>
  <done>Type definitions file created with all three interfaces exported</done>
</task>

<task type="auto">
  <name>Create filter preset constants</name>
  <files>src/constants/filters.ts</files>
  <action>
Create a new file at src/constants/filters.ts with:

1. Import FilterType and FilterPreset from @/types/filters

2. FILTER_PRESETS array with 7 filter presets:

   **noir** (Black & White)
   - category: 'bw'
   - grayscale: 100, sepia: 0, saturation: 0, brightness: 105, contrast: 115

   **sepia** (Classic Sepia)
   - category: 'vintage'
   - grayscale: 0, sepia: 80, saturation: 60, brightness: 102, contrast: 105

   **vintage** (Aged Photo)
   - category: 'vintage'
   - grayscale: 0, sepia: 40, saturation: 70, brightness: 95, contrast: 90

   **warm** (Warm Tones)
   - category: 'color'
   - grayscale: 0, sepia: 20, saturation: 110, brightness: 102, contrast: 105

   **cool** (Cool Tones)
   - category: 'color'
   - grayscale: 0, sepia: 0, saturation: 90, brightness: 98, contrast: 105

   **vivid** (High Saturation)
   - category: 'color'
   - grayscale: 0, sepia: 0, saturation: 140, brightness: 100, contrast: 110

   **muted** (Low Saturation)
   - category: 'color'
   - grayscale: 0, sepia: 0, saturation: 60, brightness: 100, contrast: 95

3. Helper function getFilterById(id: FilterType): FilterPreset | undefined

4. Helper function getFiltersByCategory(category: string): FilterPreset[]

Follow the pattern from src/data/templates.ts for consistency.
  </action>
  <verify>File exists at src/constants/filters.ts with FILTER_PRESETS containing exactly 7 filters and helper functions</verify>
  <done>Filter presets constants created with all 7 filters and helper functions</done>
</task>

</tasks>

<verification>
Run TypeScript compilation to verify types are correct:
npm run check

Ensure no type errors related to the new filter types.
</verification>

<success_criteria>
1. src/types/filters.ts exists with FilterType, FilterParameters, and FilterPreset exported
2. src/constants/filters.ts exists with FILTER_PRESETS array containing exactly 7 filters
3. Each filter preset has all 5 parameters defined (grayscale, sepia, saturation, brightness, contrast)
4. Helper functions getFilterById and getFiltersByCategory are exported
5. TypeScript compilation passes without errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-filter-foundations---build-filter-types,-state,-and-calibration-infrastructure/01-01-SUMMARY.md`
</output>
