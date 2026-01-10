-- Analytics Functions for FinanceTask

-- 1. Get Monthly Metrics (Income, Expenses, Savings, etc.)
create or replace function public.get_monthly_metrics(month_str text)
returns jsonb as $$
declare
  start_date timestamptz;
  end_date timestamptz;
  total_income numeric;
  total_expenses numeric;
  net_savings numeric;
begin
  -- Parse month string (expects 'YYYY-MM-DD' or similar compatible date)
  -- We'll assume input is the first day of the month
  start_date := month_str::timestamptz;
  end_date := start_date + interval '1 month';

  -- Calculate Income (from transactions + salary if applicable logic, 
  -- but here strictly from transactions type 'income')
  select coalesce(sum(amount), 0) into total_income
  from public.transactions
  where user_id = auth.uid()
    and type = 'income'
    and date >= start_date
    and date < end_date;

  -- Calculate Expenses
  select coalesce(sum(amount), 0) into total_expenses
  from public.transactions
  where user_id = auth.uid()
    and type = 'expense'
    and date >= start_date
    and date < end_date;

  net_savings := total_income - total_expenses;

  return jsonb_build_object(
    'total_income', total_income,
    'total_expenses', total_expenses,
    'net_savings', net_savings
  );
end;
$$ language plpgsql security definer;

-- 2. Get Category Distribution
create or replace function public.get_category_distribution(month_str text)
returns table (
  name text,
  value numeric,
  color text
) as $$
declare
  start_date timestamptz;
  end_date timestamptz;
begin
  start_date := month_str::timestamptz;
  end_date := start_date + interval '1 month';

  return query
  select 
    t.category as name,
    sum(t.amount) as value,
    max(c.color) as color -- simple hack to get color, ideally join properly
  from public.transactions t
  left join public.categories c on t.category = c.name and c.user_id = auth.uid()
  where t.user_id = auth.uid()
    and t.type = 'expense'
    and t.date >= start_date
    and t.date < end_date
  group by t.category;
end;
$$ language plpgsql security definer;

-- 3. Get Spending Trend (Daily)
create or replace function public.get_spending_trend(month_str text)
returns table (
  day_label text,
  amount numeric
) as $$
declare
  start_date timestamptz;
  end_date timestamptz;
begin
  start_date := month_str::timestamptz;
  end_date := start_date + interval '1 month';

  return query
  select 
    to_char(date, 'Mon DD') as day_label,
    sum(t.amount) as amount
  from public.transactions t
  where t.user_id = auth.uid()
    and t.type = 'expense'
    and t.date >= start_date
    and t.date < end_date
  group by to_char(date, 'Mon DD'), date::date
  order by date::date;
end;
$$ language plpgsql security definer;
