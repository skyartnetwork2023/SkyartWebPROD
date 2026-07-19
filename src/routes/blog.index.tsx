import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: `Blog & News — Guides, updates and industry insight | ${site.name}` },
      { name: "description", content: `Guides on wireless broadband, connectivity planning and technology updates from ${site.name}.` },
      { property: "og:title", content: `Blog & News | ${site.name}` },
      { property: "og:description", content: `Insights and updates from ${site.name} on network technology, connectivity and community internet access.` },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

type Post = { slug: string; title: string; date: string; category: string; excerpt: string; cover?: string };

function BlogPage() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const { posts: fallbackPosts } = useSiteContent();

  const { data: rows } = useQuery({
    queryKey: ["public-section", "blog"],
    queryFn: () => listSectionPublic({ data: { section: "blog" } }),
  });
  const dbPosts: Post[] = (rows ?? []).map((r) => {
    const d = r.data as Record<string, unknown>;
    return {
      slug: (d.slug as string) ?? r.id,
      title: (d.title as string) ?? "Untitled",
      date: (d.date as string) ?? "",
      category: (d.category as string) ?? "General",
      excerpt: (d.excerpt as string) ?? "",
      cover: d.cover as string | undefined,
    };
  });
  const posts: Post[] = dbPosts.length > 0 ? dbPosts : fallbackPosts;
  const allLabel = isSw ? "Yote" : "All";
  const categories = useMemo(() => [allLabel, ...Array.from(new Set(posts.map((p) => p.category)))], [posts, allLabel]);
  const [cat, setCat] = useState(allLabel);
  const [q, setQ] = useState("");
  const filtered = posts
    .filter((p) => cat === allLabel || p.category === cat)
    .filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));
  const [featured, ...rest] = filtered;

  return (
    <>
      <PageHero eyebrow={isSw ? "Blogu na Habari" : "Blog & News"} title={isSw ? "Miongozo, habari na maarifa ya muunganisho." : "Guides, updates and insights on connectivity."}>
        {isSw
          ? "Kutoka mwenendo wa broadband hadi ushauri wa vitendo, gundua mawazo mapya kutoka SkyArt Networks Limited."
          : "From wireless broadband trends to practical internet guidance, discover the latest thinking from SkyArt Networks Limited."}
      </PageHero>

      <section className="section-py">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Button key={c} variant={cat === c ? "default" : "outline"} size="sm" onClick={() => setCat(c)}>{c}</Button>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isSw ? "Tafuta makala..." : "Search posts..."} className="pl-9" />
            </div>
          </div>

          {featured && (
            <Card className="mt-10 grid overflow-hidden md:grid-cols-2">
              <div className="flex h-56 items-center justify-center bg-gradient-to-br from-primary via-primary-glow to-primary/50 p-8 md:h-auto">
                <p className="font-display text-4xl font-bold text-primary-foreground">{isSw ? "Makala maalum" : "Featured"}</p>
              </div>
              <div className="p-8">
                <Badge variant="secondary">{featured.category}</Badge>
                <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">{featured.title}</h2>
                <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">{new Date(featured.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                <Button asChild className="mt-6"><Link to="/blog/$slug" params={{ slug: featured.slug }}>{isSw ? "Soma makala" : "Read article"}</Link></Button>
              </div>
            </Card>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="block">
                <Card className="group flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
                  <Badge variant="secondary" className="self-start">{p.category}</Badge>
                  <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-4 text-xs text-muted-foreground">{p.date && new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                </Card>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <Card className="mt-10 p-8 text-center text-sm text-muted-foreground">{isSw ? "Hakuna makala yanayolingana na utafutaji wako." : "No posts match your search."}</Card>
          )}
        </div>
      </section>
    </>
  );
}
