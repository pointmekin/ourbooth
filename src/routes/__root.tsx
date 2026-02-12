import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { getThemeServerFn } from "@/server/theme";

interface MyRouterContext {
  queryClient: QueryClient;
}

// Helper to resolve the actual theme (handles "system" preference)
function resolveTheme(theme: string): "dark" | "light" {
  if (theme !== "system") return theme as "dark" | "light";

  // During SSR, we can't detect system preference, default to light
  // The inline script will handle system preference on the client
  return "light";
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Load theme from cookie on server
  loader: async () => {
    return await getThemeServerFn()
  },

  head: (ctx) => {
    const theme = ctx.loaderData || "system"
    const resolvedTheme = resolveTheme(theme)

    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "OurBooth | Online Photobooth",
        },
        {
          name: "description",
          content: "Snap. Share. OurBooth.",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
      scripts: [
        {
          // Inline script to apply theme immediately before hydration
          // This is a fallback that syncs cookie to localStorage
          innerHTML: `
            (function() {
              try {
                // Get theme from cookie first (server set)
                const cookies = document.cookie.split(';').reduce((acc, c) => {
                  const [key, val] = c.trim().split('=');
                  acc[key] = val;
                  return acc;
                }, {});

                const cookieTheme = cookies['theme'];

                // Sync cookie to localStorage for client nav
                if (cookieTheme) {
                  localStorage.setItem("vite-ui-theme", cookieTheme);
                }

                // If no cookie, check localStorage
                const storedTheme = cookieTheme || localStorage.getItem("vite-ui-theme");
                
                // Resolve system preference
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                const theme = storedTheme === "system" ? systemTheme : (storedTheme || systemTheme);
                
                // Apply to document immediately
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(theme);
              } catch (e) {
                console.error("Failed to apply theme:", e);
              }
            })();
          `,
        },
      ],
    }
  },

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  // Get theme from loader data for server-side rendering
  const theme = Route.useLoaderData()
  const resolvedTheme = resolveTheme(theme)

  return (
    <html lang="en" className={resolvedTheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider serverTheme={theme}>
          {children}
          <Toaster />
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  );
}
