import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn, Menu, Moon, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { nav, site } from "@/lib/site-data";
import { useTheme } from "@/components/theme-provider";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-xl shadow-[0_1px_0_0_var(--color-border)]"
          : "bg-background/40 backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <Zap className="h-5 w-5" />
          </span>
          <span>{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/contact">Request a Quote</Link>
          </Button>
          {user ? (
            <Button asChild variant="outline" className="hidden md:inline-flex">
              <Link to="/admin"><LayoutDashboard className="mr-1 h-4 w-4" /> Admin</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Sign in">
              <Link to="/auth"><LogIn className="h-4 w-4" /></Link>
            </Button>
          )}
          <Button asChild className="hidden shadow-[var(--shadow-elegant)] md:inline-flex">
            <Link to="/packages">Get Connected</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetTitle className="mb-6 flex items-center gap-2 font-display">
                <Zap className="h-5 w-5 text-primary" /> {site.name}
              </SheetTitle>
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium",
                      pathname === item.href
                        ? "bg-accent text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild variant="outline"><Link to="/contact">Request a Quote</Link></Button>
                <Button asChild><Link to="/packages">Get Connected</Link></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
