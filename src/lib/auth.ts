import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Adapting alias based on tsconfig
import * as schema from "@/db/schema";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET, // Access from your Worker's env object
    baseURL: process.env.BETTER_AUTH_URL ?? undefined,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
