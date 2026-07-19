import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { CookieBanner } from "@/components/cookie-banner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-data";

function NotFoundComponent() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-hero-radial px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-8xl font-bold gradient-text">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">{isSw ? "Ukurasa haujapatikana" : "Page not found"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSw ? "Ukurasa unaoutafuta haupo au umehamishwa." : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link to="/">{isSw ? "Rudi nyumbani" : "Go home"}</Link></Button>
          <Button asChild variant="outline"><Link to="/contact">{isSw ? "Wasiliana na msaada" : "Contact support"}</Link></Button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-hero-radial px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-bold gradient-text">500</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">
          {isSw ? "Kuna hitilafu upande wetu" : "Something went wrong on our end"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSw ? "Timu yetu imejulishwa. Jaribu ku-refresh au rudi nyumbani." : "Our team has been notified. Try refreshing, or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => { router.invalidate(); reset(); }}>{isSw ? "Jaribu tena" : "Try again"}</Button>
          <Button asChild variant="outline"><a href="/">{isSw ? "Rudi nyumbani" : "Go home"}</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1E5BE0" },
      { title: `${site.name} — ${site.tagline}` },
      { name: "description", content: site.description },
      { name: "author", content: site.name },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: `${site.name} — Fast, reliable and affordable internet` },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@SkyArtNetworks" },
      { title: "Skyart Networks" },
      { property: "og:title", content: "Skyart Networks" },
      { name: "twitter:title", content: "Skyart Networks" },
      { name: "description", content: "ISP Command Center is a comprehensive management system for Internet Service Providers." },
      { property: "og:description", content: "ISP Command Center is a comprehensive management system for Internet Service Providers." },
      { name: "twitter:description", content: "ISP Command Center is a comprehensive management system for Internet Service Providers." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3bf16cf1-f4f1-412a-87c1-0a4e0bcf2e1d/id-preview-7af15e40--a76068a1-d15b-4829-9eaf-fe7de20fa1a5.lovable.app-1783862697968.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3bf16cf1-f4f1-412a-87c1-0a4e0bcf2e1d/id-preview-7af15e40--a76068a1-d15b-4829-9eaf-fe7de20fa1a5.lovable.app-1783862697968.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          description: site.description,
          telephone: site.phone,
          email: site.email,
          address: { "@type": "PostalAddress", streetAddress: site.address },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChromeless = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
    });
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          {isChromeless ? (
            <Outlet />
          ) : (
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <main className="flex-1">
                <Outlet />
              </main>
              <SiteFooter />
            </div>
          )}
          <ScrollToTop />
          <CookieBanner />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
