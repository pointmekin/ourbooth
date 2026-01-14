import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template, type TemplateCategory } from '@/data/templates'
import { AppHeader } from '@/components/AppHeader'
import { Toggle } from '@/components/ui/toggle'

interface TemplateGalleryProps {
  onSelect: (template: Template) => void
}

// Group templates by their visual shape for optimal gallery layout
type LayoutShape = 'grid' | 'strip' | 'triple'

function getLayoutShape(aspectRatio: string): LayoutShape {
  if (aspectRatio === '1/4') return 'strip'
  if (aspectRatio === '1/3') return 'triple'
  return 'grid' // 2/3 and 2/4
}

const LAYOUT_GROUPS: { id: LayoutShape; label: string; description: string }[] = [
  { id: 'grid', label: 'Photo Grids', description: 'Classic layouts for multiple shots' },
  { id: 'strip', label: 'Vertical Strips', description: 'Tall, cinema-style photo strips' },
  { id: 'triple', label: 'Triple Frames', description: 'Elegant three-photo compositions' },
]

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollCategoryLeft, setCanScrollCategoryLeft] = useState(false)
  const [canScrollCategoryRight, setCanScrollCategoryRight] = useState(false)

  const filteredTemplates = activeCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === activeCategory)

  // Group filtered templates by layout shape
  const groupedTemplates = LAYOUT_GROUPS.map(group => ({
    ...group,
    templates: filteredTemplates.filter(t => getLayoutShape(t.layout.aspectRatio) === group.id)
  })).filter(group => group.templates.length > 0)

  const checkCategoryScroll = () => {
    if (!categoryScrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current
    setCanScrollCategoryLeft(scrollLeft > 10)
    setCanScrollCategoryRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex flex-col">
      <AppHeader />
      
      <div className="flex-1 overflow-auto">
        {/* Hero Header */}
        <div className="px-6 md:px-12 pt-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-3 bg-linear-to-br from-white via-white to-neutral-500 bg-clip-text text-transparent">
              Choose Your Frame
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-xl">
              Select a style that matches your vibe. Each template is crafted for the perfect memory.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-6 md:px-12 mb-8 sticky top-0 z-20 bg-linear-to-b pb-4">
          <div className="max-w-7xl mx-auto relative">
            {/* Left Fade */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-6 md:w-12 bg-linear-to-r from-foreground to-transparent z-10 pointer-events-none transition-opacity ${
                canScrollCategoryLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* Right Fade */}
            <div 
              className={`absolute right-0 top-0 bottom-0 w-6 md:w-12 bg-linear-to-l from-foreground to-transparent z-10 pointer-events-none transition-opacity ${
                canScrollCategoryRight ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div 
              ref={categoryScrollRef}
              onScroll={checkCategoryScroll}
              className="overflow-x-auto scrollbar-none"
            >
              <div className="flex gap-2 pb-2">
                <Toggle
                  pressed={activeCategory === 'all'}
                  onPressedChange={() => setActiveCategory('all')}
                  variant="default"
                  className="px-5 py-2.5 rounded-full font-semibold whitespace-nowrap data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg shrink-0"
                >
                  All Styles
                </Toggle>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <Toggle
                    key={cat.id}
                    pressed={activeCategory === cat.id}
                    onPressedChange={() => setActiveCategory(cat.id)}
                    variant="default"
                    className="px-5 py-2.5 rounded-full font-semibold whitespace-nowrap data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg gap-2 shrink-0"
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                  </Toggle>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Template Rows by Layout Shape */}
        <div className="space-y-12 pb-12">
          {groupedTemplates.map(group => (
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
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-neutral-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Horizontal scrolling row for a group of templates
function TemplateRow({ 
  title, 
  description, 
  templates, 
  onSelect 
}: { 
  title: string
  description: string
  templates: Template[]
  onSelect: (template: Template) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  
  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftStart, setScrollLeftStart] = useState(0)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  // Mouse drag handlers with movement threshold
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftStart(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = x - startX
    scrollRef.current.scrollLeft = scrollLeftStart - walk
  }

  const handleMouseUp = () => {
    // Small delay to let click handlers check isDragging state
    setTimeout(() => setIsDragging(false), 0)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Check if this was a real drag (moved more than threshold)
  const hasDragged = () => {
    if (!scrollRef.current) return false
    return Math.abs(scrollRef.current.scrollLeft - scrollLeftStart) > 5
  }

  return (
    <section className="relative">
      {/* Row Header */}
      <div className="px-6 md:px-12 mb-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-sm text-neutral-500 mt-1">{description}</p>
          </div>
          
          {/* Scroll Controls - Desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft 
                  ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white cursor-pointer' 
                  : 'border-white/5 text-neutral-700 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight 
                  ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white cursor-pointer' 
                  : 'border-white/5 text-neutral-700 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Cards Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Left Fade - positioned after content padding */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-6 md:w-12 bg-linear-to-r from-neutral-950 to-transparent z-10 pointer-events-none transition-opacity ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Right Fade */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-6 md:w-12 bg-linear-to-l from-neutral-950 to-transparent z-10 pointer-events-none transition-opacity ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`flex gap-4 overflow-x-auto scrollbar-none py-2 ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{ 
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            paddingLeft: 'max(1.5rem, calc((100% - 80rem) / 2 + 1.5rem))',
            paddingRight: 'max(1.5rem, calc((100% - 80rem) / 2 + 1.5rem))',
          }}
        >
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => !hasDragged() && onSelect(template)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function TemplateCard({ 
  template, 
  onSelect 
}: { 
  template: Template
  onSelect: () => void 
}) {
  const { layout, style, footer } = template
  const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category)

  // Parse aspect ratio to calculate width from fixed height
  const [arW, arH] = layout.aspectRatio.split('/').map(Number)
  const aspectValue = arW / arH // e.g., 2/3 = 0.667, 1/4 = 0.25

  // Fixed preview heights per layout type for consistency within rows
  const getPreviewHeight = () => {
    if (layout.aspectRatio === '1/4') return 280 // Tall strips
    if (layout.aspectRatio === '1/3') return 240 // Triple strips
    return 200 // Grids (2/3, 2/4)
  }

  const previewHeight = getPreviewHeight()
  const previewWidth = Math.round(previewHeight * aspectValue)

  // Preview style
  const previewStyle: React.CSSProperties = {
    width: previewWidth,
    height: previewHeight,
    background: style.backgroundColor,
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor}` : undefined,
    borderRadius: style.borderRadius ?? 8,
    padding: style.padding * 0.35,
    gap: style.gap * 0.35,
  }

  return (
    <button
      onClick={onSelect}
      className="group shrink-0 text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
      style={{ width: previewWidth + 24 }} // Add padding for card container
    >
      {/* Card Container */}
      <div className="relative bg-neutral-900/60 rounded-2xl p-3 border border-white/5 group-hover:border-white/20 group-hover:bg-neutral-900 transition-all duration-300 group-hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Template Preview */}
        <div 
          className="rounded-xl overflow-hidden flex flex-col shadow-lg"
          style={previewStyle}
        >
          <div 
            className="flex-1 grid"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              gap: style.gap * 0.35,
            }}
          >
            {Array.from({ length: layout.count }).map((_, i) => (
              <div
                key={i}
                className="bg-neutral-500/40 transition-colors group-hover:bg-neutral-400/50"
                style={{ borderRadius: style.photoRadius ?? 0 }}
              />
            ))}
          </div>
          {footer.text && (
            <div 
              className="text-center py-1 mt-auto truncate px-1"
              style={{ 
                fontFamily: footer.font,
                color: footer.color,
                fontSize: '0.4rem',
              }}
            >
              {footer.text}
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-neutral-800 border border-white/10 rounded-full flex items-center justify-center text-sm shadow-lg">
          {category?.icon}
        </div>
      </div>

      {/* Card Info - Below the card */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-white text-sm group-hover:text-rose-400 transition-colors truncate">
          {template.name}
        </h3>
        <p className="text-[11px] text-neutral-500 capitalize truncate">
          {template.category} • {layout.count} photos
        </p>
      </div>
    </button>
  )
}
