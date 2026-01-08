import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ImageIcon, LogOut } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
      await authClient.signOut()
      window.location.reload()
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-rose-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 mix-blend-difference px-6 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md">
        <div className="text-xl font-bold tracking-tighter">OURBOOTH</div>
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
            <span className="cursor-pointer hover:text-rose-500 transition-colors">Digital</span>
            <span className="cursor-pointer hover:text-rose-500 transition-colors">Physical</span>
            <span className="cursor-pointer hover:text-rose-500 transition-colors">Pricing</span>
        </div>
        
        {session ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full overflow-hidden border border-white hover:border-white/80 transition-colors">
                {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-rose-500 flex items-center justify-center font-bold text-sm text-white">
                    {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-white/10 text-white z-[60]">
                <div className="px-3 py-2 text-sm text-neutral-400">
                {session.user.name || session.user.email}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="cursor-pointer bg-transparent focus:bg-white/10 focus:text-white">
                <Link to="/photos" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    My Photos
                </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-white/10"
                >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <Link to="/auth/signin" className="text-sm font-bold border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors rounded-full">
            SIGN IN
            </Link>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center p-6">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-neutral-900 z-0" />
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/80 to-black z-0 pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <span className="inline-block py-1 px-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-[0.2em]">
                  The New Standard
              </span>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9]">
                  CAPTURE <br/>
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-500 to-rose-300">REALITY</span>
              </h1>
              <p className="max-w-xl mx-auto text-neutral-400 text-lg md:text-xl font-light leading-relaxed">
                  The digital photobooth that feels tangible. 
                  Curated textures, premium layouts, and physical prints.
              </p>
              
              <div className="pt-8">
                  <Link 
                    to="/create"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white rounded-full overflow-hidden transition-transform active:scale-95 hover:scale-105"
                  >
                      <span className="relative z-10 flex items-center gap-2 group-hover:text-rose-600 transition-colors">
                          Start Creating
                      </span>
                  </Link>
              </div>
          </div>
      </section>

      {/* Feature Marquee */}
      <div className="border-y border-white/10 bg-black py-4 overflow-hidden whitespace-nowrap">
          <div className="inline-flex gap-12 text-neutral-500 font-mono text-xs tracking-widest uppercase">
              {Array(10).fill("• High Fidelity 4K Export • Real Film Grain • Cloud Storage • Privacy First").map((text, i) => (
                  <span key={i}>{text}</span>
              ))}
          </div>
      </div>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
             <h4 className="text-2xl font-bold tracking-tighter mb-4">OURBOOTH</h4>
             <p className="text-neutral-500 text-sm">© 2025 Chompooh Inc.</p>
          </div>
      </footer>
    </div>
  )
}
