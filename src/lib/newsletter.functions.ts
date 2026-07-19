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

const subSchema = z.object({
  email: z.string().trim().email().max(320),
  source: z.string().trim().max(64).optional().nullable(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => subSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase(), source: data.source ?? "footer", is_active: true });
    if (error) {
      // Treat duplicate as success (already subscribed)
      if (error.code === "23505") return { ok: true, existing: true };
      throw new Error(error.message);
    }
    return { ok: true, existing: false };
  });

export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminDeleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("newsletter_subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase as never,
      context.userId,
      actorEmail(context.claims),
      "delete", "newsletter_subscriber", data.id,
    );
    return { ok: true };
  });

export const adminToggleSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("newsletter_subscribers")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
