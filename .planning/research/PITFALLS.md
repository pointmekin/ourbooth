# Pitfalls Research

**Domain:** Photo Filter Implementation (CSS Preview + Sharp Export)
**Researched:** 2025-01-28
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Color Space Mismatch Between CSS and Sharp

**What goes wrong:**
CSS filters render differently than Sharp filters, causing exported images to look darker, cooler, or have different color characteristics than the live preview. Users see one thing in the browser, download another.

**Why it happens:**
- CSS filters operate in browser-specific color spaces (often sRGB with gamma correction)
- Sharp/libvips by default processes in non-linear sRGB space
- SVG filters use linearRGB by default, requiring explicit `color-interpolation-filters="sRGB"` attribute
- Sharp's `greyscale()` and other operations are linear but assume non-linear input, creating math mismatches

**How to avoid:**
1. **Match color spaces explicitly:**
   - Use Sharp's `pipelineColourspace('srgb')` to force sRGB processing
   - Apply `gamma()` correction before linear operations in Sharp
   - Set SVG filter attribute: `color-interpolation-filters="sRGB"`

2. **Create calibration tests:**
   - Generate test image with known color values
   - Apply CSS filter, capture screenshot
   - Apply Sharp filter with same parameters
   - Pixel-compare results, adjust Sharp values until match achieved

3. **Document the conversion formula:**
   - Create a mapping function: `cssFilterValue → sharpFilterValue`
   - Store calibration curves for each filter type (brightness, contrast, saturation)
   - Version this mapping — browser rendering changes over time

**Warning signs:**
- Exported images look "washed out" or have blue tint compared to preview
- Darker images appear significantly darker when exported
- Color saturation differs between preview and export
- Side-by-side comparison shows obvious mismatch

**Phase to address:**
Phase 1 - Filter Foundations. Must solve before building UI on top, otherwise fixing requires rewriting all filter logic.

---

### Pitfall 2: Different Filter Algorithms Between CSS and Sharp

**What goes wrong:**
Even with matched color spaces, brightness/contrast/saturation values produce different visual results because CSS and Sharp use different mathematical formulas.

**Why it happens:**
- CSS `brightness()` uses a linear multiplier on pixel values
- CSS `contrast()` factor formula differs from libvips contrast implementation
- CSS `saturate()` may use different color space (HSL vs RGB) than Sharp
- No official specification says "CSS filters must equal Sharp operations"

**How to avoid:**
1. **Implement custom filter matching:**
   ```javascript
   // Don't use Sharp's built-in directly
   // sharp.modulate({ brightness: 1.2 }) // ❌ Won't match CSS

   // Instead, implement CSS-equivalent math
   function applyCssBrightness(sharp, value) {
     // CSS brightness() = linear multiplier
     // Must convert to linear space, apply, convert back
     return sharp
       .gamma() // Convert to linear
       .modulate({ brightness: value })
       .gamma(1 / 2.2) // Convert back to sRGB
   }
   ```

2. **Build lookup tables (LUTs):**
   - For each filter (brightness, contrast, saturation), test values at 0%, 25%, 50%, 75%, 100%
   - Create comparison images (CSS vs Sharp)
   - Measure delta-E (color difference)
   - Build interpolation table to map CSS values to Sharp values

3. **Use intensity slider as truth:**
   - Define your own filter scale (0-100% intensity)
   - Map your scale → CSS filter value for preview
   - Map your scale → Sharp filter value for export
   - Calibrate both mappings against visual reference

**Warning signs:**
- Filter strength feels "stronger" or "weaker" in export than preview
- Fine-tuned filter settings look wrong when exported
- Contrast adjustments create different mid-tone behaviors
- Brightness changes affect shadow/highlight details differently

**Phase to address:**
Phase 1 - Filter Foundations. Algorithm matching is core to the feature — impossible to retrofit later.

---

### Pitfall 3: Performance Death by Real-Time Preview

**What goes wrong:**
Live filter preview becomes sluggish as filters are chained, causing UI lag and poor user experience. Safari is especially vulnerable to CSS filter performance issues.

**Why it happens:**
- CSS filters trigger GPU compositing for each filtered element
- Multiple filters (brightness + contrast + saturation) compound rendering cost
- Safari has known performance issues with certain filter orderings
- Filtered images + stickers + overlays = many composited layers
- Each slider change triggers reflow/repaint of entire canvas

