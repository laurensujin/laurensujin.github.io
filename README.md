# Sujin Lee - Portfolio & Admin CMS

An editorial portfolio website with a private admin area at `/admin`. Every word, image, project and photo set on the public site is edited in the admin and stored in Supabase. Nothing needs to be changed in code to update the portfolio.

- **Public site:** Next.js (App Router) + Tailwind CSS, exported as static files. Serif/sans editorial design, light and dark mode, responsive.
- **Content:** Supabase Postgres (with Row Level Security), Supabase Storage for images, videos and PDFs, Supabase Auth for the admin login. The admin runs entirely in the browser and talks to Supabase directly.
- **Hosting:** GitHub Pages, built and published by the GitHub Actions workflow in `.github/workflows/deploy.yml`.

---

## How it is organised

```
src/
  app/
    (site)/            Public pages: homepage, /work/[slug], draft preview (/admin/preview/?id=…)
    admin/             Admin area (login, dashboard, editors), rendered in the browser
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
    actions/           Functions that write to Supabase from the admin (projects, media, ...)
    auth-client.ts     Sign-in state and the admin guard used by every admin page
    deploy.ts          Tells GitHub to rebuild the site after publishing
    media/             Upload pipeline with resized copies (upload.ts) and the image loader
    supabase/          Supabase clients (browser, public) and generated types
.github/workflows/     deploy.yml: builds the static site and publishes it to GitHub Pages
supabase/
  migrations/          The database schema (tables, security rules, storage bucket)
  seed.sql             Starter content (generated from scripts/generate-seed.mjs)
e2e/                   Playwright end-to-end tests
scripts/               create-admin.mjs, generate-seed.mjs
```

**How content flows.** Each project has two copies of its content: a **draft** (what you edit) and a **live** version (what visitors see). *Save draft* keeps your work private, *Preview draft* shows it as a real page, *Publish* copies the draft to the live version. Photo sets, the profile, the homepage copy and the settings become "live" as soon as you save them.

**How the public site updates.** The public pages are static files built from the live content. Whenever you publish or save something public, the admin records a "content changed" timestamp and, if you have added a GitHub token under Settings, asks GitHub to rebuild immediately (about three minutes). Without a token, a scheduled job checks every 15 minutes and rebuilds only when something changed. Either way you never touch code or git.

**Security.** Visitors use the public "anon" key, and the database's Row Level Security rules only let it read published content. Only accounts listed in the `admins` table can create, edit, delete or upload anything; the admin pages are just a convenient interface on top of those rules. The `service_role` key is never used by the app.

---

## Setup, step by step

