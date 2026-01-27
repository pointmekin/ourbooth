# Stack Research: Instagram-Style Color Filters

**Domain:** Photo booth color filter implementation
**Researched:** 2025-01-28
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **CSS Filters** | CSS3 | Real-time preview in browser | Hardware-accelerated, zero-latency preview, native browser support, no server load |
| **Sharp** | 0.34.5 | Server-side image processing | Already installed, production-ready, supports all required operations (modulate, tint, gamma, linear) |
| **React + Zustand** | Existing | Filter state management | Already in use, provides global filter state across photobooth strip |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **None required** | - | No helper libraries needed | CSS filters + Sharp operations cover all requirements. Avoid unnecessary dependencies. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **TypeScript** | Type safety for filter configs | Define filter types with CSS and Sharp operation interfaces |

## Installation

```bash
# No additional packages needed
# Sharp 0.34.5 is already installed
# CSS filters are native browser APIs
```

## Filter Implementation Strategy

### Architecture: Hybrid CSS + Sharp

**Preview (Client-side):** CSS filters applied via inline styles
**Export (Server-side):** Sharp operations matching CSS effects

This approach provides:
- Instant preview (no server round-trip)
- Consistent export quality
- Zero additional dependencies

### 7 Preset Filters: CSS Syntax → Sharp Operations

#### 1. **Noir** (Black & White)

**CSS Preview:**
```css
filter: grayscale(100%) contrast(110%);
```

**Sharp Export:**
```typescript
sharp(input)
  .grayscale()
  .modulate({ brightness: 1.1 }) // Contrast equivalent
```

**Rationale:** Grayscale removes color, modulate brightness adjusts contrast. HIGH confidence - direct CSS mapping.

---

#### 2. **Sepia** (Vintage Warm)

**CSS Preview:**
```css
filter: sepia(100%) contrast(90%) brightness(105%);
```

**Sharp Export:**
```typescript
sharp(input)
  .modulate({
    brightness: 1.05,
    saturation: 0.6  // Sepia reduces saturation
  })
  .tint({ r: 112, g: 66, b: 20 }) // Warm brown tint
```

**Rationale:** Sepia is warm brown tint. Sharp uses `tint()` with hex #704214. MEDIUM confidence - may need calibration.

---

#### 3. **Vintage** (Faded & Warm)

**CSS Preview:**
```css
filter: sepia(30%) contrast(90%) brightness(95%) saturate(85%);
```

**Sharp Export:**
```typescript
sharp(input)
  .modulate({
    brightness: 0.95,
    saturation: 0.85
  })
  .tint({ r: 255, g: 240, b: 200 }) // Warm cream tint
```

**Rationale:** Vintage = reduced contrast + warm tint. `tint()` creates faded look. MEDIUM confidence - tint value needs testing.

---

#### 4. **Warm** (Temperature Shift)

**CSS Preview:**
```css
filter: sepia(20%) saturate(120%) brightness(105%);
```

**Sharp Export:**
```typescript
sharp(input)
  .modulate({
    brightness: 1.05,
    saturation: 1.2
  })
  .tint({ r: 255, g: 200, b: 150 }) // Orange warmth
```

**Rationale:** Warm = boosted saturation + orange tint. MEDIUM confidence - tint intensity may vary.

---

#### 5. **Cool** (Temperature Shift)

**CSS Preview:**
```css
filter: hue-rotate(180deg) saturate(80%) brightness(100%);
```

**Sharp Export:**
```typescript
sharp(input)
  .modulate({
    saturation: 0.8,
    hue: 180 // Blue shift
  })
```

**Rationale:** Cool = hue rotation to blue spectrum + desaturation. HIGH confidence - `modulate()` hue is direct equivalent.

---

#### 6. **Vivid** (High Contrast & Saturation)

**CSS Preview:**
```css
filter: saturate(160%) contrast(115%) brightness(105%);
```

**Sharp Export:**
```typescript
sharp(input)
  .modulate({
    brightness: 1.05,
    saturation: 1.6
  })
  .linear({ 1.15 }) // Contrast multiplier
```

**Rationale:** Vivid needs strong saturation boost. Sharp's `linear()` adjusts contrast. HIGH confidence - straightforward multiplier.

---

#### 7. **Muted** (Low Contrast & Desaturation)

