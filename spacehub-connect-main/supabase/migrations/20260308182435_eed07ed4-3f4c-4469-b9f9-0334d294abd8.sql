
-- Study requests table
CREATE TABLE public.study_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  semester text,
  description text NOT NULL,
  time_available text NOT NULL,
  max_partners integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Study request participants (join table)
CREATE TABLE public.study_request_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.study_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_request_participants ENABLE ROW LEVEL SECURITY;

-- Study requests policies
CREATE POLICY "Study requests viewable by everyone" ON public.study_requests FOR SELECT USING (true);
CREATE POLICY "Users can create study requests" ON public.study_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study requests" ON public.study_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study requests" ON public.study_requests FOR DELETE USING (auth.uid() = user_id);

-- Participants policies
CREATE POLICY "Participants viewable by everyone" ON public.study_request_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join" ON public.study_request_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.study_request_participants FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_study_requests_updated_at
  BEFORE UPDATE ON public.study_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
