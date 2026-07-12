# Self-hosting on Vercel while keeping the Lovable editor

You want three things at once:

1. Keep editing in the **Lovable editor** with a live preview.
2. Deploy the same app to **Vercel** on your public domain.
3. Have direct **Supabase dashboard access** to the database.

Read this first — there's a fork in the road at step 3.

---

## The tradeoff you need to pick

This project currently uses **Lovable Cloud**, which is a managed Supabase
instance you cannot log into directly. There are two viable setups:

### Option A — Stay on Lovable Cloud, deploy to Vercel (recommended for you)

- ✅ Lovable editor + preview keep working with zero friction.
- ✅ Vercel serves the same code on your public domain.
- ❌ No direct Supabase dashboard access. You manage data through the
  Lovable Cloud UI (**Cloud → Tables / Users / Storage**) and export via
  **Cloud → Advanced settings → Export data**.

### Option B — Move to your own Supabase, deploy to Vercel

- ✅ Full Supabase dashboard access, own the DB completely.
- ✅ Vercel deploy points at your Supabase.
- ⚠️ Lovable preview will still hit **Lovable Cloud**, not your Supabase,
  because Lovable auto-manages `.env` with its own Supabase URL. You'd need
  to keep the two databases roughly in sync manually, or accept that the
  Lovable preview shows different data than production.
- ⚠️ The editor still works, but new tables you create through the Lovable
  tools land in Lovable Cloud, not your Supabase — you'd have to re-apply
  each migration to your own project.

**I strongly recommend Option A** unless you have a hard requirement for
dashboard access. Below covers both.

---

## Common step: connect GitHub (needed for either option)

1. In the Lovable editor, open the **+** menu (bottom-left of chat) →
   **GitHub → Connect project → Create repository**.
2. Authorize the Lovable GitHub App and pick your GitHub account/org.
3. Lovable now two-way syncs: edits in Lovable push to GitHub, and
   pushes to GitHub sync back into the Lovable editor.
4. Verify the repo appears in your GitHub account before continuing.

---

## Option A — Deploy Lovable Cloud project to Vercel

### 1. Get your Lovable Cloud env values

They're already in your project's `.env` file (auto-managed by Lovable):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

You'll also need the server-side equivalents (same values, different names —
Vercel doesn't auto-mirror `VITE_*` for server functions):

- `SUPABASE_URL` = same as `VITE_SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` = same as `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` = **not available on Lovable Cloud**. Admin
  operations (`src/integrations/supabase/client.server.ts`) will not work on
  Vercel with Lovable Cloud. This affects: role grants in
  `admin.users.tsx`, some audit writes, CV download URLs. Everything else
  (public reads, authenticated writes via `requireSupabaseAuth`) works.

> If you need those admin features on Vercel, that's the case where you
> must move to Option B — Lovable Cloud does not expose the service role
> key by design.

### 2. Switch the build target to Vercel

Edit `vite.config.ts` and change the TanStack Start target:

```ts
tanstackStart({ target: 'vercel' })
```

(currently it targets Cloudflare Workers for the Lovable preview). Commit
this to the GitHub repo. **Note:** this will break the Lovable preview
because the preview runs on Cloudflare Workers. To keep both working, use
an environment variable switch:

```ts
tanstackStart({
  target: process.env.VERCEL ? 'vercel' : 'cloudflare-module',
})
```

Vercel sets `VERCEL=1` automatically at build time; Lovable doesn't, so
the preview keeps using Cloudflare.

### 3. Create the Vercel project

1. <https://vercel.com> → **Add New → Project → Import** your GitHub repo.
2. Framework preset: **Other** (TanStack Start auto-detects).
3. Build command: `bun run build` (or leave default).
4. Output directory: leave default.
5. **Environment Variables** — add all six from step 1 to
   `Production`, `Preview`, and `Development`.
6. Deploy.

### 4. Add your Vercel domain to the auth allowlist

Since Lovable Cloud manages Supabase Auth, the redirect URLs are set via
the Lovable Cloud UI:

- **Cloud → Users → Auth Settings → URL Configuration**
- Add your Vercel domain (e.g. `https://your-app.vercel.app/**`) and any
  custom domain (`https://wb.skyartnetworks.com/**`) to **Redirect URLs**.

Without this, sign-in on the Vercel-hosted site redirects back to a
"redirect not allowed" error page.

### 5. Verify

- Open the Vercel URL in an incognito window.
- Sign up → confirm you land in `/admin` (the first user is auto-promoted
  to `super_admin`).
- Create a category and a product with an image — confirm the row appears
  in **Cloud → Tables** in Lovable and shows up at `/products`.
- Open the Lovable preview → same data, since both point at the same DB.

---

## Option B — Move to your own Supabase

Only do this if dashboard access is a hard requirement. Steps:

1. Create a Supabase project at <https://supabase.com>.
2. In its **SQL Editor**, run [`docs/schema.sql`](./schema.sql) — that file
   creates every table, enum, RLS policy, and trigger (including
   `handle_new_user`, which promotes the first signup to `super_admin`).
3. In **Storage**, create three **private** buckets: `product-images`,
   `product-documents`, `cvs`. Then run the storage policies at the bottom
   of `docs/schema.sql` (or copy them from the Option B section that used
   to live here — same three `CREATE POLICY` statements against
   `storage.objects`).
4. In **Authentication → Providers**, enable **Email** (and Google if
   wanted), then in **URL Configuration** whitelist your Vercel + custom
   domain (`https://your-app.vercel.app/**`, `http://localhost:8080/**`).
5. Regenerate typed client:
   ```bash
   npx supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts
   ```
6. In Vercel Environment Variables, set the six variables **to your own
   Supabase project's values** (not Lovable Cloud's).
7. Same Vite target switch as Option A step 2.
8. Deploy.

**The Lovable preview will still show Lovable Cloud data.** That's the
tradeoff. Any schema changes made through Lovable Cloud tools must be
re-applied to your Supabase project via SQL migration.

---

## Troubleshooting

- **Lovable preview blank after adding `target: 'vercel'`** — you didn't
  use the `process.env.VERCEL` switch. Re-add it (Option A step 2).
- **Login on Vercel redirects to "URL not allowed"** — add the domain in
  Cloud → Users → Auth Settings → URL Configuration (Option A step 4) or
  your Supabase dashboard (Option B step 4).
- **`Expected 3 parts in JWT` in a server function** — a `VITE_*` var was
  set to a service-role-shaped key, or Option A code hit an admin path
  without a service role key. Move that path off admin client to
  `requireSupabaseAuth`.
- **Vercel build fails on `@tanstack/react-start/plugin/vite`** — make
  sure the Vercel Node version is 20+; set `"engines": { "node": ">=20" }`
  in `package.json` if needed.

---

## Recommendation

Go with **Option A**. You get Vercel hosting on your public domain, the
Lovable editor keeps working exactly as it does today, and you avoid the
schema-drift headache of running two databases. For direct DB access, use
Lovable Cloud's built-in table editor and the data export tool. If you
later outgrow that, migrating to Option B is straightforward — the schema
in `docs/schema.sql` is the source of truth.
