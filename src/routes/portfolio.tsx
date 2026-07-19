import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { portfolio as fallback, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: `Portfolio — Selected client projects | ${site.name}` },
      { name: "description", content: "A selection of connectivity projects delivered for healthcare, hospitality, education, finance, agriculture and government clients." },
      { property: "og:title", content: `Portfolio | ${site.name}` },
      { property: "og:description", content: `Selected ${site.name} projects supporting homes, businesses, public spaces and institutions across Tanzania.` },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: PortfolioPage,
});

type Item = { title: string; industry: string; tech: string[]; location: string; date: string; result: string; cover?: string };

function PortfolioPage() {
  const { data: rows } = useQuery({
    queryKey: ["public-section", "portfolio"],
    queryFn: () => listSectionPublic({ data: { section: "portfolio" } }),
  });
  const portfolio: Item[] = useMemo(() => {
    if (rows && rows.length > 0) return rows.map((r) => ({
      title: String((r.data as Record<string, unknown>).title ?? ""),
      industry: String((r.data as Record<string, unknown>).industry ?? "Other"),
      location: String((r.data as Record<string, unknown>).location ?? ""),
      date: String((r.data as Record<string, unknown>).date ?? ""),
      result: String((r.data as Record<string, unknown>).result ?? ""),
      tech: (((r.data as Record<string, unknown>).tech as string[]) ?? []),
      cover: (r.data as Record<string, unknown>).cover as string | undefined,
    }));
    return fallback as Item[];
  }, [rows]);


  const industries = useMemo(() => ["All", ...Array.from(new Set(portfolio.map((p) => p.industry)))], [portfolio]);
  const [filter, setFilter] = useState<string>("All");
  const items = filter === "All" ? portfolio : portfolio.filter((p) => p.industry === filter);

  return (
    <>
      <PageHero eyebrow="Portfolio" title="A snapshot of our growing connectivity work.">
        SkyArt Networks Limited delivers dependable broadband solutions for homes, businesses, public spaces and institutions across Tanzania.
      </PageHero>

      <section className="section-py">
        <div className="container-page">
          <div className="flex flex-wrap justify-center gap-2">
            {industries.map((i) => (
              <Button
                key={i}
                variant={filter === i ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(i)}
              >
                {i}
              </Button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Card key={p.title} className="flex flex-col overflow-hidden">
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                    <div className="text-center">
                      <p className="font-display text-4xl font-bold text-primary/40">{p.industry.charAt(0)}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <Badge variant="secondary" className="self-start">{p.industry}</Badge>
                  <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.result}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location}</span>
                    <span>{new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short" })}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
