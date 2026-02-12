import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  serverTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  serverTheme = "system",
  ...props
}: ThemeProviderProps) {
  // Initialize from server theme first, then localStorage
  const getInitialTheme = (): Theme => {
    if (typeof window === "undefined") return serverTheme

    // Prefer localStorage for client-side navigation
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored) return stored
    } catch (e) {
      // Ignore localStorage errors
    }

    return serverTheme || defaultTheme
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme())

  // Sync theme changes to localStorage (for client nav)
  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored && stored !== theme) {
      setTheme(stored)
    }
  }, [storageKey])

  // Apply theme class to document
  useEffect(() => {
    if (typeof window === "undefined") return

    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Save to localStorage for client-side navigation
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)

      // Call server function to update cookie
      import("@/server/theme").then(({ setThemeServerFn }) => {
        setThemeServerFn({ data: newTheme })
      })
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
