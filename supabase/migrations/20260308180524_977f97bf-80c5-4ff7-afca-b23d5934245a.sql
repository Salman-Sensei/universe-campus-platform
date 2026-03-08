
-- Confessions table (anonymous posts)
CREATE TABLE public.confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Confessions are viewable by everyone" ON public.confessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create confessions" ON public.confessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own confessions" ON public.confessions
  FOR DELETE USING (auth.uid() = user_id);

-- Confession reactions
CREATE TABLE public.confession_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL DEFAULT '❤️',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(confession_id, user_id, reaction)
);

ALTER TABLE public.confession_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone" ON public.confession_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react" ON public.confession_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.confession_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Confession comments
CREATE TABLE public.confession_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.confession_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Confession comments viewable by everyone" ON public.confession_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment on confessions" ON public.confession_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own confession comments" ON public.confession_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Non-expired stories are viewable by everyone" ON public.stories
  FOR SELECT USING (expires_at > now());

CREATE POLICY "Authenticated users can create stories" ON public.stories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Add founder_badge column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS founder_badge boolean DEFAULT false;
