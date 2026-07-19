import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";
import { iconByName } from "@/lib/site-icons";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services — Wireless internet and broadband solutions | ${site.name}` },
      { name: "description", content: "SkyArt Networks Limited offers residential internet, business internet, public Wi-Fi hotspots, fixed wireless access, fiber connectivity and rural connectivity solutions." },
      { property: "og:title", content: `Services | ${site.name}` },
      { property: "og:description", content: "Discover SkyArt Networks Limited services for homes, businesses, public access points and underserved communities in Tanzania." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

type ServiceItem = { slug: string; title: string; Icon: ReturnType<typeof iconByName>; blurb: string };

function ServicesPage() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const { services: fallbackServices } = useSiteContent();

  const { data: rows } = useQuery({
    queryKey: ["public-section", "services"],
    queryFn: () => listSectionPublic({ data: { section: "services" } }),
  });
  const services: ServiceItem[] = rows && rows.length > 0
    ? rows.map((r) => {
        const d = r.data as { title?: string; icon?: string; blurb?: string; slug?: string };
        return {
          slug: d.slug || (d.title ?? r.id).toLowerCase().replace(/\s+/g, "-"),
          title: d.title ?? "Untitled",
          Icon: iconByName(d.icon),
          blurb: d.blurb ?? "",
        };
      })
    : fallbackServices.map((s) => ({ slug: s.slug, title: s.title, Icon: s.icon, blurb: s.blurb }));
  return (
    <>
      <PageHero
        eyebrow={isSw ? "Huduma" : "Services"}
        title={isSw ? "Huduma za intaneti za kuaminika kwa kila hitaji." : "Reliable internet services for every connection need."}
      >
        {isSw
          ? "SkyArt Networks Limited hutoa broadband ya wireless na suluhisho za muunganisho kwa nyumba, biashara, taasisi na jamii kwa utendaji wa kuaminika."
          : "SkyArt Networks Limited delivers wireless broadband and connectivity solutions designed to support homes, businesses, institutions and communities with dependable performance."}
      </PageHero>

      <section className="section-py">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ slug, title, Icon, blurb }) => (
              <Card key={slug} className="group flex flex-col p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{blurb}</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                  {isSw ? "Ongea nasi" : "Talk to us"} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            ))}
          </div>

          <Card className="mt-14 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center md:p-12">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{isSw ? "Unahitaji suluhisho maalum la muunganisho?" : "Need a tailored connectivity solution?"}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {isSw
                ? "Timu yetu inaweza kukusaidia kuchagua huduma sahihi ya intaneti kwa nyumba, ofisi, shule, jamii au biashara yako."
                : "Our team can help you identify the right internet service for your home, office, school, community or business operation."}
            </p>
            <Button asChild className="mt-6" size="lg"><Link to="/contact">{isSw ? "Omba Bei" : "Request a Quote"}</Link></Button>
          </Card>
        </div>
      </section>
    </>
  );
}
