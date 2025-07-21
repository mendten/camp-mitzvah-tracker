
-- Create sessions table for custom session periods
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create camper session stats table for tracking totals per session
CREATE TABLE public.camper_session_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camper_id TEXT NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  total_qualified_days INTEGER DEFAULT 0,
  total_missions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(camper_id, session_id)
);

-- Create rank thresholds table for customizable ranks
CREATE TABLE public.rank_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rank_name TEXT NOT NULL,
  missions_required INTEGER NOT NULL,
  qualified_days_required INTEGER NOT NULL,
  rank_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add session_id to submissions table
ALTER TABLE public.submissions 
ADD COLUMN session_id UUID REFERENCES public.sessions(id);

-- Enable RLS on new tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camper_session_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_thresholds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all operations
CREATE POLICY "Allow all operations on sessions" 
ON public.sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on camper_session_stats" 
ON public.camper_session_stats 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on rank_thresholds" 
ON public.rank_thresholds 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add update triggers
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_camper_session_stats_updated_at
  BEFORE UPDATE ON public.camper_session_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rank_thresholds_updated_at
  BEFORE UPDATE ON public.rank_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rank thresholds
INSERT INTO public.rank_thresholds (rank_name, missions_required, qualified_days_required, rank_order) VALUES
('Bronze', 50, 7, 1),
('Silver', 100, 14, 2),
('Gold', 200, 25, 3),
('Platinum', 350, 40, 4);

-- Create a default current session
INSERT INTO public.sessions (name, start_date, end_date, is_active) VALUES
('Current Session', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', true);
