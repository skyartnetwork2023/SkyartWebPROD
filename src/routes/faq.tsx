import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { faqs as fallback, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ — Installation, billing, packages, support | ${site.name}` },
      { name: "description", content: "Answers to common questions about installation, billing, packages, support, equipment and coverage." },
      { property: "og:title", content: `FAQ | ${site.name}` },
      { property: "og:description", content: "Common questions about installation, billing, packages, support, equipment and coverage." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

type Faq = { category: string; q: string; a: string };

function FaqPage() {
  const { data: rows } = useQuery({
    queryKey: ["public-section", "faq"],
    queryFn: () => listSectionPublic({ data: { section: "faq" } }),
  });
  const faqs: Faq[] = useMemo(() => {
    if (rows && rows.length > 0) return rows.map((r) => {
      const d = r.data as Record<string, unknown>;
      return {
        category: String(d.category ?? "General"),
        q: String(d.q ?? ""),
        a: String(d.a ?? ""),
      };
    });
    return fallback as Faq[];
  }, [rows]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))], [faqs]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const list = faqs
    .filter((f) => cat === "All" || f.category === cat)
    .filter((f) => !q || f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHero eyebrow="FAQ" title="Answers first. Small print never.">
        Everything you might want to know before signing up, and most of what you'll need after.
      </PageHero>

      <section className="section-py">
        <div className="container-page max-w-3xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="pl-9" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button key={c} variant={cat === c ? "default" : "outline"} size="sm" onClick={() => setCat(c)}>{c}</Button>
            ))}
          </div>

          <Accordion type="single" collapsible className="mt-8">
            {list.map((f, i) => (
              <AccordionItem key={`${f.category}-${i}`} value={`${f.category}-${i}`}>
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {list.length === 0 && <p className="mt-6 text-center text-sm text-muted-foreground">No questions match your search.</p>}
        </div>
      </section>
    </>
  );
}
