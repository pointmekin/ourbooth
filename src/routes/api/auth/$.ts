import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/auth/$")({
    loader: async ({ request }: any) => {
        const { auth } = await import("@/lib/auth");
        return auth.handler(request);
    },
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