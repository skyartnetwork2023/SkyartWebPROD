import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, EyeOff, Eye, Upload, FileText, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  adminListSection, upsertSectionItem, deleteSectionItem, type SectionName,
} from "@/lib/site-sections.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentPage,
});

// Curated lucide icon list for the Services section
const SERVICE_ICONS = [
  "Wifi", "Router", "Globe", "Signal", "Radio", "Satellite", "Antenna",
  "Server", "Cloud", "Cable", "Network", "Building2", "Home", "Hotel",
  "GraduationCap", "Hospital", "Landmark", "Factory", "ShoppingBag",
  "Zap", "Shield", "Headphones", "Phone", "Mail", "MapPin", "Users",
] as const;

function ContentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Site content</h1>
        <p className="text-sm text-muted-foreground">
          Edit the content shown on the public site — Portfolio, Solutions, Coverage, FAQ, Packages, Services, Contact info and Blog posts.
        </p>
      </div>
      <Tabs defaultValue="portfolio">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="contact">Contact info</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="why">Why SkyArt</TabsTrigger>
          <TabsTrigger value="social">Social links</TabsTrigger>
          <TabsTrigger value="map">Map embed</TabsTrigger>
        </TabsList>
        <TabsContent value="portfolio"><SectionManager section="portfolio" /></TabsContent>
        <TabsContent value="solutions"><SectionManager section="solutions" /></TabsContent>
        <TabsContent value="coverage"><SectionManager section="coverage" /></TabsContent>
        <TabsContent value="faq"><SectionManager section="faq" /></TabsContent>
        <TabsContent value="packages"><SectionManager section="packages" /></TabsContent>
        <TabsContent value="services"><SectionManager section="services" /></TabsContent>
        <TabsContent value="contact"><SectionManager section="contact" /></TabsContent>
        <TabsContent value="blog"><SectionManager section="blog" /></TabsContent>
        <TabsContent value="why"><SectionManager section="why" /></TabsContent>
        <TabsContent value="social"><SectionManager section="social" /></TabsContent>
        <TabsContent value="map"><SectionManager section="map" /></TabsContent>
      </Tabs>
    </div>
  );
}

type Row = {
  id: string;
  section: string;
  sort_order: number;
  is_published: boolean;
  data: Record<string, unknown>;
};

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "csv" | "number" | "boolean" | "image" | "icon" | "pdf";
  placeholder?: string;
};

