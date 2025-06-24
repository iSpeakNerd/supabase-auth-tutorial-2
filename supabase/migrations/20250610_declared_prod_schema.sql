CREATE TABLE IF NOT EXISTS public.audio (
    url text not null,
    meta_data jsonb null,
    created_at timestamp with time zone null default now(),
    user_id uuid not null,
    skip_minutes smallint null,
    description text,
    name text,
    id uuid not null default gen_random_uuid (),
    constraint audio_pkey primary key (id),
    constraint audio_id_key unique (id),
    constraint audio_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.transcript (
  transcription_id uuid not null default gen_random_uuid (),
  audio_id uuid not null,
  transcript text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  meta_data jsonb null,
  constraint transcript_pkey primary key (transcription_id),
  constraint transcript_audio_id_fkey foreign KEY (audio_id) references audio (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.correction (
  correction_id uuid not null default gen_random_uuid (),
  audio_id uuid not null,
  transcript text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  meta_data jsonb null,
  constraint correction_pkey primary key (correction_id),
  constraint correction_audio_id_fkey foreign KEY (audio_id) references audio (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.gen_ai (
  gen_id uuid not null default gen_random_uuid (),
  audio_id uuid not null,
  system_prompt text not null,
  user_prompt text not null,
  output text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  meta_data jsonb null,
  constraint gen_ai_pkey primary key (gen_id),
  constraint gen_ai_audio_id_fkey foreign KEY (audio_id) references audio (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- CREATE TYPE pipeline_stage as enum (
--   'transcript',
--   'content',
--   'meta_data'
-- )

CREATE TABLE IF NOT EXISTS public.pipeline_runs (
  run_id uuid not null default gen_random_uuid (),
  stage TEXT NOT NULL,
  data jsonb null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null,
  audio_id uuid not null,
  constraint pipeline_runs_pkey primary key (run_id, stage),
  constraint pipeline_runs_audio_id_fkey foreign KEY (audio_id) references audio (id) on update CASCADE on delete CASCADE,
  constraint pipeline_runs_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE
) TABLESPACE pg_default;

-- CREATE TYPE task_type as enum (
--   'download',
--   'trim',
--   'transcribe',
--   'parse_metadata',
--   'generate'
-- )

-- CREATE TYPE task_status as enum (
--   'queued',
--   'completed',
--   'failed'
-- )
-- TODO: migrate these table + types defs to prod --
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id uuid NOT NULL,
  task_type TEXT NOT NULL,
  task_status TEXT NOT NULL,
  created_at timestamptz null default CURRENT_TIMESTAMP,
  started_at timestamptz null default CURRENT_TIMESTAMP,
  completed_at timestamptz null,
  error_message TEXT NULL,
  meta_data jsonb NULL,
  constraint tasks_audio_id_fkey FOREIGN KEY (audio_id) references public.audio (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

CREATE OR REPLACE VIEW public.aggregated_pipeline_runs AS
SELECT 
  run_id,
  jsonb_agg(data) AS aggregated_data,
  jsonb_object_agg(stage, data) AS data_by_stage,
  min(created_at) AS first_timestamp,
  max(created_at) AS last_timestamp
FROM 
  public.pipeline_runs
GROUP BY 
  run_id;
