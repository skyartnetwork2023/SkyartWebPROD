import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft, Briefcase, MapPin, Clock, GraduationCap, Users,
  Loader2, Upload, CheckCircle2, Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getJobBySlug, createCvUploadUrl, submitApplication } from "@/lib/jobs.functions";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/lib/site-data";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";

const jobQueryOptions = (slug: string) => ({
  queryKey: ["job", slug],
  queryFn: () => getJobBySlug({ data: { slug } }),
});

export const Route = createFileRoute("/careers/$slug")({
  loader: async ({ params, context }) => {
    const j = await context.queryClient.ensureQueryData(jobQueryOptions(params.slug));
    if (!j) throw notFound();
    return j;
  },
  head: ({ loaderData }) => {
    const j = loaderData;
    if (!j) return { meta: [] };
    const title = j.seo_title || `${j.title} — Careers | ${site.name}`;
    const desc = j.seo_description || `${j.title}${j.location ? ` in ${j.location}` : ""} — apply to join ${site.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `/careers/${j.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: j.title,
            description: [j.responsibilities, j.requirements, j.benefits].filter(Boolean).join("\n\n"),
            datePosted: j.created_at,
            validThrough: j.application_deadline,
            employmentType: j.employment_type?.toUpperCase(),
            hiringOrganization: { "@type": "Organization", name: site.name },
            jobLocation: j.location
              ? { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location, addressCountry: "TZ" } }
              : undefined,
          }),
        },
      ],
    };
  },
  component: JobDetail,
  errorComponent: CareerErrorComponent,
  notFoundComponent: CareerNotFoundComponent,
});

function CareerErrorComponent() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  return <div className="p-12 text-center text-muted-foreground">{isSw ? "Imeshindikana kupakia nafasi." : "Failed to load role."}</div>;
}

function CareerNotFoundComponent() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  return (
    <div className="p-16 text-center">
      <h1 className="font-display text-2xl font-bold">{isSw ? "Nafasi haijapatikana" : "Role not found"}</h1>
      <p className="text-muted-foreground mt-2">{isSw ? "Inawezekana nafasi imefungwa au kuondolewa." : "It may have been closed or removed."}</p>
      <Button asChild className="mt-4"><Link to="/careers">{isSw ? "Rudi kwenye ajira" : "Back to careers"}</Link></Button>
    </div>
  );
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract",
  internship: "Internship", temporary: "Temporary",
};

