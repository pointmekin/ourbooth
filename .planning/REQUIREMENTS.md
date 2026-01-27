# Requirements: Photobooth Filter System

**Defined:** 2026-01-28
**Core Value:** Users can enhance their photobooth photos with one-click color filters applied consistently in export.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Filter Selection

- [ ] **FILTER-01**: User can select from 7 preset filters (Noir, Sepia, Vintage, Warm, Cool, Vivid, Muted)
- [ ] **FILTER-02**: User sees filter preview thumbnails showing each filter effect
- [ ] **FILTER-03**: User applies filter with one click/tap on thumbnail
- [ ] **FILTER-04**: User sees visual indication of currently selected filter
- [ ] **FILTER-05**: User can reset filter to original (no filter)

### Filter Controls

- [ ] **FILTER-06**: User can adjust filter intensity using slider (0-100% range)
- [ ] **FILTER-07**: User sees real-time preview of filter as intensity slider moves
- [ ] **FILTER-08**: User can use intensity presets (notches at 25%, 50%, 75%)

### Filter Application

- [ ] **FILTER-09**: Selected filter applies to all photos in strip (global application)
- [ ] **FILTER-10**: Filter preview applies to captured/uploaded photos (not live camera feed)
- [ ] **FILTER-11**: Exported image includes filter effects applied via Sharp processing

### Technical Foundation

- [ ] **FILTER-12**: System uses CSS filters for real-time preview
- [ ] **FILTER-13**: System uses Sharp operations matching CSS filters for export
- [ ] **FILTER-14**: Filter state managed in Zustand store
- [ ] **FILTER-15**: Filter UI integrated into existing ToolSidebar component

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Filter Selection

- **FILTER-16**: User can favorite filters for quick access
- **FILTER-17**: User sees favorited filters promoted to top of list

### Filter Controls

- **FILTER-18**: User can compare original vs filtered using press-and-hold gesture

### Filter Organization

- **FILTER-19**: Filters organized into categories (B&W, Color, Vintage, Modern)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Live camera filtering | Too complex for initial release; apply only to captured/uploaded photos |
| Per-photo filters | Adds UI complexity; global filter matches existing sticker pattern |
| Custom filter creation | Power user feature; can add based on user feedback |
| Smart filter suggestions | AI complexity; uncertain value proposition for casual photobooth |
| Advanced color grading | Violates simplicity principle; preset filters sufficient |
| Multiple filter stacking | Creates UI complexity; single filter with intensity is clearer |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FILTER-01 | Phase 2 | Pending |
| FILTER-02 | Phase 2 | Pending |
| FILTER-03 | Phase 2 | Pending |
| FILTER-04 | Phase 2 | Pending |
| FILTER-05 | Phase 2 | Pending |
| FILTER-06 | Phase 2 | Pending |
| FILTER-07 | Phase 2 | Pending |
| FILTER-08 | Phase 4 | Pending |
| FILTER-09 | Phase 2 | Pending |
| FILTER-10 | Phase 2 | Pending |
| FILTER-11 | Phase 3 | Pending |
| FILTER-12 | Phase 1 | Pending |
| FILTER-13 | Phase 1, Phase 3 | Pending |
| FILTER-14 | Phase 1 | Pending |
| FILTER-15 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after roadmap creation*
