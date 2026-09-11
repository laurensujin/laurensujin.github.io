# Sujin Lee - Portfolio & Admin CMS

An editorial portfolio website with a private admin area at `/admin`. Every word, image, project and photo set on the public site is edited in the admin and stored in Supabase. Nothing needs to be changed in code to update the portfolio.

- **Public site:** Next.js (App Router) + Tailwind CSS. Serif/sans editorial design, light and dark mode, responsive.
- **Content:** Supabase Postgres (with Row Level Security), Supabase Storage for images, videos and PDFs, Supabase Auth for the admin login.
- **Hosting:** Vercel.

---

## How it is organised

```
src/
  app/
    (site)/            Public pages: homepage, /work/[slug], draft preview
    admin/             Admin area (login, dashboard, editors)
    auth/callback/     Handles password-reset links from Supabase emails
    layout.tsx         Fonts, colour theme, site metadata
  components/
    site/              Public components (Header, Hero, ProjectPreview, CaseStudy,
                       blocks/, ProfileDrawer, BeforeAfterSlider, Lightbox, Footer)
    admin/             Admin components (ProjectEditor, blocks/BlockEditor,
                       MediaUploader, MediaPicker, MediaLibrary, ...)
  lib/
    content/           The project content model (schema.ts) and block list (blocks.ts)
    data/              Read functions: public.ts (visitors) and admin.ts (signed in)
    actions/           Server actions that write to Supabase (projects, media, ...)
    media/             Upload pipeline (upload.ts) and storage URL helper
    supabase/          Supabase clients (server, browser, public) and generated types
  proxy.ts             Sends people who are not signed in away from /admin
supabase/
  migrations/          The database schema (tables, security rules, storage bucket)
  seed.sql             Starter content (generated from scripts/generate-seed.mjs)
e2e/                   Playwright end-to-end tests
scripts/               create-admin.mjs, generate-seed.mjs
```

**How content flows.** Each project has two copies of its content: a **draft** (what you edit) and a **live** version (what visitors see). *Save draft* keeps your work private, *Preview draft* shows it as a real page, *Publish* copies the draft to the live site. Photo sets, the profile, the homepage copy and the settings go live as soon as you save them.

**Security.** Visitors use the public "anon" key, and the database's Row Level Security rules only let it read published content. Only accounts listed in the `admins` table can create, edit, delete or upload anything. The `service_role` key is never used by the app.

---

## Setup, step by step

