# Architecture Research

**Domain:** React Photo Editor Filter Systems
**Researched:** 2026-01-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer (React)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ToolSidebar  │  │ FilterPanel  │  │  PhotoStrip  │          │
│  │ (Filter UI)  │  │ (Sliders/UI) │  │  (Preview)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
├────────────────────────────┼──────────────────────────────────────┤
│                    ↓       │       ↓                              │
│  ┌─────────────────────────┴─────────────────────────────────┐    │
│  │              Zustand Store (State Management)              │    │
│  │  - Filter values (brightness, contrast, saturation, etc.)  │    │
│  │  - Selected filter preset                                  │    │
│  │  - Filter intensity per photo slot                         │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
├────────────────────────────────┼───────────────────────────────────┤
│                    ↓             │             ↓                    │
│  ┌──────────────────────────────┴───────────────────────────────┐  │
│  │                  Data Flow Layer                            │  │
│  │  1. User adjusts filter → Store update                     │  │
│  │  2. Store change → CSS filter string computed              │  │
│  │  3. CSS filter applied to <img> style prop (preview)       │  │
│  │  4. Export → Sharp applies equivalent filters              │  │
│  └─────────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────┤
│                      Processing Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ CSS Filters  │  │   Sharp      │  │   Output     │           │
│  │ (Real-time   │  │   (Export)   │  │   (Final     │           │
│  │  Preview)    │  │              │  │    Image)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **FilterPanel** | Provides filter adjustment UI (sliders, presets) | Separate component or panel in PropertiesPanel |
| **PhotoStrip** | Displays photos with CSS filter preview applied | Inline `style={{ filter: cssFilterString }}` on `<img>` elements |
| **PhotoboothStore** | Manages filter state for all photo slots | Zustand store with filter values per slot or global |
| **image-generator.ts** | Applies Sharp equivalents of CSS filters during export | Uses Sharp's `modulate()`, `blur()`, etc. |
| **FilterUtils** | Converts CSS filter values to Sharp parameters | Utility module for filter mapping |

## Recommended Project Structure

```
src/
├── components/
│   ├── photobooth/
│   │   ├── ToolSidebar.tsx          # Add filter mode toggle
│   │   ├── PhotoStrip.tsx           # Apply CSS filters for preview
│   │   ├── FilterPanel.tsx          # NEW: Filter adjustment UI
│   │   │   ├── FilterSlider.tsx     # Individual filter control
│   │   │   ├── FilterPresets.tsx    # Predefined filter combinations
│   │   │   └── FilterResetButton.tsx
│   │   └── PropertiesPanel.tsx      # May show selected filter details
├── lib/
│   ├── image-generator.ts           # Add Sharp filter application
│   └── filter-utils.ts              # NEW: CSS → Sharp conversion
├── stores/
│   └── photobooth-store.ts          # Add filter state
├── constants/
│   └── filters.ts                   # NEW: Filter presets, defaults
└── types/
    └── filters.ts                   # NEW: Filter type definitions
```

### Structure Rationale

- **FilterPanel as separate component**: Keeps filter logic isolated, testable, and reusable. Can be shown/hidden based on selected tool.
- **filter-utils.ts**: Centralizes filter logic and CSS→Sharp conversion. Makes it easy to add new filters.
- **filters.ts constants**: Filter presets (Vintage, B&W, Warm, Cool) defined as data, not hardcoded.
- **Filter state in store**: Enables per-slot filters (each photo can have different filter) or global filter (all photos same).

## Architectural Patterns

### Pattern 1: Dual-Pipeline Filter System

**What:** Preview filters use CSS for performance; export filters use Sharp for quality.

**When to use:** Any React photo editor needing real-time preview + high-quality export.

**Trade-offs:**
- ✅ Fast, responsive preview (CSS is GPU-accelerated)
- ✅ No Canvas complexity for preview
- ✅ Sharp provides professional-quality export
- ⚠️ CSS and Sharp filters must be kept in sync
- ⚠️ Some CSS filters (drop-shadow) have no Sharp equivalent

