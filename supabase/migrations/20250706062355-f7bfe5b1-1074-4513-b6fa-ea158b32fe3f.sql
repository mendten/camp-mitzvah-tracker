-- Phase 4: Create week/session point tracking tables
CREATE TABLE IF NOT EXISTS public.camper_weekly_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camper_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  total_points INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(camper_id, week_number, session_number)
);

-- Enable RLS
ALTER TABLE public.camper_weekly_points ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow all operations on camper_weekly_points" 
ON public.camper_weekly_points 
FOR ALL 
USING (true);

-- Phase 5: Fix the update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update trigger for camper_weekly_points
CREATE TRIGGER update_camper_weekly_points_updated_at
  BEFORE UPDATE ON public.camper_weekly_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some initial session configuration if not exists
INSERT INTO public.session_config (id, current_week, current_session, current_day, session_lengths) 
VALUES (1, 1, 1, 1, ARRAY[4, 3]) 
ON CONFLICT (id) DO NOTHING;