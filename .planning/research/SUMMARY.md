# Project Research Summary

**Project:** ourbooth Instagram-style photo filters
**Domain:** Photobooth filter system with CSS preview + Sharp export
**Researched:** 2025-01-28
**Confidence:** HIGH

## Executive Summary

This project implements an Instagram-style color filter system for a photobooth application. The research establishes a hybrid approach: CSS filters for real-time browser preview and Sharp (Node.js image processing) for high-quality export. This dual-pipeline architecture balances performance (GPU-accelerated CSS) with professional output quality (Sharp's server-side processing).

The recommended approach prioritizes filter consistency above all else. The critical technical challenge is ensuring CSS preview matches Sharp export exactly—research identified color space mismatches and algorithmic differences as major pitfalls. Implementation must begin with calibration infrastructure (delta-E testing, lookup tables) before building UI features. Feature research confirms users expect: filter thumbnails, one-click application, active state indication, real-time preview, intensity slider (0-100%), and reset to original—all table stakes for any photo filter system.

Key risks are manageable but require upfront investment: (1) CSS/Sharp color space divergence—solved by explicit gamma correction and sRGB pipeline configuration; (2) Performance degradation on Safari—mitigated by filter ordering optimization and debouncing; (3) Sharp concurrency bottlenecks during batch export—addressed with explicit thread pool configuration. These pitfalls are well-documented with established prevention strategies. Overall confidence is HIGH: stack choices (native CSS + Sharp 0.34.5) are production-proven, architecture patterns are standard for React photo editors, and critical pitfalls have clear mitigation paths.

## Key Findings

### Recommended Stack

**Core technologies:**
- **CSS Filters** — Real-time preview in browser — Hardware-accelerated, zero-latency, native browser support, no server load
- **Sharp 0.34.5** — Server-side image processing — Already installed, production-ready, supports modulate/tint/gamma/linear operations
- **React + Zustand** — Filter state management — Already in use, provides global filter state across photobooth strip

**No additional dependencies required.** CSS filters are native browser APIs; Sharp is already installed. Avoid unnecessary libraries (CSSgram, Jimp, ImageMagick) that add complexity without benefit.

### Expected Features

**Must have (table stakes):**
- **Filter preview thumbnails** — Users expect visual grid showing each filter applied to sample image (Instagram/VSCO pattern)
- **One-click filter application** — Standard interaction: tap thumbnail to apply immediately
- **Active filter indication** — Visual highlight (border/checkmark) on selected filter
- **Real-time preview** — Instant feedback as user browses/applies filters
- **Filter intensity slider** — 0-100% strength control (found in all major photo apps)
- **Remove/reset filter** — "Original" option or clear button

**Should have (competitive):**
- **Before/after comparison** — Press-and-hold gesture to see original (Instagram/VSCO pattern)
- **Batch filter application** — One filter applies to all photos in strip (matches current sticker pattern)
- **Intensity presets** — Notches at 25%, 50%, 75% for easier slider control
- **Filter favorites** — Star frequently used filters for quick access

**Defer (v2+):**
- **Custom filter creation** — Power user feature, not essential for casual photobooth
- **Smart filter suggestions** — AI recommendations, complex and uncertain value
- **Advanced filtering** — Multiple filter stacking, violates simplicity principle

### Architecture Approach

**Dual-pipeline filter system:** CSS for preview (fast, GPU-accelerated), Sharp for export (professional quality). Filter state lives in Zustand store, accessed by FilterPanel (UI) and PhotoStrip (preview), and passed to image-generator for export processing.

**Major components:**
1. **FilterPanel** — Provides filter adjustment UI (sliders, presets) as separate component
2. **PhotoStrip** — Displays photos with CSS filter preview applied via inline styles
3. **PhotoboothStore** — Manages filter state (brightness, contrast, saturation, etc.) in Zustand
4. **image-generator.ts** — Applies Sharp equivalents of CSS filters during export
5. **FilterUtils** — Converts CSS filter values to Sharp parameters (utility module)

**Global vs per-slot filters:** Research recommends global filter (all photos same) to match existing sticker pattern and simplify UX. Per-slot filters add flexibility but complexity.

### Critical Pitfalls

1. **Color space mismatch between CSS and Sharp** — CSS uses sRGB with gamma correction; Sharp/libvips defaults to linear space. Prevent by setting `pipelineColourspace('srgb')` in Sharp, applying `gamma()` correction before linear operations, and creating calibration tests with delta-E comparison (< 2.0 tolerance).

2. **Different filter algorithms between CSS and Sharp** — Even with matched color spaces, brightness/contrast/saturation formulas differ. Prevent by implementing custom CSS-equivalent math with gamma correction, building lookup tables (LUTs) at 0%/25%/50%/75%/100%, and defining intensity as parameter scaling applied identically to both CSS and Sharp.

3. **Performance death by real-time preview** — CSS filters compound rendering cost, especially Safari. Prevent by debouncing slider input (16ms ~ 60fps), using `requestAnimationFrame` for smooth updates, applying filter to container once (not each element), and testing filter ordering for Safari optimization.

4. **Sharp concurrency limits during batch export** — Thread pool doesn't auto-scale for concurrent processing. Prevent by configuring `sharp.concurrency(N)` explicitly, implementing job queue for exports (limit to 3 concurrent), and monitoring export duration metrics.

5. **Intensity slider multiplies mismatch** — CSS interpolation ≠ Sharp interpolation, creating third dimension of divergence. Prevent by defining intensity as parameter scaling using identical formula for both systems, testing intensity curve visually at 0%/25%/50%/75%/100%, and considering perceptual scaling (sqrt/cube) for smoother feel.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Filter Foundations

**Rationale:** Must solve CSS/Sharp consistency first—calibration infrastructure is impossible to retrofit after UI is built. Architecture research establishes types → store → utilities → components dependency chain.

**Delivers:**
- Filter type definitions (`FilterState` interface)
- Filter state in Zustand store
- Filter presets (7 filters: Noir, Sepia, Vintage, Warm, Cool, Vivid, Muted)
- FilterUtils module with CSS→Sharp conversion
- Calibration test suite (delta-E comparison)

**Addresses:**
- Stack requirement: Sharp 0.34.5 API verification (modulate, tint, gamma, linear)
- Architecture requirement: State management foundation (Pattern 2: Per-Slot vs Global Filter State)
- Pitfall prevention: Color space mismatch, algorithm mismatch, intensity scaling

**Avoids:**
- Pitfall 1: Color space mismatch (solve with gamma correction, sRGB pipeline)
- Pitfall 2: Algorithm mismatch (solve with custom CSS-equivalent math)
- Pitfall 5: Intensity slider mismatch (solve with identical scaling formula)

**Research flag:** Standard patterns—no additional research needed. Official Sharp documentation and CSS filter specs are sufficient.

### Phase 2: Filter Preview UI

**Rationale:** Depends on Phase 1 state/types. Builds preview infrastructure before export processing, allowing UI validation independent of Sharp pipeline.

**Delivers:**
- FilterPanel component (grid layout, 7 filter thumbnails)
- FilterSlider component (0-100% intensity control)
- PhotoStrip CSS filter application (inline styles)
- Real-time preview with performance optimization
- Active filter indication (visual state)
- Reset button functionality

**Addresses:**
- Features requirement: Filter preview thumbnails, one-click application, active indication, real-time preview, intensity slider, remove/reset (all table stakes)
- Architecture requirement: FilterPanel component, PhotoStrip integration, store subscription
- Stack requirement: CSS filters for preview (GPU-accelerated)

**Uses:**
- CSS filters (native browser APIs)
- React + Zustand (state management)
- Debouncing/performance optimization patterns

**Implements:**
- Architecture: Pattern 1 (Dual-Pipeline Filter System) — CSS preview half
- Architecture: Pattern 3 (Filter Presets as Combinations)

**Avoids:**
- Pitfall 3: Performance death by real-time preview (debounce, rAF, Safari testing)
- Anti-pattern 1: Using Canvas for preview (CSS filters are faster)
- Anti-pattern 3: Applying filters globally to container (affects stickers)

**Research flag:** Standard patterns—Instagram/VSCO UI patterns are well-documented. Grid layout vs horizontal scroll decision resolved by feature research (7 filters = manageable grid).

### Phase 3: Filter Export Processing

**Rationale:** Depends on Phase 1 filter utilities. Can be built independently of UI—Sharp pipeline processes store state directly.

**Delivers:**
- Update image-generator.ts to accept filter parameter
- Apply Sharp filters during photo strip generation
- Filter validation (clamp values, prevent DoS via extreme inputs)
- Batch export optimization (concurrency limits, job queue)
- Export progress indicators

**Addresses:**
- Stack requirement: Sharp 0.34.5 operations (modulate, tint, linear, grayscale, blur)
- Architecture requirement: image-generator integration, Sharp processing layer
- Features requirement: Consistent export quality (preview matches export)

**Uses:**
- Sharp 0.34.5 (already installed)
- FilterUtils CSS→Sharp conversion (from Phase 1)
- Filter state from store (from Phase 1)

**Avoids:**
- Pitfall 4: Sharp concurrency limits (explicit concurrency config, job queue)
- Security mistake: Allowing arbitrary filter values (validate on server)
- Integration gotcha: Assuming modulate() matches CSS (use custom CSS-equivalent math)

**Research flag:** Medium complexity—Sharp API is well-documented but CSS→Sharp mapping requires testing. Consider `/gsd:research-phase` if calibration tests reveal significant divergence.

### Phase 4: Polish & UX Enhancements

**Rationale:** Builds on working foundation. Features are differentiators, not table stakes—can be added after core functionality validates.

**Delivers:**
- Before/after comparison (press-and-hold gesture)
- Filter intensity presets (25%, 50%, 75% notches)
- Filter favorites (star for quick access)
- Performance optimizations (Safari filter ordering, canvas caching)
- User testing feedback integration

**Addresses:**
- Features requirement: Before/after comparison, intensity presets, filter favorites (should-have differentiators)
- Pitfall prevention: UX pitfalls (no way to compare original, no undo/redo)

**Implements:**
- Architecture: Refinement of Pattern 1 (Dual-Pipeline) — consistency validation
- UX patterns from Smashing Magazine, LogRocket research

**Research flag:** Standard patterns—press-and-hold comparison is Instagram/VSCO standard. Slider UX best practices are well-documented.

### Phase Ordering Rationale

**Why this order based on dependencies:**
- Phase 1 first: Types and state are foundation for everything else. Architecture research shows FilterState → Store → FilterPanel → PhotoStrip dependency chain. Cannot build UI without types, cannot process export without utilities.
- Phase 2 before Phase 3: Preview UI validates filter logic visually, easier to debug. Export processing can be tested independently with mock store state.
- Phase 3 after Phase 1: Sharp pipeline depends on FilterUtils conversion logic. Can develop in parallel with Phase 2 but requires Phase 1 completion.
- Phase 4 last: Enhancements build on working preview + export. User testing of MVP may change priorities (e.g., if before/after is requested frequently, prioritize higher).

**Why this grouping based on architecture patterns:**
- Phase 1 groups foundation work (types, store, utilities) — aligns with "State & Types" build order from architecture research
- Phase 2 groups all preview components — aligns with "Preview" phase (UI only, no processing)
- Phase 3 groups export processing — aligns with "Export" phase (processing only, no UI changes)
- Phase 4 groups UX enhancements — aligns with "Polish" phase (optional, test-driven)

**How this avoids pitfalls:**
- Phase 1 directly addresses 3 of 5 critical pitfalls (color space mismatch, algorithm mismatch, intensity scaling)—prevention is impossible to retrofit
- Phase 2 addresses performance pitfalls before they affect users—Safari testing, debouncing, filter ordering optimization
- Phase 3 addresses Sharp concurrency and export bottlenecks—load testing before production exposure
- Phase 4 addresses UX pitfalls through user testing—before/after comparison, undo/redo, discoverability

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3:** Medium complexity—Sharp API is documented but CSS→Sharp calibration may require iterative testing. Consider `/gsd:research-phase` if initial calibration reveals significant divergence (>5% delta-E).

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Well-documented—Sharp API, CSS filter specs, Zustand patterns all have official documentation.
- **Phase 2:** Well-documented—Instagram/VSCO UI patterns are standard, slider UX best practices established (Smashing Magazine, LogRocket).
- **Phase 4:** Well-documented—Before/after gesture is industry standard, accessibility patterns established.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Sharp documentation (HIGH), CSS filter specification (HIGH), already-installed packages verified |
| Features | MEDIUM-HIGH | Instagram/VSCO patterns verified (HIGH), photobooth-specific UI limited research (MEDIUM), general photo app patterns well-established (HIGH) |
| Architecture | HIGH | React photo editor patterns documented (HIGH), dual-pipeline architecture is industry standard (HIGH), Zustand integration straightforward (HIGH) |
| Pitfalls | HIGH-MEDIUM | Color space mismatch well-documented (HIGH), performance patterns established (HIGH), calibration strategies proven (MEDIUM-HIGH) |

**Overall confidence:** HIGH

All critical technical decisions have high-quality source verification (official documentation, established patterns). Stack choices are production-proven with no experimental dependencies. Architecture patterns are standard for React photo editors. Pitfalls are well-documented with clear mitigation strategies. Medium confidence areas (photobooth-specific UI) are non-critical—can iterate based on user feedback.

### Gaps to Address

**Gaps to validate during implementation:**
- **Exact CSS→Sharp calibration values:** Research establishes methodology (gamma correction, LUTs, delta-E testing) but specific RGB values for sepia/warm/cool filters require empirical testing. Handle by: Creating calibration test script during Phase 1, adjusting tint() RGB values until delta-E < 2.0.
- **Safari performance characteristics:** Research confirms Safari has filter performance issues but optimal filter ordering is device-dependent. Handle by: Benchmarking on actual Safari devices during Phase 2, testing `brightness → contrast → saturate` vs `saturate → contrast → brightness`.
- **Sharp concurrency tuning:** Research identifies concurrency limits but optimal thread count depends on hardware. Handle by: Load testing during Phase 3 with realistic batch exports, starting with `sharp.concurrency(4)` and adjusting based on metrics.

**Gaps that are NOT blockers:**
- Photobooth-specific filter UI patterns are limited in research—Instagram/VSCO patterns are sufficient foundation.
- Exact current UI of competitor apps (changes frequently)—established patterns are stable.
- Performance characteristics for specific image sizes—can test with real photos during development.

## Sources

### Primary (HIGH confidence)

**Stack:**
- [Sharp 0.34.5 API Documentation](https://sharp.pixelplumbing.com/api-operation) — Verified modulate(), tint(), linear(), grayscale() operations
- [Sharp Color API Documentation](https://sharp.pixelplumbing.com/api-colour) — Verified gamma correction, sRGB pipeline requirements
- [CSS Filter Specification (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) — Verified CSS filter syntax and value ranges

**Architecture:**
- [How to Build a Photo Editor With React and CSS Filters - CoderPad](https://coderpad.io/blog/development/react-photo-editor-with-css-filters/) — Comprehensive dual-pipeline architecture tutorial
- [Zustand Documentation](https://github.com/pmndrs/zustand) — State management patterns for global filter state
- [Sharp GitHub Repository](https://github.com/lovell/sharp) — Official source for concurrency configuration, operation usage

**Pitfalls:**
- [GitHub Issue #1958: CSS Contrast + Brightness with Sharp](https://github.com/lovell/sharp/issues/1958) — Direct confirmation that CSS filters don't match Sharp operations without custom math
- [GitHub Issue #2227: Color space conversion in Sharp](https://github.com/lovell/sharp/issues/2227) — Discussion of sRGB vs linear pipeline
- [CSS Performance Optimization (MDN, 2025)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS) — Official CSS performance best practices

### Secondary (MEDIUM confidence)

**Features:**
- [Smashing Magazine - Designing The Perfect Slider UX](https://www.smashingmagazine.com/2017/07/designing-perfect-slider/) — Comprehensive slider UX guidelines (principles timeless, dated but valid)
- [LogRocket Blog - Getting Filters Right](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices/) — Updated November 2024, covers both UX and UI for filter systems
- [Instagram Filters Recreated in CSS3](https://www.designpieces.com/2014/09/instagram-filters-css3-effects/) — Empirical CSS filter values for 1977, Amaro, Valencia (tested by author)

**Pitfalls:**
- [Stack Overflow: CSS vs Sharp contrast implementation](https://stackoverflow.com/questions/55323334/implementing-css-svg-contrast-filter-using-sharp-libvips) — Notes SVG filters use linearRGB, requires sRGB attribute
- [CSS Filter Performance on Safari](https://stackoverflow.com/questions/44662417/css-filter-is-very-slow-on-safari-with-different-order-can-someone-explain) — Confirms Safari has filter performance issues depending on order
- [GitHub Issue #4411: Sharp concurrency documentation](https://github.com/lovell/sharp/issues/4411) — CPU utilization issues with concurrent image processing

**Architecture:**
- [Why CSS3 filters are more performant than Canvas - StackOverflow](https://stackoverflow.com/questions/43822886/why-are-css3-filter-effects-more-performant-than-html5-canvas-equivalents) — Performance comparison justification
- [Vintage CSS Photo Effects](https://dev.to/codingdudecom/7-css-image-effects-for-making-awesome-vintage-photos-51h2) — Tested sepia/warm/cool filter patterns

### Tertiary (LOW confidence)

**Features:**
- [Pencil & Paper - Mobile Filter UX Design Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-mobile-filters) — Published July 2024, mobile-specific but enterprise-focused
- Instagram, VSCO, Lightroom Mobile patterns (based on common knowledge of these apps, not verified against current versions)

**Pitfalls:**
- [Image Compositing Performance with Sharp](https://stackoverflow.com/questions/62382204/bad-performance-compositing-images-with-sharp) — Performance bottlenecks in compositing workflow (specific to compositing, less relevant to filters)

---
*Research completed: 2025-01-28*
*Ready for roadmap: yes*
