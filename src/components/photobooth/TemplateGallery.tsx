import { useState } from 'react'
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template, type TemplateCategory } from '@/data/templates'
import { AppHeader } from '@/components/AppHeader'

interface TemplateGalleryProps {
  onSelect: (template: Template) => void
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')

  const filteredTemplates = activeCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex flex-col">
      <AppHeader />
      
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">
            Choose Your Template
          </h1>
          <p className="text-neutral-400 text-lg">
            Select a style for your photo booth strip
          </p>
        </div>

        {/* Category Tabs */}
        <div className="max-w-6xl mx-auto mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Templates
            </button>
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onSelect(template)}
            />
          ))}
        </div>
      </div>
    </div>
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

  // Generate preview grid
  const previewStyle: React.CSSProperties = {
    background: style.backgroundColor,
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor}` : undefined,
    borderRadius: style.borderRadius ?? 8,
    padding: style.padding * 0.4,
    gap: style.gap * 0.4,
  }

  return (
    <button
      onClick={onSelect}
      className="group relative bg-neutral-900/50 rounded-2xl p-4 border border-white/5 hover:border-white/20 hover:bg-neutral-900 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
    >
      {/* Template Preview */}
      <div 
        className="aspect-3/4 rounded-lg overflow-hidden mb-3 flex flex-col"
        style={previewStyle}
      >
        <div 
          className="flex-1 grid"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            gap: style.gap * 0.4,
          }}
        >
          {Array.from({ length: layout.count }).map((_, i) => (
            <div
              key={i}
              className="bg-neutral-600/50"
              style={{ borderRadius: style.photoRadius ?? 0 }}
            />
          ))}
        </div>
        {footer.text && (
          <div 
            className="text-center py-1 mt-auto"
            style={{ 
              fontFamily: footer.font,
              color: footer.color,
              fontSize: '0.5rem',
            }}
          >
            {footer.text}
          </div>
        )}
      </div>

      {/* Template Info */}
      <div>
        <h3 className="font-semibold text-white group-hover:text-rose-400 transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-neutral-500 capitalize">
          {template.category} • {layout.count} photos
        </p>
      </div>

      {/* Category Badge */}
      <div className="absolute top-2 right-2">
        <span className="text-lg">
          {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}
        </span>
      </div>
    </button>
  )
}
