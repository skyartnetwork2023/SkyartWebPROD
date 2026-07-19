import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Briefcase, MapPin, Sparkles, Search, ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { site } from "@/lib/site-data";
import { listPublishedJobs } from "@/lib/jobs.functions";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: `Careers — Join the team building the region's network | ${site.name}` },
      { name: "description", content: `Explore opportunities with ${site.name} across engineering, field operations, support and network delivery in Tanzania.` },
      { property: "og:title", content: `Careers | ${site.name}` },
      { property: "og:description", content: "Open roles across engineering, NOC, field operations, customer success and sales." },
      { property: "og:url", content: "/careers" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
  component: CareersPage,
});

const perks = [
  "Private medical insurance for you + family",
  "Annual learning & certification budget",
  "Flexible / hybrid work",
  "Equity for senior roles",
  "Home fiber, on us",
  "Paid volunteer days",
];

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

function CareersPage() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const { site: localizedSite } = useSiteContent();
  const perks = isSw
    ? [
        "Bima ya afya binafsi kwako na familia",
        "Bajeti ya mafunzo na vyeti kila mwaka",
        "Kazi ya mseto inayonyumbulika",
        "Umiliki wa hisa kwa nafasi za juu",
        "Fiber ya nyumbani, sisi tunagharamia",
        "Siku za kujitolea kwa malipo",
      ]
    : [
        "Private medical insurance for you + family",
        "Annual learning & certification budget",
        "Flexible / hybrid work",
        "Equity for senior roles",
        "Home fiber, on us",
        "Paid volunteer days",
      ];
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["public-jobs", search, department, location, type],
    queryFn: () =>
      listPublishedJobs({
        data: {
          search,
          department: department === "all" ? "" : department,
          location: location === "all" ? "" : location,
          employment_type: type === "all" ? "" : type,
        },
      }),
  });

  const items = data?.items ?? [];
  const departments = data?.departments ?? [];
  const locations = data?.locations ?? [];

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const j of items) {
      const k = j.department ?? "Other";
      (g[k] ||= []).push(j);
    }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <>
      <PageHero eyebrow={isSw ? "Ajira" : "Careers"} title={isSw ? "Jenga mtandao unaoleta mabadiliko." : "Build a network that makes a difference."}>
        {isSw
          ? `Jiunge na ${localizedSite.name} kusaidia kupanua intaneti ya kuaminika Tanzania.`
          : `Join ${localizedSite.name} and help expand dependable internet across Tanzania with a team that values reliability, innovation and customer impact.`}
      </PageHero>

      <section className="section-py">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-1 h-fit">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-xl font-semibold">{isSw ? `Kwa nini ${localizedSite.name.split(" ")[0]}` : `Why ${localizedSite.name.split(" ")[0]}`}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">{isSw ? "Nafasi zilizo wazi" : "Open roles"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? (isSw ? "Inapakia..." : "Loading...") : (isSw ? `${items.length} nafasi wazi` : `${items.length} open role${items.length === 1 ? "" : "s"}`)}
              </p>
            </div>

            <Card className="p-3">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={isSw ? "Tafuta nafasi..." : "Search roles..."} className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder={isSw ? "Idara" : "Department"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSw ? "Idara zote" : "All departments"}</SelectItem>
                    {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue placeholder={isSw ? "Eneo" : "Location"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSw ? "Maeneo yote" : "All locations"}</SelectItem>
                    {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder={isSw ? "Aina" : "Type"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSw ? "Aina zote" : "All types"}</SelectItem>
                    {Object.entries(EMPLOYMENT_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {isLoading ? (
              <Card className="p-6 text-sm text-muted-foreground">{isSw ? "Inapakia nafasi..." : "Loading roles..."}</Card>
            ) : items.length === 0 ? (
              <Card className="p-10 text-center">
                <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <h3 className="mt-3 font-semibold">{isSw ? "Hakuna nafasi zinazolingana na vichujio vyako" : "No open roles match your filters"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isSw ? "Jaribu kuondoa vichujio, au tuma maombi ya wazi hapa chini." : "Try clearing filters, or send us an open application below."}
                </p>
              </Card>
            ) : (
              grouped.map(([dept, list]) => (
                <div key={dept} className="space-y-3">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{dept}</h3>
                  {list.map((j) => (
                    <Card key={j.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between transition-shadow hover:shadow-md">
                      <div>
                        <Link to="/careers/$slug" params={{ slug: j.slug }} className="font-semibold hover:text-primary">
                          {j.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {j.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>}
                          <Badge variant="outline" className="text-[10px]">{EMPLOYMENT_LABELS[j.employment_type] ?? j.employment_type}</Badge>
                          {j.application_deadline && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {isSw ? "Omba kabla ya" : "Apply by"} {new Date(j.application_deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/careers/$slug" params={{ slug: j.slug }}>
                          {isSw ? "Angalia nafasi" : "View role"} <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section-py bg-surface">
        <div className="container-page max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold">{isSw ? "Huoni nafasi inayokufaa?" : "Don't see the right role?"}</h2>
          <p className="mt-2 text-muted-foreground">
            {isSw ? "Daima tunatafuta watu bora. Tuma CV yako kwa" : "We're always looking for exceptional people. Send your CV to"}{" "}
            <a href={`mailto:careers@${localizedSite.email.split("@")[1]}`} className="text-primary underline underline-offset-2">
              careers@{localizedSite.email.split("@")[1]}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
