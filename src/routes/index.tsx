import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Gauge, Headphones, ShieldCheck, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { services, packages, stats, customerSegments, technologies, partners, posts, formatTZS, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";
import { iconByName } from "@/lib/site-icons";
import heroImg from "@/assets/hero-fiber.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} — Fiber, wireless & business internet you can count on` },
      { name: "description", content: site.description },
      { property: "og:title", content: `${site.name} — Fiber, wireless & business internet` },
      { property: "og:description", content: site.description },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = services.slice(0, 6);
  const previewPackages = packages.filter((p) => p.tier === "home");
  const latestPosts = posts.slice(0, 3);
  const { data: whyRows } = useQuery({
    queryKey: ["public-section", "why"],
    queryFn: () => listSectionPublic({ data: { section: "why" } }),
  });
  const whyItems = (whyRows && whyRows.length > 0)
    ? whyRows.map((r) => {
        const d = r.data as { title?: string; icon?: string; body?: string };
        return { Icon: iconByName(d.icon, Gauge), title: d.title ?? "", body: d.body ?? "" };
      })
    : [
        { Icon: Gauge, title: "Fast wireless connectivity", body: "Built for smooth browsing, video calls and everyday productivity." },
        { Icon: ShieldCheck, title: "Secure and scalable network", body: "Designed to support both current needs and future growth." },
        { Icon: Headphones, title: "Local customer support", body: "Friendly guidance and dependable assistance from a team that knows the market." },
        { Icon: Zap, title: "Energy-efficient design", body: "Infrastructure planned for performance, resilience and responsible operation." },
      ];

  return (
    <>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt=""
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-30 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
        <div className="container-page relative pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              <Zap className="mr-1 h-3 w-3" /> Fast, reliable and affordable internet for Tanzania
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl md:leading-[1.05]">
              Fast, Reliable &amp; Affordable Internet for <span className="gradient-text">Homes and Businesses</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              {site.name} delivers high-quality broadband connectivity through modern wireless technologies, helping individuals, businesses and institutions stay connected with dependable internet services.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 shadow-[var(--shadow-elegant)]">
                <Link to="/contact">Get Connected <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link to="/contact">Request a Quote</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="border-primary/10 bg-card/80 p-4 backdrop-blur md:p-6">
                <p className="font-display text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="section-py bg-background">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              About {site.name}
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Connecting communities and empowering Tanzania through dependable wireless internet.
            </h2>
            <p className="mt-4 text-muted-foreground">
              SkyArt Networks Limited is a Tanzanian wireless internet service provider dedicated to delivering affordable, reliable and high-performance broadband solutions to communities where traditional wired infrastructure is limited or unavailable.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Affordable internet packages",
                "Reliable network performance",
                "Professional technical support",
                "Modern wireless infrastructure",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8" variant="outline">
              <Link to="/about">Learn more about us <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {whyItems.map(({ Icon, title, body }) => (
              <Card key={title} className="p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-py bg-surface">
        <div className="container-page">
          <SectionHeading eyebrow="Services" title="Connectivity solutions for homes, businesses and communities">
            From residential broadband to fixed wireless and public hotspot deployments, SkyArt Networks Limited helps customers stay connected with dependable service.
          </SectionHeading>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(({ slug, title, icon: Icon, blurb }) => (
              <Card key={slug} className="group p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline"><Link to="/services">All services <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="section-py bg-background">
        <div className="container-page">
          <SectionHeading eyebrow="Flexible Packages" title="Internet plans built around real needs">
            Choose a connection that fits your home, business or community requirements with transparent, customer-focused options.
          </SectionHeading>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {previewPackages.map((p) => (
              <Card key={p.name} className={`relative flex flex-col p-6 ${p.recommended ? "border-primary shadow-[var(--shadow-elegant)]" : ""}`}>
                {p.recommended && (
                  <Badge className="absolute -top-3 left-6 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                    Most popular
                  </Badge>
                )}
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Unlimited fiber</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold">{formatTZS(p.price)}</span>
                  <span className="mb-1 text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="mt-4 flex gap-4 border-y py-3 text-sm">
                  <div><span className="font-semibold text-primary">{p.down}</span> <span className="text-muted-foreground">Mbps down</span></div>
                  <div className="h-full w-px bg-border" />
                  <div><span className="font-semibold text-primary">{p.up}</span> <span className="text-muted-foreground">Mbps up</span></div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{f}</span></li>
                  ))}
                </ul>
                <Button asChild className="mt-6" variant={p.recommended ? "default" : "outline"}>
                  <Link to="/contact">Apply now</Link>
                </Button>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="ghost"><Link to="/packages">See business packages <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* CUSTOMER SEGMENTS */}
      <section className="section-py bg-surface">
        <div className="container-page">
          <SectionHeading eyebrow="Customer Segments" title="Connectivity designed for the people and organizations we serve" />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customerSegments.map(({ title, icon: Icon, blurb }) => (
              <Card key={title} className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="border-y bg-background py-12">
        <div className="container-page">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Technology we use
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {technologies.map((item) => (
              <span key={item} className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="section-py bg-background">
        <div className="container-page">
          <SectionHeading eyebrow="Blog & News" title="Fresh from our team" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {latestPosts.map((p) => (
              <Card key={p.slug} className="group overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
                <Badge variant="secondary">{p.category}</Badge>
                <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline"><Link to="/blog">Read the blog <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-py bg-background">
        <div className="container-page">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-primary-glow p-10 text-primary-foreground md:p-16">
            <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%)" }} />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to connect your home or business?</h2>
                <p className="mt-3 text-primary-foreground/80">Speak with the SkyArt Networks Limited team about your connectivity needs and next steps.</p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Button asChild size="lg" variant="secondary"><Link to="/contact">Request a quote</Link></Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/packages">See packages</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
