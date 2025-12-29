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
                try {
                    const { auth } = await import("@/lib/auth");
                    return await auth.handler(request);
                } catch (e: any) {
                    console.error("Auth GET error:", e);
                    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500 });
                }
            },
            POST: async ({ request }: { request: Request }) => {
                try {
                    const { auth } = await import("@/lib/auth");
                    return await auth.handler(request);
                } catch (e: any) {
                    console.error("Auth POST error:", e);
                    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500 });
                }
            },
        }
    }
})