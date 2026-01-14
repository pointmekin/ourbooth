import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, FormEvent } from 'react'
import { authClient } from '@/lib/auth-client'
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/auth/signup')({
  component: SignUp,
})

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  checks: {
    length: boolean
    hasLetter: boolean
    hasNumber: boolean
  }
}

function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    checks: { length: false, hasLetter: false, hasNumber: false }
  })
  const navigate = useNavigate()

  // Validation helpers
  const validateName = (name: string): string | undefined => {
    if (!name) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    return undefined
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address"
    }
    return undefined
  }

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const checks = {
      length: pwd.length >= 8,
      hasLetter: /[a-zA-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    }
    
    const feedback: string[] = []
    let score = 0
    
    if (!checks.length) feedback.push("At least 8 characters")
    else score++
    
    if (!checks.hasLetter) feedback.push("Include letters")
    else score++
    
    if (!checks.hasNumber) feedback.push("Include numbers")
    else score++
    
    // Bonus points for special characters and length
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++
    if (pwd.length >= 12) score++
    
    return { score, feedback, checks }
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    
    const strength = calculatePasswordStrength(password)
    if (strength.score < 2) {
      return "Password is too weak"
    }
    
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    if (nameError) newErrors.name = nameError
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd)
    setPasswordStrength(calculatePasswordStrength(pwd))
    
    // Clear error on change
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing", {
        description: "Check the form fields highlighted in red",
      })
      return
    }

    setIsEmailLoading(true)
    
    try {
      const { error } = await authClient.signUp.email({ 
        email, 
        password,
        name,
      })
      
      if (error) {
        // Handle specific error cases
        if (error.message.toLowerCase().includes("already exists") || 
            error.message.toLowerCase().includes("already registered")) {
          toast.error("Account already exists", {
            description: "An account with this email already exists",
            icon: <AlertCircle className="w-5 h-5" />,
            action: {
              label: "Sign in",
              onClick: () => navigate({ to: "/auth/signin" }),
            },
          })
        } else if (error.message.toLowerCase().includes("invalid email")) {
          toast.error("Invalid email", {
            description: "Please enter a valid email address",
          })
        } else {
          toast.error("Sign up failed", {
            description: error.message || "Something went wrong. Please try again.",
          })
        }
      } else {
        // Success state
        setShowSuccess(true)
        toast.success("Account created!", {
          description: "Welcome to OURBOOTH. Redirecting...",
          icon: <CheckCircle2 className="w-5 h-5" />,
        })
        
        // Delay navigation for success animation
        setTimeout(() => {
          navigate({ to: "/create" })
        }, 800)
      }
    } catch (err) {
      toast.error("Connection error", {
        description: "Unable to reach the server. Please check your connection.",
      })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/create"
      })
    } catch (err) {
      toast.error("Google sign-in failed", {
        description: "Unable to connect with Google. Please try again.",
      })
      setIsGoogleLoading(false)
    }
  }

  const isLoading = isEmailLoading || isGoogleLoading

  // Password strength color and label
  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-neutral-700"
    if (score === 1) return "bg-red-500"
    if (score === 2) return "bg-orange-500"
    if (score === 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthLabel = (score: number) => {
    if (score === 0) return ""
    if (score === 1) return "Weak"
    if (score === 2) return "Fair"
    if (score === 3) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <CheckCircle2 className="w-16 h-16 text-blue-500 relative z-10" />
            </div>
            <p className="text-xl font-semibold">Creating your account...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="mb-10 text-center space-y-2 animate-in slide-in-from-top duration-700">
          <Link 
            to="/" 
            className="text-2xl font-bold tracking-tighter inline-block mb-2 hover:text-blue-400 transition-colors"
          >
            OURBOOTH
          </Link>
          <h2 className="text-4xl font-light text-neutral-400">Join the movement</h2>
          <p className="text-sm text-neutral-600">Create your account to get started</p>
        </div>

        {/* Form Container */}
        <div className="space-y-4 bg-neutral-950/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-700">
          {/* Google Sign In */}
          <Button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold h-12 rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative flex py-2 items-center" role="separator">
            <div className="grow border-t border-white/10" />
            <span className="shrink-0 mx-4 text-neutral-600 text-xs uppercase tracking-widest">
              Or create with email
            </span>
            <div className="grow border-t border-white/10" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-neutral-400">
                Full name
              </Label>
              <div className="relative group">
                <div className="absolute top-3 left-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                  <User className="w-5 h-5" aria-hidden="true" />
                </div>
                <Input 
                  id="name"
                  type="text" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    // Clear error on change
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }))
                    }
                  }}
                  onBlur={() => {
                    const error = validateName(name)
                    if (error) {
                      setErrors((prev) => ({ ...prev, name: error }))
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`
                    w-full bg-neutral-900/50 border rounded-xl pl-10 pr-4 py-3 
                    outline-none transition-all text-white placeholder:text-neutral-600
                    focus:bg-neutral-900 focus:ring-2 focus:ring-blue-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.name 
                      ? "border-red-500/50 focus:border-red-500" 
                      : "border-white/10 focus:border-blue-500/50"
                    }
                  `}
                />
              </div>
              {errors.name && (
                <p 
                  id="name-error"
                  className="text-sm text-red-400 flex items-center gap-1.5 animate-in slide-in-from-left duration-200"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-neutral-400">
                Email address
              </Label>
              <div className="relative group">
                <div className="absolute top-3 left-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    // Clear error on change
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  onBlur={() => {
                    const error = validateEmail(email)
                    if (error) {
                      setErrors((prev) => ({ ...prev, email: error }))
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`
                    w-full bg-neutral-900/50 border rounded-xl pl-10 pr-4 py-3 
                    outline-none transition-all text-white placeholder:text-neutral-600
                    focus:bg-neutral-900 focus:ring-2 focus:ring-blue-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.email 
                      ? "border-red-500/50 focus:border-red-500" 
                      : "border-white/10 focus:border-blue-500/50"
                    }
                  `}
                />
              </div>
              {errors.email && (
                <p 
                  id="email-error"
                  className="text-sm text-red-400 flex items-center gap-1.5 animate-in slide-in-from-left duration-200"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-neutral-400">
                Password
              </Label>
              <div className="relative group">
                <div className="absolute top-3 left-3 text-neutral-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </div>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => {
                    const error = validatePassword(password)
                    if (error) {
                      setErrors((prev) => ({ ...prev, password: error }))
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : password ? "password-strength" : undefined}
                  className={`
                    w-full bg-neutral-900/50 border rounded-xl pl-10 pr-4 py-3 
                    outline-none transition-all text-white placeholder:text-neutral-600
                    focus:bg-neutral-900 focus:ring-2 focus:ring-blue-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.password 
                      ? "border-red-500/50 focus:border-red-500" 
                      : "border-white/10 focus:border-blue-500/50"
                    }
                  `}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {password && !errors.password && (
                <div id="password-strength" className="space-y-2 animate-in slide-in-from-top duration-200">
                  {/* Strength Bar */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength.score 
                            ? getStrengthColor(passwordStrength.score)
                            : "bg-neutral-800"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Strength Label & Checks */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${
                      passwordStrength.score === 1 ? "text-red-400" :
                      passwordStrength.score === 2 ? "text-orange-400" :
                      passwordStrength.score === 3 ? "text-yellow-400" :
                      passwordStrength.score >= 4 ? "text-green-400" :
                      "text-neutral-500"
                    }`}>
                      {getStrengthLabel(passwordStrength.score)}
                    </span>
                    
                    <div className="flex gap-2 text-neutral-500">
                      <span className={`flex items-center gap-1 ${passwordStrength.checks.length ? "text-green-400" : ""}`}>
                        {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        8+ chars
                      </span>
                      <span className={`flex items-center gap-1 ${passwordStrength.checks.hasLetter ? "text-green-400" : ""}`}>
                        {passwordStrength.checks.hasLetter ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Letter
                      </span>
                      <span className={`flex items-center gap-1 ${passwordStrength.checks.hasNumber ? "text-green-400" : ""}`}>
                        {passwordStrength.checks.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Number
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p 
                  id="password-error"
                  className="text-sm text-red-400 flex items-center gap-1.5 animate-in slide-in-from-left duration-200"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-bold h-12 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {isEmailLoading ? (
                <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-neutral-500 animate-in fade-in duration-1000 delay-300">
          Already have an account?{" "}
          <Link 
            to="/auth/signin" 
            className="text-white hover:text-blue-400 hover:underline underline-offset-4 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
