import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminListCategories, upsertCategory, deleteCategory } from "@/lib/products.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

type Cat = Awaited<ReturnType<typeof adminListCategories>>[number];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type CategoryInput = {
  id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

function CategoriesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-cats"], queryFn: () => adminListCategories() });
  const [editing, setEditing] = useState<Partial<Cat> | null>(null);


  const save = useMutation({
    mutationFn: (payload: CategoryInput) => upsertCategory({ data: payload }),
    onSuccess: () => {
      toast.success("Category saved");
      qc.invalidateQueries({ queryKey: ["admin-cats"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-cats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize your product catalog.</p>
        </div>
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ name: "", slug: "", is_active: true, sort_order: 0 })}>
              <Plus className="mr-2 h-4 w-4" /> New category
            </Button>
          </DialogTrigger>
          {editing && (
            <CategoryDialog
              value={editing}
              parents={data}
              saving={save.isPending}
              onSave={(v) => save.mutate(v)}
            />
          )}
        </Dialog>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {data.find((p) => p.id === c.parent_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"}>
                      {c.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.confirm(`Delete "${c.name}"?`) && del.mutate(c.id)}
                    >
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

function CategoryDialog({
  value,
  parents,
  saving,
  onSave,
}: {
  value: Partial<Cat>;
  parents: Cat[];
  saving: boolean;
  onSave: (v: CategoryInput) => void;
}) {
  const [v, setV] = useState({
    id: value.id ?? undefined,
    name: value.name ?? "",
    slug: value.slug ?? "",
    description: value.description ?? "",
    parent_id: value.parent_id ?? null,
    sort_order: value.sort_order ?? 0,
    is_active: value.is_active ?? true,
  });
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{v.id ? "Edit category" : "New category"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Name</Label>
          <Input
            value={v.name}
            onChange={(e) =>
              setV((x) => ({ ...x, name: e.target.value, slug: x.slug || slugify(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={v.slug} onChange={(e) => setV((x) => ({ ...x, slug: slugify(e.target.value) }))} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={2} value={v.description ?? ""} onChange={(e) => setV((x) => ({ ...x, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Parent</Label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={v.parent_id ?? ""}
              onChange={(e) => setV((x) => ({ ...x, parent_id: e.target.value || null }))}
            >
              <option value="">— none —</option>
              {parents.filter((p) => p.id !== v.id).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={v.sort_order}
              onChange={(e) => setV((x) => ({ ...x, sort_order: Number(e.target.value) || 0 }))}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={v.is_active} onCheckedChange={(c) => setV((x) => ({ ...x, is_active: c }))} />
          <Label>Active (visible on site)</Label>
        </div>
      </div>
      <DialogFooter>
        <Button disabled={saving || !v.name || !v.slug} onClick={() => onSave(v)}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