const FIELDS: Record<SectionName, { title: string; summary: (d: Record<string, unknown>) => string; fields: FieldDef[] }> = {
  portfolio: {
    title: "Portfolio snapshot",
    summary: (d) => (d.title as string) ?? "(untitled)",
    fields: [
      { key: "title", label: "Project title", type: "text" },
      { key: "cover", label: "Cover image URL", type: "image", placeholder: "https://…" },
      { key: "industry", label: "Industry", type: "text", placeholder: "Healthcare, Hospitality…" },
      { key: "location", label: "Location", type: "text" },
      { key: "date", label: "Date (YYYY-MM)", type: "text", placeholder: "2025-06" },
      { key: "result", label: "Result / outcome", type: "textarea" },
      { key: "tech", label: "Tech (comma separated)", type: "csv" },
    ],
  },
  solutions: {
    title: "Solution offered",
    summary: (d) => (d.title as string) ?? "(untitled)",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "challenge", label: "Challenge", type: "textarea" },
      { key: "answer", label: "How we solve it", type: "textarea" },
    ],
  },
  coverage: {
    title: "Coverage area",
    summary: (d) => (d.region as string) ?? "(unnamed)",
    fields: [
      { key: "region", label: "Region / District", type: "text" },
      { key: "type", label: "Service type", type: "text", placeholder: "Wireless Broadband" },
      { key: "availability", label: "Availability", type: "text", placeholder: "Active / Planned" },
      { key: "cities", label: "Areas covered (comma separated)", type: "csv" },
    ],
  },
  faq: {
    title: "FAQ entry",
    summary: (d) => (d.q as string) ?? "(no question)",
    fields: [
      { key: "category", label: "Category", type: "text", placeholder: "Installation, Billing…" },
      { key: "q", label: "Question", type: "text" },
      { key: "a", label: "Answer", type: "textarea" },
    ],
  },
  packages: {
    title: "Package",
    summary: (d) => `${(d.name as string) ?? "(unnamed)"}${d.tier ? " · " + d.tier : ""}`,
    fields: [
      { key: "name", label: "Package name", type: "text" },
      { key: "description", label: "Description (optional)", type: "textarea", placeholder: "Short package summary" },
      { key: "tier", label: "Tier (home / business / hotspot)", type: "text", placeholder: "home" },
      { key: "price", label: "Price (TZS)", type: "number" },
      { key: "duration", label: "Duration (monthly / weekly / daily / hourly / custom)", type: "text", placeholder: "monthly" },
      { key: "duration_label", label: "Custom duration label (optional, e.g. '3 days', '/session')", type: "text", placeholder: "/mo" },
      { key: "install", label: "Installation cost (TZS, 0 for free)", type: "number" },
      { key: "down", label: "Download speed (Mbps)", type: "number" },
      { key: "up", label: "Upload speed (Mbps)", type: "number" },
      { key: "recommended", label: "Mark as most popular", type: "boolean" },
      { key: "features", label: "Features (comma separated)", type: "csv" },
    ],
  },
  services: {
    title: "Service",
    summary: (d) => (d.title as string) ?? "(untitled)",
    fields: [
      { key: "title", label: "Service title", type: "text" },
      { key: "icon", label: "Icon", type: "icon" },
      { key: "blurb", label: "Short description", type: "textarea" },
      { key: "slug", label: "URL slug (optional)", type: "text", placeholder: "residential-internet" },
    ],
  },
  contact: {
    title: "Contact info block",
    summary: (d) => (d.label as string) ?? (d.kind as string) ?? "(entry)",
    fields: [
      { key: "kind", label: "Kind (address / phone / email / hours / other)", type: "text", placeholder: "phone" },
      { key: "label", label: "Label", type: "text", placeholder: "Head office" },
      { key: "value", label: "Value", type: "textarea", placeholder: "+255 …" },
    ],
  },
  blog: {
    title: "Blog post",
    summary: (d) => (d.title as string) ?? "(untitled)",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug", type: "text", placeholder: "why-fiber-matters" },
      { key: "category", label: "Category", type: "text", placeholder: "Guides" },
      { key: "cover", label: "Cover image URL", type: "image", placeholder: "https://…" },
      { key: "date", label: "Publish date (YYYY-MM-DD)", type: "text", placeholder: "2026-07-12" },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "body", label: "Article body (typed — shown when no PDF is uploaded)", type: "textarea" },
      { key: "document_url", label: "Or upload a PDF article (shown embedded when present)", type: "pdf" },

    ],
  },
  why: {
    title: "Why SkyArt reason",
    summary: (d) => (d.title as string) ?? "(untitled)",
    fields: [
      { key: "title", label: "Reason title", type: "text", placeholder: "Fast wireless connectivity" },
      { key: "icon", label: "Icon", type: "icon" },
      { key: "body", label: "Short description", type: "textarea" },
    ],
  },
  social: {
    title: "Social link",
    summary: (d) => `${(d.platform as string) ?? "(platform)"} — ${(d.url as string) ?? ""}`,
    fields: [
      { key: "platform", label: "Platform (twitter / linkedin / facebook / instagram / youtube / tiktok)", type: "text", placeholder: "twitter" },
      { key: "url", label: "Profile URL", type: "text", placeholder: "https://twitter.com/…" },
    ],
  },
  map: {
    title: "Map embed",
    summary: (d) => (d.label as string) ?? "Office map",
    fields: [
      { key: "label", label: "Label", type: "text", placeholder: "Head office" },
      { key: "lat", label: "Latitude (recommended — most reliable)", type: "text", placeholder: "-6.7924" },
      { key: "lng", label: "Longitude", type: "text", placeholder: "39.2083" },
      { key: "zoom", label: "Zoom (1-20, default 16)", type: "number", placeholder: "16" },
      { key: "embed_url", label: "Or paste a Google Maps URL (share/place/embed — auto-converted)", type: "text", placeholder: "https://maps.google.com/…" },
      { key: "address", label: "Address caption (optional)", type: "textarea" },
    ],
  },
};

function SectionManager({ section }: { section: SectionName }) {
  const qc = useQueryClient();
  const key = ["admin-section", section];
  const { data = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => adminListSection({ data: { section } }),
  });
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const save = useMutation({
    mutationFn: (p: Partial<Row>) =>
      upsertSectionItem({ data: {
        id: p.id ?? null,
        section,
        sort_order: p.sort_order ?? 0,
        is_published: p.is_published ?? true,
        data: p.data ?? {},
      } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: key });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteSectionItem({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const batchDel = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await deleteSectionItem({ data: { id } });
      }
    },
    onSuccess: () => {
      toast.success(`Deleted ${selectedIds.size} item${selectedIds.size === 1 ? "" : "s"}`);
      setSelectedIds(new Set());
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const conf = FIELDS[section];
  const allIds = (data as Row[]).map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id));

  const toggleId = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size > 0 && `${selectedIds.size} selected`}
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.size} item${selectedIds.size === 1 ? "" : "s"}?`)) {
                  batchDel.mutate(Array.from(selectedIds));
                }
              }}
              disabled={batchDel.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => setEditing({ sort_order: (data[data.length - 1]?.sort_order ?? 0) + 1, is_published: true, data: {} })}>
            <Plus className="mr-2 h-4 w-4" /> New {conf.title}
          </Button>
        </div>
      </div>
      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No entries yet. Click "New {conf.title}" to add one.
          </div>
        ) : (
          <ul className="divide-y">
            {(data as Row[]).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={selectedIds.has(r.id)}
                    onCheckedChange={() => toggleId(r.id)}
                  />
                  <span className="w-8 text-xs text-muted-foreground">#{r.sort_order}</span>
                  <div className="flex-1">
                    <div className="font-medium">{conf.summary(r.data)}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {Object.entries(r.data)
                        .filter(([k]) => !["title","q","region","name","label"].includes(k))
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v ?? "")}`)
                        .join(" · ")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge variant={r.is_published ? "default" : "secondary"}>
                    {r.is_published ? <><Eye className="mr-1 h-3 w-3" />Live</> : <><EyeOff className="mr-1 h-3 w-3" />Hidden</>}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => window.confirm("Delete this entry?") && del.mutate(r.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <EditorDialog
            section={section}
            value={editing}
            saving={save.isPending}
            onSave={(v) => save.mutate(v)}
          />
        )}
      </Dialog>
    </div>
  );
}

