# Migrate to your own Supabase + deploy to Vercel

Right now this project runs on **Lovable Cloud**, which is a managed Supabase instance you can't log into directly. To get full dashboard access AND host on Vercel, we switch the app to your own Supabase project and adapt the runtime for Vercel.

There are two big decisions before I write code — please answer the questions below.

---

## What you'll need to provide

1. A Supabase project you own (free tier is fine). From **Project Settings → API** and **Database**:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_PUBLISHABLE_KEY` (or legacy `anon` key)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
2. A Vercel account connected to the GitHub repo Lovable syncs to.

I'll walk you through where to click for each once we start.

---

## What I'll do (code + config changes)

### 1. Port the database to your Supabase
- Take every migration in `supabase/migrations/` (products, categories, jobs, applications, contact_messages, profiles, user_roles, audit_logs, RLS policies, `has_role`/`is_admin` functions, `handle_new_user` trigger) and give you a single consolidated SQL file to run in **your** Supabase SQL editor.
- Recreate the 3 storage buckets (`product-images`, `product-documents`, `cvs`) as private, with the same policies.
- Enable Email auth (and Google if you want it) in your Supabase dashboard — I'll give you the exact toggles.

### 2. Switch the app to talk to your Supabase
- Replace the auto-generated `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `types.ts` with hand-maintained equivalents that read from **your** env vars (Lovable's auto-gen only points at Cloud).
- Regenerate `types.ts` from your project via `supabase gen types`.
- Keep every call site (`src/lib/*.functions.ts`, routes, components) unchanged.

### 3. Adapt for Vercel hosting
- Swap the Cloudflare Workers Vite target for Vercel (`@vercel/react-router` / Vite Vercel preset for TanStack Start).
- Move Node-only concerns out of server functions — current code is already Worker-safe so this is mostly config.
- Add `vercel.json` if needed for SSR routing + `/sitemap.xml`.
- Document the env vars to set in **Vercel → Project → Settings → Environment Variables**:
  - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`

### 4. Auth on the public Vercel domain
- In **your Supabase → Authentication → URL Configuration**, add your Vercel domain (and any custom domain) to **Site URL** and **Redirect URLs** — without this, login/signup/password reset all fail on the live site.
- Update the Google OAuth flow to use raw `supabase.auth.signInWithOAuth` (the Lovable broker only works on Lovable-hosted previews). You'll add Google credentials in Supabase's Google provider settings.
- Password reset redirect updated to `${window.location.origin}/reset-password`.

### 5. Verify
- Run the build locally, sign up a test user, promote to `super_admin` via SQL, confirm admin CRUD + public product/careers/contact flows against your Supabase.

---

## Questions before I write the plan-to-code

1. **Do you want to keep the current Lovable preview working too**, or fully cut over to your Supabase (Lovable preview would then also point at your DB)?
2. **Google sign-in** — do you want it, or email/password only? (Google needs a Google Cloud OAuth client; I'll guide you.)
3. **Do you already have the Supabase project created**, or should the first step be creating one?
4. **Custom domain** — will you serve from `wb.skyartnetworks.com` on Vercel, or use the default `*.vercel.app`? (Affects the auth redirect URLs I tell you to whitelist.)

Once you answer, I'll produce the consolidated SQL, the code diffs, and a step-by-step Vercel + Supabase dashboard checklist.