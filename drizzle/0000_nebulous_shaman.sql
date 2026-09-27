CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"seat" integer NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"avatar" jsonb NOT NULL,
	"token_hash" text NOT NULL,
	CONSTRAINT "run_players_run_seat_uq" UNIQUE("run_id","seat")
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"mode" text NOT NULL,
	"seed" text NOT NULL,
	"daily_key" text,
	"escaped" boolean NOT NULL,
	"stages_cleared" integer NOT NULL,
	"total" integer NOT NULL,
	"time_left_ms" integer NOT NULL,
	"strikes" integer NOT NULL,
	"hints_used" integer NOT NULL,
	"score" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_tokens_token_hash_uq" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_players" ADD CONSTRAINT "run_players_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_players" ADD CONSTRAINT "run_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "run_players_token_hash_idx" ON "run_players" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "run_players_user_id_idx" ON "run_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "runs_daily_score_idx" ON "runs" USING btree ("daily_key","score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_tokens_user_id_idx" ON "user_tokens" USING btree ("user_id");