**How to avoid:**
1. **Debounce slider input:**
   ```javascript
   // Don't apply on every input event
   const debouncedApplyFilters = debounce(applyFilters, 16) // ~60fps

   // Or use requestAnimationFrame for smoother updates
   let rafId = null
   function onSliderChange(value) {
     if (rafId) cancelAnimationFrame(rafId)
     rafId = requestAnimationFrame(() => applyFilters(value))
   }
   ```

2. **Use CSS filter property efficiently:**
   ```css
   /* ❌ Bad: Apply to each element separately */
   .sticker { filter: brightness(1.2); }
   .overlay { filter: brightness(1.2); }
   .photo { filter: brightness(1.2); }

   /* ✅ Good: Apply to container once */
   .photo-canvas {
     filter: brightness(1.2) contrast(1.1) saturate(1.2);
   }
   ```

3. **Test filter ordering:**
   - Safari performs better with certain filter orders
   - Benchmark: `brightness → contrast → saturate` vs `saturate → contrast → brightness`
   - Document optimal order for your use case

4. **Consider WebGL for complex filters:**
   - If performance is unacceptable, move preview to WebGL
   - Three.js is already in your stack — use shader material for filters
   - Sharper filters can then match WebGL shader math

**Warning signs:**
- Slider drag feels "heavy" or lags behind mouse movement
- FPS drops below 30 when adjusting filters
- Safari specifically performs worse than Chrome/FireFox
- Adding more stickers/filters exponentially slows down preview

**Phase to address:**
Phase 2 - Preview Performance. Test early with realistic photo + sticker load, optimize before adding more features.

---

### Pitfall 4: Sharp Concurrency Limits During Batch Export

**What goes wrong:**
When users export multiple photos or create GIFs, Sharp only uses a fraction of available CPU (e.g., 550% of 1400% on 14-core machine), causing slow exports.

**Why it happens:**
- Sharp uses libvips thread pool, sized by default based on detected cores
- Thread pool doesn't automatically scale for concurrent image processing
- Each Sharp operation competes for same worker threads
- No built-in queue management for parallel exports

**How to avoid:**
1. **Configure Sharp concurrency explicitly:**
   ```javascript
   // In server startup
   const sharp = require('sharp')
   sharp.concurrency(4) // Limit to avoid starvation

   // Or increase for dedicated export workers
   sharp.concurrency(8) // Use more cores if available
   ```

2. **Implement job queue for exports:**
   ```javascript
   // Use a queue (bull, bee-queue) for export jobs
   const exportQueue = new Queue('photo-export', {
     limiter: {
       max: 3, // Max 3 concurrent exports
       duration: 1000
     }
   })
   ```

3. **Batch optimize:**
   - For GIFs, process frames in parallel but limit concurrency
   - Use `Promise.all()` with concurrency limit
   - Cache filtered images if same filter applied multiple times

4. **Monitor and alert:**
   - Track export duration metrics
   - Alert if exports consistently take > 2 seconds per photo
   - Load test with 10+ concurrent exports before launch

**Warning signs:**
- Export time scales linearly with photo count (no parallelism)
- CPU usage stuck at ~50% despite 100% load on other operations
- GIF creation takes disproportionately long
- User reports: "Exporting 10 photos took forever"

**Phase to address:**
Phase 3 - Export Optimization. Test with batch exports early — concurrency issues are hard to fix retroactively.

---

### Pitfall 5: Intensity Slider Multiplies Mismatch

**What goes wrong:**
Adding an intensity slider (0-100%) to control filter strength creates a third dimension of mismatch: CSS interpolation ≠ Sharp interpolation.

**Why it happens:**
- CSS filters don't have native "intensity" parameter
- You're interpolating between `filter: none` and `filter: brightness(X)`
- CSS interpolation is linear in filter value space
- Sharp interpolation (if you modulate parameters) may be linear in different space
- 50% intensity ≠ 50% of the max filter effect visually

**How to avoid:**
1. **Define intensity as parameter scaling:**
   ```javascript
   // CSS Preview
   function applyFilter(baseValue, intensity) {
     // intensity: 0-100
     const scaled = (baseValue - 1) * (intensity / 100) + 1
     return `brightness(${scaled})`
   }

   // Sharp Export — use SAME formula
   function applySharpFilter(sharp, baseValue, intensity) {
     const scaled = (baseValue - 1) * (intensity / 100) + 1
     return sharp.modulate({ brightness: scaled })
   }
   ```

2. **Test intensity curve visually:**
   - At intensity 0%, verify both CSS and Sharp show no effect
   - At intensity 50%, verify visual effect is "half as strong" as 100%
   - Create reference images for 0%, 25%, 50%, 75%, 100% intensity
   - Ensure CSS and Sharp match at each point

