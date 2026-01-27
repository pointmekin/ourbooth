---
phase: 01-filter-foundations
plan: 04
type: execute
wave: 4
depends_on: ["01-03"]
files_modified:
  - tests/filter-calibration.test.ts
  - tests/fixtures/calibration-image.ts
autonomous: false

must_haves:
  truths:
    - "Calibration test generates reference images with CSS filters"
    - "Calibration test generates matching images with Sharp filters"
    - "Delta-E color difference is calculated and compared against tolerance"
    - "Test suite validates all 7 filters at 100% intensity"
    - "Test fails if delta-E exceeds 2.0 tolerance threshold"
  artifacts:
    - path: tests/filter-calibration.test.ts
      provides: "End-to-end calibration tests for CSS/Sharp consistency"
      exports: ["calibration test suite"]
    - path: tests/fixtures/calibration-image.ts
      provides: "Sample test image for calibration testing"
      exports: ["getCalibrationTestImage"]
  key_links:
    - from: "tests/filter-calibration.test.ts"
      to: "src/lib/filter-utils.ts"
      via: "import getCssFilterValue, getSharpModifiers"
      pattern: "getCssFilterValue|getSharpModifiers"
    - from: "tests/filter-calibration.test.ts"
      to: "src/constants/filters.ts"
      via: "import FILTER_PRESETS"
      pattern: "FILTER_PRESETS"
---

<objective>
Create a calibration test suite that validates CSS filter preview matches Sharp export by comparing color values using delta-E metric. This ensures filter consistency across the dual-pipeline architecture.

Purpose: The core technical risk of this project is CSS preview not matching Sharp export. Calibration tests catch regressions early by measuring color difference (delta-E) between CSS-rendered and Sharp-processed images. If delta-E < 2.0, colors are perceptually identical.
Output: Calibration test suite that validates all 7 filters at full intensity.
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
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/lib/filter-utils.ts
@/Users/dhanabordeemekintharanggur/Desktop/Projects/chompooh/ourbooth/src/lib/image-generator.ts
</context>

<tasks>

<task type="auto">
  <name>Create calibration test image fixture</name>
  <files>tests/fixtures/calibration-image.ts</files>
  <action>
Create tests/fixtures/calibration-image.ts with:

1. Create a simple test image (100x100px) with known color values:
   - Use a base64-encoded PNG with a color gradient (white to black)
   - Or use jsdom/Vitest canvas to generate a test image
   - Image should have: pure white (#ffffff), pure black (#000000), and middle gray (#808080)
   - These test points cover the full brightness range for accurate delta-E calculation

2. Export getCalibrationTestImage() function that returns:
   - A Buffer containing the test image
   - Or an HTMLImageElement for CSS rendering

The test image must be consistent across test runs.
  </action>
  <verify>File exists at tests/fixtures/calibration-image.ts with getCalibrationTestImage exported</verify>
  <done>Calibration test image fixture created</done>
</task>

<task type="auto">
  <name>Implement delta-E color difference calculation</name>
  <files>tests/filter-calibration.test.ts</files>
  <action>
Create tests/filter-calibration.test.ts with:

1. Import dependencies:
   - sharp (already installed)
   - getCssFilterValue, getSharpModifiers from @/lib/filter-utils
   - FILTER_PRESETS from @/constants/filters
   - getCalibrationTestImage from ./fixtures/calibration-image

2. Implement deltaE function:
   - Takes two RGB colors: {r, g, b}
   - Converts RGB to LAB color space
   - Calculates Euclidean distance in LAB space
   - Returns delta-E value (lower = more similar)

3. Helper function extractColor(buffer, x, y):
   - Uses sharp to extract pixel color at coordinates
   - Returns {r, g, b} object

LAB conversion formula:
- Convert RGB to linear RGB (gamma correction)
- Convert linear RGB to XYZ
- Convert XYZ to LAB

Use standard CIE Delta E 1976 formula.
  </action>
  <verify>deltaE function exists and returns values >= 0 (zero for identical colors)</verify>
  <done>Delta-E calculation implemented with LAB color space conversion</done>
</task>

<task type="auto">
  <name>Create CSS-to-Sharp comparison test</name>
  <files>tests/filter-calibration.test.ts</files>
  <action>
Add to tests/filter-calibration.test.ts:

1. Test suite describe('Filter Calibration', () => {...})

2. For each filter preset in FILTER_PRESETS:
   - Test case: `it(`should match CSS and Sharp for ${preset.id}`, ...)`
   - Get filter parameters and CSS filter string
   - Generate CSS-filtered image (using canvas/HTML or jsdom)
   - Generate Sharp-filtered image (using getSharpModifiers)
   - Sample 5-10 points across both images
   - Calculate delta-E for each point
   - Assert max delta-E < 2.0 (perceptually identical)

3. Edge case tests:
   - Zero intensity: both images should match original
   - Full intensity: delta-E within tolerance for all filters

Note: CSS rendering may need happy-dom or jsdom for test environment.
  </action>
  <verify>Test file contains calibration tests for all 7 filter presets</verify>
  <done>Calibration test suite created with delta-E assertions</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete calibration test suite that validates CSS/Sharp filter consistency</what-built>
  <how-to-verify>
    1. Run: npm test filter-calibration
    2. Check that all 7 filter tests pass
    3. Review delta-E values in test output (should be < 2.0)
    4. If tests fail, examine which filter exceeds tolerance and why
    5. Fix filter parameters in src/constants/filters.ts if needed

    Expected result: All tests pass with delta-E < 2.0
  </how-to-verify>
  <resume-signal>Type "approved" if calibration tests pass, or describe which filters need adjustment</resume-signal>
</task>

</tasks>

<verification>
1. Run: npm test filter-calibration --reporter=verbose
2. Verify all 7 filter presets are tested
3. Check delta-E values are calculated correctly
4. Ensure test fails when delta-E exceeds 2.0 tolerance
5. Confirm test outputs diagnostic info on failure
</verification>

<success_criteria>
1. tests/fixtures/calibration-image.ts exists with test image
2. tests/filter-calibration.test.ts exists with delta-E calculation
3. All 7 filter presets have calibration tests
4. Tests assert delta-E < 2.0 tolerance
5. Running `npm test filter-calibration` passes
6. Test provides useful diagnostic output on failure
</success_criteria>

<output>
After completion, create `.planning/phases/01-filter-foundations---build-filter-types,-state,-and-calibration-infrastructure/01-04-SUMMARY.md`
</output>
