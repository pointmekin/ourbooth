---
phase: 01-filter-foundations
plan: 03
type: tdd
wave: 3
depends_on: ["01-01"]
files_modified:
  - src/lib/filter-utils.ts
  - src/lib/filter-utils.test.ts
autonomous: true

must_haves:
  truths:
    - "getCssFilterValue returns valid CSS filter string from FilterParameters"
    - "getCssFilterValue scales parameters by intensity (0-100%) correctly"
    - "getSharpModifiers returns Sharp-compatible operations from FilterParameters"
    - "getSharpModifiers scales parameters by intensity correctly"
    - "Test suite validates intensity scaling at 0%, 50%, 100%"
  artifacts:
    - path: src/lib/filter-utils.test.ts
      provides: "TDD test suite for filter utility functions"
      exports: ["getCssFilterValue tests", "getSharpModifiers tests"]
    - path: src/lib/filter-utils.ts
      provides: "Utility functions converting filter parameters to CSS/Sharp"
      exports: ["getCssFilterValue", "getSharpModifiers"]
  key_links:
    - from: "src/lib/filter-utils.ts"
      to: "src/constants/filters.ts"
      via: "import FilterPreset type"
      pattern: "FilterPreset"
    - from: "src/lib/filter-utils.ts"
      to: "src/lib/image-generator.ts"
      via: "Sharp operations in Phase 3"
      pattern: "sharp\\..*modulate"
---

<objective>
Create TDD-tested utility functions that convert filter parameters to CSS filter strings (for Phase 2 preview) and Sharp operations (for Phase 3 export), with proper intensity scaling.

Purpose: These utilities are the bridge between filter definitions and their actual application. The CSS function generates filter strings for browser preview; the Sharp function prepares operations for server-side image processing. TDD ensures correctness since filter consistency is critical.
Output: Tested utility module at src/lib/filter-utils.ts with getCssFilterValue and getSharpModifiers.
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
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/lib/image-generator.ts
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/constants/filters.ts
</context>

<feature>
  <name>Filter Utility Functions</name>
  <files>src/lib/filter-utils.ts, src/lib/filter-utils.test.ts</files>
  <behavior>
    getCssFilterValue(parameters: FilterParameters, intensity: number): string
    - Returns CSS filter string from filter parameters
    - Intensity 0% returns "none" (no filter applied)
    - Intensity 100% returns full filter effect
    - Intensity 50% returns half-strength effect (linear interpolation)
    - Example: {grayscale: 100, contrast: 115} at 100% intensity = "grayscale(100%) contrast(115%)"
    - Example: Same parameters at 50% intensity = "grayscale(50%) contrast(107.5%)"

    getSharpModifiers(parameters: FilterParameters, intensity: number): SharpModifiers
    - Returns Sharp operation parameters from filter parameters
    - Intensity 0% returns identity values (no change)
    - Intensity 100% returns full filter values
    - Intensity scales linearly between 0% and 100%
    - Maps: grayscale -> no Sharp equivalent (handled via saturation=0)
    - Maps: sepia -> grayscale + tint (simulated via saturation/temperature)
    - Maps: saturation -> sharp.modulate({ saturation })
    - Maps: brightness -> sharp.modulate({ brightness })
    - Maps: contrast -> sharp.linear() or sharp.normalize()
  </behavior>
  <implementation>
    After tests pass, implement:
    1. Linear interpolation function: scaleParameter(value: number, intensity: number)
    2. getCssFilterValue: Map parameters to CSS filter syntax, skip 0-values
    3. getSharpModifiers: Map parameters to Sharp API calls
  </implementation>
</feature>

<tasks>
<!-- TDD RED PHASE -->
<task type="auto">
  <name>Write failing tests for filter utilities</name>
  <files>src/lib/filter-utils.test.ts</files>
  <action>
Create src/lib/filter-utils.test.ts with vitest tests:

1. Test getCssFilterValue with:
   - Zero intensity returns "none"
   - Full intensity (100%) returns all non-zero parameters
   - Half intensity (50%) returns half-strength values
   - Zero-valued parameters are omitted from output
   - Parameters are output in consistent order

2. Test getSharpModifiers with:
   - Zero intensity returns identity values
   - Full intensity returns mapped parameter values
   - Half intensity returns interpolated values
   - All five parameters map correctly to Sharp operations

