import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { adminGetJob, upsertJob } from "@/lib/jobs.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/jobs/$id")({
  component: JobEditor,
});

type Draft = {
  id?: string | null;
  title: string;
  slug: string;
  department: string;
  employment_type: "full_time" | "part_time" | "contract" | "internship" | "temporary";
  location: string;
  experience_required: string;
  education: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  number_of_positions: number;
  application_deadline: string;
  status: "draft" | "published" | "closed";
  seo_title: string;
  seo_description: string;
};

const empty: Draft = {
  title: "", slug: "", department: "", employment_type: "full_time", location: "",
  experience_required: "", education: "", responsibilities: "", requirements: "",
  benefits: "", skills: [], number_of_positions: 1, application_deadline: "",
  status: "draft", seo_title: "", seo_description: "",
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 200);

function JobEditor() {
  const { id } = useParams({ from: "/_authenticated/admin/jobs/$id" });
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(empty);
  const [skillInput, setSkillInput] = useState("");
  const [autoSlug, setAutoSlug] = useState(isNew);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-job", id],
    queryFn: () => adminGetJob({ data: { id } }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!data) return;
    setDraft({
      id: data.id,
      title: data.title ?? "",
      slug: data.slug ?? "",
      department: data.department ?? "",
      employment_type: (data.employment_type ?? "full_time") as Draft["employment_type"],
      location: data.location ?? "",
      experience_required: data.experience_required ?? "",
      education: data.education ?? "",
      responsibilities: data.responsibilities ?? "",
      requirements: data.requirements ?? "",
      benefits: data.benefits ?? "",
      skills: data.skills ?? [],
      number_of_positions: data.number_of_positions ?? 1,
      application_deadline: data.application_deadline ?? "",
      status: (data.status ?? "draft") as Draft["status"],
      seo_title: data.seo_title ?? "",
      seo_description: data.seo_description ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      upsertJob({
        data: {
          id: draft.id || undefined,
          title: draft.title,
          slug: draft.slug,
          department: draft.department || null,
          employment_type: draft.employment_type,
          location: draft.location || null,
          experience_required: draft.experience_required || null,
          education: draft.education || null,
          responsibilities: draft.responsibilities || null,
          requirements: draft.requirements || null,
          benefits: draft.benefits || null,
          skills: draft.skills,
          number_of_positions: draft.number_of_positions,
          application_deadline: draft.application_deadline || null,
          status: draft.status,
          seo_title: draft.seo_title || null,
          seo_description: draft.seo_description || null,
        },
      }),
    onSuccess: (res) => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      qc.invalidateQueries({ queryKey: ["admin-job", res.id] });
      if (isNew) nav({ to: "/admin/jobs/$id", params: { id: res.id }, replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const onTitleChange = (v: string) => {
    setDraft((d) => ({ ...d, title: v, slug: autoSlug ? slugify(v) : d.slug }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || draft.skills.includes(s)) return;
    set("skills", [...draft.skills, s]);
    setSkillInput("");
  };

  if (!isNew && isLoading) {
    return <div className="p-6 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to="/admin/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> All jobs
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold">{isNew ? "New job" : draft.title || "Edit job"}</h1>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !draft.title || !draft.slug}>
          {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="grid gap-1.5">
              <Label>Title *</Label>
              <Input value={draft.title} onChange={(e) => onTitleChange(e.target.value)} maxLength={200} />
            </div>
            <div className="grid gap-1.5">
              <Label>Slug *</Label>
              <Input
                value={draft.slug}
                onChange={(e) => { setAutoSlug(false); set("slug", slugify(e.target.value)); }}
                placeholder="senior-network-engineer"
              />
              <p className="text-xs text-muted-foreground">Public URL: /careers/{draft.slug || "…"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Department</Label>
                <Input value={draft.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Engineering" />
              </div>
              <div className="grid gap-1.5">
                <Label>Location</Label>
                <Input value={draft.location} onChange={(e) => set("location", e.target.value)} placeholder="Dar es Salaam" />
              </div>
              <div className="grid gap-1.5">
                <Label>Employment type</Label>
                <Select value={draft.employment_type} onValueChange={(v: Draft["employment_type"]) => set("employment_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Positions</Label>
                <Input type="number" min={1} value={draft.number_of_positions} onChange={(e) => set("number_of_positions", Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Experience required</Label>
                <Input value={draft.experience_required} onChange={(e) => set("experience_required", e.target.value)} placeholder="3+ years" />
              </div>
              <div className="grid gap-1.5">
                <Label>Education</Label>
                <Input value={draft.education} onChange={(e) => set("education", e.target.value)} placeholder="BSc CS or equivalent" />
              </div>
              <div className="grid gap-1.5">
                <Label>Application deadline</Label>
                <Input type="date" value={draft.application_deadline || ""} onChange={(e) => set("application_deadline", e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v: Draft["status"]) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="grid gap-1.5">
              <Label>Responsibilities</Label>
              <Textarea rows={6} value={draft.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} placeholder="One per line…" />
            </div>
            <div className="grid gap-1.5">
              <Label>Requirements</Label>
              <Textarea rows={6} value={draft.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder="Must-haves…" />
            </div>
            <div className="grid gap-1.5">
              <Label>Benefits</Label>
              <Textarea rows={4} value={draft.benefits} onChange={(e) => set("benefits", e.target.value)} placeholder="Perks and benefits…" />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="Add a skill and press enter"
              />
              <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {draft.skills.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button type="button" onClick={() => set("skills", draft.skills.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {draft.skills.length === 0 && <p className="text-xs text-muted-foreground">No skills yet.</p>}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-sm">SEO</h3>
            <div className="grid gap-1.5">
              <Label>SEO title</Label>
              <Input value={draft.seo_title} onChange={(e) => set("seo_title", e.target.value)} maxLength={160} />
            </div>
            <div className="grid gap-1.5">
              <Label>SEO description</Label>
              <Textarea rows={3} value={draft.seo_description} onChange={(e) => set("seo_description", e.target.value)} maxLength={400} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
