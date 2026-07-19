import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

const KEY = "netpulse-cookies-ack";

export function CookieBanner() {
  const { messages } = useLanguage();
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
        {messages.cookieNotice}{" "}
        <a href="#" className="text-primary underline underline-offset-2">{messages.cookiePolicy}</a>.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={dismiss}>{messages.acceptAll}</Button>
        <Button size="sm" variant="outline" onClick={dismiss}>{messages.onlyEssential}</Button>
      </div>
    </div>
  );
}
