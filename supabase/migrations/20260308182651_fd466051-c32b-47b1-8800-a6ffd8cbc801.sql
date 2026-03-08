
-- Notes & Resources table
CREATE TABLE public.notes_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'lecture_notes',
  subject text NOT NULL,
  semester text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notes_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes viewable by everyone" ON public.notes_resources FOR SELECT USING (true);
CREATE POLICY "Users can upload notes" ON public.notes_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes_resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes_resources FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_notes_resources_updated_at
  BEFORE UPDATE ON public.notes_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', true);

CREATE POLICY "Notes files publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'notes');
CREATE POLICY "Authenticated users can upload notes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own notes files" ON storage.objects FOR DELETE USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);
