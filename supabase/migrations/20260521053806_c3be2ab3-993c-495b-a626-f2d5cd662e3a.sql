
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT,
  location TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'system',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile, location, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Farms
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_acres NUMERIC,
  soil_type TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own farms select" ON public.farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own farms insert" ON public.farms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own farms update" ON public.farms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own farms delete" ON public.farms FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_farms_updated BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Crops
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crop_type TEXT,
  plantation_date DATE,
  expected_harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own crops select" ON public.crops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own crops insert" ON public.crops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own crops update" ON public.crops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own crops delete" ON public.crops FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_crops_updated BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Disease reports
CREATE TABLE public.disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  disease_name TEXT,
  severity TEXT,
  causes TEXT,
  solutions TEXT,
  prevention TEXT,
  recommendations TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports select" ON public.disease_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own reports insert" ON public.disease_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reports delete" ON public.disease_reports FOR DELETE USING (auth.uid() = user_id);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tasks insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own tasks update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own tasks delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notif select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own notif insert" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notif update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own notif delete" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Chat history
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat select" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own chat insert" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own chat delete" ON public.chat_history FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_farms_user ON public.farms(user_id);
CREATE INDEX idx_crops_user ON public.crops(user_id);
CREATE INDEX idx_tasks_user ON public.tasks(user_id);
CREATE INDEX idx_reports_user ON public.disease_reports(user_id);
CREATE INDEX idx_notif_user ON public.notifications(user_id);
CREATE INDEX idx_chat_user ON public.chat_history(user_id, created_at);

-- Storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true);

CREATE POLICY "public read crop images" ON storage.objects FOR SELECT USING (bucket_id = 'crop-images');
CREATE POLICY "users upload own crop images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users delete own crop images" ON storage.objects FOR DELETE
  USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