**Example:**
```typescript
// Store holds filter values
interface FilterState {
  brightness: number    // 0-200 (CSS %)
  contrast: number      // 0-200 (CSS %)
  saturation: number    // 0-200 (CSS %)
  grayscale: number     // 0-100 (CSS %)
  sepia: number         // 0-100 (CSS %)
  hueRotate: number     // 0-360 (CSS deg)
  blur: number          // 0-20 (CSS px)
}

// Preview: CSS filter string
const cssFilterString = useMemo(() => {
  return `brightness(${filter.brightness}%) ` +
         `contrast(${filter.contrast}%) ` +
         `saturate(${filter.saturation}%) ` +
         `grayscale(${filter.grayscale}%) ` +
         `sepia(${filter.sepia}%) ` +
         `hue-rotate(${filter.hueRotate}deg) ` +
         `blur(${filter.blur}px)`
}, [filter])

// Export: Sharp equivalents
async function applySharpFilters(image: Sharp, filter: FilterState) {
  return image
    .modulate({
      brightness: filter.brightness / 100,
      saturation: filter.saturation / 100,
      hue: filter.hueRotate
    })
    .linear((filter.contrast / 100) * 255)  // Contrast adjustment
    .blur(filter.blur)
}
```

### Pattern 2: Per-Slot vs Global Filter State

**What:** Choose between filters applied per photo slot or globally to all photos.

**When to use:**
- **Per-slot**: Users want different filters on different photos in the strip
- **Global**: Consistent filter across entire strip (simpler UX)

**Trade-offs:**
- Per-slot: More flexibility, more complex UI
- Global: Simpler, matches current sticker pattern (stickers are global, not per-slot)

**Example:**
```typescript
// Option 1: Global filter (simpler, matches current pattern)
interface PhotoboothState {
  filter: FilterState  // Single filter for all photos
}

// Option 2: Per-slot filter (more flexibility)
interface PhotoboothState {
  filters: FilterState[]  // One filter per photo slot
}
```

### Pattern 3: Filter Presets as Combinations

**What:** Presets are pre-configured filter combinations (Vintage, B&W, etc.)

**When to use:** Improve UX by offering one-tap filter styles.

**Trade-offs:**
- ✅ Great UX for casual users
- ⚠️ Must allow manual adjustment after preset applied

**Example:**
```typescript
// constants/filters.ts
export const FILTER_PRESETS = {
  none: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0 },
  vintage: { brightness: 110, contrast: 90, saturation: 80, grayscale: 0, sepia: 40, hueRotate: 0, blur: 0 },
  'black-white': { brightness: 100, contrast: 120, saturation: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0 },
  warm: { brightness: 105, contrast: 100, saturation: 110, grayscale: 0, sepia: 20, hueRotate: 10, blur: 0 },
  cool: { brightness: 100, contrast: 100, saturation: 90, grayscale: 0, sepia: 0, hueRotate: 200, blur: 0 },
}
```

## Data Flow

### Filter Selection → Preview → Export Flow

```
User selects "Vintage" preset
    ↓
FilterPanel → store.setFilter(FILTER_PRESETS.vintage)
    ↓
Zustand store updates: filter = { brightness: 110, sepia: 40, ... }
    ↓
PhotoStrip (subscribed to store) re-renders
    ↓
useMemo recalculates: cssFilterString = "brightness(110%) sepia(40%) ..."
    ↓
<img style={{ filter: cssFilterString }}  // Real-time preview!
    ↓
User clicks Export
    ↓
generatePhotoStrip() reads filter from store
    ↓
applySharpFilters() converts CSS values to Sharp params
    ↓
Sharp applies filters to each image before compositing
    ↓
Final output with baked-in filters
```

### State Management

```
Zustand Store
    ↓ (subscribe)
PhotoStrip ←─┐
    │        │
FilterPanel ┘ (both read/write to store)
    ↓ (user action)
Store.updateFilter() → PhotoStrip re-renders with new CSS
```

### Key Data Flows

1. **Filter adjustment:** FilterPanel slider change → Store action → PhotoStrip CSS update
2. **Preset selection:** FilterPanel preset click → Store batch update → PhotoStrip CSS update
3. **Export:** Export action → Store filter read → Sharp application → Final image

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single global filter, CSS preview, Sharp export is sufficient |
| 1k-100k users | Add per-slot filters, debounced slider updates for performance |
| 100k+ users | Consider Web Workers for Sharp processing, caching filter presets |

### Scaling Priorities

1. **First bottleneck:** CSS filter performance on low-end devices
   - **Fix:** Debounce rapid slider changes, use `will-change: filter` CSS hint

2. **Second bottleneck:** Sharp export time with many filters
   - **Fix:** Cache filter presets as pre-sharpened images, parallel processing

## Anti-Patterns

### Anti-Pattern 1: Using Canvas for Preview

**What people do:** Implement filter preview using HTML5 Canvas

