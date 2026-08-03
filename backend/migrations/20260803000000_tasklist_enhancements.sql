-- Migration: Task List Schema Enhancements
-- Date: 2026-08-03

-- 1. Add budget_limit to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS budget_limit NUMERIC DEFAULT NULL;

-- 2. Add reason_not_done & completion_time to tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS reason_not_done TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completion_time TIMESTAMPTZ DEFAULT NULL;

-- 3. Create budget_history table for storing salary and setting snapshots
CREATE TABLE IF NOT EXISTS public.budget_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    monthly_salary NUMERIC NOT NULL DEFAULT 0,
    savings_target_percent NUMERIC NOT NULL DEFAULT 0,
    fixed_expenses JSONB DEFAULT '[]'::jsonb,
    variable_expenses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on budget_history
ALTER TABLE public.budget_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budget history"
    ON public.budget_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function & Trigger to automatically log budget settings changes
CREATE OR REPLACE FUNCTION public.log_budget_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.budget_history (
        user_id,
        monthly_salary,
        savings_target_percent,
        fixed_expenses,
        variable_expenses
    ) VALUES (
        NEW.user_id,
        NEW.monthly_salary,
        NEW.savings_target_percent,
        NEW.fixed_expenses,
        NEW.variable_expenses
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_budget_settings ON public.budget_settings;
CREATE TRIGGER trigger_log_budget_settings
    AFTER INSERT OR UPDATE ON public.budget_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_budget_settings_change();

-- 4. Create notifications_history table for sync across devices
CREATE TABLE IF NOT EXISTS public.notifications_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'budget_warning', 'alarm', 'task_reminder'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NULL
);

-- Enable RLS on notifications_history
ALTER TABLE public.notifications_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications history"
    ON public.notifications_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
