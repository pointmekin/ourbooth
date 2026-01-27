---
phase: 01-filter-foundations
plan: 02
type: execute
wave: 2
depends_on: ["01-01"]
files_modified:
  - src/stores/filter-store.ts
autonomous: true

must_haves:
  truths:
    - "Filter state (selected filter, intensity) is accessible globally via Zustand store"
    - "Filter state persists to localStorage and restores on page load"
    - "Store provides setSelectedFilter and setIntensity actions"
    - "Store includes reset action to clear filter state"
  artifacts:
    - path: src/stores/filter-store.ts
      provides: "Global filter state management with localStorage persistence"
      exports: ["useFilterStore", "FilterState"]
      contains: "create<FilterState>"
  key_links:
    - from: "src/stores/filter-store.ts"
      to: "src/constants/filters.ts"
      via: "import FILTER_PRESETS for default values"
      pattern: "FILTER_PRESETS"
    - from: "src/stores/filter-store.ts"
      to: "localStorage"
      via: "zustand persist middleware"
      pattern: "persist"
---

<objective>
Create a Zustand store for filter state management with localStorage persistence. This provides global access to the selected filter and intensity value for Phase 2 (UI) components.

Purpose: Centralize filter state so any component can access or modify the currently selected filter and intensity. Persistence ensures user's filter choice survives page refreshes.
Output: Zustand store at src/stores/filter-store.ts with filter, intensity, and actions.
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
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/stores/photobooth-store.ts
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/constants/filters.ts
</context>

<tasks>

<task type="auto">
  <name>Create filter Zustand store</name>
  <files>src/stores/filter-store.ts</files>
  <action>
Create a new file at src/stores/filter-store.ts with:

1. Import from zustand:
   - create for store creation
   - persist for localStorage middleware

2. Import FilterType from @/types/filters
   Import FILTER_PRESETS from @/constants/filters

3. Define FilterState interface with:
   - selectedFilter: FilterType | null (currently selected filter, null = no filter)
   - intensity: number (0-100, default 75)
   - setSelectedFilter: (filter: FilterType | null) => void
   - setIntensity: (intensity: number) => void
   - reset: () => void

4. Create store with create<FilterState>():

   Initial state:
   - selectedFilter: null (no filter by default)
   - intensity: 75 (default intensity)

   Actions:
   - setSelectedFilter: Sets the selected filter
   - setIntensity: Clamps input between 0-100, then sets intensity
   - reset: Resets to initial state

5. Wrap with persist middleware:
   - name: 'ourbooth-filter-storage'
   - Skip persistence in non-browser environments (check typeof window !== 'undefined')

Follow the exact pattern from src/stores/photobooth-store.ts for consistency.
  </action>
  <verify>
  File exists at src/stores/filter-store.ts with useFilterStore exported. Store has selectedFilter, intensity state and setSelectedFilter, setIntensity, reset actions.
  </verify>
  <done>
  Filter store created with Zustand, includes persist middleware for localStorage, matches the pattern of photobooth-store.ts
  </done>
</task>

</tasks>

<verification>
1. Run TypeScript compilation: npm run check
2. Verify store can be imported: grep -r "useFilterStore" src/ should initially return nothing (new store)
3. Test that persist configuration is valid (check localStorage key name matches pattern)
</verification>

<success_criteria>
1. src/stores/filter-store.ts exists with useFilterStore exported
2. Store has selectedFilter (FilterType | null) and intensity (number) state
3. setSelectedFilter, setIntensity, and reset actions are defined
4. Persist middleware is configured with localStorage key 'ourbooth-filter-storage'
5. TypeScript compilation passes without errors
6. Store follows the same pattern as photobooth-store.ts
</success_criteria>

<output>
After completion, create `.planning/phases/01-filter-foundations---build-filter-types,-state,-and-calibration-infrastructure/01-02-SUMMARY.md`
</output>