You need a free account at [supabase.com](https://supabase.com) and [github.com](https://github.com), plus [Node.js](https://nodejs.org) (version 20 or newer) installed on your computer if you want to run the site locally.

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

The same two Supabase values are added to GitHub in step 8 so the workflow can build the site.

### 7. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin> for the admin. Sign in with the account from step 5.

### 8. Connect GitHub and turn on GitHub Pages

The code is already in the repository `laurensujin/laurensujin.github.io`. Because the repository name ends in `.github.io`, GitHub serves the site at **https://laurensujin.github.io**. Three settings in the repository make it work:

1. **Make the repository public** (Settings → General → Danger Zone → Change visibility). GitHub Pages on a free account requires a public repository. Before doing this, delete or move any personal files such as `Resume.txt` (it contains a phone number) and remember they also live in the git history.
2. **Add the Supabase keys as secrets**: Settings → Secrets and variables → Actions → New repository secret. Create `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the values from step 6.
3. **Enable Pages with GitHub Actions**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

Then open the **Actions** tab, choose "Deploy to GitHub Pages" and press **Run workflow** (later runs happen automatically). After about three minutes the site is live.

Finally, in Supabase go to **Authentication → URL Configuration**: set **Site URL** to `https://laurensujin.github.io` and add `https://laurensujin.github.io/**` to **Redirect URLs**, so password-reset emails link to the right place.

To send code changes to GitHub later (content changes never need this):

```bash
git add .
git commit -m "Describe the change"
git push
```

### 9. Instant publishing (optional but recommended)

Out of the box the site refreshes within 15 minutes of a change. To make **Publish** rebuild the site right away:

1. On GitHub open your profile menu → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Name it "Portfolio publish", choose an expiry (you can pick one year), and under **Repository access** select **Only select repositories** → `laurensujin.github.io`.
3. Under **Permissions → Repository permissions** set **Contents** to **Read and write**. Generate the token and copy it.
4. In the admin open **Settings → Site deployment**, enter `laurensujin/laurensujin.github.io` and the token, press **Save**, then **Test connection**.

When the token expires, publishing keeps working through the 15-minute schedule until you paste a new one.

### 10. Connect a custom domain

1. In the repository open Settings → Pages → **Custom domain**, type your domain (for example `sujinlee.com`) and save. GitHub shows the DNS records to add at the place where you bought the domain (four `A` records and a `CNAME` for `www`). Tick **Enforce HTTPS** once the check turns green.
2. Settings → Secrets and variables → Actions → **Variables** → New repository variable `SITE_URL` = `https://sujinlee.com`, then run the workflow again so links and the sitemap use the new address.
3. Update the Supabase Site URL and Redirect URLs (end of step 8) to the new domain.

### 11. Log in to /admin

Go to `https://your-domain/admin`, enter the email and password from step 5. Forgot the password? Use **Forgot password?** on the login page; the email link brings you to a page where you set a new one.

### 12. Update the portfolio later

1. Open `/admin` and sign in.
2. **Projects** → click a project. Change text, upload images into any section (drag files straight onto an image slot), add sections with **Add section**, drag the ⋮⋮ handle to reorder.
3. Press **Save draft** whenever you like, **Preview draft** to see it, and **Publish** when it is ready. The site rebuilds in about three minutes (with the token from step 9) or within 15 minutes (without it).
4. **Photography** → **Add Photo Set** for new before/after pairs. **Profile**, **Homepage** (including the hero image and the moving line of disciplines), **Resume** and **Settings** work the same way.
5. **Media Library** shows every image, video and PDF uploaded into projects, photo sets and settings (resume PDFs are managed under **Resume**). Deleting a file that is still used somewhere warns you first and removes it from those places.

---

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site locally at <http://localhost:3000> |
| `npm run build` | Builds the static site into `out/` (GitHub Actions runs this for you) |
| `npm run serve:out` | Serves `out/` locally the way GitHub Pages does |
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

`npm run db:start` prints the local API URL and anon key; put those in `.env.local` while developing locally. Password-reset emails sent by the local stack can be read at the Mailpit URL it prints.

The end-to-end tests (`npm run test:e2e`) reset the local database, create the admin account, and drive the real site and admin in a browser: login, creating and publishing a project with uploaded images, reordering sections with the keyboard, publishing a photo set and using the lightbox, uploading a resume, editing the homepage, deleting used media, and unpublishing.

## Changing the content model

- Block types live in `src/lib/content/schema.ts` (shape) and `src/lib/content/blocks.ts` (labels and defaults). Rendering is in `src/components/site/blocks/BlockRenderer.tsx`, editing in `src/components/admin/blocks/BlockFields.tsx`.
- Adding a field to a block or project means: add it to the schema with a `.catch()` default, render it, and add an input for it. Old content keeps working because missing fields fall back to their defaults.
- Database changes go in a new file under `supabase/migrations/`; run it in the SQL Editor on the hosted project the same way as in step 2.

## Notes on images

Uploads go straight from the browser to Supabase Storage with a progress bar. Images wider or taller than 3000 px are resized in the browser before upload (PNG stays PNG, photos become high-quality JPEG), and four smaller copies (480, 960, 1600 and 2400 px wide) are created at the same time. On the public site `next/image` with the custom loader in `src/lib/media/image-loader.ts` picks the copy that fits each screen, so visitors never download more pixels than they need. Anything without an uploaded image shows a generated placeholder visual until you add one.
