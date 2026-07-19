import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { writeAudit } from "@/lib/audit";

const ROLES = ["super_admin", "admin", "content_manager"] as const;

const actorEmail = (claims: unknown) => (claims as { email?: string } | null)?.email ?? null;

/* -------------------------------- CONTACT -------------------------------- */

export const adminListContact = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        status: z.enum(["all", "new", "responded", "closed"]).optional().default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,email.ilike.%${data.search}%,subject.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateContactStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "responded", "closed"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      (context.claims as { email?: string })?.email,
      "update_status",
      "contact_message",
      data.id,
      { status: data.status },
    );
    return { ok: true };
  });

export const deleteContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      (context.claims as { email?: string })?.email,
      "delete",
      "contact_message",
      data.id,
    );
    return { ok: true };
  });

/* -------------------------------- AUDIT -------------------------------- */

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        entity_type: z.string().optional().default(""),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.entity_type) q = q.eq("entity_type", data.entity_type);
    if (data.search) q = q.or(`actor_email.ilike.%${data.search}%,action.ilike.%${data.search}%,entity_id.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const deleteAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isSuper, error: rErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isSuper) throw new Error("Only Super Admins can delete audit entries.");
    const { error } = await context.supabase.from("audit_logs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- USERS -------------------------------- */

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // read profiles (admins-read policy) and user_roles (admins-read policy)
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      context.supabase.from("profiles").select("id,email,full_name,created_at").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id,role"),
    ]);
    if (pErr) throw new Error(pErr.message);
    if (rErr) throw new Error(rErr.message);
    const byUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role as string);
      byUser.set(r.user_id, arr);
    }
    return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
  });

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(ROLES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_roles")
      .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      (context.claims as { email?: string })?.email,
      "grant_role",
      "user_role",
      data.user_id,
      { role: data.role },
    );
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(ROLES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // safety: prevent removing last super_admin
    if (data.role === "super_admin") {
      const { count } = await context.supabase
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if ((count ?? 0) <= 1) throw new Error("Cannot remove the last Super Admin.");
    }
    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      (context.claims as { email?: string })?.email,
      "revoke_role",
      "user_role",
      data.user_id,
      { role: data.role },
    );
    return { ok: true };
  });

/* ------------------------ ADMIN-CREATED USER INVITE ------------------------ */

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        full_name: z.string().trim().max(120).optional().nullable(),
        password: z.string().min(8).max(72).optional().nullable(),
        role: z.enum(ROLES).optional().nullable(),
        send_invite: z.boolean().optional().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isSuper, error: rErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isSuper) throw new Error("Only Super Admins can create users.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let userId: string | null = null;
    if (data.send_invite) {
      const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: { full_name: data.full_name ?? null },
      });
      if (error) throw new Error(error.message);
      userId = invited.user?.id ?? null;
    } else {
      if (!data.password) throw new Error("Password required when not sending an invite.");
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.full_name ?? null },
      });
      if (error) throw new Error(error.message);
      userId = created.user?.id ?? null;
    }
    if (!userId) throw new Error("User was not created.");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, email: data.email, full_name: data.full_name ?? null }, { onConflict: "id" });

    if (data.role) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });
    }

    await writeAudit(
      context.supabase as never,
      context.userId,
      actorEmail(context.claims),
      "create_user",
      "user",
      userId,
      { email: data.email, role: data.role ?? null, invited: !!data.send_invite },
    );

    return { id: userId };
  });

/* ---------------------- PREAPPROVED USER ROLES (EMAIL) --------------------- */

export const listPreapprovedRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isSuper, error: rErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isSuper) throw new Error("Only Super Admins can view pre-approved roles.");

    const { data, error } = await context.supabase
      .from("preapproved_user_roles")
      .select("id,email,role,created_at,used_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addPreapprovedRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().email().max(255), role: z.enum(ROLES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isSuper, error: rErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isSuper) throw new Error("Only Super Admins can pre-approve roles.");

    const { error } = await context.supabase
      .from("preapproved_user_roles")
      .insert({
        email: data.email.toLowerCase(),
        role: data.role,
        created_by: context.userId,
      });
    if (error) throw new Error(error.message);

    await writeAudit(
      context.supabase as never,
      context.userId,
      actorEmail(context.claims),
      "preapprove_role",
      "preapproved_user_role",
      data.email.toLowerCase(),
      { role: data.role },
    );
    return { ok: true };
  });

export const removePreapprovedRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isSuper, error: rErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isSuper) throw new Error("Only Super Admins can remove pre-approved roles.");

    const { error } = await context.supabase.from("preapproved_user_roles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await writeAudit(
      context.supabase as never,
      context.userId,
      actorEmail(context.claims),
      "remove_preapproved_role",
      "preapproved_user_role",
      data.id,
    );
    return { ok: true };
  });

/* ---------------------------- SITEMAP SUPPORT ---------------------------- */

// Public server function used by /sitemap.xml — returns published slugs only.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const listPublicSitemapSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[Supabase] Missing SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY for sitemap public reads.");
    return { products: [], jobs: [] };
  }
  const supabase = createClient<Database>(
    url,
    key,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const [{ data: products }, { data: jobs }] = await Promise.all([
    supabase.from("products").select("slug,updated_at").eq("status", "published"),
    supabase.from("jobs").select("slug,updated_at").eq("status", "published"),
  ]);
  return {
    products: (products ?? []).map((p) => ({ slug: p.slug, lastmod: p.updated_at })),
    jobs: (jobs ?? []).map((j) => ({ slug: j.slug, lastmod: j.updated_at })),
  };
});
