# Roadmap: Photobooth Filter System

## Overview

This roadmap delivers an Instagram-style color filter system for the photobooth application. We build a dual-pipeline architecture: CSS filters for real-time browser preview and Sharp for high-quality export. The journey begins with foundational types, state management, and calibration infrastructure to ensure filter consistency. We then build the complete preview UI (filter selection, thumbnails, intensity slider), followed by Sharp export processing with validated color matching. The final phase adds UX polish (intensity presets) based on user feedback. This order prevents technical debt—calibration infrastructure cannot be retrofitted after UI is built.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Filter Foundations** - Build filter types, state, and calibration infrastructure
- [ ] **Phase 2: Filter Preview UI** - Implement complete filter selection and preview interface
- [ ] **Phase 3: Filter Export Processing** - Integrate Sharp filter processing for export
- [ ] **Phase 4: Polish & UX Enhancements** - Add intensity presets and UX refinements

## Phase Details

### Phase 1: Filter Foundations

**Goal**: Filter types, state management, and calibration infrastructure ensure CSS preview matches Sharp export exactly.

**Depends on**: Nothing (first phase)

**Requirements**: FILTER-12, FILTER-13, FILTER-14

**Success Criteria** (what must be TRUE):
1. Filter state (selected filter, intensity) persists across application and is accessible globally
2. All 7 filter presets (Noir, Sepia, Vintage, Warm, Cool, Vivid, Muted) are defined with matching CSS and Sharp parameters
3. Calibration test suite validates CSS→Sharp filter consistency with delta-E < 2.0 tolerance
4. FilterUtils module converts CSS filter values to Sharp operations correctly

**Plans:** 4 plans

Plans:
- [ ] 01-01-filter-types-and-presets-PLAN.md — Define filter types and create 7 filter presets
- [ ] 01-02-filter-state-store-PLAN.md — Create Zustand store for filter state management
- [ ] 01-03-filter-utilities-PLAN.md — Build TDD-tested CSS/Sharp conversion utilities
- [ ] 01-04-calibration-test-suite-PLAN.md — Create delta-E validation tests

### Phase 2: Filter Preview UI

**Goal**: Users can select filters, preview them in real-time on captured photos, and adjust intensity.

**Depends on**: Phase 1 (requires filter types, state, and presets)

**Requirements**: FILTER-01, FILTER-02, FILTER-03, FILTER-04, FILTER-05, FILTER-06, FILTER-07, FILTER-09, FILTER-10, FILTER-15

**Success Criteria** (what must be TRUE):
1. User can see 7 filter preview thumbnails showing each filter effect on a sample photo
2. User can tap any thumbnail to apply that filter to all photos in the strip with one click
3. User sees visual indication (border or highlight) of the currently selected filter
4. User can adjust filter intensity using slider (0-100%) and see real-time preview as slider moves
5. User can reset to original (no filter) via dedicated button or "Original" thumbnail

**Plans**: TBD

### Phase 3: Filter Export Processing

**Goal**: Exported photo strips include filter effects applied via Sharp processing, matching CSS preview exactly.

**Depends on**: Phase 1 (requires FilterUtils and filter definitions), Phase 2 (requires filter state from UI)

**Requirements**: FILTER-11, FILTER-13

**Success Criteria** (what must be TRUE):
1. Exported photo strip images include the selected filter applied via Sharp operations
2. Filter effects in exported images match CSS preview visually (validated via calibration)
3. Export processing handles batch photo strips without concurrency bottlenecks
4. Export validates filter parameters to prevent extreme values causing processing errors

**Plans**: TBD

### Phase 4: Polish & UX Enhancements

**Goal**: Enhanced UX with intensity presets for easier slider control and performance optimizations.

**Depends on**: Phase 2 (requires complete UI with intensity slider)

**Requirements**: FILTER-08

**Success Criteria** (what must be TRUE):
1. User can quickly set intensity to common values (25%, 50%, 75%) via preset notches on slider
2. Slider UX provides smooth feedback when selecting preset values
3. Preview performance remains smooth (60fps) with filters applied on Safari browsers

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Filter Foundations | 0/4 | Not started | - |
| 2. Filter Preview UI | 0/TBD | Not started | - |
| 3. Filter Export Processing | 0/TBD | Not started | - |
| 4. Polish & UX Enhancements | 0/TBD | Not started | - |
