-- Create recurring_rules table
create table public.recurring_rules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  amount numeric not null,
  category text not null,
  type text check (type in ('income', 'expense')) not null,
  frequency text check (frequency in ('weekly', 'monthly', 'yearly')) not null,
  start_date date not null,
  last_processed_date date,
  next_due_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.recurring_rules enable row level security;

-- Policies
create policy "Users can view own recurring rules" on public.recurring_rules
  for select using (auth.uid() = user_id);

create policy "Users can insert own recurring rules" on public.recurring_rules
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recurring rules" on public.recurring_rules
  for update using (auth.uid() = user_id);

create policy "Users can delete own recurring rules" on public.recurring_rules
  for delete using (auth.uid() = user_id);

-- Function to process recurring transactions
create or replace function process_recurring_transactions(p_user_id uuid)
returns void as $$
declare
  rule record;
  current_due_date date;
begin
  -- Loop through rules that are due
  for rule in 
    select * from public.recurring_rules 
    where user_id = p_user_id 
    and next_due_date <= current_date
  loop
    current_due_date := rule.next_due_date;
    
    -- Process all missed occurrences up to today
    while current_due_date <= current_date loop
      -- Insert transaction
      insert into public.transactions (
        user_id, title, amount, category, type, date, created_at
      ) values (
        rule.user_id,
        rule.title || ' (Recurring)',
        rule.amount,
        rule.category,
        rule.type,
        to_char(current_due_date, 'Mon DD, YYYY'),
        now()
      );
      
      -- Calculate next due date
      if rule.frequency = 'weekly' then
        current_due_date := current_due_date + interval '1 week';
      elsif rule.frequency = 'monthly' then
        current_due_date := current_due_date + interval '1 month';
      elsif rule.frequency = 'yearly' then
        current_due_date := current_due_date + interval '1 year';
      end if;
    end loop;

    -- Update the rule with the new next_due_date
    update public.recurring_rules
    set last_processed_date = current_date,
        next_due_date = current_due_date
    where id = rule.id;
    
  end loop;
end;
$$ language plpgsql security definer;
