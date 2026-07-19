import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Search, Download, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminListInquiries, updateInquiryStatus } from "@/lib/products.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: InquiriesPage,
});

type Inquiry = Awaited<ReturnType<typeof adminListInquiries>>[number];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-primary text-primary-foreground",
  responded: "bg-emerald-500 text-white",
  closed: "bg-muted text-muted-foreground",
};

function InquiriesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<"all" | "new" | "responded" | "closed">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Inquiry | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-inquiries", status, search],
    queryFn: () => adminListInquiries({ data: { status, search } }),
  });

  const update = useMutation({
    mutationFn: ({ id, s }: { id: string; s: "new"|"responded"|"closed" }) =>
      updateInquiryStatus({ data: { id, status: s } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const csv = useMemo(() => {
    const rows = [
      ["Date","Name","Email","Phone","Company","Product","Quantity","Status","Message"],
      ...data.map((i) => [
        new Date(i.created_at).toISOString(),
        i.name, i.email, i.phone ?? "", i.company ?? "",
        i.product_name ?? "", String(i.quantity ?? ""), i.status, i.message.replace(/\n/g, " "),
      ]),
    ];
    return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  }, [data]);

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `inquiries-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold">Product inquiries</h1>
          <p className="text-sm text-muted-foreground">{data.length} shown</p>
        </div>
        <Button variant="outline" onClick={downloadCsv} disabled={!data.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, product…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(v: "all"|"new"|"responded"|"closed") => setStatus(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No inquiries.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((i) => (
                <TableRow key={i.id} className="cursor-pointer" onClick={() => setOpen(i)}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">
                    {i.name}
                    {i.company && <div className="text-xs text-muted-foreground">{i.company}</div>}
                  </TableCell>
                  <TableCell>{i.product_name ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{i.email}</div>
                    {i.phone && <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{i.phone}</div>}
                  </TableCell>
                  <TableCell><Badge className={STATUS_STYLES[i.status] ?? ""}>{i.status}</Badge></TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Select value={i.status} onValueChange={(s: "new"|"responded"|"closed") => update.mutate({ id: i.id, s })}>
                      <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Inquiry from {open.name}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <dl className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Product</dt><dd className="col-span-2">{open.product_name ?? "—"}</dd>
                <dt className="text-muted-foreground">Email</dt><dd className="col-span-2"><a className="text-primary" href={`mailto:${open.email}`}>{open.email}</a></dd>
                {open.phone && (<><dt className="text-muted-foreground">Phone</dt><dd className="col-span-2">{open.phone}</dd></>)}
                {open.company && (<><dt className="text-muted-foreground">Company</dt><dd className="col-span-2">{open.company}</dd></>)}
                {open.quantity && (<><dt className="text-muted-foreground">Quantity</dt><dd className="col-span-2">{open.quantity}</dd></>)}
              </dl>
              <div>
                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">Message</div>
                <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3">{open.message}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