**Why it's wrong:**
- Slower than CSS filters (Canvas is CPU-bound, CSS uses GPU)
- More complex code (Canvas manipulation vs inline styles)
- Unnecessary complexity for preview

**Do this instead:** Use CSS filters for preview, Canvas/Sharp only for export

### Anti-Pattern 2: Storing CSS Filter Strings Directly

**What people do:** Store `filter: "brightness(110%) sepia(40%)"` string in state

**Why it's wrong:**
- Hard to manipulate individual filter values (need string parsing)
- Can't easily adjust sliders (need to parse, modify, re-serialize)
- Makes preset combinations harder

**Do this instead:** Store filter values as object, compute CSS string on render

```typescript
// ❌ Bad
state.filterString = "brightness(110%) sepia(40%)"

// ✅ Good
state.filter = { brightness: 110, sepia: 40 }
// CSS computed: `brightness(${brightness}%) sepia(${sepia}%)`
```

### Anti-Pattern 3: Applying Filters Globally to PhotoStrip Container

**What people do:** Apply CSS filter to entire PhotoStrip container

**Why it's wrong:**
- Affects UI elements (stickers, borders, text) - makes everything look weird
- Users expect filters on photos only, not entire layout

**Do this instead:** Apply filter only to photo `<img>` elements inside slots

```typescript
// ❌ Bad
<div style={{ filter: cssFilterString }}>  {/* Affects stickers too! */}
  <img src={photo} />
  <ResizableSticker />
</div>

// ✅ Good
<div>
  <img src={photo} style={{ filter: cssFilterString }} />  {/* Photo only */}
  <ResizableSticker />  {/* Not affected */}
</div>
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Sharp (Node.js) | Server-side image processing | Already integrated; add filter methods |
| Twemoji CDN | Existing sticker integration | No changes needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| PhotoboothStore ↔ PhotoStrip | Zustand subscription (useStore) | Add filter state subscription |
| PhotoboothStore ↔ FilterPanel | Zustand actions (setFilter, resetFilter) | Add filter update actions |
| PhotoboothStore ← image-generator | Direct read during export | Pass filter to `generatePhotoStrip()` |
| PhotoStrip ↔ FilterUtils | Import/util function | Convert filter to CSS string |

## Implementation Build Order

Based on dependencies, recommended build sequence:

1. **Phase 1: State & Types** (Foundation)
   - Add `FilterState` type to `types/filters.ts`
   - Add filter state to `photobooth-store.ts`
   - Add filter constants/presets to `constants/filters.ts`

2. **Phase 2: Preview** (UI)
   - Create `FilterPanel.tsx` component with sliders
   - Update `PhotoStrip.tsx` to apply CSS filters to images
   - Wire FilterPanel to store (filters update in real-time)

3. **Phase 3: Export** (Processing)
   - Create `lib/filter-utils.ts` with CSS→Sharp conversion
   - Update `image-generator.ts` to accept filter param
   - Apply Sharp filters during photo strip generation

4. **Phase 4: Polish** (UX)
   - Add filter presets to FilterPanel
   - Add filter reset button
   - Add keyboard shortcuts (if desired)
   - Performance optimizations (debouncing, memoization)

**Why this order:**
- Phase 1 must be first (types drive everything)
- Phase 2 can be built independently (preview works without export)
- Phase 3 depends on Phase 1 (needs types, store structure)
- Phase 4 is enhancement (core features work in Phases 1-3)

## Sources

- [How to Build a Photo Editor With React and CSS Filters - CoderPad](https://coderpad.io/blog/development/react-photo-editor-with-css-filters/) (HIGH confidence - comprehensive tutorial)
- [Sharp Node.js Image Processing - GitHub](https://github.com/lovell/sharp) (HIGH confidence - official repository)
- [Sharp API Operations Documentation](https://sharp.pixelplumbing.com/api-operation) (HIGH confidence - official docs)
- [Why CSS3 filters are more performant than Canvas - StackOverflow](https://stackoverflow.com/questions/43822886/why-are-css3-filter-effects-more-performant-than-html5-canvas-equivalents) (MEDIUM confidence - performance comparison)
- [Zustand vs Redux in 2026 - Medium](https://javascript.plainenglish.io/zustand-vs-redux-in-2026-why-i-switched-and-you-should-too-c119dd840ddb) (MEDIUM confidence - state management trends)
- [CSS Filter Property - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) (HIGH confidence - CSS filter reference)

---
*Architecture research for: React Photo Editor Filter Systems*
*Researched: 2026-01-28*