**CSS Preview:**
```css
filter: saturate(60%) contrast(85%) brightness(100%);
```

**Sharp Export:**
```typescript
sharp(input)
  .modulate({
    saturation: 0.6
  })
  .linear({ 0.85 }) // Reduce contrast
```

**Rationale:** Muted = desaturated + lower contrast. HIGH confidence - simple multiplier reduction.

---

## Intensity Slider (0-100%)

**Implementation:** Scale filter values by intensity percentage

**CSS Preview Example (Vivid at 50% intensity):**
```css
filter: saturate(130%) contrast(107%); /* 50% of 160%/115% boost */
```

**Formula:**
```typescript
const scale = (base: number, intensity: number) => {
  return 1 + (base - 1) * (intensity / 100)
}

// Example: Vivid filter at 50% intensity
const saturation = scale(1.6, 50) // → 1.3 (130%)
const contrast = scale(1.15, 50)   // → 1.075 (107.5%)
```

**Confidence:** HIGH - linear interpolation is standard practice.

---

## Mapping CSS Filters to Sharp Operations

| CSS Filter | Sharp Equivalent | Confidence | Notes |
|------------|------------------|------------|-------|
| `grayscale(100%)` | `.grayscale()` | HIGH | Direct 1:1 mapping |
| `sepia(X%)` | `.tint({r,g,b})` + saturation | MEDIUM | Sepia = brown tint, needs RGB tuning |
| `brightness(X%)` | `.modulate({brightness})` | HIGH | Multiplier: 100% = 1.0, 120% = 1.2 |
| `contrast(X%)` | `.linear({multiplier})` | HIGH | Multiplier: 100% = 1.0, >100% = higher contrast |
| `saturate(X%)` | `.modulate({saturation})` | HIGH | Multiplier: 100% = 1.0, >100% = more saturated |
| `hue-rotate(Xdeg)` | `.modulate({hue})` | HIGH | Degrees are identical (0-360) |
| `blur(Xpx)` | `.blur(sigma)` | HIGH | CSS px ≈ Sharp sigma (may need 2x multiplier) |

---

## TypeScript Type Definitions

```typescript
// Filter configuration type
export interface PhotoFilter {
  id: string
  name: string
  css: string // CSS filter string for preview
  sharp: (sharp: Sharp.Sharp) => Sharp.Sharp // Sharp operations for export
}

// Example: Noir filter
export const noirFilter: PhotoFilter = {
  id: 'noir',
  name: 'Noir',
  css: 'grayscale(100%) contrast(110%)',
  sharp: (s) => s.grayscale().modulate({ brightness: 1.1 })
}

// Filter with intensity
export interface FilterWithIntensity {
  filter: PhotoFilter
  intensity: number // 0-100
}
```

---

## Implementation Pattern

