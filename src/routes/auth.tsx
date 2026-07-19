import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Zap, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { site } from "@/lib/site-data";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Sign in — ${site.name}` },
      { name: "description", content: "Admin & content manager sign in for SkyArt Networks." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { locale } = useLanguage();
  const isSw = locale === "sw";
  const { site: localizedSite } = useSiteContent();
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search }) as unknown as Record<string, string>;
  const redirectTo = typeof search?.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : "/admin";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo });
    });
  }, [navigate, redirectTo]);

  // Handle email confirmation callback with auth parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1)); // Parse hash parameters
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (accessToken && refreshToken && type) {
      (async () => {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (!error && data.session) {
            toast.success(isSw ? "Barua pepe imethibitishwa. Tunaingia..." : "Email confirmed! Signing you in...");
            // Clear the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate({ to: redirectTo });
          } else if (error) {
            toast.error((isSw ? "Uundaji wa session umeshindikana: " : "Session setup failed: ") + error.message);
          }
        } catch (err) {
          toast.error(isSw ? "Hitilafu katika uthibitisho wa barua pepe" : "Error processing email confirmation");
        }
      })();
    }
  }, [navigate, redirectTo]);

  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(isSw ? "Umeingia" : "Signed in");
    navigate({ to: redirectTo });
  }

  async function signUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback?redirect=/admin",
        data: { full_name: String(fd.get("full_name") || "") },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(isSw ? "Akaunti imeundwa. Angalia barua pepe yako kama uthibitisho unahitajika." : "Account created. Check your email if confirmation is required.");
  }

  async function google() {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("redirect", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
    if (error) return toast.error(error.message);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-hero-radial px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Zap className="h-5 w-5" />
          </span>
          {localizedSite.name}
        </Link>
        <h1 className="text-center font-display text-2xl font-semibold">{isSw ? "Lango la Msimamizi" : "Admin Portal"}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {isSw ? "Ingia kusimamia bidhaa, ajira na maudhui." : "Sign in to manage products, careers and content."}
        </p>

        <Button variant="outline" className="mt-6 w-full" onClick={google} type="button">
          {isSw ? "Endelea na Google" : "Continue with Google"}
        </Button>
        <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> {isSw ? "au" : "or"} <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{isSw ? "Ingia" : "Sign in"}</TabsTrigger>
            <TabsTrigger value="signup">{isSw ? "Fungua akaunti" : "Create account"}</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-3 pt-2">
              <div>
                <Label htmlFor="si-email">Email</Label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="si-email" name="email" type="email" required className="pl-9" autoComplete="email" />
                </div>
              </div>
              <div>
                <Label htmlFor="si-pass">{isSw ? "Nenosiri" : "Password"}</Label>
                <div className="relative"><Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="si-pass" name="password" type="password" required minLength={6} className="pl-9" autoComplete="current-password" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? (isSw ? "Inaingia..." : "Signing in...") : (isSw ? "Ingia" : "Sign in")}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-3 pt-2">
              <div>
                <Label htmlFor="su-name">{isSw ? "Jina kamili" : "Full name"}</Label>
                <div className="relative"><User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="su-name" name="full_name" required className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="su-email">Email</Label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="su-email" name="email" type="email" required className="pl-9" autoComplete="email" />
                </div>
              </div>
              <div>
                <Label htmlFor="su-pass">{isSw ? "Nenosiri" : "Password"}</Label>
                <div className="relative"><Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="su-pass" name="password" type="password" required minLength={8} className="pl-9" autoComplete="new-password" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? (isSw ? "Inaunda..." : "Creating...") : (isSw ? "Fungua akaunti" : "Create account")}</Button>
              <p className="text-center text-xs text-muted-foreground">
                {isSw ? "Mtumiaji wa kwanza kujiandikisha anakuwa Super Admin moja kwa moja." : "The first user to sign up automatically becomes Super Admin."}
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