3. **Perceptual vs. linear intensity:**
   - Linear intensity (50% = half the value) may not look "half as strong"
   - Consider perceptual scaling: square or cube the intensity value
   - Test with users: "Does 50% intensity feel like half strength?"
   - Apply same perceptual curve to both CSS and Sharp

**Warning signs:**
- 50% intensity looks much stronger/weaker than expected
- Slider feels "non-linear" (small changes at low end, big changes at high end)
- Low intensity values (10-20%) barely visible in preview but obvious in export
- User feedback: "Intensity slider doesn't feel smooth"

**Phase to address:**
Phase 2 - Filter Intensity. Intensity is core UX — must match preview/export at all intensity levels.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use CSS `filter` directly without Sharp equivalent | Quick prototype, works in browser | Impossible to match export without complete rewrite | Never for production |
| Calibrate filters "by eye" without LUTs | Faster initial development | Continuous drift, browser updates break matching | MVP only, must document calibration process |
| Ignore Safari performance issues | Faster development, Chrome works | 15-20% of users have poor experience, bad reviews | Never — Safari is significant on macOS/iOS |
| Skip intensity slider, use fixed presets | Simpler UI, less calibration | Limited user control, less competitive | MVP only, add intensity in Phase 2 |
| Process exports synchronously | Simpler code, no queue infrastructure | Blocks server, can't handle load, bad UX | Never for production |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Sharp API | Assuming `modulate({brightness: X})` matches CSS `brightness(X)` | Implement custom CSS-equivalent math with gamma correction |
| Three.js WebGL | Writing shader that doesn't match CSS filter math | Use shader math that mirrors Sharp operations, verify with delta-E testing |
| HTML2Canvas | Expecting screenshot to capture CSS filters exactly | Don't rely on screenshots — always use Sharp for export, CSS is preview-only |
| Google Cloud Storage | Uploading filtered images without optimizing | Use Sharp's `.webp()` with quality setting for smaller uploads |
| Neon Database | Storing filter parameters as JSON string | Store as structured columns: `filter_type`, `brightness`, `contrast`, `saturation`, `intensity` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Applying filters on every slider input event | UI jank, < 20 FPS | Debounce to 16ms (60fps) or use rAF | Immediate with any filter |
| Not batching Sharp operations | 10s to export 10 photos | Use Promise.all with concurrency limit | At 5+ concurrent exports |
| Re-computing filter chain on each render | Slider feels "heavy" | Cache filter string, only rebuild on change | With 3+ chained filters |
| Ignoring Safari filter performance | Works great in Chrome, terrible in Safari | Test in Safari early, optimize filter order | On first Safari user |
| Processing GIF frames synchronously | 30s to create 10-frame GIF | Process frames in parallel with pool | At 5+ frames |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Allowing arbitrary filter values from client | DoS via extreme values (brightness: 999999) | Validate and clamp all filter values on server |
| Processing user-provided image without limits | Memory exhaustion via 100MB images | Validate image dimensions and file size before processing |
| Storing unoptimized filtered images | Storage costs explode 10x | Always apply Sharp optimization before saving |
| Exporting without rate limiting | Server DoS via export spam | Implement per-user rate limits on export endpoint |
| Not sanitizing filter parameters | Sharp crashes on invalid input | Use Zod schema validation on all filter parameters |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Preview looks great, export looks different | User distrust, "broken" feature | Calibrate CSS ≈ Sharp, show "export quality" preview warning |
| No way to compare original vs filtered | Can't see if filter improved photo | Long-press to show original, or side-by-side toggle |
| Filter changes undo previous tweaks | Frustration, feels like bug | Stack filters non-destructively, allow reordering |
| Too many filter presets | Decision paralysis, feature ignored | Start with 3-5 curated presets, add more based on usage |
| No undo/redo for filter changes | Accidental slider move ruins photo | Implement undo stack (at least 10 levels deep) |
| Export shows no progress indicator | "Is it working? Did it freeze?" | Show progress bar for multi-photo exports, animated spinner for single |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Filter consistency:** Often missing delta-E testing — verify CSS and Sharp outputs match within perceptual tolerance (ΔE < 2.0)
- [ ] **Intensity slider calibration:** Often missing intermediate value testing — test 0%, 25%, 50%, 75%, 100% intensity values match between preview and export
- [ ] **Safari performance:** Often missing Safari testing — verify preview maintains 30+ FPS on Safari with max filters + stickers
- [ ] **Color space handling:** Often missing ICC profile support — verify exported images include sRGB profile for consistent viewing
- [ ] **Error handling:** Often missing Sharp error handling — catch processing errors and show user-friendly message (not "Error: Input buffer has unsupported owner")
- [ ] **Filter combination testing:** Often missing chained filter testing — verify brightness + contrast + saturation together doesn't create unexpected artifacts
- [ ] **Edge case images:** Often missing testing with unusual images — test with very dark, very bright, and high-saturation photos
- [ ] **Export quality settings:** Often missing quality/compression options — provide user control over export quality vs file size

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Color space mismatch discovered late | HIGH | 1. Create calibration test suite immediately. 2. Build CSS→Sharp value mapping for all filters. 3. Update export pipeline with corrected math. 4. Recalculate all previously saved filtered images. 5. Communicate "improved export quality" to users. |
| Performance issues in production | MEDIUM | 1. Profile with Chrome DevTools Performance tab. 2. Identify slowest filter combination. 3. Implement debouncing + rAF throttling. 4. Move filter application to container-level CSS. 5. Add canvas caching for static elements. |
| Sharp concurrency bottleneck | MEDIUM | 1. Add `sharp.concurrency(N)` configuration. 2. Implement export job queue with concurrency limit. 3. Add metrics to monitor export duration. 4. Load test batch exports. 5. Scale horizontally if single-machine limit reached. |
| Filter algorithm mismatch | HIGH | 1. Freeze current filter system. 2. Build new filter module with proper CSS→Sharp mapping. 3. A/B test new vs old system. 4. Migrate users to new system with data migration script. 5. Deprecate old filter API. |
| Intensity slider feels wrong | LOW | 1. Gather user feedback on desired intensity curve. 2. Test perceptual scaling (sqrt, cube). 3. Update intensity formula in both CSS and Sharp. 4. A/B test linear vs perceptual scaling. 5. Ship better curve as update. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Color space mismatch | Phase 1: Filter Foundations | Unit tests: CSS filter value → Sharp operation → delta-E comparison < 2.0 |
| Algorithm mismatch | Phase 1: Filter Foundations | Integration tests: Sample image through CSS preview and Sharp export, pixel match > 95% |
| Preview performance | Phase 2: Preview Performance | Performance tests: 60 FPS with max filters + 10 stickers on Safari |
| Sharp concurrency | Phase 3: Export Optimization | Load tests: 10 concurrent exports complete in < 5 seconds total |
| Intensity slider mismatch | Phase 2: Filter Intensity | Visual regression tests: Screenshots at 0%, 25%, 50%, 75%, 100% intensity match export |
| UX pitfalls | Phase 4: Polish & Testing | User testing: 5 users can apply filter, adjust intensity, export without confusion |
| Edge case images | Phase 3: Edge Case Handling | Test suite: Dark image, bright image, neon colors, black & white photo all process correctly |

