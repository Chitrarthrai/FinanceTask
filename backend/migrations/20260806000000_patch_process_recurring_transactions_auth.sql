-- Migration: Patch process_recurring_transactions to ensure auth context
-- Date: 2026-08-06

create or replace function process_recurring_transactions(p_user_id uuid)
returns void as $$
declare
  rule record;
  current_due_date date;
begin
  -- SECURITY PATCH: Ensure the caller is authenticated and matches the requested user_id
  if auth.uid() is null or auth.uid() != p_user_id then
    raise exception 'Unauthorized: You can only process your own recurring transactions.';
  end if;

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
