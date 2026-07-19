import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { nav } from "@/lib/site-data";
import { listPublicSitemapSlugs } from "@/lib/cms.functions";

const BASE_URL = "https://wb.skyartnetworks.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = nav.map((n) => ({
          path: n.href,
          changefreq: "weekly",
          priority: n.href === "/" ? "1.0" : "0.8",
        }));

        try {
          const { products, jobs } = await listPublicSitemapSlugs();
          for (const p of products) {
            entries.push({ path: `/products/${p.slug}`, lastmod: p.lastmod, changefreq: "weekly", priority: "0.7" });
          }
          for (const j of jobs) {
            entries.push({ path: `/careers/${j.slug}`, lastmod: j.lastmod, changefreq: "weekly", priority: "0.7" });
          }
        } catch {
          // fall through with static entries only
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
