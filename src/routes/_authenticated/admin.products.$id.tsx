import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Save, Star, Trash2, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  adminGetProduct, upsertProduct, adminListCategories,
  addProductImage, removeProductImage, setPrimaryImage,
  addProductDocument, removeProductDocument, createStorageSignedUrl,
} from "@/lib/products.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: ProductEditor,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type FormState = {
  id?: string | null;
  name: string; slug: string; sku: string | null; brand: string | null;
  category_id: string | null;
  short_description: string | null; full_description: string | null;
  specifications: Record<string, string>;
  features: string[];
  price: number | null; currency: string;
  availability: "in_stock" | "out_of_stock" | "pre_order" | "discontinued";
  is_featured: boolean; is_new_arrival: boolean;
  tags: string[]; seo_title: string | null; seo_description: string | null;
  status: "draft" | "published";
};

const empty: FormState = {
  name: "", slug: "", sku: null, brand: null, category_id: null,
  short_description: null, full_description: null,
  specifications: {}, features: [],
  price: null, currency: "TZS",
  availability: "in_stock", is_featured: false, is_new_arrival: false,
  tags: [], seo_title: null, seo_description: null, status: "draft",
};

function ProductEditor() {
  const { id } = useParams({ from: "/_authenticated/admin/products/$id" });
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();

  const catsQ = useQuery({ queryKey: ["admin-cats"], queryFn: () => adminListCategories() });
  const productQ = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminGetProduct({ data: { id } }),
    enabled: !isNew,
  });

  const [form, setForm] = useState<FormState>(empty);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : id);

  useEffect(() => {
    if (!isNew && productQ.data) {
      const p = productQ.data;
      setForm({
        id: p.id,
        name: p.name, slug: p.slug, sku: p.sku, brand: p.brand,
        category_id: p.category_id,
        short_description: p.short_description, full_description: p.full_description,
        specifications: (p.specifications ?? {}) as Record<string, string>,
        features: (p.features ?? []) as string[],
        price: p.price ? Number(p.price) : null, currency: p.currency,
        availability: p.availability as FormState["availability"],
        is_featured: p.is_featured, is_new_arrival: p.is_new_arrival,
        tags: p.tags ?? [], seo_title: p.seo_title, seo_description: p.seo_description,
        status: p.status as FormState["status"],
      });
      setSavedId(p.id);
    }
  }, [isNew, productQ.data]);

  const save = useMutation({
    mutationFn: () => upsertProduct({ data: form }),
    onSuccess: (res) => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-product", res.id] });
      if (isNew) {
        setSavedId(res.id);
        nav({ to: "/admin/products/$id", params: { id: res.id }, replace: true });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const specEntries = useMemo(() => Object.entries(form.specifications), [form.specifications]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon"><Link to="/admin/products"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold">{isNew ? "New product" : form.name || "Product"}</h1>
            <p className="text-sm text-muted-foreground">Manage details, media and documents.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={form.status === "published" ? "default" : "secondary"}>{form.status}</Badge>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.slug}>
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="media" disabled={!savedId}>Media {!savedId && "(save first)"}</TabsTrigger>
          <TabsTrigger value="docs" disabled={!savedId}>Documents</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="grid gap-4 p-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} />
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku ?? ""} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value || null }))} />
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={form.brand ?? ""} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value || null }))} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id ?? "none"} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v === "none" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {(catsQ.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price</Label>
              <div className="flex gap-2">
                <Input className="w-20" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
                <Input type="number" value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
            <div>
              <Label>Availability</Label>
              <Select value={form.availability} onValueChange={(v: FormState["availability"]) => setForm((f) => ({ ...f, availability: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of stock</SelectItem>
                  <SelectItem value="pre_order">Pre-order</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Short description</Label>
              <Textarea rows={2} value={form.short_description ?? ""} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value || null }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Full description</Label>
              <Textarea rows={8} value={form.full_description ?? ""} onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value || null }))} placeholder="Supports plain text and line breaks." />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                rows={4}
                value={form.features.join("\n")}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Specifications</Label>
                <Button size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, specifications: { ...f.specifications, "": "" } }))}>Add row</Button>
              </div>
              <div className="space-y-2">
                {specEntries.length === 0 && <p className="text-xs text-muted-foreground">No specifications. Add key/value rows.</p>}
                {specEntries.map(([k, v], idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input placeholder="Key" value={k} onChange={(e) => {
                      const key = e.target.value;
                      setForm((f) => {
                        const entries = Object.entries(f.specifications);
                        entries[idx] = [key, entries[idx][1]];
                        return { ...f, specifications: Object.fromEntries(entries) };
                      });
                    }} />
                    <Input placeholder="Value" value={String(v)} onChange={(e) => setForm((f) => ({ ...f, specifications: { ...f.specifications, [k]: e.target.value } }))} />
                    <Button size="icon" variant="ghost" onClick={() => setForm((f) => {
                      const spec = { ...f.specifications };
                      delete spec[k];
                      return { ...f, specifications: spec };
                    })}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags.join(", ")}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              />
            </div>

            <div className="flex flex-col gap-3 justify-end">
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(c) => setForm((f) => ({ ...f, is_featured: c }))} /><Label>Featured</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_new_arrival} onCheckedChange={(c) => setForm((f) => ({ ...f, is_new_arrival: c }))} /><Label>New arrival</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.status === "published"} onCheckedChange={(c) => setForm((f) => ({ ...f, status: c ? "published" : "draft" }))} /><Label>Published</Label></div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          {savedId && <MediaTab productId={savedId} />}
        </TabsContent>
        <TabsContent value="docs">
          {savedId && <DocsTab productId={savedId} />}
        </TabsContent>

        <TabsContent value="seo">
          <Card className="grid gap-4 p-4">
            <div>
              <Label>SEO title</Label>
              <Input value={form.seo_title ?? ""} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value || null }))} maxLength={160} />
              <p className="mt-1 text-xs text-muted-foreground">{(form.seo_title ?? "").length}/160</p>
            </div>
            <div>
              <Label>SEO description</Label>
              <Textarea rows={3} value={form.seo_description ?? ""} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value || null }))} maxLength={400} />
              <p className="mt-1 text-xs text-muted-foreground">{(form.seo_description ?? "").length}/400</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MediaTab({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const productQ = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => adminGetProduct({ data: { id: productId } }),
  });
  const images = productQ.data?.product_images ?? [];
  const [uploading, setUploading] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (error) throw error;
        const { url } = await createStorageSignedUrl({ data: { bucket: "product-images", path } });
        await addProductImage({ data: { product_id: productId, url, storage_path: path, alt: file.name } });
      }
      toast.success("Images uploaded");
      qc.invalidateQueries({ queryKey: ["admin-product", productId] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const del = useMutation({
    mutationFn: (id: string) => removeProductImage({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-product", productId] }),
  });
  const setPrimary = useMutation({
    mutationFn: (id: string) => setPrimaryImage({ data: { id, product_id: productId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-product", productId] }),
  });

  return (
    <Card className="p-4 space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 hover:bg-muted/40">
        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{uploading ? "Uploading…" : "Click or drop images here"}</span>
        <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </label>
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border">
              <img src={img.url} alt={img.alt ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
              {img.is_primary && (
                <Badge className="absolute left-2 top-2"><Star className="mr-1 h-3 w-3 fill-current" />Primary</Badge>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.is_primary && (
                  <Button size="sm" variant="secondary" onClick={() => setPrimary.mutate(img.id)}>
                    <Star className="mr-1 h-3 w-3" /> Primary
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => del.mutate(img.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DocsTab({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const productQ = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => adminGetProduct({ data: { id: productId } }),
  });
  const docs = productQ.data?.product_documents ?? [];
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from("product-documents").upload(path, file, { upsert: false });
        if (error) throw error;
        const { url } = await createStorageSignedUrl({ data: { bucket: "product-documents", path } });
        await addProductDocument({ data: {
          product_id: productId, title: title || file.name, url, storage_path: path,
          file_type: file.type || null, size_bytes: file.size,
        } });
      }
      toast.success("Uploaded");
      setTitle("");
      qc.invalidateQueries({ queryKey: ["admin-product", productId] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const del = useMutation({
    mutationFn: (id: string) => removeProductDocument({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-product", productId] }),
  });

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <Label>Title (optional)</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Datasheet PDF" />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload document
          <input type="file" hidden onChange={(e) => onFiles(e.target.files)} />
        </label>
      </div>
      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents yet.</p>
      ) : (
        <ul className="divide-y">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 py-2">
              <a href={d.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-sm hover:underline">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{d.title}</span>
                {d.size_bytes && <span className="text-xs text-muted-foreground">({Math.round(d.size_bytes / 1024)} KB)</span>}
              </a>
              <Button size="icon" variant="ghost" onClick={() => del.mutate(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
