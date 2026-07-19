import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  return (
    <section className="relative overflow-hidden border-b bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-70" aria-hidden />
      <div className="container-page relative pt-16 pb-14 md:pt-24 md:pb-20">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          {segments.map((seg, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            return (
              <span key={href} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <span className={i === segments.length - 1 ? "text-foreground" : ""}>
                  {seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")}
                </span>
              </span>
            );
          })}
        </nav>
        {eyebrow && (
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {children && <div className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{children}</div>}
      </div>
    </section>
  );
}
