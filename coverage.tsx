import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  adminListSubscribers, adminDeleteSubscriber, adminToggleSubscriber,
} from "@/lib/newsletter.functions";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  component: SubscribersPage,
});

function SubscribersPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: () => adminListSubscribers(),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminDeleteSubscriber({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["admin-subscribers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => adminToggleSubscriber({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subscribers"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data as Array<{ id: string; email: string; source: string | null; is_active: boolean; created_at: string }>;
  const total = rows.length;
  const active = rows.filter((r) => r.is_active).length;

  const exportCsv = () => {
    const csv = [
      "email,source,is_active,created_at",
      ...rows.map((r) => `${r.email},${r.source ?? ""},${r.is_active},${r.created_at}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Newsletter subscribers</h1>
          <p className="text-sm text-muted-foreground">Emails collected from the footer subscribe form.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="mt-1 font-display text-3xl font-semibold">{total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Active</div>
          <div className="mt-1 font-display text-3xl font-semibold text-primary">{active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Unsubscribed</div>
          <div className="mt-1 font-display text-3xl font-semibold text-muted-foreground">{total - active}</div>
        </Card>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Mail className="mx-auto mb-2 h-6 w-6" />
            No one has subscribed yet.
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} · {r.source ?? "unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.is_active ? "default" : "secondary"}>
                    {r.is_active ? "Active" : "Unsubscribed"}
                  </Badge>
                  <Switch
                    checked={r.is_active}
                    onCheckedChange={(c) => toggle.mutate({ id: r.id, is_active: c })}
                  />
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => window.confirm("Remove this subscriber?") && del.mutate(r.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
