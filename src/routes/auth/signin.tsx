import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/signin")({
  component: SignIn,
});

interface FormErrors {
  email?: string;
  password?: string;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // Validation helpers
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing", {
        description: "Check the form fields highlighted in red",
      });
      return;
    }

    setIsEmailLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error?.message?.toLowerCase().includes("invalid")) {
          toast.error("Invalid credentials", {
            description: "Please check your email and password",
            icon: <AlertCircle className="w-5 h-5" />,
          });
        } else if (error?.message?.toLowerCase().includes("not found")) {
          toast.error("Account not found", {
            description: "No account exists with this email",
            action: {
              label: "Sign up",
              onClick: () => navigate({ to: "/auth/signup" }),
            },
          });
        } else {
          toast.error("Sign in failed", {
            description:
              error.message || "Something went wrong. Please try again.",
          });
        }
      } else {
        // Success state
        setShowSuccess(true);
        toast.success("Welcome back!", {
          description: "Redirecting to your booth...",
          icon: <CheckCircle2 className="w-5 h-5" />,
        });

        // Delay navigation for success animation
        setTimeout(() => {
          navigate({ to: "/create" });
        }, 800);
      }
    } catch (err) {
      toast.error("Connection error", {
        description:
          "Unable to reach the server. Please check your connection.",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/create",
      });
    } catch (err) {
      toast.error("Google sign-in failed", {
        description: "Unable to connect with Google. Please try again.",
      });
      setIsGoogleLoading(false);
    }
  };

  const isLoading = isEmailLoading || isGoogleLoading;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-rose-500/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-b from-rose-900/10 to-transparent" />
        <div className="absolute bottom-[-20%] right-[-10%] w-150 h-150 rounded-full bg-rose-600/5 blur-[120px]" />
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-rose-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
              <CheckCircle2 className="w-16 h-16 text-rose-500 relative z-10" />
            </div>
            <p className="text-xl font-semibold">Signing you in...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="mb-10 text-center space-y-2 animate-in slide-in-from-top duration-700">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter inline-block mb-2 hover:text-rose-400 transition-colors"
          >
            OURBOOTH
          </Link>
          <h2 className="text-4xl font-light text-neutral-400">Welcome back</h2>
          <p className="text-sm text-neutral-600">
            Sign in to continue creating
          </p>
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
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative flex py-2 items-center" role="separator">
            <div className="grow border-t border-white/10" />
            <span className="shrink-0 mx-4 text-neutral-600 text-xs uppercase tracking-widest">
              Or continue with email
            </span>
            <div className="grow border-t border-white/10" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSignIn} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-neutral-400">
                Email address
              </Label>
              <div className="relative group">
                <div className="absolute top-3.5 left-3 text-neutral-500 group-focus-within:text-rose-400 transition-colors pointer-events-none">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error on change
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  onBlur={() => {
                    const error = validateEmail(email);
                    if (error) {
                      setErrors((prev) => ({ ...prev, email: error }));
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`
                    w-full bg-neutral-900/50 border rounded-xl pl-10 pr-4 py-3 h-12
                    outline-none transition-all text-white placeholder:text-neutral-600
                    focus:bg-neutral-900 focus:ring-2 focus:ring-rose-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      errors.email
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-rose-500/50"
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
                <div className="absolute top-3.5 left-3 text-neutral-500 group-focus-within:text-rose-400 transition-colors pointer-events-none">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error on change
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  onBlur={() => {
                    const error = validatePassword(password);
                    if (error) {
                      setErrors((prev) => ({ ...prev, password: error }));
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={`
                    w-full bg-neutral-900/50 border rounded-xl pl-10 pr-4 py-3 h-12
                    outline-none transition-all text-white placeholder:text-neutral-600
                    focus:bg-neutral-900 focus:ring-2 focus:ring-rose-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      errors.password
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-rose-500/50"
                    }
                  `}
                />
              </div>
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
              className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.5)] hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600"
            >
              {isEmailLoading ? (
                <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-neutral-500 animate-in fade-in duration-1000 delay-300">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-white hover:text-rose-400 hover:underline underline-offset-4 transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