function EditorDialog({
  section, value, saving, onSave,
}: {
  section: SectionName;
  value: Partial<Row>;
  saving: boolean;
  onSave: (v: Partial<Row>) => void;
}) {
  const conf = FIELDS[section];
  const [v, setV] = useState({
    id: value.id,
    sort_order: value.sort_order ?? 0,
    is_published: value.is_published ?? true,
    data: { ...(value.data ?? {}) } as Record<string, unknown>,
  });

  const setField = (k: string, val: unknown) =>
    setV((x) => ({ ...x, data: { ...x.data, [k]: val } }));

  return (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{v.id ? `Edit ${conf.title}` : `New ${conf.title}`}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        {conf.fields.map((f) => {
          const raw = v.data[f.key];
          if (f.type === "csv") {
            return (
              <CsvField
                key={f.key}
                label={f.label}
                placeholder={f.placeholder}
                value={Array.isArray(raw) ? (raw as string[]) : []}
                onChange={(arr) => setField(f.key, arr)}
              />
            );
          }
          if (f.type === "textarea") {
            return (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={(raw as string) ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              </div>
            );
          }
          if (f.type === "number") {
            return (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input
                  type="number"
                  placeholder={f.placeholder}
                  value={raw == null ? "" : String(raw)}
                  onChange={(e) => setField(f.key, e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            );
          }
          if (f.type === "boolean") {
            return (
              <div key={f.key} className="flex items-center gap-3">
                <Switch checked={!!raw} onCheckedChange={(c) => setField(f.key, c)} />
                <Label>{f.label}</Label>
              </div>
            );
          }
          if (f.type === "image") {
            return (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input
                  placeholder={f.placeholder ?? "https://…"}
                  value={(raw as string) ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
                {typeof raw === "string" && raw.length > 0 && (
                  <img
                    src={raw}
                    alt="preview"
                    className="mt-2 h-28 w-full rounded-md object-cover border"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                )}
              </div>
            );
          }
          if (f.type === "icon") {
            return (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Select value={(raw as string) ?? ""} onValueChange={(val) => setField(f.key, val)}>
                  <SelectTrigger><SelectValue placeholder="Choose an icon" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_ICONS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }
          if (f.type === "pdf") {
            return (
              <PdfField
                key={f.key}
                label={f.label}
                value={(raw as string) ?? ""}
                onChange={(url) => setField(f.key, url)}
              />
            );
          }
          return (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                placeholder={f.placeholder}
                value={(raw as string) ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            </div>
          );
        })}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Sort order</Label>
            <Input type="number" value={v.sort_order}
              onChange={(e) => setV((x) => ({ ...x, sort_order: Number(e.target.value) || 0 }))} />
          </div>
          <div className="flex items-end gap-2">
            <Switch checked={v.is_published} onCheckedChange={(c) => setV((x) => ({ ...x, is_published: c }))} />
            <Label>Published (visible on site)</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button disabled={saving} onClick={() => onSave(v)}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function CsvField({
  label, placeholder, value, onChange,
}: {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (arr: string[]) => void;
}) {
  const [raw, setRaw] = useState(value.join(", "));

  useEffect(() => {
    setRaw(value.join(", "));
  }, [value]);

  const parse = (next: string) =>
    next
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <div>
      <Label>{label}</Label>
      <Textarea
        rows={3}
        placeholder={placeholder}
        value={raw}
        onChange={(e) => {
          const next = e.target.value;
          setRaw(next);
          onChange(parse(next));
        }}
      />
      <p className="mt-1 text-xs text-muted-foreground">Separate with commas, semicolons, or new lines.</p>
    </div>
  );
}

function PdfField({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const path = `blog/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-images")
        .upload(path, file, { contentType: file.type || "application/pdf", upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("site-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (sErr) throw sErr;
      onChange(signed.signedUrl);
      toast.success("PDF uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button type="button" variant="outline" size="sm" disabled={busy}
          onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {value ? "Replace PDF" : "Upload PDF"}
        </Button>
        {value && (
          <>
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <FileText className="h-3 w-3" /> View uploaded file
            </a>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Remove
            </Button>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Upload a PDF or leave empty to use the typed article body above.
      </p>
    </div>
  );
}
