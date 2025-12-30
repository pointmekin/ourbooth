import { pgTable, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
			
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
    credits: integer('credits').default(3).notNull(), // Custom field
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(()=> user.id, { onDelete: 'cascade' }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(()=> user.id, { onDelete: 'cascade' }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const photobooth = pgTable("photobooth", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }), // Nullable for guests
    layoutConfig: jsonb("layout_config").notNull(), // Stores grid, images, decorations
    status: text("status").notNull().default('draft'), // draft, completed
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const order = pgTable("order", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }),
    type: text("type").notNull(), // 'digital', 'print'
    status: text("status").notNull().default('pending'), // pending, paid, shipped
    shippingAddress: jsonb("shipping_address"),
    amount: integer("amount").notNull(), // In cents
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPhoto = pgTable("user_photo", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    type: text("type").notNull(), // 'png' | 'gif'
    layout: text("layout").notNull(), // '2x2' | '1x4' | '1x3'
    storageUrl: text("storage_url").notNull(), // GCP public/signed URL
    storagePath: text("storage_path").notNull(), // GCP object path
    thumbnailUrl: text("thumbnail_url"), // Optional thumbnail for gallery
    fileSize: integer("file_size"), // bytes
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
