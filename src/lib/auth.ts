import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Adapting alias based on tsconfig
import * as schema from "@/db/schema";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_dev_only", 
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    onResponse: async (response: Response) => {
        if (response.status >= 400) {
            console.error(`[BetterAuth Error] status: ${response.status}`);
        }
        return response;
    },
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    user: {
        additionalFields: {
            credits: {
                type: "number",
                defaultValue: 3, 
            },
        },
    },
});
