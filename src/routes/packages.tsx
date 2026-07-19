import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatTZS, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: `Internet Packages — Home & Business Fiber | ${site.name}` },
      { name: "description", content: "Symmetrical unlimited fiber packages for homes and businesses. From TZS 45,000/mo home fiber to dedicated gigabit business circuits — transparent pricing, no throttling." },
      { property: "og:title", content: `Internet Packages | ${site.name}` },
      { property: "og:description", content: "Symmetrical unlimited fiber for homes and businesses. Transparent pricing, no throttling." },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesPage,
});

type PackageItem = {
  name: string; tier: "home" | "business" | "hotspot";
  price: number; install: number; down: number; up: number;
  features: string[]; recommended?: boolean;
  duration?: string; duration_label?: string;
  description?: string;
};

const DURATION_SUFFIX: Record<string, string> = {
  monthly: "/mo", month: "/mo",
  weekly: "/wk", week: "/wk",
  daily: "/day", day: "/day",
  hourly: "/hr", hour: "/hr",
  yearly: "/yr", year: "/yr",
};
function durationSuffix(p: { duration?: string; duration_label?: string }) {
  if (p.duration_label && p.duration_label.trim()) return p.duration_label.trim();
  const k = (p.duration ?? "monthly").toLowerCase();
  return DURATION_SUFFIX[k] ?? (k === "custom" ? "" : `/${k}`);
}

function PackagesPage() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const {
    packages: fallbackPackages,
    streetHotspotPackages,
  } = useSiteContent();

  const [tier, setTier] = useState<"home" | "business" | "hotspot">("home");
  const { data: rows } = useQuery({
    queryKey: ["public-section", "packages"],
    queryFn: () => listSectionPublic({ data: { section: "packages" } }),
  });

  const dbPackages: PackageItem[] = (rows ?? []).map((r) => {
    const d = r.data as Record<string, unknown>;
    return {
      name: (d.name as string) ?? "Package",
      tier: (d.tier as PackageItem["tier"]) ?? "home",
      price: Number(d.price ?? 0),
      install: Number(d.install ?? 0),
      down: Number(d.down ?? 0),
      up: Number(d.up ?? 0),
      features: Array.isArray(d.features) ? (d.features as string[]) : [],
      recommended: Boolean(d.recommended),
      duration: (d.duration as string) ?? undefined,
      duration_label: (d.duration_label as string) ?? undefined,
      description: typeof d.description === "string" && d.description.trim().length > 0
        ? d.description
        : undefined,
    };
  });
  const packages: PackageItem[] = dbPackages.length > 0 ? dbPackages : fallbackPackages;
  const list = packages.filter((p) => p.tier === tier);

  return (
    <>
      <PageHero eyebrow={isSw ? "Vifurushi" : "Packages"} title={isSw ? "Bei halisi. Kasi halisi." : "Real prices. Real speeds. Really."}>
        {isSw
          ? "Hakuna matangazo ya kuvutia tu, hakuna kupunguza kasi kwa siri. Chagua kifurushi na badili muda wowote."
          : "No promotional bait, no throttling surprises, no fine print. Pick a plan, upgrade or downgrade anytime."}
      </PageHero>

      <section className="section-py">
        <div className="container-page">
          <Tabs value={tier} onValueChange={(v) => setTier(v as "home" | "business" | "hotspot")} className="mx-auto max-w-lg">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="home">{isSw ? "Nyumbani" : "Home"}</TabsTrigger>
              <TabsTrigger value="business">{isSw ? "Biashara" : "Business"}</TabsTrigger>
              <TabsTrigger value="hotspot">Hotspot</TabsTrigger>
            </TabsList>
            <TabsContent value={tier} />
          </Tabs>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {list.map((p) => (
              <Card key={p.name} className={`relative flex flex-col p-6 ${p.recommended ? "border-primary shadow-[var(--shadow-elegant)]" : ""}`}>
                {p.recommended && (
                  <Badge className="absolute -top-3 left-6 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                    {isSw ? "Maarufu zaidi" : "Most popular"}
                  </Badge>
                )}
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                {p.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-6 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold">{formatTZS(p.price)}</span>
                  <span className="mb-1 text-sm text-muted-foreground">{durationSuffix(p)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isSw ? "Ufungaji" : "Installation"}: <span className="font-medium text-foreground">{p.install === 0 ? (isSw ? "Bure" : "Free") : formatTZS(p.install)}</span>
                </p>
                <div className="mt-4 flex gap-4 border-y py-3 text-sm">
                  <div><span className="font-semibold text-primary">{p.down}</span> <span className="text-muted-foreground">{isSw ? "Mbps kupakua" : "Mbps down"}</span></div>
                  <div className="h-full w-px bg-border" />
                  <div><span className="font-semibold text-primary">{p.up}</span> <span className="text-muted-foreground">{isSw ? "Mbps kupakia" : "Mbps up"}</span></div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{f}</span></li>
                  ))}
                </ul>
                <Button asChild className="mt-6" variant={p.recommended ? "default" : "outline"}>
                  <Link to="/contact">{isSw ? "Omba sasa" : "Apply now"}</Link>
                </Button>
              </Card>
            ))}
          </div>

          <section className="mt-16 rounded-2xl border bg-card/60 p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl font-semibold">{isSw ? "Vifurushi vya Hotspot ya Mtaani" : "Street Hotspot Packages"}</h2>
              <p className="text-sm text-muted-foreground">{isSw ? "Chaguo za kulipia kabla kwa intaneti ya haraka na nafuu." : "Flexible prepaid options for quick, affordable internet access."}</p>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{isSw ? "Kifurushi" : "Package"}</th>
                    <th className="px-4 py-3">{isSw ? "Gharama (TSH)" : "Cost (TSH)"}</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">{isSw ? "Kasi (Hadi)" : "Speed (Up to)"}</th>
                    <th className="px-4 py-3">{isSw ? "Vifaa" : "Devices"}</th>
                    <th className="px-4 py-3">{isSw ? "Muda" : "Duration"}</th>
                  </tr>
                </thead>
                <tbody>
                  {streetHotspotPackages.map((pkg) => (
                    <tr key={pkg.name} className="border-t">
                      <td className="px-4 py-3 font-medium">{pkg.name}</td>
                      <td className="px-4 py-3">{formatTZS(pkg.cost)}</td>
                      <td className="px-4 py-3">{pkg.data}</td>
                      <td className="px-4 py-3">{pkg.speed}</td>
                      <td className="px-4 py-3">{pkg.devices}</td>
                      <td className="px-4 py-3">{pkg.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {isSw ? "Bei zote hazijajumuisha VAT ya 18%. Vifurushi vya biashara vinajumuisha static IP." : "All prices exclusive of 18% VAT. Business plans include static IP allocation."}{" "}
            <Link to="/faq" className="text-primary underline underline-offset-2">{isSw ? "Soma Maswali" : "Read the FAQ"}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
