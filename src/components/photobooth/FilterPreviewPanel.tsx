import { useMemo, useCallback } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FilterThumbnail } from "./FilterThumbnail";
import { IntensitySlider } from "./IntensitySlider";
import { useFilterStore } from "@/stores/filter-store";
import { usePhotoboothStore } from "@/stores/photobooth-store";
import { FILTER_PRESETS } from "@/constants/filters";
import type { FilterType } from "@/types/filters";

// Default sample image for thumbnail previews when no photos captured
const DEFAULT_SAMPLE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23cccccc"/%3E%3Crect x="40" y="120" width="120" height="60" rx="10" fill="%23cccccc"/%3E%3C/svg%3E';

interface FilterPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPreviewPanel({
  isOpen,
  onClose,
}: FilterPreviewPanelProps) {
  const images = usePhotoboothStore((s) => s.images);
  const setSelectedFilter = useFilterStore((s) => s.setSelectedFilter);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Get first captured photo as sample, or use default
  const samplePhoto = useMemo(() => {
    const firstImage = images.find((img) => img !== null);
    return firstImage || DEFAULT_SAMPLE;
  }, [images]);

  const hasPhotos = images.some((img) => img !== null);

  const handleFilterSelect = useCallback(
    (filterId: FilterType | null) => {
      setSelectedFilter(filterId);
    },
    [setSelectedFilter],
  );

  // Panel content - shared between mobile sheet and desktop sidebar
  const panelContent = hasPhotos ? (
    <div className="flex flex-col gap-4 px-4 lg:px-0">
      {/* Wrapping Grid of Filter Thumbnails */}
      <div className="grid grid-cols-3 gap-2 px-1">
        {/* Original (no filter) */}
        <FilterThumbnail
          filter={null}
          samplePhoto={samplePhoto}
          onSelect={handleFilterSelect}
        />

        {/* All filter presets */}
        {FILTER_PRESETS.map((filter) => (
          <FilterThumbnail
            key={filter.id}
            filter={filter}
            samplePhoto={samplePhoto}
            onSelect={handleFilterSelect}
          />
        ))}
      </div>

      {/* Intensity Slider */}
      <div className="px-1">
        <IntensitySlider />
      </div>
    </div>
  ) : (
    <div className="w-full p-6 text-center">
      <p className="text-muted-foreground text-sm">
        Add photos to try filters
      </p>
    </div>
  );

  // Don't render anything if not open
  if (!isOpen) return null;

  // Desktop: Static sidebar
  if (isDesktop) {
    return (
      <aside className="w-72 bg-background/50 backdrop-blur-xl border-r border-border p-5 overflow-y-auto flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Filters</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose a filter to apply to all photos</p>
        {panelContent}
      </aside>
    );
  }

  // Mobile: Sheet
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Choose a filter to apply to all photos
          </SheetDescription>
        </SheetHeader>
        {panelContent}
      </SheetContent>
    </Sheet>
  );
}
