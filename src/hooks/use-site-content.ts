import { useMemo } from "react";
import { useLanguage } from "@/components/language-provider";
import { getLocalizedSiteData } from "@/lib/site-data";

export function useSiteContent() {
  const { locale } = useLanguage();
  return useMemo(() => getLocalizedSiteData(locale), [locale]);
}
