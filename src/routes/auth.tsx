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
            toast.success("Email confirmed! Signing you in...");
            // Clear the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate({ to: redirectTo });
          } else if (error) {
            toast.error("Session setup failed: " + error.message);
          }
        } catch (err) {
          toast.error("Error processing email confirmation");
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
    toast.success("Signed in");
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
    toast.success("Account created. Check your email if confirmation is required.");
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
          {site.name}
        </Link>
        <h1 className="text-center font-display text-2xl font-semibold">Admin Portal</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to manage products, careers and content.
        </p>

        <Button variant="outline" className="mt-6 w-full" onClick={google} type="button">
          Continue with Google
        </Button>
        <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
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
                <Label htmlFor="si-pass">Password</Label>
                <div className="relative"><Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="si-pass" name="password" type="password" required minLength={6} className="pl-9" autoComplete="current-password" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-3 pt-2">
              <div>
                <Label htmlFor="su-name">Full name</Label>
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
                <Label htmlFor="su-pass">Password</Label>
                <div className="relative"><Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="su-pass" name="password" type="password" required minLength={8} className="pl-9" autoComplete="new-password" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
              <p className="text-center text-xs text-muted-foreground">
                The first user to sign up automatically becomes Super Admin.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
