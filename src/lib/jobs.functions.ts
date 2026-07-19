import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { writeAudit } from "@/lib/audit";

const actorEmail = (claims: unknown) => (claims as { email?: string } | null)?.email ?? null;

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/* ------------------------------ PUBLIC READS ------------------------------ */

export const listPublishedJobs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        department: z.string().optional().default(""),
        location: z.string().optional().default(""),
        employment_type: z.string().optional().default(""),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let q = supabase
      .from("jobs")
      .select("id,title,slug,department,employment_type,location,application_deadline,number_of_positions,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    if (data.department) q = q.eq("department", data.department);
    if (data.location) q = q.eq("location", data.location);
    if (data.employment_type) q = q.eq("employment_type", data.employment_type as never);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const { data: facetsRaw } = await supabase
      .from("jobs")
      .select("department,location")
      .eq("status", "published");
    const departments = Array.from(new Set((facetsRaw ?? []).map((r) => r.department).filter(Boolean))) as string[];
    const locations = Array.from(new Set((facetsRaw ?? []).map((r) => r.location).filter(Boolean))) as string[];
    return { items: rows ?? [], departments, locations };
  });

export const getJobBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { data: job, error } = await publicClient()
      .from("jobs")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return job;
  });

/* --------------------------- CV UPLOAD + APPLY ---------------------------- */

export const createCvUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ filename: z.string().trim().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("cvs")
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        job_id: z.string().uuid(),
        full_name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(40).optional().nullable(),
        cover_letter: z.string().trim().max(5000).optional().nullable(),
        portfolio_url: z.string().trim().url().max(500).optional().nullable().or(z.literal("").transform(() => null)),
        cv_path: z.string().trim().max(400).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let cv_url: string | null = null;
    if (data.cv_path) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("cvs")
        .createSignedUrl(data.cv_path, 60 * 60 * 24 * 365 * 5);
      cv_url = signed?.signedUrl ?? null;
    }
    const { error } = await supabase.from("job_applications").insert({
      job_id: data.job_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      cover_letter: data.cover_letter ?? null,
      portfolio_url: data.portfolio_url || null,
      cv_path: data.cv_path ?? null,
      cv_url,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- ADMIN --------------------------------- */

export const adminListJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        status: z.enum(["all", "draft", "published", "closed"]).optional().default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("jobs")
      .select("id,title,slug,department,location,employment_type,status,application_deadline,number_of_positions,updated_at")
      .order("updated_at", { ascending: false });
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetJob = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("jobs").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Job not found");
    return row;
  });

const jobInput = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/, "Use lowercase, digits, dashes"),
  department: z.string().trim().max(120).optional().nullable(),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship", "temporary"]).optional().default("full_time"),
  location: z.string().trim().max(160).optional().nullable(),
  experience_required: z.string().trim().max(160).optional().nullable(),
  education: z.string().trim().max(200).optional().nullable(),
  responsibilities: z.string().max(10000).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  benefits: z.string().max(5000).optional().nullable(),
  skills: z.array(z.string()).optional().default([]),
  number_of_positions: z.number().int().min(1).max(999).optional().default(1),
  application_deadline: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "closed"]).optional().default("draft"),
  seo_title: z.string().max(160).optional().nullable(),
  seo_description: z.string().max(400).optional().nullable(),
});

export const upsertJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobInput.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      title: data.title,
      slug: data.slug,
      department: data.department ?? null,
      employment_type: data.employment_type ?? "full_time",
      location: data.location ?? null,
      experience_required: data.experience_required ?? null,
      education: data.education ?? null,
      responsibilities: data.responsibilities ?? null,
      requirements: data.requirements ?? null,
      benefits: data.benefits ?? null,
      skills: data.skills ?? [],
      number_of_positions: data.number_of_positions ?? 1,
      application_deadline: data.application_deadline || null,
      status: data.status ?? "draft",
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("jobs").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "update", "job", data.id, { title: data.title, status: payload.status });
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("jobs")
      .insert({ ...payload, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "create", "job", row.id, { title: data.title, status: payload.status });
    return { id: row.id };
  });

export const deleteJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("jobs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "delete", "job", data.id);
    return { ok: true };
  });

/* ----------------------------- APPLICATIONS ----------------------------- */

const APP_STATUSES = ["new", "under_review", "shortlisted", "interview_scheduled", "offered", "rejected"] as const;

export const adminListApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        job_id: z.string().uuid().optional().nullable(),
        status: z.enum(["all", ...APP_STATUSES]).optional().default("all"),
        search: z.string().optional().default(""),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("job_applications")
      .select("*, jobs(title,slug)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.job_id) q = q.eq("job_id", data.job_id);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.search) q = q.or(`full_name.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(APP_STATUSES),
        notes: z.string().max(5000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch = { status: data.status, ...(data.notes !== undefined ? { notes: data.notes } : {}) };
    const { error } = await context.supabase.from("job_applications").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "update_status", "application", data.id, { status: data.status });
    return { ok: true };
  });

export const createCvDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ path: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    // Only admins/content managers can pull CVs.
    const { data: canManage } = await context.supabase.rpc("can_manage_content", { _user_id: context.userId });
    if (!canManage) throw new Error("Forbidden");
    // Storage RLS on the `cvs` bucket restricts read access, so use the
    // service-role client to mint a short-lived signed URL for admins.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("cvs")
      .createSignedUrl(data.path, 60 * 15);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
