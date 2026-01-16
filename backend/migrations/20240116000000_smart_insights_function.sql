-- Smart Insights Function for Analytics
-- Generates dynamic insights based on user's spending patterns

create or replace function public.get_smart_insights(month_str text)
returns jsonb as $$
declare
  start_date timestamptz;
  end_date timestamptz;
  prev_start_date timestamptz;
  prev_end_date timestamptz;
  
  -- Current period data
  top_category text;
  top_category_amount numeric;
  top_category_prev_amount numeric;
  category_increase_pct numeric;
  
  -- Subscription detection
  subscription_category text;
  subscription_amount numeric;
  
  -- Budget status
  total_expenses numeric;
  total_income numeric;
  budget_status text;
  
  insights jsonb := '[]'::jsonb;
  insight jsonb;
begin
  -- Parse dates for current and previous month
  start_date := month_str::timestamptz;
  end_date := start_date + interval '1 month';
  prev_start_date := start_date - interval '1 month';
  prev_end_date := start_date;

  -- Get total expenses and income for current month
  select coalesce(sum(amount), 0) into total_expenses
  from public.transactions
  where user_id = auth.uid()
    and type = 'expense'
    and date >= start_date
    and date < end_date;

  select coalesce(sum(amount), 0) into total_income
  from public.transactions
  where user_id = auth.uid()
    and type = 'income'
    and date >= start_date
    and date < end_date;

  -- INSIGHT 1: Spending Alert - Find category with biggest increase
  with current_spending as (
    select category, sum(amount) as amount
    from public.transactions
    where user_id = auth.uid()
      and type = 'expense'
      and date >= start_date
      and date < end_date
    group by category
  ),
  previous_spending as (
    select category, sum(amount) as amount
    from public.transactions
    where user_id = auth.uid()
      and type = 'expense'
      and date >= prev_start_date
      and date < prev_end_date
    group by category
  ),
  category_changes as (
    select 
      c.category,
      c.amount as current_amount,
      coalesce(p.amount, 0) as previous_amount,
      case 
        when coalesce(p.amount, 0) = 0 then 100
        else round(((c.amount - coalesce(p.amount, 0)) / coalesce(p.amount, 1) * 100)::numeric, 0)
      end as increase_pct
    from current_spending c
    left join previous_spending p on c.category = p.category
    where c.amount > 0
  )
  select category, current_amount, previous_amount, increase_pct
  into top_category, top_category_amount, top_category_prev_amount, category_increase_pct
  from category_changes
  where increase_pct > 10
  order by increase_pct desc
  limit 1;

  if top_category is not null then
    insight := jsonb_build_object(
      'type', 'spending_alert',
      'title', 'Spending Alert',
      'message', format('You''ve spent %s%% more on %s compared to last month. Current: $%s (Previously: $%s). Consider reducing expenses in this category.', 
        category_increase_pct, 
        top_category, 
        round(top_category_amount, 2),
        round(top_category_prev_amount, 2)
      ),
      'category', top_category,
      'increase_pct', category_increase_pct,
      'current_amount', round(top_category_amount, 2),
      'previous_amount', round(top_category_prev_amount, 2)
    );
    insights := insights || jsonb_build_array(insight);
  end if;

  -- INSIGHT 2: Check for recurring/subscription expenses
  with recurring_transactions as (
    select category, avg(amount) as avg_amount, count(*) as frequency
    from public.transactions
    where user_id = auth.uid()
      and type = 'expense'
      and date >= start_date - interval '3 months'
      and date < end_date
    group by category
    having count(*) >= 3 -- Appears at least 3 times in last 3 months
  )
  select category, avg_amount
  into subscription_category, subscription_amount
  from recurring_transactions
  where category in ('Entertainment', 'Subscriptions', 'Utilities', 'Software')
  order by avg_amount desc
  limit 1;

  if subscription_category is not null then
    insight := jsonb_build_object(
      'type', 'savings_opportunity',
      'title', 'Savings Opportunity',
      'message', format('You have recurring expenses in %s averaging $%s. Review these subscriptions to find unused services and save money.', 
        subscription_category,
        round(subscription_amount, 2)
      ),
      'category', subscription_category,
      'amount', round(subscription_amount, 2)
    );
    insights := insights || jsonb_build_array(insight);
  end if;

  -- INSIGHT 3: Budget health check
  if total_income > 0 then
    if total_expenses > total_income * 0.9 then
      budget_status := 'warning';
      insight := jsonb_build_object(
        'type', 'budget_warning',
        'title', 'Budget Warning',
        'message', format('You''ve spent $%s of your $%s income (%s%%). Consider reducing discretionary spending to maintain healthy savings.', 
          round(total_expenses, 2),
          round(total_income, 2),
          round((total_expenses / total_income * 100)::numeric, 0)
        ),
        'expenses', round(total_expenses, 2),
        'income', round(total_income, 2),
        'percentage', round((total_expenses / total_income * 100)::numeric, 0)
      );
      insights := insights || jsonb_build_array(insight);
    elsif total_expenses < total_income * 0.7 then
      budget_status := 'success';
      insight := jsonb_build_object(
        'type', 'budget_success',
        'title', 'Great Job!',
        'message', format('You''re saving $%s this month (%s%% of income). Keep up the excellent financial discipline!', 
          round(total_income - total_expenses, 2),
          round(((total_income - total_expenses) / total_income * 100)::numeric, 0)
        ),
        'savings', round(total_income - total_expenses, 2),
        'percentage', round(((total_income - total_expenses) / total_income * 100)::numeric, 0)
      );
      insights := insights || jsonb_build_array(insight);
    end if;
  end if;

  -- If no insights were generated, add a default positive message
  if jsonb_array_length(insights) = 0 then
    insights := jsonb_build_array(
      jsonb_build_object(
        'type', 'info',
        'title', 'Good Start',
        'message', 'Your spending looks balanced this month. Keep tracking your expenses to identify optimization opportunities.'
      )
    );
  end if;

  return jsonb_build_object('insights', insights);
end;
$$ language plpgsql security definer;
