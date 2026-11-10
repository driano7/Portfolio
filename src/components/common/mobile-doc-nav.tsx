"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { MarketTickerToggle } from "@/components/common/market-ticker-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

const MOBILE_CONTROL = "flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300/60 bg-zinc-800/90 text-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-800/90";

export function MobileDocNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const reducedMotion = useReducedMotion();

  // Evitar mismatch de hidratación
  const [isClient, setIsClient] = useState(false);
  const [compact, setCompact] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (pathname === "/" || !isClient) return null;

  // Dock never hides: after inactivity or scroll down it only compacts.
  // Any interaction re-expands it (style EarningsAI).
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCompact(false);
    timerRef.current = setTimeout(() => setCompact(true), 10000);
  }, []);

  useEffect(() => {
    setIsClient(true);
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, resetTimer]);

  useEffect(() => {
    const events = ["pointerdown", "focusin"];
    events.forEach((event) => document.addEventListener(event, resetTimer, { passive: true }));
    return () => events.forEach((event) => document.removeEventListener(event, resetTimer));
  }, [resetTimer]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY) {
        setCompact(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCompact(true), 10000);
      } else {
        resetTimer();
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [resetTimer]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] px-4 sm:hidden">
        <nav
          aria-label="Navegación móvil"
          className={cn(
            "pointer-events-auto relative mx-auto flex w-full max-w-md items-center justify-between gap-2 rounded-[1.6rem] border px-3 py-1 shadow-2xl backdrop-blur-xl transition-all duration-300",
            "border-zinc-300/40 bg-zinc-100/70 dark:border-white/10 dark:bg-zinc-900/55",
            compact ? "px-1.5" : "px-2",
          )}
        >
          {/* Nombre como home */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -18, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0, ease: "easeOut" }}
          >
            <Link
              href="/"
              prefetch
              onClick={resetTimer}
              className={MOBILE_CONTROL}
              aria-label={t("home")}
            >
              <span className="text-[9px] font-medium leading-none text-zinc-900 dark:text-zinc-100">
                Donovan Riaño
              </span>
            </Link>
          </motion.div>

          {/* Precio */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -18, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.09, ease: "easeOut" }}
          >
            <div className={MOBILE_CONTROL} onClick={resetTimer}>
              <MarketTickerToggle />
            </div>
          </motion.div>

          {/* Idioma */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -18, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          >
            <div className={MOBILE_CONTROL} onClick={resetTimer}>
              <LanguageSwitcher />
            </div>
          </motion.div>

          {/* Tema */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -18, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.27, ease: "easeOut" }}
          >
            <div className={MOBILE_CONTROL} onClick={resetTimer}>
              <ThemeSwitcher />
            </div>
          </motion.div>
        </nav>
      </div>
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))] sm:hidden" />
    </>
  );
}
