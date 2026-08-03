-- Migration: Flexible Billing Cycles & Insights Persistence
-- Date: 2026-08-03

-- 1. Updated get_monthly_metrics to support dynamic start_date
CREATE OR REPLACE FUNCTION public.get_monthly_metrics(month_str TEXT, cycle_start_day INT DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
  base_date TIMESTAMPTZ;
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
  total_income NUMERIC;
  total_expenses NUMERIC;
  net_savings NUMERIC;
BEGIN
  base_date := month_str::TIMESTAMPTZ;
  -- Calculate start date based on cycle_start_day
  start_date := date_trunc('month', base_date) + (cycle_start_day - 1 || ' days')::INTERVAL;
  end_date := start_date + INTERVAL '1 month';

  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM public.transactions
  WHERE user_id = auth.uid()
    AND type = 'income'
    AND date >= start_date
    AND date < end_date;

  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM public.transactions
  WHERE user_id = auth.uid()
    AND type = 'expense'
    AND date >= start_date
    AND date < end_date;

  net_savings := total_income - total_expenses;

  RETURN jsonb_build_object(
    'total_income', total_income,
    'total_expenses', total_expenses,
    'net_savings', net_savings
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Updated get_category_distribution with cycle_start_day
CREATE OR REPLACE FUNCTION public.get_category_distribution(month_str TEXT, cycle_start_day INT DEFAULT 1)
RETURNS TABLE (
  name TEXT,
  value NUMERIC,
  color TEXT
) AS $$
DECLARE
  base_date TIMESTAMPTZ;
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
BEGIN
  base_date := month_str::TIMESTAMPTZ;
  start_date := date_trunc('month', base_date) + (cycle_start_day - 1 || ' days')::INTERVAL;
  end_date := start_date + INTERVAL '1 month';

  RETURN QUERY
  SELECT 
    t.category AS name,
    SUM(t.amount) AS value,
    MAX(c.color) AS color
  FROM public.transactions t
  LEFT JOIN public.categories c ON t.category = c.name AND c.user_id = auth.uid()
  WHERE t.user_id = auth.uid()
    AND t.type = 'expense'
    AND t.date >= start_date
    AND t.date < end_date
  GROUP BY t.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Updated get_spending_trend with cycle_start_day
CREATE OR REPLACE FUNCTION public.get_spending_trend(month_str TEXT, cycle_start_day INT DEFAULT 1)
RETURNS TABLE (
  day_label TEXT,
  amount NUMERIC
) AS $$
DECLARE
  base_date TIMESTAMPTZ;
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
BEGIN
  base_date := month_str::TIMESTAMPTZ;
  start_date := date_trunc('month', base_date) + (cycle_start_day - 1 || ' days')::INTERVAL;
  end_date := start_date + INTERVAL '1 month';

  RETURN QUERY
  SELECT 
    to_char(date, 'Mon DD') AS day_label,
    SUM(t.amount) AS amount
  FROM public.transactions t
  WHERE t.user_id = auth.uid()
    AND t.type = 'expense'
    AND t.date >= start_date
    AND t.date < end_date
  GROUP BY to_char(date, 'Mon DD'), date::date
  ORDER BY date::date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Updated get_smart_insights to log warnings into notifications_history
CREATE OR REPLACE FUNCTION public.get_smart_insights(month_str TEXT)
RETURNS JSONB AS $$
DECLARE
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
  total_expenses NUMERIC;
  total_income NUMERIC;
  insights JSONB := '[]'::JSONB;
  insight JSONB;
BEGIN
  start_date := month_str::TIMESTAMPTZ;
  end_date := start_date + INTERVAL '1 month';

  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM public.transactions
  WHERE user_id = auth.uid() AND type = 'expense' AND date >= start_date AND date < end_date;

  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM public.transactions
  WHERE user_id = auth.uid() AND type = 'income' AND date >= start_date AND date < end_date;

  IF total_income > 0 AND total_expenses > total_income * 0.8 THEN
    insight := jsonb_build_object(
      'type', 'budget_warning',
      'title', 'Budget Threshold Warning',
      'message', format('Spending has passed 80%% of income ($%s spent of $%s income).', round(total_expenses, 2), round(total_income, 2))
    );
    insights := insights || jsonb_build_array(insight);

    -- Log into notifications_history table
    INSERT INTO public.notifications_history (user_id, type, title, message)
    VALUES (auth.uid(), 'budget_warning', 'Budget Threshold Warning', format('Spending has passed 80%% of income ($%s spent of $%s income).', round(total_expenses, 2), round(total_income, 2)));
  END IF;

  RETURN jsonb_build_object('insights', insights);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
