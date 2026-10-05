-- ============================================================================
-- Drop site_settings.content_updated_at
--
-- Run this file once in the Supabase SQL editor (or with `supabase db push`).
--
-- A scheduled GitHub Actions job used to compare this timestamp with the last
-- build every 15 minutes to decide whether to rebuild the site. The admin now
-- asks GitHub to rebuild whenever something is published, so nothing reads or
-- writes the column any more.
-- ============================================================================

alter table public.site_settings drop column content_updated_at;
