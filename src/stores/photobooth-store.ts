import { create } from 'zustand'
import { type Template } from '@/data/templates'

export type StickerType = 'emoji' | 'image'

export interface Sticker {
  id: number
  x: number
  y: number
  type: StickerType
  emoji?: string      // For emoji type
  src?: string        // For image type (URL path)
  scale: number       // 0.5 to 2.0 (1.0 = default size)
  zIndex: number      // For layering
}

export type ExportType = 'png' | 'gif'

interface PhotoboothState {
  // Template
  selectedTemplate: Template | null
  setTemplate: (template: Template) => void

  // Images
  images: (string | null)[]
  setImage: (index: number, image: string | null) => void
  setImages: (images: (string | null)[]) => void

  // Stickers
  stickers: Sticker[]
  nextZIndex: number
  addSticker: (emojiOrSrc: string, x?: number, y?: number, type?: StickerType) => void
  updateStickerPosition: (id: number, x: number, y: number) => void
  updateStickerScale: (id: number, scale: number) => void
  bringToFront: (id: number) => void
  removeSticker: (id: number) => void

  // Export type
  exportType: ExportType
  setExportType: (type: ExportType) => void

  // Reset
  reset: () => void
}

const initialState = {
  selectedTemplate: null as Template | null,
  images: Array(4).fill(null) as (string | null)[],
  stickers: [] as Sticker[],
  nextZIndex: 1,
  exportType: 'png' as ExportType,
}

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
  ...initialState,

  setTemplate: (template) => set({ 
    selectedTemplate: template,
    images: Array(template.layout.count).fill(null),
    stickers: [],
    nextZIndex: 1,
  }),

  setImage: (index, image) =>
    set((state) => {
      const newImages = [...state.images]
      newImages[index] = image
      return { images: newImages }
    }),

  setImages: (images) => set({ images }),

  addSticker: (emojiOrSrc, x = 50, y = 50, type = 'emoji') =>
    set((state) => ({
      stickers: [
        ...state.stickers,
        {
          id: Date.now(),
          x,
          y,
          type,
          ...(type === 'emoji' ? { emoji: emojiOrSrc } : { src: emojiOrSrc }),
          scale: 1,
          zIndex: state.nextZIndex,
        },
      ],
      nextZIndex: state.nextZIndex + 1,
    })),

  updateStickerPosition: (id, x, y) =>
    set((state) => ({
      stickers: state.stickers.map((s) =>
        s.id === id ? { ...s, x, y } : s
      ),
    })),

  updateStickerScale: (id, scale) =>
    set((state) => ({
      stickers: state.stickers.map((s) =>
        s.id === id ? { ...s, scale: Math.max(0.3, Math.min(3, scale)) } : s
      ),
    })),

  bringToFront: (id) =>
    set((state) => ({
      stickers: state.stickers.map((s) =>
        s.id === id ? { ...s, zIndex: state.nextZIndex } : s
      ),
      nextZIndex: state.nextZIndex + 1,
    })),

  removeSticker: (id) =>
    set((state) => ({
      stickers: state.stickers.filter((s) => s.id !== id),
    })),

  setExportType: (type) => set({ exportType: type }),

  reset: () => set(initialState),
}))
