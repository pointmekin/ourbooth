---
phase: 02-filter-preview-ui
plan: 05
type: execute
wave: 3
depends_on: [02-01, 02-02, 02-03, 02-04]
files_modified:
  - src/components/photobooth/ToolSidebar.tsx
  - src/routes/create/index.tsx
autonomous: true

must_haves:
  truths:
    - Filter tool icon appears in sidebar with Wand2 icon
    - Clicking filter icon toggles filter panel visibility
    - Active state shows when filter panel is open
    - FilterPreviewPanel renders when activeTool is 'filters'
    - Mobile toolbar has filter toggle button
  artifacts:
    - path: src/components/photobooth/ToolSidebar.tsx
      provides: Sidebar with filter tool toggle
      contains: "activeTool"
      contains: "filters"
    - path: src/routes/create/index.tsx
      provides: Create route with filter panel integration
      contains: "FilterPreviewPanel"
  key_links:
    - from: src/components/photobooth/ToolSidebar.tsx
      to: src/routes/create/index.tsx
      via: "onToolChange callback prop"
      pattern: "onToolChange"
    - from: src/routes/create/index.tsx
      to: src/components/photobooth/FilterPreviewPanel.tsx
      via: "Import and render FilterPreviewPanel conditionally"
      pattern: "FilterPreviewPanel"
    - from: src/routes/create/index.tsx
      to: src/components/photobooth/MobileToolbar.tsx
      via: "Pass filter tool state and handler"
      pattern: "filters"
---

<objective>
Integrate filter tool toggle into ToolSidebar and create route, rendering FilterPreviewPanel when active.

Purpose: Provide access point for filter UI through sidebar/desktop and mobile toolbar.

Output: Modified ToolSidebar.tsx with filter tool, updated create route with filter panel rendering.
</objective>

<execution_context>
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dhanabordeemekintharanggur/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/components/photobooth/ToolSidebar.tsx
@src/components/photobooth/MobileToolbar.tsx
@src/components/photobooth/FilterPreviewPanel.tsx
@src/routes/create/index.tsx
</context>

<tasks>

<task type="auto">
  <name>Add filter tool to ToolSidebar component</name>
  <files>src/components/photobooth/ToolSidebar.tsx</files>
  <action>
Modify ToolSidebar to add filter tool toggle:

1. Update ToolSidebarProps interface:
```tsx
interface ToolSidebarProps {
  captureMode: "upload" | "camera";
  onCaptureModeChange: (mode: "upload" | "camera") => void;
  activeTool?: "stickers" | "filters" | null;  // ADD THIS
  onToolChange?: (tool: "stickers" | "filters" | null) => void;  // ADD THIS
}
```

2. Update the function signature:
```tsx
export function ToolSidebar({
  captureMode,
  onCaptureModeChange,
  activeTool,  // ADD THIS
  onToolChange,  // ADD THIS
}: ToolSidebarProps) {
```

3. Find the stickers ToolIcon (around line 93) and add filter tool after it:
```tsx
// BEFORE (stickers only)
<ToolIcon label="Stickers" icon={Smile} />

// AFTER (stickers + filters)
<ToolIcon
  label="Stickers"
  icon={Smile}
  active={activeTool === "stickers"}
  onClick={() => onToolChange?.(activeTool === "stickers" ? null : "stickers")}
/>
<ToolIcon
  label="Filters"
  icon={Wand2}
  active={activeTool === "filters"}
  onClick={() => onToolChange?.(activeTool === "filters" ? null : "filters")}
/>
```

Note: The Wand2 icon is already imported at the top of the file, and the filters ToolIcon already exists but needs the active/onClick handlers added.

Key implementation details:
- Toggle behavior: clicking active tool closes the panel (null)
- Non-active tool click sets that tool as active
- Optional chaining on onToolChange since props may not exist in all usages
  </action>
  <verify>
1. ToolSidebarProps has activeTool and onToolChange props
2. Filters ToolIcon has active prop checking activeTool === "filters"
3. Filters ToolIcon has onClick calling onToolChange with toggle logic
4. Stickers ToolIcon also updated with active/onClick (for consistency)
5. Component compiles without errors
  </verify>
  <done>
ToolSidebar has filter tool toggle with active state and click handler.
  </done>
</task>

<task type="auto">
  <name>Integrate filter panel into create route</name>
  <files>src/routes/create/index.tsx</files>
  <action>
