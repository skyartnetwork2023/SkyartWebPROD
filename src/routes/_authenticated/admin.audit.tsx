import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs, deleteAuditLog } from "@/lib/cms.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { exportRowsToPdf } from "@/lib/pdf-export";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

const ENTITY_TYPES = ["all", "contact_message", "user_role", "product", "job", "application"] as const;

function AuditPage() {
  const qc = useQueryClient();
  const isBrowser = typeof window !== "undefined";
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState<(typeof ENTITY_TYPES)[number]>("all");

  const { data: roleInfo } = useQuery({
    queryKey: ["my-roles"],
    queryFn: () => getMyRoles(),
    enabled: isBrowser,
  });
  const isSuper = !!roleInfo?.isSuperAdmin;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", search, entity],
    queryFn: () => listAuditLogs({ data: { search, entity_type: entity === "all" ? "" : entity } }),
    enabled: isBrowser,
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAuditLog({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["audit-logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];

  const exportPdf = () => {
    exportRowsToPdf({
      title: "Audit Log",
      subtitle: `${items.length} entries${entity !== "all" ? ` · ${entity}` : ""}`,
      filename: `audit-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: "Time", accessor: (l) => new Date(l.created_at).toLocaleString() },
        { header: "Actor", accessor: (l) => l.actor_email ?? l.actor_id ?? "—" },
        { header: "Action", accessor: (l) => l.action },
        { header: "Entity", accessor: (l) => l.entity_type },
        { header: "Entity ID", accessor: (l) => l.entity_id ?? "" },
        { header: "Details", accessor: (l) => (l.details ? JSON.stringify(l.details) : "") },
      ],
      rows: items,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Audit log</h1>
          <p className="text-sm text-muted-foreground">Recent admin actions across the system.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportPdf} disabled={items.length === 0}>
          <FileDown className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search actor, action, entity id…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={entity} onValueChange={(v: typeof entity) => setEntity(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All entities" : t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No audit entries yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                {isSuper && <TableHead className="w-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{l.actor_email ?? l.actor_id ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                  <TableCell className="text-sm">
                    {l.entity_type}
                    {l.entity_id && <span className="text-xs text-muted-foreground"> · {String(l.entity_id).slice(0, 8)}</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                    {l.details ? JSON.stringify(l.details) : "—"}
                  </TableCell>
                  {isSuper && (
                    <TableCell>
                      <Button
                        size="icon" variant="ghost"
                        onClick={() => window.confirm("Delete this audit entry?") && del.mutate(l.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
