
-- Reputation system table
CREATE TABLE public.user_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  points integer NOT NULL DEFAULT 0,
  posts_count integer NOT NULL DEFAULT 0,
  likes_received integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  badge text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- Everyone can view reputation
CREATE POLICY "Reputation is viewable by everyone"
ON public.user_reputation FOR SELECT
USING (true);

-- Users can insert their own reputation
CREATE POLICY "Users can insert own reputation"
ON public.user_reputation FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reputation
CREATE POLICY "Users can update own reputation"
ON public.user_reputation FOR UPDATE
USING (auth.uid() = user_id);

-- Function to recalculate reputation
CREATE OR REPLACE FUNCTION public.recalculate_reputation(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p_count integer;
  l_received integer;
  c_count integer;
  total_points integer;
  computed_badge text;
BEGIN
  SELECT COUNT(*) INTO p_count FROM public.posts WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO l_received FROM public.likes l JOIN public.posts p ON l.post_id = p.id WHERE p.user_id = target_user_id;
  SELECT COUNT(*) INTO c_count FROM public.comments WHERE user_id = target_user_id;

  total_points := (p_count * 10) + (l_received * 5) + (c_count * 3);

  IF total_points >= 500 THEN computed_badge := 'Top Contributor';
  ELSIF total_points >= 200 THEN computed_badge := 'Helpful Student';
  ELSIF total_points >= 50 THEN computed_badge := 'Active Member';
  ELSE computed_badge := NULL;
  END IF;

  INSERT INTO public.user_reputation (user_id, points, posts_count, likes_received, comments_count, badge)
  VALUES (target_user_id, total_points, p_count, l_received, c_count, computed_badge)
  ON CONFLICT (user_id)
  DO UPDATE SET
    points = EXCLUDED.points,
    posts_count = EXCLUDED.posts_count,
    likes_received = EXCLUDED.likes_received,
    comments_count = EXCLUDED.comments_count,
    badge = EXCLUDED.badge,
    updated_at = now();
END;
$$;
