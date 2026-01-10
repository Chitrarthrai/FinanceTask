-- Database Schema for FinanceTask
-- Generated from Supabase Implementation

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Create Budget Settings Table
create table public.budget_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  monthly_salary numeric default 0,
  savings_target_percent numeric default 20,
  emergency_fund_amount numeric default 0,
  fixed_expenses jsonb default '[]'::jsonb,
  variable_expenses jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table public.budget_settings enable row level security;
create policy "Users can view own budget" on public.budget_settings for select using (auth.uid() = user_id);
create policy "Users can insert own budget" on public.budget_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own budget" on public.budget_settings for update using (auth.uid() = user_id);

-- Create Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text,
  color text,
  icon text,
  created_at timestamptz default now()
);
alter table public.categories enable row level security;
create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- Create Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  amount numeric not null,
  type text not null,
  category text,
  date timestamptz default now(),
  payment_method text,
  receipt_url text,
  created_at timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- Create Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date timestamptz,
  recurring boolean default false,
  tags text[],
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Helper to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
