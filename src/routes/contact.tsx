import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone, Info } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { site } from "@/lib/site-data";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/contact.functions";
import { listSectionPublic } from "@/lib/site-sections.functions";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact ${site.name} — Internet service provider in Tanzania` },
      { name: "description", content: "Contact SkyArt Networks Limited for residential internet, business internet, technical support and quote requests in Dar es Salaam and beyond." },
      { property: "og:title", content: `Contact ${site.name}` },
      { property: "og:description", content: "Reach SkyArt Networks Limited for broadband solutions, support and quote requests." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const { site: localizedSite } = useSiteContent();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.name || !data.email || !data.message) {
      toast.error(isSw ? "Tafadhali jaza jina, barua pepe na ujumbe." : "Please fill in name, email and message.");
      return;
    }
    if (!data.email.includes("@")) {
      toast.error(isSw ? "Tafadhali weka barua pepe sahihi." : "Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await submitContactMessage({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          subject: data.topic || "",
          message: data.message,
        },
      });
      form.reset();
      toast.success(isSw ? "Ujumbe umetumwa. Tutakujibu ndani ya siku moja ya kazi." : "Message sent. We'll be in touch within one business day.");
    } catch (err) {
      toast.error((err as Error).message || (isSw ? "Imeshindikana kutuma ujumbe wako." : "Could not send your message."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero eyebrow={isSw ? "Mawasiliano" : "Contact"} title={isSw ? "Tuko tayari kukusaidia kuunganishwa." : "We're ready to help you get connected."}>
        {isSw
          ? `Wasiliana na ${localizedSite.name} kwa maswali ya huduma, msaada wa kiufundi na maombi ya bei.`
          : `Reach out to ${localizedSite.name} for service enquiries, technical support and quote requests.`}
      </PageHero>

      <section className="section-py">
        <div className="container-page grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <ContactCards siteData={localizedSite} isSw={isSw} />

          <div className="space-y-6">

            <Card className="p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold">Send us a message</h2>
              <p className="mt-2 text-sm text-muted-foreground">{isSw ? "Tunajibu ndani ya siku moja ya kazi." : "We respond within one business day."}</p>
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{isSw ? "Jina kamili" : "Full name"} *</Label>
                    <Input id="name" name="name" required maxLength={80} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">{isSw ? "Kampuni (si lazima)" : "Company (optional)"}</Label>
                    <Input id="company" name="company" maxLength={80} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required maxLength={120} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{isSw ? "Simu" : "Phone"}</Label>
                    <Input id="phone" name="phone" type="tel" maxLength={30} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topic">{isSw ? "Tukusaidie nini?" : "What can we help with?"}</Label>
                  <Select name="topic" defaultValue="sales">
                    <SelectTrigger id="topic"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">{isSw ? "Uunganishaji mpya / mauzo" : "New connection / sales"}</SelectItem>
                      <SelectItem value="support">{isSw ? "Msaada wa kiufundi" : "Technical support"}</SelectItem>
                      <SelectItem value="billing">{isSw ? "Swali la malipo" : "Billing enquiry"}</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="press">{isSw ? "Vyombo vya habari" : "Press / media"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">{isSw ? "Ujumbe" : "Message"} *</Label>
                  <Textarea id="message" name="message" required rows={5} maxLength={1000} placeholder={isSw ? "Tuambie unachohitaji..." : "Tell us what you need..."} />
                </div>
                <Button type="submit" size="lg" className="mt-2" disabled={loading}>{loading ? (isSw ? "Inatuma..." : "Sending...") : (isSw ? "Tuma ujumbe" : "Send message")}</Button>
              </form>
            </Card>

            <MapEmbed isSw={isSw} />
          </div>
        </div>
      </section>
    </>
  );
}

function toEmbedSrc(raw: string | undefined): string | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;
  if (url.includes("/maps/embed")) return url;
  const iframeSrc = url.match(/src="([^"]+)"/);
  if (iframeSrc) return iframeSrc[1];
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+(?:\.\d+)?)z)?/);
  if (at) {
    const [, lat, lng, zoom] = at;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom ?? 16}&hl=en&output=embed`;
  }
  const q = url.match(/[?&]q=([^&]+)/);
  if (q) return `https://maps.google.com/maps?q=${q[1]}&output=embed`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

