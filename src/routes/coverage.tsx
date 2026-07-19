import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { coverage as fallback, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/coverage")({
  head: () => ({
    meta: [
      { title: `Coverage — Wireless internet rollout in Dar es Salaam | ${site.name}` },
      { name: "description", content: "Find out where SkyArt Networks Limited is currently serving customers in Dar es Salaam and where we plan to expand across Tanzania." },
      { property: "og:title", content: `Coverage areas | ${site.name}` },
      { property: "og:description", content: "Explore SkyArt Networks Limited coverage in Kinondoni, Kigamboni, Ubungo and future expansion areas across Tanzania." },
      { property: "og:url", content: "/coverage" },
    ],
    links: [{ rel: "canonical", href: "/coverage" }],
  }),
  component: CoveragePage,
});

type Region = { region: string; type: string; availability: string; cities: string[] };

function CoveragePage() {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<null | { area: string; found: boolean }>(null);

  const { data: rows } = useQuery({
    queryKey: ["public-section", "coverage"],
    queryFn: () => listSectionPublic({ data: { section: "coverage" } }),
  });
  const coverage: Region[] = useMemo(() => {
    if (rows && rows.length > 0) return rows.map((r) => {
      const d = r.data as Record<string, unknown>;
      return {
        region: String(d.region ?? ""),
        type: String(d.type ?? ""),
        availability: String(d.availability ?? ""),
        cities: ((d.cities as string[]) ?? []),
      };
    });
    return fallback as Region[];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coverage;
    return coverage
      .map((r) => ({ ...r, cities: r.cities.filter((c) => c.toLowerCase().includes(q) || r.region.toLowerCase().includes(q)) }))
      .filter((r) => r.cities.length > 0 || r.region.toLowerCase().includes(q));
  }, [query, coverage]);

  const onCheck = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const area = (new FormData(e.currentTarget).get("area") as string).trim();
    if (!area) return;
    const found = coverage.some((r) => r.region.toLowerCase().includes(area.toLowerCase()) || r.cities.some((c) => c.toLowerCase().includes(area.toLowerCase())));
    setChecked({ area, found });
    if (found) toast.success(`Great news — ${area} is in our coverage footprint!`);
    else toast.info(`We're not live in ${area} yet — we've noted your interest.`);
  };

  return (
    <>
      <PageHero eyebrow="Coverage" title="Expanding reliable connectivity across Dar es Salaam.">
        SkyArt Networks Limited is currently focused on network rollout in Kinondoni, Kigamboni and Ubungo, with plans to extend services across Tanzania.
      </PageHero>

      <section className="section-py">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Card className="p-6">
              <h2 className="font-display text-xl font-semibold">Check my address</h2>
              <p className="mt-2 text-sm text-muted-foreground">Enter a neighbourhood, district or landmark to check availability.</p>
              <form onSubmit={onCheck} className="mt-4 flex gap-2">
                <Input name="area" placeholder="e.g. Masaki, Nairobi CBD" required />
                <Button type="submit">Check</Button>
              </form>
              {checked && (
                <div className={`mt-4 rounded-lg border p-3 text-sm ${checked.found ? "border-success/40 bg-success/10 text-success" : "border-primary/40 bg-primary/10 text-primary"}`}>
                  {checked.found
                    ? `${checked.area} is in our footprint. A sales agent will reach out with next steps.`
                    : `We're not live in ${checked.area} yet — thanks for registering interest.`}
                </div>
              )}
            </Card>

            <Card className="mt-6 aspect-video overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <MapPin className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-3 font-display text-lg font-semibold">Coverage map</p>
                  <p className="mt-1 text-xs text-muted-foreground">Map integration can be added here when service rollout details are finalized.</p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter cities and neighbourhoods…" className="pl-9" />
            </div>
            <div className="mt-6 space-y-4">
              {filtered.map((r) => (
                <Card key={r.region} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{r.region}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{r.type}</Badge>
                      <Badge variant={r.availability === "Full" ? "default" : "secondary"}>{r.availability}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.cities.map((c) => (
                      <span key={c} className="rounded-full bg-muted px-3 py-1 text-xs">{c}</span>
                    ))}
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  No matches — try a different search, or check with a sales agent.
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
