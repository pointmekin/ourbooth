import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { authClient } from '@/lib/auth-client'
import { LayoutGrid, Upload, Smile, Wand2, LucideIcon, LogIn, LogOut } from 'lucide-react'

export const Route = createFileRoute('/create/')({
  component: PhotoboothEditor,
})

const LAYOUTS = {
  '2x2': { cols: 2, rows: 2, count: 4, aspect: 'aspect-[2/3]' },
  '1x4': { cols: 1, rows: 4, count: 4, aspect: 'aspect-[1/4]' },
  '1x3': { cols: 1, rows: 3, count: 3, aspect: 'aspect-[1/3]' },
}

function PhotoboothEditor() {
  const [selectedLayout, setSelectedLayout] = useState<keyof typeof LAYOUTS>('2x2')
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null))
  const [stickers, setStickers] = useState<{id: number, x: number, y: number, emoji: string}[]>([])
  const [draggingStickerId, setDraggingStickerId] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)
  
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        const newImages = [...images]
        newImages[index] = e.target?.result as string
        setImages(newImages)
    }
    reader.readAsDataURL(file)
  }

  const addSticker = (emoji: string) => {
      setStickers([...stickers, { id: Date.now(), x: 50, y: 50, emoji }])
  }

  const handleStickerMouseDown = (e: React.MouseEvent, id: number) => {
      e.stopPropagation()
      e.preventDefault()
      setDraggingStickerId(id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!draggingStickerId || !stripRef.current) return

      const rect = stripRef.current.getBoundingClientRect()
      
      const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
      const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))

      setStickers(stickers.map(s => 
          s.id === draggingStickerId ? { ...s, x, y } : s
      ))
  }

  const handleMouseUp = () => {
      setDraggingStickerId(null)
  }

  const handleExport = async () => {
      if (!session) {
          alert("Please sign in to export your masterpiece!")
          navigate({ to: '/auth/signin' })
          return
      }

      if (!stripRef.current) return

      setIsExporting(true)
      
      setTimeout(async () => {
          try {
              const canvas = await html2canvas(stripRef.current!, {
                  scale: 3,
                  useCORS: true,
                  backgroundColor: null
              })
              
              const link = document.createElement('a')
              link.download = `ourbooth-${Date.now()}.png`
              link.href = canvas.toDataURL('image/png')
              link.click()
          } catch (err) {
              console.error("Export failed", err)
          } finally {
              setIsExporting(false)
          }
      }, 100)
  }

  const handleAuthAction = async () => {
      if (session) {
          await authClient.signOut()
          window.location.reload()
      } else {
          navigate({ to: '/auth/signin' })
      }
  }

  const currentLayout = LAYOUTS[selectedLayout]

  return (
    <div 
        className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      {/* LEFT SIDEBAR - TOOLS */}
      <aside className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-6 z-10 bg-neutral-950/50 backdrop-blur-xl">
        <ToolIcon label="Layout" icon={LayoutGrid} active={true} />
        <ToolIcon label="Upload" icon={Upload} />
        <ToolIcon label="Stickers" icon={Smile} />
        <ToolIcon label="Filters" icon={Wand2} />
        
        <div className="flex-1" />
        
        {session && (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 mb-2">
                 {session.user.image ? (
                     <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                 ) : (
                     <div className="w-full h-full bg-rose-500 flex items-center justify-center font-bold text-xs">
                         {session.user.name?.charAt(0).toUpperCase()}
                     </div>
                 )}
            </div>
        )}
        
        <ToolIcon 
            label={session ? "Sign Out" : "Sign In"} 
            icon={session ? LogOut : LogIn} 
            onClick={handleAuthAction}
            className={session ? "hover:bg-red-500/20 hover:text-red-500" : ""}
        />
        <div className="h-4" />
      </aside>

      {/* MAIN CANVAS AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-neutral-950/80 backdrop-blur-md z-10 cursor-default">
            <h1 className="text-xl font-bold tracking-tighter bg-linear-to-br from-white to-white/50 bg-clip-text text-transparent">
                OURBOOTH
            </h1>
            <div className="flex gap-4">
               <button className="px-5 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                   Preview
               </button>
               <button 
                onClick={handleExport}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)] transition-all hover:scale-105 active:scale-95"
               >
                   {session ? `Export (1 Credit)` : 'Sign in to Export'}
               </button>
            </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex items-center justify-center p-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
           {/* The Strip */}
            <div 
                ref={stripRef}
                className={`w-75 bg-white text-black shadow-2xl shadow-black ring-1 ring-white/10 transform transition-all duration-500 ${isExporting ? 'scale-100' : 'hover:scale-[1.01]'} flex flex-col relative group select-none`}
                style={{ height: selectedLayout === '1x4' ? '800px' : '600px', width: selectedLayout === '1x4' ? '200px' : '400px' }}
            >
                {/* Watermark Overlay */}
                {!isExporting && (
                    <div className="absolute inset-0 z-30 pointer-events-none opacity-30 flex items-center justify-center overflow-hidden">
                        <div className="rotate-[-45deg] text-6xl font-bold text-black/10 whitespace-nowrap tracking-widest border-4 border-black/10 p-4">
                            PREVIEW • OURBOOTH
                        </div>
                    </div>
                )}

                <div className={`absolute -inset-4 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isExporting ? 'hidden' : ''}`} />
                
                {/* Photo Grid Placeholder */}
                <div 
                    className="flex-1 grid gap-2.5 p-4 box-border relative z-0"
                    style={{ 
                        gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`
                    }}
                >
                    {Array.from({ length: currentLayout.count }).map((_, i) => (
                        <div key={i} className="bg-neutral-100 w-full h-full relative overflow-hidden group/slot cursor-pointer hover:bg-neutral-200 transition-colors">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className={`absolute inset-0 opacity-0 z-20 cursor-pointer ${isExporting ? 'hidden' : ''}`}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(i, e.target.files[0])}
                            />
                            {images[i] ? (
                                <img src={images[i]!} alt={`Slot ${i}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-300 group-hover/slot:text-neutral-400 transition-colors">
                                    <span className="text-4xl font-light">+</span>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Stickers Layer */}
                     {stickers.map(s => (
                        <div 
                            key={s.id} 
                            onMouseDown={(e) => handleStickerMouseDown(e, s.id)}
                            className="absolute text-4xl cursor-move z-40 hover:scale-110 transition-transform drop-shadow-md select-none"
                            style={{ 
                                left: `${s.x}%`, 
                                top: `${s.y}%`,
                                transform: 'translate(-50%, -50%)',
                                cursor: draggingStickerId === s.id ? 'grabbing' : 'grab' 
                            }}
                        >
                            {s.emoji}
                        </div>
                    ))}
                </div>

                {/* Footer / Branding */}
                <div className="h-16 flex items-center justify-center border-t border-neutral-100 relative z-10 bg-white">
                    <span className="font-mono text-xs tracking-[0.2em] text-neutral-400 uppercase">
                        OurBooth • 2025
                    </span>
                </div>
            </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR - PROPERTIES */}
      <aside className="w-80 border-l border-white/5 bg-neutral-950/50 backdrop-blur-xl p-6 z-10 hidden lg:block overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">Properties</h3>
        
        {/* Layout Selector */}
        <div className="space-y-4 mb-8">
             <div className="text-sm font-medium text-neutral-300">Layout</div>
             <div className="grid grid-cols-2 gap-2">
                <div 
                    onClick={() => setSelectedLayout('2x2')}
                    className={`aspect-3/4 border rounded-sm cursor-pointer transition-colors ${selectedLayout === '2x2' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 hover:border-white/30'}`} 
                >
                    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
                        {[1,2,3,4].map(i => <div key={i} className="bg-current opacity-20" />)}
                    </div>
                </div>
                <div 
                    onClick={() => setSelectedLayout('1x4')}
                    className={`aspect-3/4 border rounded-sm cursor-pointer transition-colors ${selectedLayout === '1x4' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 hover:border-white/30'}`} 
                >
                     <div className="w-full h-full grid grid-cols-1 grid-rows-4 gap-1 p-2 py-4 px-6">
                        {[1,2,3,4].map(i => <div key={i} className="bg-current opacity-20" />)}
                    </div>
                </div>
             </div>
        </div>

        {/* Stickers Selector */}
        <div className="space-y-4">
             <div className="text-sm font-medium text-neutral-300">Decorations</div>
             <div className="grid grid-cols-4 gap-2">
                 {['🎀', '✨', '💖', '🔥', '👑', '🕶️', '🌸', '💀'].map(emoji => (
                     <button 
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-2xl transition-colors"
                     >
                         {emoji}
                     </button>
                 ))}
             </div>
        </div>
      </aside>
    </div>
  )
}

function ToolIcon({ label, icon: Icon, active, onClick, className }: { label: string; icon: LucideIcon; active?: boolean; onClick?: () => void; className?: string }) {
    return (
        <div 
            onClick={onClick}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 group ${active ? 'bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]' : 'hover:bg-white/10 text-neutral-500 hover:text-white'} ${className}`}
        >
            <span className="text-[10px] font-bold uppercase tracking-wider hidden group-hover:block absolute left-14 bg-neutral-800 px-2 py-1 rounded text-white border border-white/10 whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2">
                {label}
            </span>
            <Icon className="w-5 h-5 opacity-80" />
        </div>
    )
}
