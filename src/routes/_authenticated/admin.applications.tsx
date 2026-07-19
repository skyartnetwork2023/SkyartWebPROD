import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, Mail, Phone, FileDown, ExternalLink } from "lucide-react";
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
import { adminListApplications, updateApplicationStatus, createCvDownloadUrl } from "@/lib/jobs.functions";
import { exportRowsToPdf } from "@/lib/pdf-export";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  component: ApplicationsAdmin,
});

const STATUSES = [
  { v: "new", label: "New" },
  { v: "under_review", label: "Under review" },
  { v: "shortlisted", label: "Shortlisted" },
  { v: "interview_scheduled", label: "Interview" },
  { v: "offered", label: "Offered" },
  { v: "rejected", label: "Rejected" },
] as const;

type StatusVal = (typeof STATUSES)[number]["v"];

const statusColor = (s: string): "default" | "secondary" | "outline" | "destructive" => {
  if (s === "offered" || s === "shortlisted") return "default";
  if (s === "rejected") return "destructive";
  if (s === "new") return "secondary";
  return "outline";
};

type AppRow = Awaited<ReturnType<typeof adminListApplications>>[number];

function ApplicationsAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | StatusVal>("all");
  const [selected, setSelected] = useState<AppRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications", search, status],
    queryFn: () => adminListApplications({ data: { search, status } }),
  });

  const setStatusMut = useMutation({
    mutationFn: (v: { id: string; status: StatusVal; notes?: string }) => updateApplicationStatus({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const downloadCv = async (path: string) => {
    try {
      const { url } = await createCvDownloadUrl({ data: { path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const items = data ?? [];

  const exportPdf = () => {
    exportRowsToPdf({
      title: "Job Applications",
      subtitle: `${items.length} applications`,
      filename: `applications-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: "Applicant", accessor: (a) => a.full_name },
        { header: "Email", accessor: (a) => a.email },
        { header: "Phone", accessor: (a) => a.phone ?? "—" },
        { header: "Job", accessor: (a) => a.jobs?.title ?? "—" },
        { header: "Status", accessor: (a) => STATUSES.find((s) => s.v === a.status)?.label ?? a.status },
        { header: "Received", accessor: (a) => new Date(a.created_at).toLocaleString() },
      ],
      rows: items,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Applications</h1>
          <p className="text-sm text-muted-foreground">{items.length} total</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportPdf} disabled={items.length === 0}>
          <FileDown className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name or email…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(v: typeof status) => setStatus(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
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
          <div className="p-8 text-center text-sm text-muted-foreground">No applications yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                  <TableCell>
                    <div className="font-medium">{a.full_name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{a.jobs?.title ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(a.status)}>
                      {STATUSES.find((s) => s.v === a.status)?.label ?? a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {a.cv_path && (
                      <Button size="icon" variant="ghost" onClick={() => downloadCv(a.cv_path!)} title="Download CV">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" asChild title="Email applicant">
                      <a href={`mailto:${a.email}`}><Mail className="h-4 w-4" /></a>
                    </Button>
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
                <DialogTitle>{selected.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-4 w-4" /> {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" /> {selected.phone}
                    </a>
                  )}
                  {selected.portfolio_url && (
                    <a href={selected.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline sm:col-span-2">
                      <ExternalLink className="h-4 w-4" /> {selected.portfolio_url}
                    </a>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Applied for</div>
                  <div className="mt-1 text-sm">{selected.jobs?.title ?? "—"}</div>
                </div>

                {selected.cover_letter && (
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Cover letter</div>
                    <div className="mt-1 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto rounded-md border p-3 bg-muted/30">
                      {selected.cover_letter}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={selected.status}
                    onValueChange={(v: StatusVal) =>
                      setStatusMut.mutate({ id: selected.id, status: v }, {
                        onSuccess: () => setSelected({ ...selected, status: v }),
                      })
                    }
                  >
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selected.cv_path && (
                    <Button variant="outline" size="sm" onClick={() => downloadCv(selected.cv_path!)}>
                      <FileDown className="mr-2 h-4 w-4" /> Download CV
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
