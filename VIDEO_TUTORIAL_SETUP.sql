-- VIDEO TUTORIAL SYSTEM - SUPABASE SETUP

-- ============================================================================
-- 1. CREATE VIDEO CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.video_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_video_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER video_categories_updated_at_trigger
BEFORE UPDATE ON public.video_categories
FOR EACH ROW
EXECUTE FUNCTION update_video_categories_updated_at();

-- ============================================================================
-- 2. CREATE VIDEOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.video_categories(id) ON DELETE CASCADE,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS videos_category_id_idx ON public.videos(category_id);
CREATE INDEX IF NOT EXISTS videos_published_idx ON public.videos(published);
CREATE INDEX IF NOT EXISTS videos_created_by_idx ON public.videos(created_by);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON public.videos(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER videos_updated_at_trigger
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION update_videos_updated_at();

-- ============================================================================
-- 3. INSERT DEFAULT VIDEO CATEGORIES
-- ============================================================================

INSERT INTO public.video_categories (name, description) VALUES
('Bot Installation', 'How to install and set up trading bots'),
('Bot Setup', 'Configuring bot parameters and settings'),
('MT4/MT5 Tutorials', 'MetaTrader 4/5 platform tutorials'),
('Account Setup', 'Setting up your trading account'),
('Trading Tutorials', 'Trading strategies and techniques'),
('Payment Tutorials', 'Payment methods and processing'),
('General Tutorials', 'General platform features and tips')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES FOR VIDEO_CATEGORIES
-- ============================================================================

-- Public: Everyone can read published content (no policy needed - defaults to allow)
-- Admin: Can read all categories
CREATE POLICY "Admin can read all video categories"
ON public.video_categories FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- Admin: Can create categories
CREATE POLICY "Admin can create video categories"
ON public.video_categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- Admin: Can update categories
CREATE POLICY "Admin can update video categories"
ON public.video_categories FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- Admin: Can delete categories
CREATE POLICY "Admin can delete video categories"
ON public.video_categories FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- 6. RLS POLICIES FOR VIDEOS
-- ============================================================================

-- Public: Everyone can read published videos (no auth required)
CREATE POLICY "Anyone can view published videos"
ON public.videos FOR SELECT
USING (published = true);

-- Authenticated: Admins can read all videos (published and unpublished)
CREATE POLICY "Admin can read all videos"
ON public.videos FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- Admin: Can create videos
CREATE POLICY "Admin can create videos"
ON public.videos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  AND created_by = auth.uid()
);

-- Admin: Can update their videos
CREATE POLICY "Admin can update videos"
ON public.videos FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- Admin: Can delete videos
CREATE POLICY "Admin can delete videos"
ON public.videos FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- 7. SUPABASE STORAGE BUCKETS
-- ============================================================================
-- Note: Run these commands in Supabase dashboard or use Supabase CLI

-- Create buckets:
-- - videos-content (for video files)
-- - video-thumbnails (for thumbnail images)

-- Both buckets should be PRIVATE (not public)

-- ============================================================================
-- 8. STORAGE RLS POLICIES
-- ============================================================================
-- Note: Configure these in Supabase Storage > Policies section

-- Videos bucket policies:
-- SELECT: Admin can download: (auth.uid() in (select id from public.users where is_admin = true))
-- INSERT: Admin can upload: (auth.uid() in (select id from public.users where is_admin = true))
-- UPDATE: Admin can update: (auth.uid() in (select id from public.users where is_admin = true))
-- DELETE: Admin can delete: (auth.uid() in (select id from public.users where is_admin = true))

-- Thumbnails bucket policies:
-- SELECT: Admin can download: (auth.uid() in (select id from public.users where is_admin = true))
-- INSERT: Admin can upload: (auth.uid() in (select id from public.users where is_admin = true))
-- UPDATE: Admin can update: (auth.uid() in (select id from public.users where is_admin = true))
-- DELETE: Admin can delete: (auth.uid() in (select id from public.users where is_admin = true))

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables created:
-- SELECT * FROM public.video_categories;
-- SELECT * FROM public.videos;

-- Check default categories:
-- SELECT COUNT(*) FROM public.video_categories;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN ('video_categories', 'videos');
