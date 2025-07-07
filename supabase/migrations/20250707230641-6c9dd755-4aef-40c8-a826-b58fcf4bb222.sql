
-- Add daily_reset_hour column to system_settings table
ALTER TABLE public.system_settings 
ADD COLUMN daily_reset_hour integer NOT NULL DEFAULT 5;

-- Update the existing row to have the 5 AM reset time
UPDATE public.system_settings 
SET daily_reset_hour = 5 
WHERE id = 1;
