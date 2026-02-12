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
function resolveTheme(theme: string): string {
  if (theme === "system" || !theme) {
    if (typeof window === "undefined") return "";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Load theme from cookie on server
  loader: async () => {
    return await getThemeServerFn()
  },

  head: () => {
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
          children: `
            (function() {
              try {
                const getCookie = (name) => {
                  const value = '; ' + document.cookie;
                  const parts = value.split('; ' + name + '=');
                  if (parts.length === 2) return parts.pop().split(';').shift();
                };

                const theme = getCookie('theme') || 'system';
                const root = document.documentElement;
                
                root.classList.remove("light", "dark");
                
                if (theme === "system") {
                  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {}
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
    <html lang="en" className={resolvedTheme} suppressHydrationWarning>
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
