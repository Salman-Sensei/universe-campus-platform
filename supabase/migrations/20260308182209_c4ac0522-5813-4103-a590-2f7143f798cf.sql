
-- Create marketplace_listings table
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'other',
  image_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Listings viewable by everyone" ON public.marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Users can create own listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for marketplace images
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace', 'marketplace', true);

-- Storage policies
CREATE POLICY "Marketplace images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace');
CREATE POLICY "Authenticated users can upload marketplace images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own marketplace images" ON storage.objects FOR DELETE USING (bucket_id = 'marketplace' AND auth.uid()::text = (storage.foldername(name))[1]);
