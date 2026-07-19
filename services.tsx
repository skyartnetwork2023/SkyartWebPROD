import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { posts as fallbackPosts, site } from "@/lib/site-data";
import { listSectionPublic } from "@/lib/site-sections.functions";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: `Article — ${site.name}` },
      { name: "description", content: `Read the full article on ${site.name}.` },
    ],
  }),
  component: BlogArticle,
  notFoundComponent: () => (
    <div className="container-page section-py text-center">
      <h1 className="font-display text-2xl font-semibold">Article not found</h1>
      <Button asChild className="mt-4"><Link to="/blog">Back to blog</Link></Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-page section-py text-center text-sm text-destructive">{error.message}</div>
  ),
});

type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  cover?: string;
  body?: string;
  external_url?: string;
  document_url?: string;
};

function BlogArticle() {
  const { slug } = Route.useParams();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["public-section", "blog"],
    queryFn: () => listSectionPublic({ data: { section: "blog" } }),
  });

  const dbPosts: Post[] = (rows ?? []).map((r) => {
    const d = r.data as Record<string, unknown>;
    return {
      slug: (d.slug as string) ?? r.id,
      title: (d.title as string) ?? "Untitled",
      date: (d.date as string) ?? "",
      category: (d.category as string) ?? "General",
      excerpt: (d.excerpt as string) ?? "",
      cover: d.cover as string | undefined,
      body: d.body as string | undefined,
      external_url: d.external_url as string | undefined,
      document_url: d.document_url as string | undefined,
    };
  });
  const posts: Post[] = dbPosts.length > 0 ? dbPosts : (fallbackPosts as Post[]);
  const post = posts.find((p) => p.slug === slug);

  if (isLoading) return <div className="container-page section-py">Loading…</div>;
  if (!post) throw notFound();

  const hasDoc = !!post.document_url?.trim();

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title}>
        {post.excerpt}
      </PageHero>
      <section className="section-py">
        <div className="container-page max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
          {post.cover && (
            <img src={post.cover} alt={post.title} className="mt-6 aspect-[16/9] w-full rounded-xl object-cover" />
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            {post.date && new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            {" · "}
            <Badge variant="secondary">{post.category}</Badge>
          </p>

          {hasDoc ? (
            <>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <a href={post.document_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" /> Open PDF in new tab
                  </a>
                </Button>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl border">
                <object
                  data={post.document_url}
                  type="application/pdf"
                  className="h-[80vh] w-full"
                >
                  <iframe
                    title={post.title}
                    src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(post.document_url!)}`}
                    className="h-[80vh] w-full border-0"
                  />
                </object>
              </div>
            </>
          ) : (
            <article className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
              {(post.body?.trim() ? post.body : post.excerpt || "This article has no content yet.")
                .split(/\n{2,}/)
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-wrap">{para}</p>
                ))}
            </article>
          )}
        </div>
      </section>
    </>
  );
}