```typescript
// Apply filter to all images in strip
export async function applyFilterToStrip(
  images: Buffer[],
  filter: PhotoFilter,
  intensity: number
): Promise<Buffer[]> {
  return Promise.all(
    images.map(async (buffer) => {
      // Scale intensity
      const scaledSharp = createIntensityScaler(filter.sharp, intensity)

      // Apply Sharp operations
      return scaledSharp(sharp(buffer)).toBuffer()
    })
  )
}

// Preview component (React)
function FilterPreview({ image, filter, intensity }: Props) {
  const scaledCss = scaleCssIntensity(filter.css, intensity)

  return (
    <img
      src={image}
      style={{ filter: scaledCss }}
      alt="Preview"
    />
  )
}
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| **CSS + Sharp** | CSSgram library | Adds unnecessary dependency. CSS filters are native. |
| **CSS + Sharp** | Canvas API (client-side) | Can't export to file easily. Server-side Sharp ensures consistent quality. |
| **CSS + Sharp** | Jimp / ImageMagick | Sharp is faster, already installed, lower memory usage. |
| **tint() + modulate()** | Color lookup tables (LUTs) | Overkill for 7 simple presets. LUTs add complexity without benefit. |
| **Hybrid approach** | Pure CSS export (html2canvas) | html2canvas quality varies. Sharp ensures pixel-perfect exports. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **WebGL filters** | Overkill, browser compatibility issues, no export path | CSS filters for preview |
| **Canvas pixel manipulation** | Slow for large images, complex export | Sharp's optimized operations |
| **Instagram API** | Requires auth, rate limits, deprecated endpoints | Custom CSS/Sharp implementation |
| **PostCSS plugins** | Build-time only, can't change intensity at runtime | Inline CSS styles |
| **Filterous / filterous-2** | Last updated 2017, unmaintained, client-side only | Sharp for server-side |

---

## Stack Patterns by Variant

**If preview performance is critical:**
- Use CSS filters exclusively for preview
- Debounce intensity slider (300ms)
- Cache filtered images in Zustand store

**If export consistency is critical:**
- Test Sharp output against CSS preview on sample photos
- Create calibration adjustments for `tint()` operations
- Document any CSS/Sharp divergence in filter config comments

**If adding custom filters later:**
- Define filters as config objects (see TypeScript types above)
- Keep CSS and Sharp operations in same object for consistency
- Add JSDoc comments explaining filter intent

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| **sharp** | 0.34.5 | Node.js >= 20.9.0 | Already installed, supports all required operations |
| **React** | 19.2.0 | CSS filters (native) | Inline styles work seamlessly |
| **Zustand** | 5.0.9 | TypeScript 5.7+ | Store filter state globally |

---

## Quality Assurance Checklist

Before implementation:

- [ ] Test CSS filter values on sample photos in browser dev tools
- [ ] Verify Sharp operations on sample images using CLI or test script
- [ ] Compare CSS preview vs Sharp export for each filter
- [ ] Document any divergence between CSS/Sharp (e.g., tint() saturation)
- [ ] Create calibration images (skin tones, landscapes, high-contrast)

---

## Sources

### HIGH Confidence (Official Documentation)

- **Sharp 0.34.5 API Documentation** — Verified modulate(), tint(), linear(), grayscale() operations
  - https://sharp.pixelplumbing.com/api-operation
  - https://sharp.pixelplumbing.com/api-colour
  - Confidence: HIGH (official docs)

- **CSS Filter Specification (MDN)** — Verified CSS filter syntax and value ranges
  - https://developer.mozilla.org/en-US/docs/Web/CSS/filter
  - Confidence: HIGH (web standard)

### MEDIUM Confidence (Community Research)

- **Instagram Filters Recreated in CSS3** — Verified CSS filter values for 1977, Amaro, Valencia, etc.
  - https://www.designpieces.com/2014/09/instagram-filters-css3-effects/
  - Confidence: MEDIUM (empirical testing by author)

- **Sharp GitHub Issues** — Verified modulate() usage patterns and tint() behavior
  - https://github.com/lovell/sharp/issues/609 (brightness/saturation/hue)
  - https://github.com/lovell/sharp/issues/1178 (tint implementation)
  - Confidence: HIGH (author discussion by maintainer)

- **Vintage CSS Photo Effects** — Verified sepia/warm/cool filter patterns
  - https://dev.to/codingdudecom/7-css-image-effects-for-making-awesome-vintage-photos-51h2
  - Confidence: MEDIUM (tutorial, tested values)

### LOW Confidence (Unverified)

- **CSSgram Library** — Instagram filter implementations (not used, but referenced)
  - https://github.com/una/CSSgram
  - Confidence: LOW (not directly used, library avoided per "What NOT to Use")

---

## Research Notes

### Sharp `tint()` Calibration Required

The `tint()` operation in Sharp applies a color in LAB color space, which may differ visually from CSS `sepia()`. **Recommendation:** Create a test script to adjust RGB values for sepia/vintage filters until Sharp output matches CSS preview.

### Sharp `linear()` vs CSS `contrast()`

Sharp's `linear()` adjusts contrast using multipliers similar to CSS `contrast()`. Testing may reveal slight differences. **Recommendation:** Test multipliers >1.2 to ensure linear relationship with CSS values.

### Filter Order Matters

CSS filters are applied left-to-right. Sharp operations are chained in order. **Recommendation:** Maintain consistent operation ordering (e.g., always grayscale → modulate → tint).

### Intensity Scaling Edge Cases

At 0% intensity, filters should be disabled (return original image). At 100%, apply full effect. **Recommendation:** Add early return if `intensity === 0`.

---

*Stack research for: Instagram-style color filter implementation*
*Researched: 2025-01-28*
