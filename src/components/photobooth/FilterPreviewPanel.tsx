import { useRef, useState, useCallback, useMemo } from "react";
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

  // Get first captured photo as sample, or use default
  const samplePhoto = useMemo(() => {
    const firstImage = images.find((img) => img !== null);
    return firstImage || DEFAULT_SAMPLE;
  }, [images]);

  const hasPhotos = images.some((img) => img !== null);

  // Drag scroll state (following TemplateGallery pattern)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = x - startX;
      scrollRef.current.scrollLeft = scrollLeftStart - walk;
    },
    [isDragging, startX, scrollLeftStart],
  );

  const handleMouseUp = useCallback(() => {
    setTimeout(() => setIsDragging(false), 0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const hasDragged = useCallback(() => {
    if (!scrollRef.current) return false;
    return Math.abs(scrollRef.current.scrollLeft - scrollLeftStart) > 5;
  }, [scrollLeftStart]);

  const handleFilterSelect = useCallback(
    (filterId: FilterType | null) => {
      // Only change selection if this wasn't a drag action
      if (!hasDragged()) {
        setSelectedFilter(filterId);
      }
    },
    [setSelectedFilter, hasDragged],
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        {hasPhotos ? (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Choose a filter to apply to all photos
              </SheetDescription>
            </SheetHeader>

            {/* Horizontal Thumbnail Strip */}
            <div className="relative mb-4">
              {/* Left Fade */}
              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6 bg-linear-to-r to-transparent" />
              {/* Right Fade */}
              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-6 bg-linear-to-l to-transparent" />

              <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className={`scrollbar-none flex gap-3 overflow-x-auto pb-2 ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
                style={{
                  scrollBehavior: isDragging ? "auto" : "smooth",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                }}
              >
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
            </div>

            {/* Intensity Slider */}
            <div className="px-4">
              <IntensitySlider />
            </div>
          </>
        ) : (
          <div className="w-full p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Add photos to try filters
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
