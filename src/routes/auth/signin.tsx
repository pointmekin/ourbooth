import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/auth/signin')({
  component: SignIn,
})

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await authClient.signIn.email({ 
      email, 
      password 
    })
    if (error) {
        alert(error.message)
    } else {
        navigate({ to: '/create' })
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
       await authClient.signIn.social({
            provider: "google",
            callbackURL: "/create"
        })
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-rose-500/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-rose-900/10 to-transparent" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-600/5 blur-[120px]" />
        </div>

        <div className="w-full max-w-md z-10">
            <div className="mb-10 text-center">
                <Link to="/" className="text-2xl font-bold tracking-tighter inline-block mb-2">OURBOOTH</Link>
                <h2 className="text-4xl font-light text-neutral-400">Welcome back</h2>
            </div>

            <div className="space-y-4 bg-neutral-950/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl">
                 <button 
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold h-12 rounded-xl hover:bg-neutral-200 transition-colors"
                 >
                     <svg className="w-5 h-5" viewBox="0 0 24 24">
                         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     Continue with Google
                 </button>

                 <div className="relative flex py-2 items-center">
                    <div className="grow border-t border-white/10"></div>
                    <span className="shrink-0 mx-4 text-neutral-600 text-xs uppercase tracking-widest">Or continue with email</span>
                    <div className="grow border-t border-white/10"></div>
                 </div>

                 <div className="space-y-4">
                     <div className="relative group">
                         <div className="absolute md:top-3.5 top-3 left-3 text-neutral-500 group-focus-within:text-white transition-colors">
                             <Mail className="w-5 h-5" />
                         </div>
                         <input 
                            type="email" 
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-10 py-3 outline-none focus:border-white/30 focus:bg-neutral-900 transition-all text-white placeholder:text-neutral-600"
                        />
                     </div>
                     <div className="relative group">
                         <div className="absolute md:top-3.5 top-3 left-3 text-neutral-500 group-focus-within:text-white transition-colors">
                             <Lock className="w-5 h-5" />
                         </div>
                         <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-10 py-3 outline-none focus:border-white/30 focus:bg-neutral-900 transition-all text-white placeholder:text-neutral-600"
                        />
                     </div>
                 </div>

                 <button 
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.5)] hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2 group"
                 >
                     {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                         <>
                            Sign In
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </>
                     )}
                 </button>
            </div>

            <p className="text-center mt-8 text-neutral-500">
                Don't have an account? <Link to="/auth/signup" className="text-white hover:underline underline-offset-4">Create one</Link>
            </p>
        </div>
    </div>
  )
}