function JobDetail() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const j = Route.useLoaderData();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="section-py">
      <div className="container-page">
        <Link to="/careers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> {isSw ? "Nafasi zote wazi" : "All open roles"}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              {j.department && <Badge variant="outline">{j.department}</Badge>}
              <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold">{j.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {EMPLOYMENT_LABELS[j.employment_type] ?? j.employment_type}</span>
                {j.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {j.location}</span>}
                {j.number_of_positions > 1 && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {j.number_of_positions} {isSw ? "nafasi" : "openings"}</span>}
                {j.application_deadline && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {isSw ? "Omba kabla ya" : "Apply by"} {new Date(j.application_deadline).toLocaleDateString()}</span>}
              </div>
            </div>

            {(j.experience_required || j.education) && (
              <Card className="p-5 grid gap-3 sm:grid-cols-2">
                {j.experience_required && (
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">{isSw ? "Uzoefu" : "Experience"}</div>
                    <div className="mt-1 text-sm">{j.experience_required}</div>
                  </div>
                )}
                {j.education && (
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {isSw ? "Elimu" : "Education"}</div>
                    <div className="mt-1 text-sm">{j.education}</div>
                  </div>
                )}
              </Card>
            )}

            {j.responsibilities && (
              <section>
                <h2 className="font-display text-xl font-semibold">{isSw ? "Majukumu" : "Responsibilities"}</h2>
                <div className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{j.responsibilities}</div>
              </section>
            )}
            {j.requirements && (
              <section>
                <h2 className="font-display text-xl font-semibold">{isSw ? "Mahitaji" : "Requirements"}</h2>
                <div className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{j.requirements}</div>
              </section>
            )}
            {j.skills?.length ? (
              <section>
                <h2 className="font-display text-xl font-semibold">{isSw ? "Ujuzi" : "Skills"}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {j.skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </section>
            ) : null}
            {j.benefits && (
              <section>
                <h2 className="font-display text-xl font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> {isSw ? "Manufaa" : "Benefits"}</h2>
                <div className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{j.benefits}</div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <Card className="p-6 lg:sticky lg:top-24">
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                  <h3 className="mt-3 font-display text-lg font-semibold">{isSw ? "Maombi yamepokelewa" : "Application received"}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isSw ? `Asante kwa kuomba nafasi ya ${j.title}. Timu yetu itakagua maombi yako na kuwasiliana nawe.` : `Thanks for applying to ${j.title}. Our people team will review your application and be in touch.`}
                  </p>
                  <Button asChild variant="outline" className="mt-4"><Link to="/careers">{isSw ? "Angalia nafasi zaidi" : "Explore more roles"}</Link></Button>
                </div>
              ) : (
                <ApplicationForm jobId={j.id} jobTitle={j.title} onDone={() => setSubmitted(true)} />
              )}
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ApplicationForm({ jobId, jobTitle, onDone }: { jobId: string; jobTitle: string; onDone: () => void }) {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const submit = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => onDone(),
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("full_name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    if (!full_name || !email) {
      toast.error(isSw ? "Tafadhali weka jina na barua pepe." : "Please provide your name and email.");
      return;
    }

    let cv_path: string | null = null;
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(isSw ? "CV inapaswa kuwa chini ya MB 8." : "CV must be under 8 MB.");
        return;
      }
      setUploading(true);
      try {
        const { path, token } = await createCvUploadUrl({ data: { filename: file.name } });
        const { error } = await supabase.storage.from("cvs").uploadToSignedUrl(path, token, file, {
          contentType: file.type || "application/octet-stream",
        });
        if (error) throw error;
        cv_path = path;
      } catch (err) {
        toast.error((err as Error).message || (isSw ? "Upakiaji wa CV umeshindikana" : "CV upload failed"));
        setUploading(false);
        return;
      }
      setUploading(false);
    }

        <h3 className="font-display text-lg font-semibold">{isSw ? `Omba nafasi ya ${jobTitle}` : `Apply for ${jobTitle}`}</h3>
      data: {
          <Label htmlFor="full_name">{isSw ? "Jina kamili" : "Full name"} *</Label>
        full_name,
        email,
        phone: String(fd.get("phone") || "").trim() || null,
        cover_letter: String(fd.get("cover_letter") || "").trim() || null,
        portfolio_url: String(fd.get("portfolio_url") || "").trim() || null,
        cv_path,
      },
          <Label htmlFor="phone">{isSw ? "Simu" : "Phone"}</Label>
  };

  const busy = uploading || submit.isPending;
          <Label htmlFor="portfolio_url">{isSw ? "Portfolio / LinkedIn" : "Portfolio / LinkedIn"}</Label>
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <h3 className="font-display text-lg font-semibold">Apply for {jobTitle}</h3>
          <Label htmlFor="cover_letter">{isSw ? "Barua ya maombi" : "Cover letter"}</Label>
          <Textarea id="cover_letter" name="cover_letter" rows={4} maxLength={5000} placeholder={isSw ? "Tuambie kuhusu wewe..." : "Tell us about yourself..."} />
        <Input id="full_name" name="full_name" required maxLength={120} />
      </div>
          <Label>{isSw ? "CV / Resume (PDF, DOCX)" : "CV / Resume (PDF, DOCX)"}</Label>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required maxLength={255} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" maxLength={40} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="portfolio_url">Portfolio / LinkedIn</Label>
        <Input id="portfolio_url" name="portfolio_url" type="url" placeholder="https://…" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="cover_letter">Cover letter</Label>
        <Textarea id="cover_letter" name="cover_letter" rows={4} maxLength={5000} placeholder="Tell us about yourself…" />
      </div>
      <div className="grid gap-1.5">
        <Label>CV / Resume (PDF, DOCX)</Label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="justify-start">
          <Upload className="mr-2 h-4 w-4" />
          {file ? file.name : (isSw ? "Chagua faili" : "Choose file")}
        </Button>
        <p className="text-xs text-muted-foreground">{isSw ? "Kiwango cha juu MB 8." : "Max 8 MB."}</p>
      </div>
      <Button type="submit" size="lg" className="mt-2" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {uploading ? (isSw ? "Inapakia CV..." : "Uploading CV...") : submit.isPending ? (isSw ? "Inatuma..." : "Submitting...") : (isSw ? "Tuma maombi" : "Submit application")}
      </Button>
    </form>
  );
}
