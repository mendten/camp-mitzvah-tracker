-- Phase 1: Add Eliyahu Zavdi to kevutzah-alef
INSERT INTO public.campers (id, name, bunk_id, access_code) 
VALUES ('camper_eliyahu_zavdi', 'Eliyahu Zavdi', 'kevutzah-alef', 'ELZVA76');

-- Ensure we have the bunk in the bunks table
INSERT INTO public.bunks (id, name, display_name) 
VALUES ('kevutzah-alef', 'kevutzah-alef', 'Kevutzah Alef') 
ON CONFLICT (id) DO NOTHING;