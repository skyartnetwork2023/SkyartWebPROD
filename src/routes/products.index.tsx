import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Package as PackageIcon, Sparkles, Star } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listPublishedProducts, listCategoriesPublic } from "@/lib/products.functions";
import { site } from "@/lib/site-data";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: `Products & Networking Equipment | ${site.name}` },
      { name: "description", content: "Browse the SkyArt Networks catalog of routers, switches, wireless access points, fiber gear and connectivity accessories — request a quote in seconds." },
      { property: "og:title", content: `Products | ${site.name}` },
      { property: "og:description", content: "Networking equipment, wireless gear and fiber components — verified stock, request a quote in one click." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<"newest" | "name" | "featured">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const catsQ = useQuery({ queryKey: ["pub-cats"], queryFn: () => listCategoriesPublic() });
  const productsQ = useQuery({
    queryKey: ["pub-products", search, categorySlug, brand, sort, page],
    queryFn: () => listPublishedProducts({ data: { search, categorySlug, brand, sort, page, pageSize } }),
  });

  const items = productsQ.data?.items ?? [];
  const total = productsQ.data?.total ?? 0;
  const brands = productsQ.data?.brands ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHero eyebrow="Catalog" title="Networking equipment & connectivity gear">
        Enterprise-grade routers, switches, wireless access points and fiber components — sourced, stocked and supported locally.
      </PageHero>
      <section className="container-page py-10">
        <Card className="mb-6 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products…" className="pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={categorySlug || "all"} onValueChange={(v) => { setCategorySlug(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(catsQ.data ?? []).map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={brand || "all"} onValueChange={(v) => { setBrand(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{total} products</p>
            <Select value={sort} onValueChange={(v: "newest" | "name" | "featured") => setSort(v)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="featured">Featured first</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {productsQ.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <PackageIcon className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="group">
                <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {p.primaryImage ? (
                      <img src={p.primaryImage} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><PackageIcon className="h-10 w-10" /></div>
                    )}
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {p.is_featured && <Badge className="bg-primary"><Star className="mr-1 h-3 w-3" />Featured</Badge>}
                      {p.is_new_arrival && <Badge className="bg-emerald-500 text-white"><Sparkles className="mr-1 h-3 w-3" />New</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {p.brand && <span className="text-xs uppercase tracking-wide text-muted-foreground">{p.brand}</span>}
                    <h3 className="font-display text-base font-semibold leading-tight">{p.name}</h3>
                    {p.short_description && <p className="line-clamp-2 text-sm text-muted-foreground">{p.short_description}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {p.price ? (
                        <span className="font-semibold">{p.currency} {Number(p.price).toLocaleString()}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Request quote</span>
                      )}
                      <Badge variant="outline" className="capitalize">{p.availability.replace("_", " ")}</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </section>
    </>
  );
}
