import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { adminListContact, updateContactStatus, deleteContact } from "@/lib/cms.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/contact")({
  component: ContactAdmin,
});

const STATUSES = [
  { v: "new", label: "New" },
  { v: "responded", label: "Responded" },
  { v: "closed", label: "Closed" },
] as const;
type S = (typeof STATUSES)[number]["v"];

type Row = Awaited<ReturnType<typeof adminListContact>>[number];

function ContactAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | S>("all");
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact", search, status],
    queryFn: () => adminListContact({ data: { search, status } }),
  });

  const setStatusMut = useMutation({
    mutationFn: (v: { id: string; status: S }) => updateContactStatus({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-contact"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteContact({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-contact"] }); setSelected(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];

  const exportCsv = () => {
    const cols = ["created_at", "name", "email", "phone", "subject", "message", "status"];
    const csv = [cols.join(",")]
      .concat(items.map((r) => cols.map((c) => JSON.stringify((r as Record<string, unknown>)[c] ?? "")).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `contact-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Contact messages</h1>
          <p className="text-sm text-muted-foreground">{items.length} total</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={items.length === 0}>Export CSV</Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, subject…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(v: typeof status) => setStatus(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}
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
          <div className="p-8 text-center text-sm text-muted-foreground">No messages yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id} className="cursor-pointer" onClick={() => setSelected(m)}>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell className="text-sm max-w-md truncate">{m.subject ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "new" ? "secondary" : m.status === "responded" ? "default" : "outline"}>
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject || "Contact message"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">From</div>
                    <div className="mt-1">{selected.name}</div>
                  </div>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-4 w-4" /> {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" /> {selected.phone}
                    </a>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Message</div>
                  <div className="mt-1 text-sm whitespace-pre-wrap max-h-72 overflow-y-auto rounded-md border p-3 bg-muted/30">
                    {selected.message}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={selected.status}
                    onValueChange={(v: S) =>
                      setStatusMut.mutate({ id: selected.id, status: v }, {
                        onSuccess: () => setSelected({ ...selected, status: v }),
                      })
                    }
                  >
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.confirm("Delete this message?") && del.mutate(selected.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
