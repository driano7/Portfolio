"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { type AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("language");

  const nextLocale: AppLocale = locale === "en" ? "es" : "en";

  const toggleLanguage = () => {
    // Keep current dynamic URL intact and force a fresh render with the updated locale cookie.
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="no-frosted gap-2 border-none bg-transparent text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
      onClick={toggleLanguage}
      aria-label={nextLocale === "en" ? t("switchToEnglish") : t("switchToSpanish")}
    >
      <Languages className="h-4 w-4" />
    </Button>
  );
}
