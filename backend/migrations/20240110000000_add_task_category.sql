-- Add category column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category text DEFAULT 'Personal';
