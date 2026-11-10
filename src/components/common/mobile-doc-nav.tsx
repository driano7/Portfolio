"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Blocks, FolderGit2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type MobileNavItem = {
  href: string;
  labelKey: "about" | "web3" | "projects";
  icon: typeof UserRound;
};

const mobileNavItems: MobileNavItem[] = [
  { href: "/about", labelKey: "about", icon: UserRound },
  { href: "/web3", labelKey: "web3", icon: Blocks },
  { href: "/projects", labelKey: "projects", icon: FolderGit2 },
];

const DOCK_BUTTON_BASE = "flex items-center justify-center rounded-xl transition";
const DOCK_BUTTON_ACTIVE = "border-violet-400/50 bg-violet-500/20 text-zinc-950 dark:text-white";
const DOCK_BUTTON_INACTIVE =
  "border-zinc-300/60 bg-zinc-800/90 text-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-800/90";

const isActiveRoute = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function MobileDocNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (pathname === "/") return null;

  const navLabel = (labelKey: MobileNavItem["labelKey"]) => {
    if (labelKey !== "web3") return t(labelKey);
    return t("web3Mobile");
  };

  // Dock never hides: after inactivity or scroll down it only compacts.
  // Any interaction re-expands it (style EarningsAI).
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCompact(false);
    timerRef.current = setTimeout(() => setCompact(true), 10000);
  }, []);

  useEffect(() => {
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
          {mobileNavItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);
            const label = navLabel(item.labelKey);

            return (
              <motion.div
                key={`dock-${item.href}`}
                initial={reducedMotion ? false : { opacity: 0, x: -18, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, delay: index * 0.09, ease: "easeOut" }}
              >
                <Link
                  href={item.href}
                  prefetch
                  onClick={resetTimer}
                  aria-label={label}
                  title={label}
                  className={cn(
                    DOCK_BUTTON_BASE,
                    compact ? "h-9 w-9" : "h-10 w-10",
                    active ? DOCK_BUTTON_ACTIVE : DOCK_BUTTON_INACTIVE,
                  )}
                >
                  <span className="relative flex items-center justify-center">
                    <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-medium leading-none",
                      !compact && (active ? "text-violet-700 dark:text-violet-300" : "text-zinc-600 dark:text-zinc-400"),
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))] sm:hidden" />
    </>
  );
}
