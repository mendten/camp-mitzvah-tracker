-- Add timezone configuration to system_settings table
ALTER TABLE public.system_settings 
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/New_York';

-- Update the existing row to have the timezone
UPDATE public.system_settings 
SET timezone = 'America/New_York' 
WHERE id = 1;