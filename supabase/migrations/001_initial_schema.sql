create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, icon text,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete cascade,
  name text not null, slug text not null unique, description text, cover_image_path text, summary_card_image_path text,
  sort_order integer not null default 0, is_free boolean not null default true, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.knowledge_cards (
  id uuid primary key default gen_random_uuid(), topic_id uuid not null references public.topics(id) on delete cascade,
  slug text not null unique, status text not null default 'draft' check (status in ('draft','published','archived')),
  question_type text not null default 'choice' check (question_type in ('choice','multiple','recall')), question text not null, answer text not null, explanation text not null,
  mnemonic text, mistake_tip text, related_knowledge jsonb not null default '[]'::jsonb,
  option_a text, option_b text, option_c text, option_d text, option_e text, correct_option text check (correct_option in ('A','B','C','D','E') or correct_option is null), correct_options text[] not null default '{}',
  question_image_path text, answer_image_path text, question_thumbnail_path text, answer_thumbnail_path text, image_alt text,
  difficulty smallint not null default 1 check (difficulty in (1,2,3)), is_free boolean not null default true, sort_order integer not null default 0,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists knowledge_cards_status_idx on public.knowledge_cards(status);
create index if not exists knowledge_cards_topic_idx on public.knowledge_cards(topic_id);
create index if not exists knowledge_cards_free_idx on public.knowledge_cards(is_free);
create index if not exists knowledge_cards_published_idx on public.knowledge_cards(published_at);
create index if not exists knowledge_cards_sort_idx on public.knowledge_cards(sort_order);
create table if not exists public.user_card_progress (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, card_id uuid not null references public.knowledge_cards(id) on delete cascade,
  status text not null default 'new' check (status in ('new','learning','reviewing','mastered')), last_rating text check (last_rating in ('forgot','fuzzy','remembered') or last_rating is null),
  review_count integer not null default 0, correct_count integer not null default 0, wrong_count integer not null default 0, correct_streak integer not null default 0,
  last_reviewed_at timestamptz, next_review_at timestamptz, is_mastered boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,card_id)
);
create index if not exists progress_due_idx on public.user_card_progress(user_id,next_review_at);
create index if not exists progress_status_idx on public.user_card_progress(user_id,status);
create index if not exists progress_mastered_idx on public.user_card_progress(user_id,is_mastered);
create table if not exists public.favorites (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, card_id uuid not null references public.knowledge_cards(id) on delete cascade, created_at timestamptz not null default now(), unique(user_id,card_id));
create table if not exists public.wrong_answers (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, card_id uuid not null references public.knowledge_cards(id) on delete cascade, last_selected_option text, wrong_count integer not null default 1, last_wrong_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,card_id));
create table if not exists public.study_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, started_at timestamptz not null, ended_at timestamptz, new_count integer not null default 0, review_count integer not null default 0, remembered_count integer not null default 0, fuzzy_count integer not null default 0, forgot_count integer not null default 0, duration_seconds integer not null default 0, created_at timestamptz not null default now());
create index if not exists sessions_user_date_idx on public.study_sessions(user_id,started_at desc);
create table if not exists public.user_settings (user_id uuid primary key references auth.users(id) on delete cascade, daily_new_count integer not null default 10, daily_review_limit integer not null default 30, study_mode text not null default 'smart' check (study_mode in ('smart','choice','recall')), auto_next boolean not null default true, show_shortcut_hint boolean not null default true, updated_at timestamptz not null default now());

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles(id,display_name) values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))) on conflict do nothing; insert into public.user_settings(user_id) values(new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
do $$ declare t text; begin foreach t in array array['profiles','categories','topics','knowledge_cards','user_card_progress','wrong_answers','study_sessions','user_settings'] loop execute format('drop trigger if exists %I_updated_at on public.%I',t,t); execute format('create trigger %I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',t,t); end loop; end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('card-images','card-images',true,1048576,array['image/png','image/jpeg','image/webp']) on conflict(id) do update set public=true,file_size_limit=1048576;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('private-card-images','private-card-images',false,1048576,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
