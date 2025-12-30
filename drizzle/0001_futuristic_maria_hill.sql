CREATE TABLE "user_photo" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"layout" text NOT NULL,
	"storage_url" text NOT NULL,
	"storage_path" text NOT NULL,
	"thumbnail_url" text,
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_photo" ADD CONSTRAINT "user_photo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;