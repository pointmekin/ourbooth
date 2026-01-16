import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type Template,
  type TemplateCategory,
} from "@/data/templates";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
}

// Group templates by their visual shape for optimal gallery layout
type LayoutShape = "grid" | "strip" | "triple";

function getLayoutShape(aspectRatio: string): LayoutShape {
  if (aspectRatio === "1/4") return "strip";
  if (aspectRatio === "1/3") return "triple";
  return "grid"; // 2/3 and 2/4
}

const LAYOUT_GROUPS: { id: LayoutShape; label: string; description: string }[] =
  [
    {
      id: "grid",
      label: "Photo Grids",
      description: "Classic layouts for multiple shots",
    },
    {
      id: "strip",
      label: "Vertical Strips",
      description: "Tall, cinema-style photo strips",
    },
    {
      id: "triple",
      label: "Triple Frames",
      description: "Elegant three-photo compositions",
    },
  ];

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "all"
  >("all");

  const filteredTemplates =
    activeCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  // Group filtered templates by layout shape
  const groupedTemplates = LAYOUT_GROUPS.map((group) => ({
    ...group,
    templates: filteredTemplates.filter(
      (t) => getLayoutShape(t.layout.aspectRatio) === group.id,
    ),
  })).filter((group) => group.templates.length > 0);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      <div className="flex-1 overflow-auto">
        {/* Hero Header */}
        <div className="px-6 pt-8 pb-6 md:px-12">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-3 bg-linear-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Choose Your Frame
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              Select a style that matches your vibe. Each template is crafted
              for the perfect memory.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="sticky top-0 z-20 mb-8 px-0 pb-4 md:px-12">
          <div className="relative mx-auto max-w-7xl ">
            {/* Left Fade */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-3 bg-linear-to-r from-background to-transparent" />
            {/* Right Fade */}
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-3 bg-linear-to-l from-background to-transparent" />

            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pl-4 pr-4">
                <Button
                  variant={activeCategory === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                  className="rounded-full px-5 py-2.5 font-semibold"
                >
                  All Styles
                </Button>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className="gap-2 rounded-full px-5 py-2.5 font-semibold"
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
        </div>

        {/* Template Rows by Layout Shape */}
        <div className="space-y-12 pb-12">
          {groupedTemplates.map((group) => (
            <TemplateRow
              key={group.id}
              title={group.label}
              description={group.description}
              templates={group.templates}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Empty State */}
        {groupedTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No templates found
            </h3>
            <p className="text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Horizontal scrolling row for a group of templates
function TemplateRow({
  title,
  description,
  templates,
  onSelect,
}: {
  title: string;
  description: string;
  templates: Template[];
  onSelect: (template: Template) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Mouse drag handlers with movement threshold
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUp = () => {
    // Small delay to let click handlers check isDragging state
    setTimeout(() => setIsDragging(false), 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Check if this was a real drag (moved more than threshold)
  const hasDragged = () => {
    if (!scrollRef.current) return false;
    return Math.abs(scrollRef.current.scrollLeft - scrollLeftStart) > 5;
  };

  return (
    <section className="relative">
      {/* Row Header */}
      <div className="mx-auto mb-4 max-w-7xl px-6 md:px-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Scroll Controls - Desktop */}
          <div className="hidden gap-2 md:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="h-10 w-10 rounded-full border-border bg-muted/50 hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-10 w-10 rounded-full border-border bg-muted/50 hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Cards Container */}
      <div className="relative mx-auto max-w-7xl">
        {/* Left Fade */}
        <div
          className={`pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6 bg-linear-to-r from-background to-transparent transition-opacity md:w-12 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Right Fade */}
        <div
          className={`pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-6 bg-linear-to-l from-background to-transparent transition-opacity md:w-12 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`scrollbar-none flex gap-4 overflow-x-auto py-2 ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
            paddingLeft: "max(1.5rem, calc((100% - 80rem) / 2 + 1.5rem))",
            paddingRight: "max(1.5rem, calc((100% - 80rem) / 2 + 1.5rem))",
          }}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => !hasDragged() && onSelect(template)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: () => void;
}) {
  const { layout, style, footer } = template;
  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);

  // Parse aspect ratio to calculate width from fixed height
  const [arW, arH] = layout.aspectRatio.split("/").map(Number);
  const aspectValue = arW / arH; // e.g., 2/3 = 0.667, 1/4 = 0.25

  // Fixed preview heights per layout type for consistency within rows
  const getPreviewHeight = () => {
    if (layout.aspectRatio === "1/4") return 280; // Tall strips
    if (layout.aspectRatio === "1/3") return 240; // Triple strips
    return 200; // Grids (2/3, 2/4)
  };

  const previewHeight = getPreviewHeight();
  const previewWidth = Math.round(previewHeight * aspectValue);

  // Preview style
  const previewStyle: React.CSSProperties = {
    width: previewWidth,
    height: previewHeight,
    background: style.backgroundColor,
    border: style.borderWidth
      ? `${style.borderWidth}px solid ${style.borderColor}`
      : undefined,
    borderRadius: style.borderRadius ?? 8,
    padding: style.padding * 0.35,
    gap: style.gap * 0.35,
  };

  return (
    <button
      onClick={onSelect}
      className="group shrink-0 text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
      style={{ width: previewWidth + 24 }}
    >
      {/* Card Container */}
      <Card className="relative border-border/50 bg-card/60 p-3 py-3 transition-all duration-300 group-hover:border-border group-hover:bg-card group-hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]">
        {/* Template Preview */}
        <div
          className="flex flex-col overflow-hidden rounded-xl shadow-lg"
          style={previewStyle}
        >
          <div
            className="grid flex-1"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              gap: style.gap * 0.35,
            }}
          >
            {Array.from({ length: layout.count }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/60 transition-colors group-hover:bg-muted"
                style={{ borderRadius: style.photoRadius ?? 0 }}
              />
            ))}
          </div>
          {footer.text && (
            <div
              className="mt-auto truncate px-1 py-1 text-center"
              style={{
                fontFamily: footer.font,
                color: footer.color,
                fontSize: "0.4rem",
              }}
            >
              {footer.text}
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-sm shadow-lg">
          {category?.icon}
        </div>
      </Card>

      {/* Card Info - Below the card */}
      <div className="mt-3 px-1">
        <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {template.name}
        </h3>
        <p className="truncate text-[11px] text-muted-foreground capitalize">
          {template.category} • {layout.count} photos
        </p>
      </div>
    </button>
  );
}