You need a free account at [supabase.com](https://supabase.com), [github.com](https://github.com) and [vercel.com](https://vercel.com), plus [Node.js](https://nodejs.org) (version 20 or newer) installed on your computer.

### 1. Create the Supabase project

1. Sign in to Supabase and click **New project**.
2. Choose a name (for example `portfolio`), set a database password (save it somewhere safe; you rarely need it), and pick the region closest to you.
3. Wait a minute for the project to be ready.

### 2. Create the database tables

1. In the Supabase dashboard open **SQL Editor** (left sidebar).
2. Open the file `supabase/migrations/20260910000000_initial_schema.sql` from this project, copy **all** of it, paste it into the editor and press **Run**. This creates every table, the security rules, the storage bucket and the helper functions.
3. Now open `supabase/seed.sql`, copy all of it, paste and **Run**. This adds the starter content (the four projects, the profile text and the homepage copy). Run it only once.

### 3. Enable Row Level Security

The SQL you just ran already turned Row Level Security on for every table and created the rules. You can confirm it under **Table Editor**: each table shows an "RLS enabled" badge. Nothing else to do.

### 4. Create the storage bucket

Also done by the SQL: a public bucket named `media` with a 50 MB per-file limit. Check it under **Storage** in the sidebar. If it is missing, click **New bucket**, name it `media`, and tick **Public bucket**.

### 5. Create the admin account

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter your email and a strong password (at least 8 characters) and tick **Auto confirm user**.
3. The **first account created automatically becomes the administrator** (a database trigger adds it to the `admins` table).
4. Now go to **Authentication → Sign In / Providers → Email** and turn **off** "Allow new users to sign up". This makes sure nobody else can create an account.

To add a second administrator later, create the user the same way and then run this in the SQL Editor:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'other@example.com';
```

### 6. Add the environment variables

1. In Supabase go to **Project Settings → API**. You need two values: the **Project URL** and the **anon public** key (called the "publishable" key in newer dashboards; either works).
2. In this project, copy `.env.example` to a new file named `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never paste the `service_role` key anywhere in this project.

### 7. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin> for the admin. Sign in with the account from step 5.

### 8. Connect GitHub

The project is already connected to the private repository `laurensujin/laurensujin.github.io` on GitHub. To send new code changes there (content changes never need this):

```bash
git add .
git commit -m "Describe the change"
git push
```

Note: the repository is named like a GitHub Pages site, but this app needs a server (login, uploads, publishing), so it cannot be hosted by GitHub Pages. GitHub only stores the code; the website runs on Vercel (next step).

### 9. Deploy to Vercel

1. In Vercel click **Add New → Project** and import the GitHub repository.
2. Framework preset: **Next.js** (detected automatically).
3. Open **Environment Variables** and add the same three variables as in step 6. For `NEXT_PUBLIC_SITE_URL` use the address Vercel gives you (for example `https://portfolio-xyz.vercel.app`); update it again after step 10.
4. Click **Deploy**. After a minute the site is live.
5. Back in Supabase, go to **Authentication → URL Configuration**: set **Site URL** to your Vercel address and add `https://your-address/**` to **Redirect URLs**. This makes password-reset emails link to the right place.

Every later push to GitHub redeploys the site automatically. Content changes do **not** need a redeploy.

### 10. Connect a custom domain

1. In Vercel open the project → **Settings → Domains → Add** and type your domain (for example `sujinlee.com`).
2. Vercel shows the DNS records to add at the place where you bought the domain (usually an `A` record and a `CNAME` for `www`). Add them and wait for Vercel to show a green check (can take up to an hour).
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel to `https://sujinlee.com` and redeploy (Deployments → ⋯ → Redeploy).
4. Update the Site URL and Redirect URLs in Supabase (step 9.5) to the new domain.

### 11. Log in to /admin

Go to `https://your-domain/admin`, enter the email and password from step 5. Forgot the password? Use **Forgot password?** on the login page; the email link brings you to a page where you set a new one.

### 12. Update the portfolio later

1. Open `/admin` and sign in.
2. **Projects** → click a project. Change text, upload images into any section (drag files straight onto an image slot), add sections with **Add section**, drag the ⋮⋮ handle to reorder.
3. Press **Save draft** whenever you like, **Preview draft** to see it, and **Publish** when it is ready. The live site updates within seconds.
4. **Photography** → **Add Photo Set** for new before/after pairs. **Profile**, **Homepage**, **Resume** and **Settings** work the same way and go live on save.
5. **Media Library** shows every image, video and PDF uploaded into projects, photo sets and settings (resume PDFs are managed under **Resume**). Deleting a file that is still used somewhere warns you first and removes it from those places.

---

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site locally at <http://localhost:3000> |
| `npm run build` | Production build (Vercel runs this for you) |
| `npm run lint` | Check the code with ESLint |
| `npm run typecheck` | Check TypeScript types |
| `npm run test:e2e` | Run the end-to-end tests (needs the local Supabase stack, see below) |
| `npm run seed:generate` | Rebuild `supabase/seed.sql` from `scripts/generate-seed.mjs` |

## Developing with a local Supabase (optional)

For development without touching the real project you can run Supabase on your computer with Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npm run db:start                       # starts Postgres, Auth, Storage locally and applies migrations + seed
npm run admin:create you@example.com your-password   # creates the local admin account
npm run db:types                       # regenerate src/lib/supabase/database.types.ts after schema changes
npm run db:reset                       # wipe and re-seed the local database
npm run db:stop                        # stop the local stack
```

`npm run db:start` prints the local API URL and anon key; put those in `.env.local` while developing locally. Password-reset emails sent by the local stack can be read at the Mailpit URL it prints. Because the local stack lives on `127.0.0.1`, `next.config.ts` enables `images.dangerouslyAllowLocalIP` during `next dev` only; production builds keep the default protection.

The end-to-end tests (`npm run test:e2e`) reset the local database, create the admin account, and drive the real site and admin in a browser: login, creating and publishing a project with uploaded images, reordering sections with the keyboard, publishing a photo set and using the lightbox, uploading a resume, editing the homepage, deleting used media, and unpublishing.

## Changing the content model

- Block types live in `src/lib/content/schema.ts` (shape) and `src/lib/content/blocks.ts` (labels and defaults). Rendering is in `src/components/site/blocks/BlockRenderer.tsx`, editing in `src/components/admin/blocks/BlockFields.tsx`.
- Adding a field to a block or project means: add it to the schema with a `.catch()` default, render it, and add an input for it. Old content keeps working because missing fields fall back to their defaults.
- Database changes go in a new file under `supabase/migrations/`; run it in the SQL Editor on the hosted project the same way as in step 2.

## Notes on images

Uploads go straight from the browser to Supabase Storage with a progress bar. Images wider or taller than 3000 px are resized in the browser before upload (PNG stays PNG, photos become high-quality JPEG) so the site never stores giant raw files. On the public site every image is served through `next/image`, which delivers a resized AVIF/WebP version for each screen size. Files keep their quality; visitors simply never download more pixels than they need.
