import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, ExternalLink, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminListJobs, deleteJob } from "@/lib/jobs.functions";
import { exportRowsToPdf } from "@/lib/pdf-export";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/jobs/")({
  component: JobsAdmin,
});

function JobsAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published" | "closed">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs", search, status],
    queryFn: () => adminListJobs({ data: { search, status } }),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteJob({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];

  const exportPdf = () => {
    exportRowsToPdf({
      title: "Jobs",
      subtitle: `${items.length} jobs`,
      filename: `jobs-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: "Title", accessor: (j) => j.title },
        { header: "Slug", accessor: (j) => `/${j.slug}` },
        { header: "Department", accessor: (j) => j.department ?? "—" },
        { header: "Location", accessor: (j) => j.location ?? "—" },
        { header: "Type", accessor: (j) => j.employment_type },
        { header: "Status", accessor: (j) => j.status },
        { header: "Deadline", accessor: (j) => (j.application_deadline ? new Date(j.application_deadline).toLocaleDateString() : "—") },
      ],
      rows: items,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-muted-foreground">{items.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPdf} disabled={items.length === 0}>
            <FileDown className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button asChild>
            <Link to="/admin/jobs/$id" params={{ id: "new" }}><Plus className="mr-2 h-4 w-4" /> New job</Link>
          </Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(v: typeof status) => setStatus(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
          <div className="p-8 text-center text-sm text-muted-foreground">No jobs yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">
                    <div>{j.title}</div>
                    <div className="text-xs text-muted-foreground">/{j.slug}</div>
                  </TableCell>
                  <TableCell>{j.department ?? "—"}</TableCell>
                  <TableCell>{j.location ?? "—"}</TableCell>
                  <TableCell className="text-xs">{j.employment_type}</TableCell>
                  <TableCell>
                    <Badge variant={j.status === "published" ? "default" : j.status === "closed" ? "outline" : "secondary"}>
                      {j.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {j.application_deadline ? new Date(j.application_deadline).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {j.status === "published" && (
                      <Button asChild size="icon" variant="ghost">
                        <a href={`/careers/${j.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    )}
                    <Button asChild size="icon" variant="ghost">
                      <Link to="/admin/jobs/$id" params={{ id: j.id }}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => window.confirm(`Delete "${j.title}"?`) && del.mutate(j.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