Use describe/it/expect syntax from vitest. Tests MUST FAIL when run initially.

Run: npm test to verify all tests fail.
  </action>
  <verify>npm test shows failing tests for getCssFilterValue and getSharpModifiers</verify>
  <done>Failing test suite written, npm test confirms red state</done>
</task>

<!-- TDD GREEN PHASE -->
<task type="auto">
  <name>Implement getCssFilterValue function</name>
  <files>src/lib/filter-utils.ts</files>
  <action>
Create src/lib/filter-utils.ts with:

1. Import FilterParameters from @/types/filters

2. Create scaleParameter function:
   - Takes base value and intensity (0-100)
   - Returns interpolated value: baseValue * (intensity / 100)
   - For brightness/contrast: interpolate between 100 and baseValue
   - Example: brightness 105 at 50% intensity = 100 + (105-100) * 0.5 = 102.5

3. Create getCssFilterValue(parameters, intensity):
   - If intensity <= 0, return "none"
   - Scale each parameter by intensity
   - Build CSS filter string with non-zero values only
   - Order: grayscale, sepia, saturate, brightness, contrast
   - Return complete filter string (e.g., "grayscale(100%) contrast(115%)")

Run: npm test filter-utils to see tests pass one by one.
  </action>
  <verify>npm test shows getCssFilterValue tests passing</verify>
  <done>getCssFilterValue implemented and tests passing</done>
</task>

<task type="auto">
  <name>Implement getSharpModifiers function</name>
  <files>src/lib/filter-utils.ts</files>
  <action>
Add to src/lib/filter-utils.ts:

1. Define SharpModifiers interface:
   - saturation: number (for modulate)
   - brightness: number (for modulate)
   - contrastLow: number | null (for linear)
   - contrastHigh: number | null (for linear)

2. Create getSharpModifiers(parameters, intensity):
   - If intensity <= 0, return identity values (saturation: 100, brightness: 100)
   - Scale each parameter by intensity using scaleParameter
   - Map grayscale: if > 0, force saturation to 0
   - Map sepia: reduce saturation and apply warm tint (brightness adjustment)
   - Map saturation directly to modulate saturation
   - Map brightness directly to modulate brightness
   - Map contrast to linear() parameters (contrastLow, contrastHigh)
   - Return SharpModifiers object

Sharp's modulate API uses percentage multipliers (100 = normal, <100 = reduced, >100 = increased).
Sharp's linear adjusts contrast using slope/intercept.

Run: npm test filter-utils to verify all tests pass.
  </action>
  <verify>npm test shows all filter-utils tests passing</verify>
  <done>getSharpModifiers implemented, all tests passing</done>
</task>

<!-- TDD REFACTOR PHASE -->
<task type="auto">
  <name>Refactor and finalize filter utilities</name>
  <files>src/lib/filter-utils.ts</files>
  <action>
Review src/lib/filter-utils.ts for refactoring opportunities:

1. Extract magic numbers to named constants
2. Add JSDoc comments for exported functions
3. Ensure code follows project patterns (similar to image-generator.ts)
4. Run tests again to ensure no regressions

If no refactoring needed, skip this task.

Commit: refactor(01-03): clean up filter utility implementation
  </action>
  <verify>npm test still passes, code is clean and documented</verify>
  <done>Code refactored if needed, all tests still passing</done>
</task>
</tasks>

<verification>
1. Run: npm test filter-utils --reporter=verbose
2. Verify test coverage for both functions is complete
3. Check that test file exports are used (not just type imports)
4. Verify sharp API compatibility (check Sharp docs if needed)
</verification>

<success_criteria>
1. src/lib/filter-utils.test.ts exists with comprehensive tests
2. src/lib/filter-utils.ts exists with getCssFilterValue and getSharpModifiers
3. getCssFilterValue returns valid CSS filter strings
4. getSharpModifiers returns Sharp-compatible modifier objects
5. All tests pass (npm test)
6. Functions handle 0%, 50%, 100% intensity correctly
7. Functions follow project code patterns
</success_criteria>

<output>
After completion, create `.planning/phases/01-filter-foundations---build-filter-types,-state,-and-calibration-infrastructure/01-03-SUMMARY.md`
</output>
