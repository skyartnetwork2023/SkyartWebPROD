import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package, CheckCircle2, Star, FolderTree, Briefcase, FileEdit,
  BadgeCheck, MessageSquare, ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function KPI({ icon: Icon, label, value, tone = "primary" }: { icon: React.ElementType; label: string; value: number | string; tone?: "primary" | "success" | "warning" | "info" }) {
  const tones = {
    primary: "from-primary/10 to-primary/5 text-primary",
    success: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    warning: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
    info: "from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400",
  }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tones}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });

  const s = data ?? {
    totalProducts: 0, activeProducts: 0, featuredProducts: 0, categories: 0,
    totalJobs: 0, publishedJobs: 0, draftJobs: 0, newInquiries: 0,
    recent: { inquiries: [], applications: [], contact: [] },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of catalog, careers and inbox activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/admin/products">Manage products</Link></Button>
          <Button asChild><Link to="/admin/jobs">New job posting</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPI icon={Package} label="Total Products" value={isLoading ? "—" : s.totalProducts} />
        <KPI icon={CheckCircle2} label="Active Products" value={isLoading ? "—" : s.activeProducts} tone="success" />
        <KPI icon={FolderTree} label="Categories" value={isLoading ? "—" : s.categories} tone="info" />
        <KPI icon={Star} label="Featured Products" value={isLoading ? "—" : s.featuredProducts} tone="warning" />
        <KPI icon={Briefcase} label="Total Jobs" value={isLoading ? "—" : s.totalJobs} />
        <KPI icon={BadgeCheck} label="Published Jobs" value={isLoading ? "—" : s.publishedJobs} tone="success" />
        <KPI icon={FileEdit} label="Draft Jobs" value={isLoading ? "—" : s.draftJobs} tone="warning" />
        <KPI icon={MessageSquare} label="New Inquiries" value={isLoading ? "—" : s.newInquiries} tone="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Product Inquiries</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/inquiries">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          <ul className="mt-3 space-y-3 text-sm">
            {s.recent.inquiries.length === 0 && <li className="text-muted-foreground">No inquiries yet.</li>}
            {s.recent.inquiries.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.product_name ?? "General"}</p>
                </div>
                <Badge variant={i.status === "new" ? "default" : "secondary"} className="capitalize">{i.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Applications</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/applications">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          <ul className="mt-3 space-y-3 text-sm">
            {s.recent.applications.length === 0 && <li className="text-muted-foreground">No applications yet.</li>}
            {s.recent.applications.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0">
                <p className="font-medium">{a.full_name}</p>
                <Badge variant="secondary" className="capitalize">{String(a.status).replace(/_/g, " ")}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Contact Messages</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/contact">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          <ul className="mt-3 space-y-3 text-sm">
            {s.recent.contact.length === 0 && <li className="text-muted-foreground">No messages yet.</li>}
            {s.recent.contact.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.subject ?? "No subject"}</p>
                </div>
                <Badge variant={c.status === "new" ? "default" : "secondary"} className="capitalize">{c.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
