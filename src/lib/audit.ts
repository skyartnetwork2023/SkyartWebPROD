// Shared audit-log writer used by admin server functions.
// Never throws — a broken audit write must not fail the caller's action.

type MinimalSupabase = {
  from: (t: string) => { insert: (v: unknown) => Promise<unknown> };
};

export async function writeAudit(
  supabase: MinimalSupabase,
  actorId: string,
  actorEmail: string | undefined | null,
  action: string,
  entity_type: string,
  entity_id: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    await supabase
      .from("audit_logs")
      .insert({
        actor_id: actorId,
        actor_email: actorEmail ?? null,
        action,
        entity_type,
        entity_id,
        details,
      });
  } catch {
    /* swallow — auditing must never break the request */
  }
}
