import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Building2, Target, Telescope } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { values, partners, site } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${site.name} — Wireless internet provider in Tanzania` },
      { name: "description", content: `SkyArt Networks Limited is a Tanzanian wireless internet service provider delivering affordable, reliable broadband connectivity to homes, businesses, institutions and communities.` },
      { property: "og:title", content: `About ${site.name}` },
      { property: "og:description", content: `Learn about SkyArt Networks Limited, our mission, vision and commitment to expanding broadband access across Tanzania.` },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const highlights = [
  { title: "Our mission", body: "To deliver fast, affordable and reliable wireless internet, empowering underserved communities across Tanzania through robust infrastructure and locally crafted connectivity solutions." },
  { title: "Our vision", body: "To become Tanzania’s most trusted and innovative internet service provider, connecting every corner and every home with affordable, high-quality internet." },
  { title: "Our commitment", body: "To expand connectivity across Tanzania while maintaining exceptional service quality, customer satisfaction and long-term network resilience." },
];

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title="Connecting communities with dependable internet access.">
        SkyArt Networks Limited is a Tanzanian wireless internet service provider dedicated to delivering affordable, reliable and high-performance broadband solutions to communities where traditional wired infrastructure is limited or unavailable.
      </PageHero>

      <section className="section-py">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="p-6">
              <Target className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-py bg-surface">
        <div className="container-page">
          <SectionHeading eyebrow="Core values" title="The values that guide our work" />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {values.map((v) => (
              <Card key={v.title} className="p-6">
                <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="container-page">
          <SectionHeading eyebrow="Our footprint" title="Growing from Dar es Salaam with a nationwide vision" />
          <p className="mt-4 max-w-3xl text-muted-foreground">
            SkyArt Networks Limited is beginning in Dar es Salaam and expanding its network across the city with a long-term plan to extend reliable internet services across Tanzania.
          </p>
          <div className="mt-12 text-center">
            <Button asChild size="lg"><Link to="/coverage">View our coverage</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
