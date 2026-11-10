"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlogControls } from "@/components/common/blog-controls";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const shouldReduceMotion = useReducedMotion();

  // Evitar mismatch de hidratación: inicializar basado en el cliente real
  const [isClient, setIsClient] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setAtTop(window.scrollY <= 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mientras no estamos en el cliente, no renderizar nada (evita parpadeo y mismatch)
  if (!isClient) {
    return null;
  }

  const spring = { type: "spring" as const, stiffness: 420, damping: 26 };
  const entryTransition = (delay: number) => ({ ...spring, delay });

  const entry = {
    initial: shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.8, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    transition: entryTransition(0),
  };

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6", className)}>
      <motion.div
        className={cn(
          "pointer-events-auto relative flex w-full max-w-6xl items-center justify-between gap-3 rounded-3xl border px-3 py-2 shadow-2xl backdrop-blur-md sm:justify-end",
          "border-black/5 bg-white/80 text-zinc-900 dark:border-white/10 dark:bg-black/60 dark:text-zinc-100",
          atTop
            ? "transition-all duration-700"
            : "border-transparent bg-transparent px-3 py-1.5 shadow-none backdrop-blur-none transition-all duration-700",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left: nombre como home */}
        {atTop ? (
          <motion.div {...entry} transition={entryTransition(0)}>
            <Link
              href="/"
              prefetch
              aria-label={t("home")}
              className="inline-flex items-center gap-1.5 truncate rounded-xl px-2 py-1 text-sm font-semibold tracking-tight transition-opacity hover:opacity-90"
            >
              <span className="bg-gradient-to-b from-foreground to-zinc-500 bg-clip-text text-transparent">
                <span className="underline decoration-zinc-500/70 underline-offset-4">Donovan Riaño</span>
              </span>
            </Link>
          </motion.div>
        ) : null}

        {/* Center: enlaces de navegación (solo desktop) */}
        <nav className="hidden sm:flex items-center gap-6">
          {[
            { href: "/about", labelKey: "about" },
            { href: "/web3", labelKey: "web3" },
            { href: "/projects", labelKey: "projects" },
          ].map((item, index) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const label = item.labelKey === "web3" ? t("web3Desktop") : t(item.labelKey);
            return (
              <motion.div
                key={item.href}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={entryTransition(index * 0.05)}
              >
                <Link
                  href={item.href}
                  prefetch
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-orange-500 dark:text-orange-400" : "text-zinc-600 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400",
                  )}
                >
                  {label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right: controles (idioma, tema, precio) */}
        <div className="flex shrink-0 items-center gap-1">
          <motion.div {...entry} transition={entryTransition(0.15)}>
            <BlogControls />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
