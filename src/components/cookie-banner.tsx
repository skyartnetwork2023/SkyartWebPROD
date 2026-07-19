import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "netpulse-cookies-ack";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { window.localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 rounded-xl border bg-card p-4 shadow-[var(--shadow-elegant)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md">
      <p className="text-sm text-foreground">
        We use cookies to improve your browsing experience, analyse site traffic and personalise content. See our{" "}
        <a href="#" className="text-primary underline underline-offset-2">Cookie Policy</a>.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={dismiss}>Accept all</Button>
        <Button size="sm" variant="outline" onClick={dismiss}>Only essential</Button>
      </div>
    </div>
  );
}
