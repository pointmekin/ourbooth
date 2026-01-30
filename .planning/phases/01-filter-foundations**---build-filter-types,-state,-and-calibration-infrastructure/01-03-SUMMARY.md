---
phase: 01-filter-foundations
plan: 03
subsystem: utilities
tags: [vitest, tdd, css-filters, sharp, image-processing]

# Dependency graph
requires:
  - phase: 01-filter-foundations
    plan: 01-01
    provides: FilterParameters type and filter presets
provides:
  - getCssFilterValue: Converts FilterParameters to CSS filter strings for browser preview
  - getSharpModifiers: Converts FilterParameters to Sharp operation parameters for server-side processing
  - Linear interpolation function for intensity scaling (0-100%)
  - Test suite validating filter-to-API conversion accuracy
affects: [02-ui-components, 03-filter-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD workflow (RED → GREEN → REFACTOR)
    - Named constants for magic numbers
    - JSDoc documentation on all exports

key-files:
  created:
    - src/lib/filter-utils.ts
    - src/lib/filter-utils.test.ts
  modified: []

key-decisions:
  - "Baseline intensity of 100 for brightness/contrast/saturation (CSS filter standard)"
  - "Sharp contrast mapping via linear() with slope/intercept calculation"
  - "Grayscale in Sharp simulated by forcing saturation to 0"
  - "Sepia in Sharp simulated by reducing saturation proportionally"

patterns-established:
  - "TDD: Write failing tests first, implement to pass, then refactor"
  - "Magic numbers extracted to named constants (BASELINE_INTENSITY, MAX_PIXEL_VALUE, SEPIA_DIVISOR)"
  - "Helper functions kept private, only public APIs exported"

# Metrics
duration: 3min
completed: 2026-01-28
---

# Phase 1: Plan 3 - Filter Utilities Summary

**TDD-tested filter utility functions converting FilterParameters to CSS filter strings and Sharp modifiers with intensity scaling**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-28T03:25:04Z
- **Completed:** 2026-01-28T03:28:21Z
- **Tasks:** 3 (RED, GREEN, REFACTOR)
- **Files modified:** 2

## Accomplishments

- Implemented `getCssFilterValue` converting FilterParameters to CSS filter syntax with intensity scaling
- Implemented `getSharpModifiers` mapping FilterParameters to Sharp modulate/linear operations
- Created comprehensive test suite with 13 tests validating 0%, 50%, 100% intensity scaling
- Extracted magic numbers to named constants for maintainability

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests for filter utilities** - `0adaf43` (test)
2. **Task 2: Implement getCssFilterValue function** - `1756b4b` (feat)
3. **Task 3: Refactor and finalize filter utilities** - `ed81a84` (refactor)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `src/lib/filter-utils.test.ts` - Vitest test suite with 13 tests for CSS and Sharp conversion
- `src/lib/filter-utils.ts` - Utility functions for filter parameter conversion

### Key Exports

**Functions:**
- `getCssFilterValue(parameters: FilterParameters, intensity: number): string` - Returns CSS filter string
- `getSharpModifiers(parameters: FilterParameters, intensity: number): SharpModifiers` - Returns Sharp operation parameters

**Types:**
- `SharpModifiers` - Interface for Sharp modulate/linear parameters (saturation, brightness, contrastLow, contrastHigh)

## Deviations from Plan

None - plan executed exactly as written using TDD methodology.

## Issues Encountered

None - TDD approach prevented implementation issues by writing tests first.

## Technical Details

### getCssFilterValue Implementation

- Converts FilterParameters to CSS filter string (e.g., "grayscale(100%) contrast(115%)")
- Intensity 0% returns "none"
- Intensity scales linearly: parameter × (intensity / 100)
- For brightness/contrast: interpolates between baseline (100) and target value
- Omits zero and baseline values from output string
- Maintains consistent parameter order: grayscale, sepia, saturate, brightness, contrast

### getSharpModifiers Implementation

- Maps FilterParameters to Sharp API operations
- **Grayscale**: Forces saturation to 0 (no direct Sharp equivalent)
- **Sepia**: Reduces saturation using formula `saturation × (1 - sepia / 200)`
- **Saturation**: Direct mapping to `sharp.modulate({ saturation })`
- **Brightness**: Direct mapping to `sharp.modulate({ brightness })`
- **Contrast**: Maps to `sharp.linear()` with calculated slope/intercept
  - Contrast > 100: slope > 1 (compress midtones, increase contrast)
  - Contrast < 100: slope < 1 (expand midtones, decrease contrast)

### Constants Extracted

- `BASELINE_INTENSITY = 100` - Normal/neutral value for filters
- `MAX_PIXEL_VALUE = 255` - Max pixel value for contrast calculations
- `SEPIA_DIVISOR = 200` - Divisor for sepia saturation reduction

## Test Coverage

All 13 tests passing:

**getCssFilterValue (5 tests):**
- ✓ Returns "none" when intensity is 0
- ✓ Returns all non-zero parameters at full intensity (100%)
- ✓ Returns half-strength values at 50% intensity
- ✓ Omits zero-valued parameters from output
- ✓ Outputs parameters in consistent order

**getSharpModifiers (8 tests):**
- ✓ Returns identity values when intensity is 0
- ✓ Returns full parameter values at 100% intensity
- ✓ Returns interpolated values at 50% intensity
- ✓ Maps grayscale to saturation=0 when grayscale > 0
- ✓ Maps sepia to reduced saturation and warm tint
- ✓ Maps saturation directly to modulate saturation
- ✓ Maps brightness directly to modulate brightness
- ✓ Maps contrast to linear parameters

## Next Phase Readiness

**Ready for Phase 2 (UI Components):**
- `getCssFilterValue` can be used for real-time filter preview in React components
- Test coverage ensures filter consistency across preview and export

**Ready for Phase 3 (Filter Export):**
- `getSharpModifiers` provides Sharp-compatible parameters for image processing
- Filter-to-API conversion validated by tests

**No blockers or concerns.**

---
*Phase: 01-filter-foundations*
*Plan: 03*
*Completed: 2026-01-28*