## Sources

- [Sharp Colour Manipulation API Documentation](https://sharp.pixelplumbing.com/api-colour/) - HIGH confidence - Official docs note linear operations require gamma correction for sRGB
- [GitHub Issue #1958: Applying CSS Contrast + Brightness Adjustment](https://github.com/lovell/sharp/issues/1958) - MEDIUM confidence - Direct confirmation that CSS filters don't match Sharp operations
- [Stack Overflow: Implementing CSS/SVG contrast filter using Sharp](https://stackoverflow.com/questions/55323334/implementing-css-svg-contrast-filter-using-sharp-libvips) - MEDIUM confidence - Notes SVG filters use linearRGB, requires sRGB attribute
- [GitHub Issue #2227: Color space conversion in Sharp](https://github.com/lovell/sharp/issues/2227) - MEDIUM confidence - Discussion of switching from non-linear sRGB to linear scRGB pipeline
- [CSS Performance Optimization (MDN, 2025)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS) - HIGH confidence - Official documentation on CSS performance best practices
- [CSS Filter Performance on Safari](https://stackoverflow.com/questions/44662417/css-filter-is-very-slow-on-safari-with-different-order-can-someone-explain) - MEDIUM confidence - Confirms Safari has filter performance issues depending on order
- [GitHub Issue #4411: Sharp concurrency documentation](https://github.com/lovell/sharp/issues/4411) - MEDIUM confidence - CPU utilization issues with concurrent image processing
- [Image Compositing Performance with Sharp](https://stackoverflow.com/questions/62382204/bad-performance-compositing-images-with-sharp) - LOW confidence - Performance bottlenecks in compositing workflow

---

*Pitfalls research for: Photo Filter Implementation (CSS Preview + Sharp Export)*
*Researched: 2025-01-28*
