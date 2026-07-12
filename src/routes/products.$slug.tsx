import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Package as PackageIcon, Star, Sparkles, FileText, Mail, Phone,
  MessageCircle, Share2, ChevronRight, Loader2, ArrowLeft,
} from "lucide-react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { getProductBySlug, createInquiryPublic } from "@/lib/products.functions";
import { site } from "@/lib/site-data";
import { toast } from "sonner";

const productQueryOptions = (slug: string) => ({
  queryKey: ["product", slug],
  queryFn: () => getProductBySlug({ data: { slug } }),
});

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params, context }) => {
    const p = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const p = loaderData;
    if (!p) return { meta: [] };
    const title = p.seo_title || `${p.name} | ${site.name}`;
    const desc = p.seo_description || p.short_description || `${p.name} available at ${site.name}.`;
    const img = p.product_images?.[0]?.url;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        ...(img ? [
          { property: "og:image", content: img },
          { name: "twitter:image", content: img },
        ] : []),
      ],
      links: [{ rel: "canonical", href: `/products/${p.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: desc,
            image: img ? [img] : undefined,
            sku: p.sku ?? undefined,
            brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
            offers: p.price ? {
              "@type": "Offer",
              price: p.price,
              priceCurrency: p.currency,
              availability: p.availability === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            } : undefined,
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-2xl">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{(error as Error).message}</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/products">Back to products</Link></Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 font-display text-2xl">Product not found</h1>
      <Button asChild variant="outline" className="mt-4"><Link to="/products">Browse products</Link></Button>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: p } = useQuery(productQueryOptions(slug));
  const [activeImg, setActiveImg] = useState(0);

  if (!p) return null;
  const images = p.product_images ?? [];
  const specs = (p.specifications ?? {}) as Record<string, string>;
  const specEntries = Object.entries(specs);
  const features = (p.features ?? []) as string[];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: p!.name, url: shareUrl }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    }
  }

  const waMessage = encodeURIComponent(`Hi, I'm interested in ${p.name} (${window.location.href}). Please share pricing and availability.`);
  const waUrl = `https://wa.me/${site.phone.replace(/[^\d]/g, "")}?text=${waMessage}`;

  return (
    <section className="container-page py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-primary">Products</Link>
        {p.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{p.category.name}</span>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <Card className="relative aspect-square overflow-hidden bg-muted">
            {images[activeImg] ? (
              <img src={images[activeImg].url} alt={images[activeImg].alt ?? p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground"><PackageIcon className="h-16 w-16" /></div>
            )}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1">
              {p.is_featured && <Badge><Star className="mr-1 h-3 w-3" />Featured</Badge>}
              {p.is_new_arrival && <Badge className="bg-emerald-500 text-white"><Sparkles className="mr-1 h-3 w-3" />New</Badge>}
            </div>
          </Card>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-md border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img.url} alt={img.alt ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {p.brand && <span className="text-xs font-medium uppercase tracking-wider text-primary">{p.brand}</span>}
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{p.name}</h1>
          {p.short_description && <p className="text-lg text-muted-foreground">{p.short_description}</p>}

          <div className="flex flex-wrap items-center gap-3">
            {p.price ? (
              <div className="text-2xl font-bold">{p.currency} {Number(p.price).toLocaleString()}</div>
            ) : (
              <div className="text-lg text-muted-foreground">Contact us for pricing</div>
            )}
            <Badge variant="outline" className="capitalize">{p.availability.replace("_", " ")}</Badge>
            {p.sku && <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <InquiryDialog productId={p.id} productName={p.name} />
            <Button asChild variant="outline"><a href={waUrl} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</a></Button>
            <Button asChild variant="outline"><a href={`mailto:${site.email}?subject=${encodeURIComponent(`Inquiry: ${p.name}`)}`}><Mail className="mr-2 h-4 w-4" />Email</a></Button>
            <Button asChild variant="outline"><a href={`tel:${site.phone}`}><Phone className="mr-2 h-4 w-4" />Call</a></Button>
            <Button variant="ghost" size="icon" onClick={share} aria-label="Share"><Share2 className="h-4 w-4" /></Button>
          </div>

          {features.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-2 font-semibold">Key features</h3>
              <ul className="grid gap-1 text-sm">
                {features.map((f, i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{f}</li>
                ))}
              </ul>
            </Card>
          )}

          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {p.tags.map((t: string) => (
                <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>
              ))}
            </div>
          )}

          <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 text-xs sm:grid-cols-2">
            {p.category && (
              <div><span className="text-muted-foreground">Category: </span><span className="font-medium">{p.category.name}</span></div>
            )}
            {p.brand && (
              <div><span className="text-muted-foreground">Brand: </span><span className="font-medium">{p.brand}</span></div>
            )}
            {p.sku && (
              <div><span className="text-muted-foreground">SKU: </span><span className="font-medium">{p.sku}</span></div>
            )}
            <div><span className="text-muted-foreground">Availability: </span><span className="font-medium capitalize">{p.availability.replace("_", " ")}</span></div>
          </div>
        </div>
      </div>

      {p.full_description && (
        <Card className="mt-8 p-6">
          <h2 className="mb-3 font-display text-xl font-semibold">Description</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">{p.full_description}</div>
        </Card>
      )}

      {specEntries.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="mb-3 font-display text-xl font-semibold">Specifications</h2>
          <dl className="grid gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-6">
            {specEntries.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {p.product_documents.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="mb-3 font-display text-xl font-semibold">Downloads</h2>
          <ul className="space-y-2">
            {p.product_documents.map((d) => (
              <li key={d.id}>
                <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border p-3 hover:bg-accent">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 font-medium">{d.title}</span>
                  {d.size_bytes && <span className="text-xs text-muted-foreground">{Math.round(d.size_bytes / 1024)} KB</span>}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {p.related && p.related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-semibold">Related products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.related.map((r) => (
              <Link key={r.id} to="/products/$slug" params={{ slug: r.slug }} className="group">
                <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-video overflow-hidden bg-muted">
                    {r.primaryImage ? (
                      <img src={r.primaryImage} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><PackageIcon className="h-8 w-8" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    {r.brand && <span className="text-xs text-muted-foreground">{r.brand}</span>}
                    <h3 className="text-sm font-semibold">{r.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Button asChild variant="ghost"><Link to="/products"><ArrowLeft className="mr-2 h-4 w-4" />Back to all products</Link></Button>
      </div>
    </section>
  );
}

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(150).optional(),
  quantity: z.number().int().min(1).optional(),
  message: z.string().trim().min(1, "Required").max(2000),
});

function InquiryDialog({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", quantity: "", message: `I'd like a quote for ${productName}.` });

  const submit = useMutation({
    mutationFn: (data: z.infer<typeof inquirySchema>) => createInquiryPublic({ data: {
      product_id: productId, product_name: productName,
      name: data.name, email: data.email, phone: data.phone || null,
      company: data.company || null, quantity: data.quantity ?? null, message: data.message,
    } }),
    onSuccess: () => {
      toast.success("Thanks — we'll be in touch shortly.");
      setOpen(false);
      setForm((f) => ({ ...f, name: "", email: "", phone: "", company: "", quantity: "" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = inquirySchema.safeParse({
      ...form,
      quantity: form.quantity ? Number(form.quantity) : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    submit.mutate(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Request a quote</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Request a quote — {productName}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email *</Label><Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} /></div>
            <div><Label>Quantity</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></div>
          </div>
          <div><Label>Message *</Label><Textarea rows={4} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></div>
          <DialogFooter>
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send inquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
