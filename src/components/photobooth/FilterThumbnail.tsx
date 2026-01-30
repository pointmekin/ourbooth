import { memo, useMemo } from 'react'
import { useFilterStore } from '@/stores/filter-store'
import { getCssFilterValue } from '@/lib/filter-utils'
import type { FilterPreset, FilterType } from '@/types/filters'

interface FilterThumbnailProps {
  filter: FilterPreset | null  // null for "Original" thumbnail
  samplePhoto: string
  onSelect: (filterId: FilterType | null) => void
}

const THUMBNAIL_INTENSITY = 75  // Fixed intensity for thumbnail previews

export const FilterThumbnail = memo(function FilterThumbnail({
  filter,
  samplePhoto,
  onSelect
}: FilterThumbnailProps) {
  // Subscribe ONLY to selectedFilter - prevents re-render on intensity change
  const selectedFilter = useFilterStore((s) => s.selectedFilter)
  const isSelected = filter ? selectedFilter === filter.id : selectedFilter === null

  // Memoize filter style - only recalculates when filter changes
  const filterStyle = useMemo(() => {
    if (!filter) return {}
    return {
      filter: getCssFilterValue(filter.parameters, THUMBNAIL_INTENSITY)
    }
  }, [filter])

  return (
    <button
      onClick={() => onSelect(filter?.id ?? null)}
      className={`relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden
        border-2 transition-all duration-200
        ${isSelected
          ? 'border-primary ring-2 ring-primary/50 scale-105 shadow-lg'
          : 'border-transparent hover:border-border hover:scale-105'
        }`}
    >
      <img
        src={samplePhoto}
        alt={filter?.name ?? 'Original'}
        style={filterStyle}
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white
        text-[10px] md:text-xs text-center backdrop-blur-sm py-1">
        {filter?.name ?? 'Original'}
      </span>
    </button>
  )
})
