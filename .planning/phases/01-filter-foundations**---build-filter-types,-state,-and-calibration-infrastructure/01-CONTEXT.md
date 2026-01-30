# Phase 1: Filter Foundations - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

## Phase Boundary

Build filter types, state management, and calibration infrastructure to ensure CSS preview matches Sharp export exactly. This phase creates the foundational system that Phase 2 (UI) and Phase 3 (Export) will depend on. No user-visible features yet, but the core data structures, state store, and validation system.

## Implementation Decisions

### State Management Approach
- Use Redux or Zustand for global filter state (selected filter, intensity)
- Store state in localStorage for persistence across browser sessions
- Single filter state applies to all photos in a strip (not per-photo filtering)
- Explicit setter actions: `setSelectedFilter(filterName)` and `setIntensity(value)`
- State structure: `{ filter: 'noir', intensity: 75 }`

### Filter Parameter Design
- Fixed presets only — 7 predefined filter combinations, not user-customizable
- All filters use a unified parameter set (grayscale, sepia, saturation, brightness, contrast)
- Intensity slider scales 0-100% linearly (0% = no effect, 100% = full preset effect)
- Single source of truth for filter definitions — converted to CSS/Sharp at runtime by utility functions

### Claude's Discretion
- Exact state store structure (Redux vs Zustand choice, action names)
- Filter utility implementation details (conversion functions)
- Calibration test suite design (test images, delta-E validation approach)
- Exact parameter values for each of the 7 presets (Noir, Sepia, Vintage, Warm, Cool, Vivid, Muted)

## Specific Ideas

- Need unified parameter set across all filters (grayscale, sepia, saturation, brightness, contrast)
- Single filter applies to entire photo strip — not per-photo customization
- Linear intensity scaling from 0-100%

## Deferred Ideas

- None — discussion stayed within phase scope

---

*Phase: 01-filter-foundations*
*Context gathered: 2026-01-28*
