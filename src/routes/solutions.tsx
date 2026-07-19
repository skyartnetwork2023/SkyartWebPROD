import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { solutions as fallback, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: `Solutions by industry — homes, business, schools, hospitals | ${site.name}` },
      { name: "description", content: "Tailored connectivity for homes, small businesses, enterprises, schools, universities, hospitals, hotels, government and NGOs." },
      { property: "og:title", content: `Solutions | ${site.name}` },
      { property: "og:description", content: "Tailored connectivity for every industry we serve." },
      { property: "og:url", content: "/solutions" },
    ],
    links: [{ rel: "canonical", href: "/solutions" }],
  }),
  component: SolutionsPage,
});

type Item = { title: string; challenge: string; answer: string; Icon: typeof Sparkles };

function SolutionsPage() {
  const { data: rows } = useQuery({
    queryKey: ["public-section", "solutions"],
    queryFn: () => listSectionPublic({ data: { section: "solutions" } }),
  });
  const items: Item[] = useMemo(() => {
    if (rows && rows.length > 0) return rows.map((r) => {
      const d = r.data as Record<string, unknown>;
      return {
        title: String(d.title ?? ""),
        challenge: String(d.challenge ?? ""),
        answer: String(d.answer ?? ""),
        Icon: Sparkles,
      };
    });
    return fallback.map((s) => ({ title: s.title, challenge: s.challenge, answer: s.answer, Icon: s.icon }));
  }, [rows]);

  return (
    <>
      <PageHero eyebrow="Solutions" title="Networks built for how your industry actually works.">
        The problems a hotel faces aren't the ones a hospital faces. We design connectivity around your reality, not the other way around.
      </PageHero>

      <section className="section-py">
        <div className="container-page grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, Icon, challenge, answer }, idx) => (
            <Card key={idx} className="flex flex-col p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Challenge</p>
                  <p className="mt-1 text-foreground">{challenge}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">How we solve it</p>
                  <p className="mt-1 text-muted-foreground">{answer}</p>
                </div>
              </div>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                Discuss my project <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          ))}
        </div>

        <div className="container-page mt-14 text-center">
          <Button asChild size="lg"><Link to="/contact">Get a tailored proposal</Link></Button>
        </div>
      </section>
    </>
  );
}
