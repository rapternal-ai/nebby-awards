DO $$ BEGIN
 CREATE TYPE "public"."award_phase" AS ENUM('setup', 'nomination', 'voting', 'results');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."consent_status" AS ENUM('pending', 'accepted', 'declined');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."membership_status" AS ENUM('pending', 'approved', 'rejected', 'removed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."post_status" AS ENUM('visible', 'hidden', 'removed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('visitor', 'pending', 'member', 'moderator', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"actor_username" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "award_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"season_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"nebby_id" text NOT NULL,
	"author_username" text NOT NULL,
	"body" text NOT NULL,
	"status" "post_status" DEFAULT 'visible' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "join_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"applicant_id" text NOT NULL,
	"applicant_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vouch_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"user_id" text NOT NULL,
	"member_number" integer NOT NULL,
	"username" text NOT NULL,
	"status" "membership_status" DEFAULT 'pending' NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"approved_at" timestamp with time zone,
	"approx_location" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nebbys" (
	"id" text PRIMARY KEY NOT NULL,
	"short_code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"boundary" jsonb NOT NULL,
	"creator_id" text NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nebbys_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nominations" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"category_id" text NOT NULL,
	"nominee_membership_id" text,
	"nominee_username" text NOT NULL,
	"nominee_is_non_member" boolean DEFAULT false NOT NULL,
	"nominator_username" text NOT NULL,
	"explanation" text NOT NULL,
	"photo_url" text,
	"consent_status" "consent_status" DEFAULT 'accepted' NOT NULL,
	"moderation_status" text DEFAULT 'approved' NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"author_username" text NOT NULL,
	"body" text NOT NULL,
	"status" "post_status" DEFAULT 'visible' NOT NULL,
	"reactions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"reporter_username" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"moderator_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"nebby_id" text NOT NULL,
	"category_id" text NOT NULL,
	"nomination_id" text NOT NULL,
	"voter_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_entries" ADD CONSTRAINT "audit_entries_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "award_categories" ADD CONSTRAINT "award_categories_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memberships" ADD CONSTRAINT "memberships_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nominations" ADD CONSTRAINT "nominations_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nominations" ADD CONSTRAINT "nominations_category_id_award_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."award_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_nebby_id_nebbys_id_fk" FOREIGN KEY ("nebby_id") REFERENCES "public"."nebbys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_category_id_award_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."award_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_nomination_id_nominations_id_fk" FOREIGN KEY ("nomination_id") REFERENCES "public"."nominations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
