export type TemplateCategory = 'classic' | 'modern' | 'party' | 'minimal' | 'vintage'

export interface TemplateLayout {
  cols: number
  rows: number
  count: number
  aspectRatio: string
}

export interface TemplateStyle {
  backgroundColor: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  gap: number
  padding: number
  photoRadius?: number
}

export interface TemplateFooter {
  text: string
  font: string
  color: string
  size?: string
}

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  layout: TemplateLayout
  style: TemplateStyle
  footer: TemplateFooter
}

export const TEMPLATES: Template[] = [
  // ============ CLASSIC ============
  {
    id: 'classic-2x2',
    name: 'Classic Grid',
    category: 'classic',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#ffffff', gap: 10, padding: 16 },
    footer: { text: 'OurBooth • 2025', font: 'monospace', color: '#a3a3a3' },
  },
  {
    id: 'classic-1x4',
    name: 'Photo Strip',
    category: 'classic',
    layout: { cols: 1, rows: 4, count: 4, aspectRatio: '1/4' },
    style: { backgroundColor: '#ffffff', gap: 8, padding: 12 },
    footer: { text: 'OurBooth • 2025', font: 'monospace', color: '#a3a3a3' },
  },
  {
    id: 'classic-1x3',
    name: 'Triple Strip',
    category: 'classic',
    layout: { cols: 1, rows: 3, count: 3, aspectRatio: '1/3' },
    style: { backgroundColor: '#ffffff', gap: 8, padding: 12 },
    footer: { text: 'OurBooth • 2025', font: 'monospace', color: '#a3a3a3' },
  },
  {
    id: 'classic-2x3',
    name: 'Six Grid',
    category: 'classic',
    layout: { cols: 2, rows: 3, count: 6, aspectRatio: '2/4' },
    style: { backgroundColor: '#ffffff', gap: 8, padding: 14 },
    footer: { text: 'OurBooth • 2025', font: 'monospace', color: '#a3a3a3' },
  },

  // ============ MODERN ============
  {
    id: 'modern-gradient',
    name: 'Rose Gradient',
    category: 'modern',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', gap: 12, padding: 20, photoRadius: 8 },
    footer: { text: 'OURBOOTH', font: 'sans-serif', color: '#ffffff', size: '0.75rem' },
  },
  {
    id: 'modern-dark',
    name: 'Dark Mode',
    category: 'modern',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#0a0a0a', borderColor: '#262626', borderWidth: 1, gap: 10, padding: 16, photoRadius: 4 },
    footer: { text: 'OURBOOTH', font: 'sans-serif', color: '#525252' },
  },
  {
    id: 'modern-glass',
    name: 'Glassmorphism',
    category: 'modern',
    layout: { cols: 1, rows: 4, count: 4, aspectRatio: '1/4' },
    style: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, gap: 8, padding: 12, photoRadius: 12 },
    footer: { text: 'ourbooth', font: 'sans-serif', color: 'rgba(255,255,255,0.6)' },
  },
  {
    id: 'modern-purple',
    name: 'Violet Dream',
    category: 'modern',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)', gap: 12, padding: 20, photoRadius: 16 },
    footer: { text: 'OURBOOTH', font: 'sans-serif', color: '#e0e7ff' },
  },
  {
    id: 'modern-mint',
    name: 'Mint Fresh',
    category: 'modern',
    layout: { cols: 1, rows: 3, count: 3, aspectRatio: '1/3' },
    style: { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7', borderWidth: 2, gap: 10, padding: 16, photoRadius: 8 },
    footer: { text: 'ourbooth', font: 'sans-serif', color: '#059669' },
  },

  // ============ PARTY ============
  {
    id: 'party-neon',
    name: 'Neon Nights',
    category: 'party',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#0f0f23', borderColor: '#00ffff', borderWidth: 3, gap: 10, padding: 16, photoRadius: 0 },
    footer: { text: '★ PARTY TIME ★', font: 'sans-serif', color: '#ff00ff' },
  },
  {
    id: 'party-birthday',
    name: 'Birthday Bash',
    category: 'party',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 4, gap: 12, padding: 20, photoRadius: 20 },
    footer: { text: '🎂 HAPPY BIRTHDAY 🎂', font: 'sans-serif', color: '#b45309' },
  },
  {
    id: 'party-newyear',
    name: 'New Year',
    category: 'party',
    layout: { cols: 1, rows: 4, count: 4, aspectRatio: '1/4' },
    style: { backgroundColor: '#1e1b4b', borderColor: '#fbbf24', borderWidth: 3, gap: 6, padding: 10, photoRadius: 4 },
    footer: { text: '✨ 2025 ✨', font: 'sans-serif', color: '#fbbf24' },
  },
  {
    id: 'party-rainbow',
    name: 'Rainbow Pop',
    category: 'party',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: 'linear-gradient(45deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)', gap: 10, padding: 18, photoRadius: 12 },
    footer: { text: 'CELEBRATE!', font: 'sans-serif', color: '#ffffff' },
  },
  {
    id: 'party-disco',
    name: 'Disco Fever',
    category: 'party',
    layout: { cols: 1, rows: 3, count: 3, aspectRatio: '1/3' },
    style: { backgroundColor: '#000000', borderColor: '#c026d3', borderWidth: 2, gap: 8, padding: 12, photoRadius: 50 },
    footer: { text: '🪩 DISCO 🪩', font: 'sans-serif', color: '#f0abfc' },
  },

  // ============ MINIMAL ============
  {
    id: 'minimal-clean',
    name: 'Clean',
    category: 'minimal',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#fafafa', gap: 2, padding: 8, photoRadius: 0 },
    footer: { text: '', font: 'sans-serif', color: '#000000' },
  },
  {
    id: 'minimal-line',
    name: 'Thin Line',
    category: 'minimal',
    layout: { cols: 1, rows: 4, count: 4, aspectRatio: '1/4' },
    style: { backgroundColor: '#ffffff', borderColor: '#e5e5e5', borderWidth: 1, gap: 6, padding: 10, photoRadius: 0 },
    footer: { text: '', font: 'sans-serif', color: '#000000' },
  },
  {
    id: 'minimal-float',
    name: 'Floating',
    category: 'minimal',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: 'transparent', gap: 16, padding: 0, photoRadius: 4 },
    footer: { text: '', font: 'sans-serif', color: '#000000' },
  },
  {
    id: 'minimal-mono',
    name: 'Monochrome',
    category: 'minimal',
    layout: { cols: 1, rows: 3, count: 3, aspectRatio: '1/3' },
    style: { backgroundColor: '#171717', gap: 4, padding: 8, photoRadius: 0 },
    footer: { text: '', font: 'sans-serif', color: '#000000' },
  },

  // ============ VINTAGE ============
  {
    id: 'vintage-polaroid',
    name: 'Polaroid',
    category: 'vintage',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#fffbeb', borderColor: '#d4d4d4', borderWidth: 1, gap: 16, padding: 24, photoRadius: 0 },
    footer: { text: 'Memories', font: 'serif', color: '#78716c' },
  },
  {
    id: 'vintage-film',
    name: 'Film Strip',
    category: 'vintage',
    layout: { cols: 1, rows: 4, count: 4, aspectRatio: '1/4' },
    style: { backgroundColor: '#1c1917', borderColor: '#44403c', borderWidth: 8, gap: 4, padding: 20, photoRadius: 0 },
    footer: { text: 'KODAK 400', font: 'monospace', color: '#fbbf24' },
  },
  {
    id: 'vintage-sepia',
    name: 'Sepia Dreams',
    category: 'vintage',
    layout: { cols: 2, rows: 2, count: 4, aspectRatio: '2/3' },
    style: { backgroundColor: '#fef3e2', borderColor: '#c4a574', borderWidth: 3, gap: 8, padding: 16, photoRadius: 2 },
    footer: { text: 'circa 2025', font: 'serif', color: '#8b7355' },
  },
  {
    id: 'vintage-newspaper',
    name: 'Newspaper',
    category: 'vintage',
    layout: { cols: 2, rows: 3, count: 6, aspectRatio: '2/4' },
    style: { backgroundColor: '#f5f5dc', borderColor: '#000000', borderWidth: 1, gap: 4, padding: 12, photoRadius: 0 },
    footer: { text: 'THE DAILY BOOTH', font: 'serif', color: '#1a1a1a' },
  },
  {
    id: 'vintage-faded',
    name: 'Faded Glory',
    category: 'vintage',
    layout: { cols: 1, rows: 3, count: 3, aspectRatio: '1/3' },
    style: { backgroundColor: '#fdf4e3', gap: 10, padding: 14, photoRadius: 4 },
    footer: { text: 'memories fade, photos don\'t', font: 'serif', color: '#a8a29e', size: '0.6rem' },
  },
]

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'classic', label: 'Classic', icon: '📷' },
  { id: 'modern', label: 'Modern', icon: '✨' },
  { id: 'party', label: 'Party', icon: '🎉' },
  { id: 'minimal', label: 'Minimal', icon: '◻️' },
  { id: 'vintage', label: 'Vintage', icon: '📜' },
]

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return TEMPLATES.filter(t => t.category === category)
}
