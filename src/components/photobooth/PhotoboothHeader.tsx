import { Download } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

interface PhotoboothHeaderProps {
  onExportClick: () => void
}

export function PhotoboothHeader({ onExportClick }: PhotoboothHeaderProps) {
  const { data: session } = authClient.useSession()

  return (
    <header 
      className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-neutral-950/80 backdrop-blur-md z-50 cursor-default"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <h1 className="text-lg md:text-xl font-bold tracking-tighter bg-linear-to-br from-white to-white/50 bg-clip-text text-transparent">
        OURBOOTH
      </h1>
      
      <div className="flex items-center gap-3">
        {/* User indicator */}
        {session && (
          <div className="hidden md:flex items-center gap-2 text-sm text-neutral-400">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-rose-500 flex items-center justify-center font-bold text-xs text-white">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export button - Desktop only, mobile uses bottom bar */}
        <button 
          type="button"
          onClick={onExportClick}
          className="hidden md:flex px-5 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)] transition-all cursor-pointer items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </header>
  )
}