Modify create route to add filter tool state and render FilterPreviewPanel:

1. Add state for active tool (near other useState declarations):
```tsx
const [activeTool, setActiveTool] = useState<'stickers' | 'filters' | null>(null)
```

2. Update isPropertiesOpen logic to use activeTool state:
Find: `const [isPropertiesOpen, setIsPropertiesOpen] = useState(false)`
Replace with: `const [activeTool, setActiveTool] = useState<'stickers' | 'filters' | null>(null)`

Then update all references:
- `isPropertiesOpen` -> `activeTool === 'stickers'`
- `setIsPropertiesOpen` -> `setActiveTool`

3. Add FilterPreviewPanel to imports:
```tsx
import {
  PhotoStrip,
  CameraView,
  PropertiesPanel,
  ToolSidebar,
  MobileToolbar,
  TemplateGallery,
  ExportSheet,
  FilterPreviewPanel,  // ADD THIS
} from '@/components/photobooth'
```

4. Update ToolSidebar props to pass activeTool state:
```tsx
<ToolSidebar
  captureMode={captureMode}
  onCaptureModeChange={handleCaptureModeChange}
  activeTool={activeTool}
  onToolChange={setActiveTool}
/>
```

5. Update PropertiesPanel usage:
```tsx
// BEFORE
<PropertiesPanel
  isOpen={isPropertiesOpen}
  onClose={() => setIsPropertiesOpen(false)}
/>

// AFTER
<PropertiesPanel
  isOpen={activeTool === 'stickers'}
  onClose={() => setActiveTool(null)}
/>
```

6. Add FilterPreviewPanel rendering (find a good location, perhaps as a sheet or overlay):
Add this before the closing div of the main component:
```tsx
{/* Filter Panel - Sheet for all screen sizes */}
{activeTool === 'filters' && (
  <div className="absolute inset-y-0 right-0 w-80 bg-background/95 backdrop-blur-xl border-l border-border shadow-xl z-20 overflow-y-auto">
    <FilterPreviewPanel />
  </div>
)}
```

Or for a cleaner sheet pattern (similar to PropertiesPanel):
```tsx
{/* Filter Panel */}
{activeTool === 'filters' && (
  <div className="fixed inset-y-0 right-0 w-80 bg-background/95 backdrop-blur-xl border-l border-border shadow-xl z-50 overflow-y-auto">
    <div className="p-4">
      <button
        onClick={() => setActiveTool(null)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        Close
      </button>
      <FilterPreviewPanel />
    </div>
  </div>
)}
```

7. Update MobileToolbar to support filter tool:
Find the MobileToolbar component usage and update props if it has a similar pattern to PropertiesPanel.

Key implementation details:
- Unified activeTool state instead of separate booleans
- Filter panel renders as fixed sidebar on right
- Close button or click-outside to close filter panel
- Filter panel only renders when activeTool === 'filters'
  </action>
  <verify>
1. activeTool state exists with type 'stickers' | 'filters' | null
2. ToolSidebar receives activeTool and onToolChange props
3. PropertiesPanel uses activeTool === 'stickers' for isOpen
4. FilterPreviewPanel imported and rendered conditionally
5. Filter panel closes when setActiveTool(null) called
6. Component compiles without errors
  </verify>
  <done>
Create route has filter tool integration with FilterPreviewPanel rendering conditionally.
  </done>
</task>

</tasks>

<verification>
1. Filter icon visible in ToolSidebar
2. Clicking filter icon opens FilterPreviewPanel
3. Clicking filter icon again closes panel (toggle)
4. Active state visual indicator shows when filter tool is active
5. Filter panel appears on right side of screen
6. Close button works to dismiss filter panel
7. Mobile toolbar also has filter access (if applicable)
</verification>

<success_criteria>
1. ToolSidebar has activeTool and onToolChange props
2. Filter ToolIcon has active state and toggle onClick
3. Create route uses activeTool state for tool management
4. FilterPreviewPanel renders when activeTool === 'filters'
5. Filter panel has close mechanism
6. All existing tools (stickers, properties) still work correctly
7. Mobile workflow considered (toolbar or responsive sheet)
</success_criteria>

<output>
After completion, create `.planning/phases/02-filter-preview-ui/02-05-SUMMARY.md` with:
- Phase: 02-filter-preview-ui
- Plan: 05
- Files modified
- Integration pattern (activeTool state for multiple tools)
- Dependencies met (all prior plans)
- Duration metrics
</output>
