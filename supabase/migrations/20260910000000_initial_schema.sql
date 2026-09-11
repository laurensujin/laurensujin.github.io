-- ============================================================================
-- Sujin Lee portfolio - initial database schema
--
-- Run this whole file once in the Supabase SQL editor (or with `supabase db push`).
-- It creates every table, the security rules (Row Level Security), the storage
-- bucket for uploads, and the helper functions the app relies on.
--
-- Content model in one paragraph:
--   * `projects` holds what visitors see (the LIVE content, as JSON).
--   * `project_drafts` holds what you are editing in /admin. Pressing
--     "Publish" copies the draft into `projects`.
--   * `photography_sets`, `profile`, `education`, `social_links`,
--     `site_settings` and `resume_files` are small flat tables.
--   * `media` is the index of everything uploaded to the storage bucket.
--   * `admins` lists which logged-in users may edit content.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- Keeps `updated_at` accurate on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Admins
-- ----------------------------------------------------------------------------

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A logged-in user may see their own admin row (used by the app to check access).
create policy "Users can read their own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- True when the current request comes from an administrator.
-- SECURITY DEFINER lets the function read `admins` regardless of RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- The very first account created in Supabase Auth automatically becomes the
-- administrator. Additional admins can be added with:
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'someone@example.com';
create or replace function public.handle_first_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins (user_id, email) values (new.id, new.email);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_first_admin();

-- ----------------------------------------------------------------------------
-- Media library (index of files in the `media` storage bucket)
-- ----------------------------------------------------------------------------