function coordEmbed(lat?: string | number, lng?: string | number, zoom?: string | number): string | null {
  if (lat == null || lng == null || lat === "" || lng === "") return null;
  const z = zoom ? String(zoom) : "16";
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${z}&hl=en&output=embed`;
}

function MapEmbed({ isSw }: { isSw: boolean }) {
  const { data: rows } = useQuery({
    queryKey: ["public-section", "map"],
    queryFn: () => listSectionPublic({ data: { section: "map" } }),
  });
  const first = rows?.[0]?.data as
    | { embed_url?: string; label?: string; address?: string; lat?: string | number; lng?: string | number; zoom?: string | number }
    | undefined;
  const src = coordEmbed(first?.lat, first?.lng, first?.zoom) ?? toEmbedSrc(first?.embed_url);
  if (src) {
    return (
      <Card className="overflow-hidden">
        <iframe
          title={first?.label ?? "Office map"}
          src={src}
          className="aspect-[16/9] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {(first?.label || first?.address) && (
          <div className="p-4 text-sm">
            {first?.label && <p className="font-medium">{first.label}</p>}
            {first?.address && <p className="text-muted-foreground whitespace-pre-line">{first.address}</p>}
          </div>
        )}
      </Card>
    );
  }
  return (
    <Card className="flex aspect-[16/8] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
      <div className="text-center">
        <MapPin className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 font-display text-lg font-semibold">{isSw ? "Tembelea ofisi yetu" : "Visit our office"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{isSw ? "Ongeza coordinates au URL ya Google Maps kwenye Admin -> Site content -> Map embed." : "Add coordinates or a Google Maps URL in Admin -> Site content -> Map embed."}</p>
      </div>
    </Card>
  );
}

const ICONS: Record<string, typeof MapPin> = { address: MapPin, phone: Phone, email: Mail, hours: Clock };

function ContactCards({ siteData, isSw }: { siteData: typeof site; isSw: boolean }) {
  const { data: rows } = useQuery({
    queryKey: ["public-section", "contact"],
    queryFn: () => listSectionPublic({ data: { section: "contact" } }),
  });

  type Entry = { kind: string; label: string; value: string };
  const entries: Entry[] = (rows ?? []).map((r) => {
    const d = r.data as Record<string, unknown>;
    return {
      kind: (d.kind as string) ?? "other",
      label: (d.label as string) ?? "",
      value: (d.value as string) ?? "",
    };
  });

  const defaults: Entry[] = [
    { kind: "address", label: isSw ? "Ofisi kuu" : "Head office", value: siteData.address },
    { kind: "phone", label: isSw ? "Simu" : "Phone", value: siteData.phone },
    { kind: "email", label: "Email", value: siteData.email },
    { kind: "hours", label: isSw ? "Saa za kazi" : "Business hours", value: siteData.hours },
  ];
  const items = entries.length > 0 ? entries : defaults;

  return (
    <div className="space-y-4">
      {items.map((e, i) => {
        const Icon = ICONS[e.kind] ?? Info;
        const isPhone = e.kind === "phone";
        const isEmail = e.kind === "email";
        return (
          <Card key={`${e.kind}-${i}`} className="p-5">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-base font-semibold">{e.label || e.kind}</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {isPhone ? (
                <a href={`tel:${e.value.replace(/\s/g, "")}`} className="text-foreground hover:text-primary">{e.value}</a>
              ) : isEmail ? (
                <a href={`mailto:${e.value}`} className="text-foreground hover:text-primary">{e.value}</a>
              ) : e.value}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
