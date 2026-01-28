# Phase 02: Filter Preview UI - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

## Phase Boundary

Build user interface for filter selection and real-time preview. Users see filter thumbnails, tap to apply filters to all captured photos, adjust intensity with slider, and see results immediately. This phase does NOT include export processing (Phase 3) or advanced UX features like intensity presets (Phase 4).

## Implementation Decisions

### Filter Thumbnail Strip Layout
- Horizontal scrollable strip showing 3-4 thumbnails at a time (classic pattern like Instagram)
- Medium-sized thumbnails (80-100px square) for good balance of visibility and touch targets
- Each thumbnail shows the same sample photo with that filter applied (clear comparison)
- Text labels below each thumbnail showing filter name (e.g., "Noir", "Sepia")
- All 7 filter presets displayed: noir, sepia, vintage, warm, cool, vivid, muted

### Intensity Slider UX
- Positioned below the thumbnail strip, appears conditionally when a filter is selected
- Real-time live update during drag (filter preview updates as you slide)
- Shows percentage value (e.g., "75%") next to slider for clear feedback
- Dedicated reset button to return intensity to default (75%)
- Slider range: 0-100%

### Photo Strip Preview Behavior
- All photos in the strip update together (single filter applied globally, not per-photo)
- Filter applies immediately on thumbnail tap (one-click application)
- Return to original (no filter) via "Original" thumbnail in the strip
- Thumbnails use first photo from user's captured strip as sample (authentic preview)
- Empty state: Show message "Add photos to try filters" with disabled thumbnail strip

### Visual Feedback & States
- Selected filter indicated by solid colored border (2-3px, brand color)
- Subtle scale or highlight effect on thumbnail hover/tap for interactive feedback
- Empty state when no photos captured: informative message + disabled filter UI
- Original (no filter) state is treated as just another thumbnail in the strip

### Claude's Discretion
- Exact spacing and typography for labels and controls
- Color palette for borders and highlights (should match existing app design)
- Scroll behavior and momentum (native platform scrolling or custom)
- Animation timing for hover/tap feedback
- Exact wording of empty state message

## Specific Ideas

- "I want it to feel like Instagram's filter selection - horizontal scroll, easy comparison"
- Use the first captured photo as the sample so users see the actual effect on their own photo
- One-tap application (no confirmation) because filters are reversible and non-destructive
- All photos in the strip get the same filter - keeps it simple and matches the success criteria

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 02-filter-preview-ui*
*Context gathered: 2026-01-28*
