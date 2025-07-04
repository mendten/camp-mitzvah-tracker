-- Create bunks table
CREATE TABLE public.bunks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create staff table
CREATE TABLE public.staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bunk_id TEXT NOT NULL REFERENCES public.bunks(id) ON DELETE CASCADE,
  access_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create campers table
CREATE TABLE public.campers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bunk_id TEXT NOT NULL REFERENCES public.bunks(id) ON DELETE CASCADE,
  access_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create missions table
CREATE TABLE public.missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id TEXT PRIMARY KEY,
  camper_id TEXT NOT NULL REFERENCES public.campers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  missions TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected', 'edit_requested')),
  submitted_at TIMESTAMPTZ NOT NULL,
  edit_request_reason TEXT,
  edit_requested_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(camper_id, date)
);

-- Create working_missions table (for in-progress missions)
CREATE TABLE public.working_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camper_id TEXT NOT NULL REFERENCES public.campers(id) ON DELETE CASCADE,
  missions TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(camper_id)
);

-- Create session_config table
CREATE TABLE public.session_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_session INTEGER NOT NULL DEFAULT 1 CHECK (current_session IN (1, 2)),
  current_week INTEGER NOT NULL DEFAULT 1,
  current_day INTEGER NOT NULL DEFAULT 1,
  session_lengths INTEGER[] NOT NULL DEFAULT '{4, 3}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (id = 1) -- Ensure only one row
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  daily_required_missions INTEGER NOT NULL DEFAULT 3,
  admin_password TEXT NOT NULL DEFAULT 'admin123',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (id = 1) -- Ensure only one row
);

