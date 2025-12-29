import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/auth/$")({
    loader: async ({ request }) => {
        const { auth } = await import("@/lib/auth");
        return auth.handler(request);
    },
    // Using loader for GET, but for API route handling of both GET/POST in explicit way:
    // @ts-ignore
    server: {
        handlers: {
            GET: async ({ request }: { request: Request }) => {
                const { auth } = await import("@/lib/auth");
                return auth.handler(request);
            },
            POST: async ({ request }: { request: Request }) => {
                const { auth } = await import("@/lib/auth");
                return auth.handler(request);
            },
        }
    }
})