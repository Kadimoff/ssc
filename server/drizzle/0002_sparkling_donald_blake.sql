CREATE TABLE "assistant_queries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"intent" text NOT NULL,
	"criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"result_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"engine" text NOT NULL,
	"status" text NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"prompt_fingerprint" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matching_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"query_id" text NOT NULL,
	"user_id" text NOT NULL,
	"result_type" text NOT NULL,
	"result_id" text NOT NULL,
	"action" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expertise" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"availability" text DEFAULT '' NOT NULL,
	"focus_stage" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_members" (
	"id" text PRIMARY KEY NOT NULL,
	"startup_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"startup_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"date_label" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'future' NOT NULL,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"startup_id" text NOT NULL,
	"title" text NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'Project' NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"location" text DEFAULT 'Remote' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startups" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"stage" text NOT NULL,
	"readiness_score" integer DEFAULT 0 NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"full_description" text DEFAULT '' NOT NULL,
	"founded" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistant_queries" ADD CONSTRAINT "assistant_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matching_feedback" ADD CONSTRAINT "matching_feedback_query_id_assistant_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."assistant_queries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matching_feedback" ADD CONSTRAINT "matching_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_milestones" ADD CONSTRAINT "startup_milestones_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_roles" ADD CONSTRAINT "startup_roles_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startups" ADD CONSTRAINT "startups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistant_queries_user_created_idx" ON "assistant_queries" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "assistant_queries_fingerprint_idx" ON "assistant_queries" USING btree ("prompt_fingerprint");--> statement-breakpoint
CREATE INDEX "matching_feedback_query_idx" ON "matching_feedback" USING btree ("query_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matching_feedback_user_result_unique" ON "matching_feedback" USING btree ("query_id","user_id","result_type","result_id","action");--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_profiles_user_unique" ON "mentor_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "startup_member_unique" ON "startup_members" USING btree ("startup_id","user_id");--> statement-breakpoint
CREATE INDEX "startup_milestones_startup_status_idx" ON "startup_milestones" USING btree ("startup_id","status");--> statement-breakpoint
CREATE INDEX "startup_roles_startup_status_idx" ON "startup_roles" USING btree ("startup_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "startups_slug_unique" ON "startups" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "startups_sector_stage_idx" ON "startups" USING btree ("sector","stage");--> statement-breakpoint
CREATE INDEX "users_assistant_search_idx" ON "users" USING gin (to_tsvector('simple', "name" || ' ' || "title" || ' ' || "skills" || ' ' || "industry" || ' ' || "location" || ' ' || "about" || ' ' || "availability"));--> statement-breakpoint
CREATE INDEX "jobs_assistant_search_idx" ON "jobs" USING gin (to_tsvector('simple', "role" || ' ' || "company" || ' ' || "location" || ' ' || "skills" || ' ' || "description"));--> statement-breakpoint
CREATE INDEX "startups_assistant_search_idx" ON "startups" USING gin (to_tsvector('simple', "name" || ' ' || "sector" || ' ' || "stage" || ' ' || "summary" || ' ' || "full_description" || ' ' || "location"));--> statement-breakpoint
CREATE INDEX "programs_assistant_search_idx" ON "programs" USING gin (to_tsvector('simple', "name" || ' ' || "type" || ' ' || "status" || ' ' || "description"));--> statement-breakpoint
CREATE INDEX "organizations_assistant_search_idx" ON "organizations" USING gin (to_tsvector('simple', "display_name" || ' ' || "type" || ' ' || "summary" || ' ' || "partnership_status"));--> statement-breakpoint
CREATE INDEX "mentor_profiles_assistant_search_idx" ON "mentor_profiles" USING gin (to_tsvector('simple', "company" || ' ' || "availability" || ' ' || "focus_stage" || ' ' || "bio"));