create table public.media (
  id                uuid primary key default gen_random_uuid(),
  path              text not null unique,          -- path inside the `media` bucket
  kind              text not null check (kind in ('image', 'video', 'pdf')),
  mime_type         text not null,
  size_bytes        bigint not null default 0,
  width             integer,                       -- images/videos only
  height            integer,
  sizes             integer[] not null default '{}', -- widths of the resized copies (-w480.jpg, ...)
  title             text not null default '',      -- display title in the library
  alt_text          text not null default '',      -- default alt text for images
  original_filename text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index media_created_at_idx on public.media (created_at desc);
create index media_kind_idx on public.media (kind);

create trigger media_set_updated_at
  before update on public.media
  for each row execute function public.set_updated_at();

alter table public.media enable row level security;

create policy "Anyone can read media records"
  on public.media for select
  to anon, authenticated
  using (true);

create policy "Admins can insert media"
  on public.media for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update media"
  on public.media for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete media"
  on public.media for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Site settings (exactly one row, id = 1)
-- ----------------------------------------------------------------------------

create table public.site_settings (
  id                      integer primary key default 1 check (id = 1),
  site_name               text not null default 'Sujin Lee',
  hero_headline           text not null default '',
  hero_description        text not null default '',
  hero_location           text not null default '',
  hero_cta_label          text not null default 'Selected Work',
  hero_ticker             text not null default '',  -- disciplines shown in the moving line, separated by ·
  selected_work_label     text not null default 'Selected Work',
  photography_label       text not null default 'Portrait',
  photography_subtitle    text not null default '',
  photography_description text not null default '',
  footer_location         text not null default '',
  footer_copyright        text not null default '',
  footer_credit           text not null default '',
  contact_email           text not null default '',
  seo_title               text not null default '',
  seo_description         text not null default '',
  og_image                jsonb,                    -- media reference or null
  favicon                 jsonb,                    -- media reference or null
  hero_image              jsonb,                    -- media reference or null (landing visual)
  -- Bumped whenever something public changes. The GitHub Actions workflow
  -- compares it with the last build to decide whether to rebuild the site.
  content_updated_at      timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Profile drawer content (exactly one row, id = 1)
-- ----------------------------------------------------------------------------

create table public.profile (
  id         integer primary key default 1 check (id = 1),
  name       text not null default '',
  title      text not null default '',              -- e.g. "Marketing · Brand · Product"
  location   text not null default '',
  about      text not null default '',
  image      jsonb,                                 -- media reference or null
  updated_at timestamptz not null default now()
);

create trigger profile_set_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

alter table public.profile enable row level security;

create policy "Anyone can read the profile"
  on public.profile for select
  to anon, authenticated
  using (true);

create policy "Admins can manage the profile"
  on public.profile for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table public.education (
  id         uuid primary key default gen_random_uuid(),
  school     text not null default '',
  college    text not null default '',
  degree     text not null default '',
  major      text not null default '',
  graduation text not null default '',              -- free text, e.g. "Expected May 2027"
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger education_set_updated_at
  before update on public.education
  for each row execute function public.set_updated_at();

alter table public.education enable row level security;

create policy "Anyone can read education"
  on public.education for select
  to anon, authenticated
  using (true);

create policy "Admins can manage education"
  on public.education for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table public.social_links (
  id              uuid primary key default gen_random_uuid(),
  label           text not null default '',
  url             text not null default '',         -- empty = not shown publicly yet
  kind            text not null default 'other'
                  check (kind in ('linkedin', 'instagram', 'email', 'github', 'website', 'other')),
  show_in_profile boolean not null default true,
  show_in_footer  boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger social_links_set_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

alter table public.social_links enable row level security;

create policy "Anyone can read social links"
  on public.social_links for select
  to anon, authenticated
  using (true);

create policy "Admins can manage social links"
  on public.social_links for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Projects (live content) and drafts (work in progress)
-- ----------------------------------------------------------------------------

create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  status       text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  content      jsonb not null default '{}'::jsonb,  -- LIVE content (title, blocks, ...)
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index projects_status_order_idx on public.projects (status, sort_order);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Visitors only ever see published projects.
create policy "Anyone can read published projects"
  on public.projects for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can manage projects"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table public.project_drafts (
  project_id uuid primary key references public.projects (id) on delete cascade,
  content    jsonb not null default '{}'::jsonb,    -- DRAFT content being edited
  updated_at timestamptz not null default now()
);

create trigger project_drafts_set_updated_at
  before update on public.project_drafts
  for each row execute function public.set_updated_at();

alter table public.project_drafts enable row level security;

-- Drafts are private: only admins can read or write them.
create policy "Admins can manage project drafts"
  on public.project_drafts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Atomically apply a new order. `ids` is the full list of project ids in the
-- desired order; each gets sort_order 1, 2, 3, ...
create or replace function public.reorder_projects(ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.projects p
     set sort_order = u.ord
    from unnest(ids) with ordinality as u (id, ord)
   where p.id = u.id;
$$;

-- ----------------------------------------------------------------------------
-- Photography sets (before / after pairs)
-- ----------------------------------------------------------------------------

create table public.photography_sets (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null default '',
  caption             text not null default '',
  before_image        jsonb,                         -- media reference or null
  after_image         jsonb,                         -- media reference or null
  photographer_credit text not null default '',
  retouching_credit   text not null default '',
  status              text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index photography_sets_status_order_idx on public.photography_sets (status, sort_order);

create trigger photography_sets_set_updated_at
  before update on public.photography_sets
  for each row execute function public.set_updated_at();

alter table public.photography_sets enable row level security;

create policy "Anyone can read published photography sets"
  on public.photography_sets for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can manage photography sets"
  on public.photography_sets for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.reorder_photography_sets(ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.photography_sets p
     set sort_order = u.ord
    from unnest(ids) with ordinality as u (id, ord)
   where p.id = u.id;
$$;

-- ----------------------------------------------------------------------------
-- Resume PDFs (the active one is linked from the profile drawer)
-- ----------------------------------------------------------------------------

create table public.resume_files (
  id         uuid primary key default gen_random_uuid(),
  path       text not null unique,                  -- path inside the `media` bucket
  filename   text not null,
  size_bytes bigint not null default 0,
  is_active  boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only one resume can be active at a time.
create unique index resume_files_single_active_idx
  on public.resume_files (is_active)
  where is_active;

alter table public.resume_files enable row level security;

create policy "Anyone can read the active resume"
  on public.resume_files for select
  to anon, authenticated
  using (is_active);

create policy "Admins can manage resume files"
  on public.resume_files for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Private admin settings (never readable by visitors)
-- ----------------------------------------------------------------------------

create table public.admin_settings (
  id           integer primary key default 1 check (id = 1),
  github_repo  text not null default '',   -- e.g. laurensujin/laurensujin.github.io
  github_token text not null default '',   -- fine-grained token used to trigger site rebuilds
  updated_at   timestamptz not null default now()
);

create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at();

alter table public.admin_settings enable row level security;

create policy "Admins can manage admin settings"
  on public.admin_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage bucket for all uploads (images, videos, PDFs)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,                     -- files are readable by anyone with the link
  52428800,                 -- 50 MB per file
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can read media files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "Admins can upload media files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "Admins can update media files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "Admins can delete media files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ----------------------------------------------------------------------------
-- Default rows for the single-row tables so the app always has something to read.
-- (seed.sql fills in the real starter copy.)
-- ----------------------------------------------------------------------------

insert into public.site_settings (id) values (1) on conflict (id) do nothing;
insert into public.profile (id) values (1) on conflict (id) do nothing;
insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Table privileges. Row Level Security (above) still decides which rows each
-- role can touch; these grants only make the tables reachable through the API.
-- ----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.media,
  public.site_settings,
  public.profile,
  public.education,
  public.social_links,
  public.projects,
  public.photography_sets,
  public.resume_files
to anon, authenticated;

grant insert, update, delete on
  public.media,
  public.site_settings,
  public.profile,
  public.education,
  public.social_links,
  public.projects,
  public.photography_sets,
  public.resume_files
to authenticated;

grant select, insert, update, delete on public.project_drafts to authenticated;
grant select, insert, update, delete on public.admin_settings to authenticated;
grant select on public.admins to authenticated;

grant execute on function public.reorder_projects(uuid[]) to authenticated;
grant execute on function public.reorder_photography_sets(uuid[]) to authenticated;

-- The service role (used only by Supabase's own tooling and the optional
-- scripts/create-admin.mjs helper, never by the website) gets full access.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
