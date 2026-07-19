import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube, Zap, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { site } from "@/lib/site-data";
import { toast } from "sonner";
import { useState, type FormEvent } from "react";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { listSectionPublic } from "@/lib/site-sections.functions";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  twitter: Twitter, x: Twitter, linkedin: Linkedin, facebook: Facebook,
  instagram: Instagram, youtube: Youtube, tiktok: Globe,
};

export function SiteFooter() {
  const [loading, setLoading] = useState(false);
  const onSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (!email || !String(email).includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email: String(email), source: "footer" } });
      form.reset();
      toast.success(res.existing ? "You're already subscribed." : "You're subscribed. Welcome to the SkyArt newsletter.");
    } catch (err) {
      toast.error((err as Error).message || "Could not subscribe.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <footer className="border-t bg-surface">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <Zap className="h-5 w-5" />
              </span>
              {site.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{site.description}</p>
            <form onSubmit={onSubscribe} className="mt-6 flex max-w-sm gap-2">
              <Input name="email" type="email" placeholder="Your email" aria-label="Email for newsletter" required />
              <Button type="submit" disabled={loading}>{loading ? "…" : "Subscribe"}</Button>
            </form>
            <SocialLinks />

          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
              <li><Link to="/portfolio" className="text-muted-foreground hover:text-primary">Portfolio</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary">Blog & News</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Services</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/services" className="text-muted-foreground hover:text-primary">All Services</Link></li>
              <li><Link to="/packages" className="text-muted-foreground hover:text-primary">Packages</Link></li>
              <li><Link to="/solutions" className="text-muted-foreground hover:text-primary">Solutions</Link></li>
              <li><Link to="/coverage" className="text-muted-foreground hover:text-primary">Coverage</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Reach us</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{site.address}</span></li>
              <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-primary">{site.phone}</a></li>
              <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><a href={`mailto:${site.email}`} className="hover:text-primary">{site.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms &amp; Conditions</a>
            <a href="#" className="hover:text-primary">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLinks() {
  const { data: rows } = useQuery({
    queryKey: ["public-section", "social"],
    queryFn: () => listSectionPublic({ data: { section: "social" } }),
  });

  const dbLinks = (rows ?? [])
    .map((r) => {
      const d = r.data as Record<string, unknown>;
      const platform = String(d.platform ?? "").toLowerCase().trim();
      const url = String(d.url ?? "").trim();
      return { platform, url };
    })
    .filter((l) => l.url && l.url !== "#");

  const fallback = [
    { platform: "twitter", url: site.social.twitter },
    { platform: "linkedin", url: site.social.linkedin },
    { platform: "facebook", url: site.social.facebook },
    { platform: "instagram", url: site.social.instagram },
    { platform: "youtube", url: site.social.youtube },
  ].filter((l) => l.url && l.url !== "#");

  const links = dbLinks.length > 0 ? dbLinks : fallback;
  if (links.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {links.map(({ platform, url }, i) => {
        const Icon = SOCIAL_ICONS[platform] ?? Globe;
        return (
          <a
            key={`${platform}-${i}`}
            href={url}
            aria-label={platform}
            target="_blank"
            rel="noreferrer noopener"
            className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

