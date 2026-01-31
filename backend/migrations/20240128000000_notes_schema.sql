-- Notes Schema for FinanceTask
-- Separate notes section with optional task linking and AI features

-- Create Notes Table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  task_id uuid references public.tasks on delete set null, -- Optional link to task
  title text not null,
  content text not null,
  summary text, -- AI-generated summary (cached)
  tags text[] default '{}', -- AI-suggested + manual tags
  extracted_tasks jsonb default '[]', -- AI-extracted action items
  is_pinned boolean default false,
  color text default 'default', -- Note color theme: default, red, orange, yellow, green, blue, purple
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.notes enable row level security;

-- RLS Policies
create policy "Users can view own notes" on public.notes 
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes" on public.notes 
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on public.notes 
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes" on public.notes 
  for delete using (auth.uid() = user_id);

-- Indexes for faster queries
create index notes_user_id_idx on public.notes(user_id);
create index notes_task_id_idx on public.notes(task_id);
create index notes_created_at_idx on public.notes(created_at desc);
create index notes_is_pinned_idx on public.notes(is_pinned) where is_pinned = true;

-- Update trigger for updated_at
create or replace function update_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at_trigger
  before update on public.notes
  for each row execute function update_notes_updated_at();

-- Full-text search index for semantic search capability
alter table public.notes add column search_vector tsvector 
  generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) stored;

create index notes_search_idx on public.notes using gin(search_vector);
