import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { writeAudit } from "@/lib/audit";

const SECTIONS = [
  "portfolio", "solutions", "coverage", "faq",
  "packages", "services", "contact", "blog", "why",
  "social", "map",
] as const;
export type SectionName = (typeof SECTIONS)[number];

const actorEmail = (claims: unknown) => (claims as { email?: string } | null)?.email ?? null;

function getPublicSupabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[Supabase] Missing SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY for site sections public reads.");
    return null;
  }
  return { url, key };
}

function publicClient() {
  const env = getPublicSupabaseEnv();
  if (!env) return null;
  return createClient<Database>(
    env.url,
    env.key,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/* ------------------------------ PUBLIC READS ------------------------------ */

export const listSectionPublic = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ section: z.enum(SECTIONS) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    if (!supabase) return [];
    const { data: rows, error } = await supabase
      .from("site_sections")
      .select("id,section,sort_order,is_published,data")
      .eq("section", data.section)
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/* ------------------------------ ADMIN ------------------------------ */

export const adminListSection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ section: z.enum(SECTIONS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("site_sections")
      .select("*")
      .eq("section", data.section)
      .order("sort_order")
      .order("created_at");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  section: z.enum(SECTIONS),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
  data: z.record(z.string(), z.unknown()).default({}),
});

export const upsertSectionItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      section: data.section,
      sort_order: data.sort_order,
      is_published: data.is_published,
      data: data.data as never,
    };
    const q = data.id
      ? context.supabase.from("site_sections").update(payload).eq("id", data.id).select().single()
      : context.supabase.from("site_sections").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      actorEmail(context.claims),
      data.id ? "update" : "create",
      `site_section:${data.section}`,
      row.id,
    );
    return row;
  });

export const deleteSectionItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("site_sections").select("section").eq("id", data.id).maybeSingle();
    const { error } = await context.supabase.from("site_sections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      actorEmail(context.claims),
      "delete",
      `site_section:${row?.section ?? "unknown"}`,
      data.id,
    );
    return { ok: true };
  });