-- Enable Row Level Security
ALTER TABLE public.bunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (we'll refine these later with authentication)
CREATE POLICY "Allow all operations on bunks" ON public.bunks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on campers" ON public.campers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on missions" ON public.missions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on working_missions" ON public.working_missions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on session_config" ON public.session_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_staff_bunk_id ON public.staff(bunk_id);
CREATE INDEX idx_campers_bunk_id ON public.campers(bunk_id);
CREATE INDEX idx_submissions_camper_id ON public.submissions(camper_id);
CREATE INDEX idx_submissions_date ON public.submissions(date);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_working_missions_camper_id ON public.working_missions(camper_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_bunks_updated_at BEFORE UPDATE ON public.bunks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campers_updated_at BEFORE UPDATE ON public.campers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_working_missions_updated_at BEFORE UPDATE ON public.working_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_session_config_updated_at BEFORE UPDATE ON public.session_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
-- Insert bunks
INSERT INTO public.bunks (id, name, display_name) VALUES
('kevutzah-alef', 'kevutzah-alef', 'Kevutzah Alef'),
('kevutzah-beis', 'kevutzah-beis', 'Kevutzah Beis'),
('kevutzah-gimmel', 'kevutzah-gimmel', 'Kevutzah Gimmel'),
('kevutzah-daled', 'kevutzah-daled', 'Kevutzah Daled'),
('kevutzah-hei', 'kevutzah-hei', 'Kevutzah Hei'),
('kevutzah-vov', 'kevutzah-vov', 'Kevutzah Vov');

-- Insert staff with secure codes
INSERT INTO public.staff (id, name, bunk_id, access_code) VALUES
('staff_a1', 'Mendy Zalmanov', 'kevutzah-alef', 'STF_MZ_A1_X9K2L5'),
('staff_b1', 'Moshe Young', 'kevutzah-beis', 'STF_MY_B1_R7H4M8'),
('staff_g1', 'Nosson Oster', 'kevutzah-gimmel', 'STF_NO_G1_P3Q6N1'),
('staff_d1', 'Dovi Cadaner', 'kevutzah-daled', 'STF_DC_D1_T5W9V2'),
('staff_h1', 'A B Stolik', 'kevutzah-hei', 'STF_AS_H1_L8F3K7'),
('staff_v1', 'Uziel Wagner', 'kevutzah-vov', 'STF_UW_V1_J6N4M9');

-- Insert campers with secure codes
INSERT INTO public.campers (id, name, bunk_id, access_code) VALUES
-- Kevutzah Alef
('camper_a1', 'Isaac Abergel', 'kevutzah-alef', 'ISAA27'),
('camper_a2', 'Tzvi Abergel', 'kevutzah-alef', 'TZAA84'),
('camper_a3', 'Mordy Bloom', 'kevutzah-alef', 'MOBA56'),
('camper_a4', 'Mendel Bortunk', 'kevutzah-alef', 'MEBA73'),
('camper_a5', 'Avremi Brody', 'kevutzah-alef', 'AVBA91'),
('camper_a6', 'Mordy Raksin', 'kevutzah-alef', 'MORA42'),
('camper_a7', 'Yossi Weiss', 'kevutzah-alef', 'YOWA68'),
('camper_a8', 'Shimon Myhill', 'kevutzah-alef', 'SHMA35'),
-- Kevutzah Beis
('camper_b1', 'Maor Fellig', 'kevutzah-beis', 'MAFB29'),
('camper_b2', 'JJ Fischweicher', 'kevutzah-beis', 'JJFB87'),
('camper_b3', 'Zalman Fischweicher', 'kevutzah-beis', 'ZAFB54'),
('camper_b4', 'Eli Levy', 'kevutzah-beis', 'ELLB76'),
('camper_b5', 'Tzvi Margolin', 'kevutzah-beis', 'TZMB13'),
('camper_b6', 'Shmuly Shagalov', 'kevutzah-beis', 'SHSB95'),
('camper_b7', 'Chaim Silberstein', 'kevutzah-beis', 'CHSB48'),
('camper_b8', 'Mendel Weic', 'kevutzah-beis', 'MEWB62'),
('camper_b9', 'Ari Wolff', 'kevutzah-beis', 'ARWB31'),
-- Kevutzah Gimmel
('camper_g1', 'Nachman Yosef Altein', 'kevutzah-gimmel', 'NAAG77'),
('camper_g2', 'Dovid Bedrick', 'kevutzah-gimmel', 'DOBG24'),
('camper_g3', 'Yaakov Friedman', 'kevutzah-gimmel', 'YAFG89'),
('camper_g4', 'Yanky Friedman', 'kevutzah-gimmel', 'YAFG56'),
('camper_g5', 'Yehuda Halilyan', 'kevutzah-gimmel', 'YEHG43'),
('camper_g6', 'Nachum Marcus', 'kevutzah-gimmel', 'NAMG71'),
('camper_g7', 'Shaya Naiditch', 'kevutzah-gimmel', 'SHNG18'),
('camper_g8', 'Tzvika Weinbaum', 'kevutzah-gimmel', 'TZWG65'),
('camper_g9', 'Yosef Dov Trojanowski', 'kevutzah-gimmel', 'YOTG92'),
-- Kevutzah Daled
('camper_d1', 'Daniel Braun', 'kevutzah-daled', 'DABD37'),
('camper_d2', 'Yoni Cotlar', 'kevutzah-daled', 'YOCD84'),
('camper_d3', 'Zalmy Epstein', 'kevutzah-daled', 'ZAED51'),
('camper_d4', 'Mendel Horowitz', 'kevutzah-daled', 'MEHD78'),
('camper_d5', 'Yisroel Reicher', 'kevutzah-daled', 'YIRD25'),
('camper_d6', 'Shmuli Smith', 'kevutzah-daled', 'SHSD69'),
('camper_d7', 'Michai Weiss', 'kevutzah-daled', 'MIWD42'),
('camper_d8', 'Alan Grimberg', 'kevutzah-daled', 'ALGD16'),
-- Kevutzah Hei
('camper_h1', 'Shiloh Menachem Abarbanel', 'kevutzah-hei', 'SHAH83'),
('camper_h2', 'Mordechai Barouk', 'kevutzah-hei', 'MOBH57'),
('camper_h3', 'Menachem Mendel Hankin', 'kevutzah-hei', 'MEHH94'),
('camper_h4', 'Schneur Zalman Kaplan', 'kevutzah-hei', 'SCKH21'),
('camper_h5', 'Eliyahu Chaim Kroker', 'kevutzah-hei', 'ELKH68'),
('camper_h6', 'Ben Nachlas', 'kevutzah-hei', 'BENH35'),
('camper_h7', 'Yacov Tawil', 'kevutzah-hei', 'YATH72'),
('camper_h8', 'Shmuly Teitelbaum', 'kevutzah-hei', 'SHTH49'),
('camper_h9', 'Benyamin Young', 'kevutzah-hei', 'BEYH86'),
-- Kevutzah Vov
('camper_v1', 'Dovber Chakoff', 'kevutzah-vov', 'DOCHV23'),
('camper_v2', 'Yehuda Jacobowitz', 'kevutzah-vov', 'YEJV91'),
('camper_v3', 'Mendel Khaytin', 'kevutzah-vov', 'MEKV58'),
('camper_v4', 'Yehuda Levin', 'kevutzah-vov', 'YELV75'),
('camper_v5', 'Shmuly Pliskin', 'kevutzah-vov', 'SHPV42'),
('camper_v6', 'Yaakov Posner', 'kevutzah-vov', 'YAPV17'),
('camper_v7', 'Binyomin Press', 'kevutzah-vov', 'BIPV64'),
('camper_v8', 'Shneur Zalman Rosenfeld', 'kevutzah-vov', 'SHRV39');

-- Insert default missions
INSERT INTO public.missions (id, title, type, icon, is_mandatory, is_active, sort_order) VALUES
('modeh-ani', 'Modeh ani', 'prayer', '🌅', true, true, 1),
('vaaser', 'Negal Vaaser', 'ritual', '💧', true, true, 2),
('brachos-krias-shema', 'Brachos/Krias Shema in morning', 'prayer', '📜', true, true, 3),
('krias-shema-night', 'Krias Shema/Chesbon Hanefesh at night', 'prayer', '🌙', true, true, 4),
('sleep-yarmulka-tzitzis', 'Sleep with yarmulka and tzitzis', 'mitzvah', '🛏️', true, true, 5),
('mikvah', 'Mikvah', 'ritual', '🏊', false, true, 6);

-- Insert session config
INSERT INTO public.session_config (current_session, current_week, current_day, session_lengths) 
VALUES (1, 2, 3, '{4, 3}');

-- Insert system settings
INSERT INTO public.system_settings (daily_required_missions, admin_password) 
VALUES (3, 'admin123');