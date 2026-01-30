import { useFilterStore } from "@/stores/filter-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";
import * as React from "react";

const DEFAULT_INTENSITY = 75;
const MIN_INTENSITY = 0;
const MAX_INTENSITY = 100;

const INTENSITY_PRESETS = [0, 25, 50, 75, 100] as const;
type IntensityPreset = (typeof INTENSITY_PRESETS)[number];

// Snap threshold: distance in percentage where snap activates
const SNAP_THRESHOLD = 5;

/**
 * Custom hook for snapping intensity values to nearest preset
 * @param value - Current intensity value
 * @param threshold - Distance within which snap activates
 * @returns Snapped value (or original if not near preset)
 */
function useSnapToPreset(value: number, threshold: number = SNAP_THRESHOLD) {
  return React.useMemo(() => {
    // Find nearest preset
    const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
      const currentDistance = Math.abs(value - preset);
      const nearestDistance = Math.abs(value - nearest);
      return currentDistance < nearestDistance ? preset : nearest;
    }, INTENSITY_PRESETS[0]);

    // Snap to preset if within threshold
    const distance = Math.abs(value - nearestPreset);
    return distance <= threshold ? nearestPreset : value;
  }, [value, threshold]);
}

interface IntensitySliderProps {
  disabled?: boolean;
}

export function IntensitySlider({ disabled = false }: IntensitySliderProps) {
  const intensity = useFilterStore((s) => s.intensity);
  const selectedFilter = useFilterStore((s) => s.selectedFilter);
  const setIntensity = useFilterStore((s) => s.setIntensity);

  // React 19 useTransition for non-blocking updates
  const [isPending, startTransition] = React.useTransition();

  // Track drag state for snap behavior
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartValue, setDragStartValue] = React.useState(intensity);

  const handleReset = () => {
    startTransition(() => setIntensity(DEFAULT_INTENSITY));
  };

  // Calculate snapped value for display
  const snappedIntensity = useSnapToPreset(intensity);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(e.target.value);

    // Apply snap when dragging - use transition for smooth non-blocking updates
    if (isDragging) {
      const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
        const currentDistance = Math.abs(rawValue - preset);
        const nearestDistance = Math.abs(rawValue - nearest);
        return currentDistance < nearestDistance ? preset : nearest;
      }, INTENSITY_PRESETS[0]);

      const distance = Math.abs(rawValue - nearestPreset);

      // Check if we're "breaking out" of a snap (moving away from preset)
      if (
        Math.abs(intensity - nearestPreset) < SNAP_THRESHOLD &&
        distance > SNAP_THRESHOLD
      ) {
        // Breaking out - use raw value
        startTransition(() => setIntensity(rawValue));
      } else if (distance <= SNAP_THRESHOLD) {
        // Within snap zone - snap to preset
        startTransition(() => setIntensity(nearestPreset));
      } else {
        // Not near any preset - use raw value
        startTransition(() => setIntensity(rawValue));
      }
    } else {
      startTransition(() => setIntensity(rawValue));
    }
  };

  const isAtDefault = intensity === DEFAULT_INTENSITY;
  const hasFilter = selectedFilter !== null;

  return (
    <div
      className={`space-y-3 ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {/* Header: Label + Value + Reset */}
      <div className="flex items-center justify-between gap-4">
        <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase flex	items-center gap-1">
          <span className="text-sm">Intensity</span>
          <span
            className={`min-w-[3rem] text-right text-sm font-semibold tabular-nums transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}
          >
            {Math.round(intensity)}%
          </span>
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex h-5 items-center justify-center">
            {hasFilter && !isAtDefault && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleReset}
                className="h-7 w-7 shrink-0"
                title="Reset to default"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={MIN_INTENSITY}
          max={MAX_INTENSITY}
          value={snappedIntensity}
          onChange={handleInputChange}
          onMouseDown={() => {
            setIsDragging(true);
            setDragStartValue(intensity);
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          disabled={disabled || !hasFilter}
          list="intensity-presets"
          className="bg-muted [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:-mt-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:-mt-3"
        />
        <datalist id="intensity-presets">
          {INTENSITY_PRESETS.map((preset) => (
            <option key={preset} value={preset} />
          ))}
        </datalist>

        {/* Tick marks overlay */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-1"
          aria-hidden="true"
        >
          {INTENSITY_PRESETS.map((preset) => {
            const isActive = Math.abs(intensity - preset) < SNAP_THRESHOLD;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => startTransition(() => setIntensity(preset))}
                disabled={disabled || !hasFilter}
                className="group pointer-events-auto relative"
                aria-label={`Set intensity to ${preset}%`}
              >
                <div
                  className={`bg-muted-foreground/30 w-0.5 transition-all duration-150 ${isActive ? "bg-foreground h-4" : "group-hover:bg-muted-foreground/50 h-2"} `}
                  style={{ marginTop: isActive ? "-2px" : "0" }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint when no filter selected */}
      {!hasFilter && (
        <p className="text-muted-foreground text-center text-xs">
          Select a filter to adjust intensity
        </p>
      )}
    </div>
  );
}
