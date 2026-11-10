"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Blocks, FolderGit2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { BlogControls } from "@/components/common/blog-controls";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

type NavItem = {
  href: string;
  labelKey: "about" | "web3" | "projects";
  icon: typeof UserRound;
};

const navItems: NavItem[] = [
  { href: "/about", labelKey: "about", icon: UserRound },
  { href: "/web3", labelKey: "web3", icon: Blocks },
  { href: "/projects", labelKey: "projects", icon: FolderGit2 },
];

export function SiteHeader({ className }: SiteHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const shouldReduceMotion = useReducedMotion();
  const [atTop, setAtTop] = useState(true);

  const navLabel = (labelKey: NavItem["labelKey"]) => {
    if (labelKey !== "web3") return t(labelKey);
    return t("web3Desktop");
  };

  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY <= 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        {/* Left: nombre como home (solo arriba, sin icono de casa) */}
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

        {/* Center: textos arriba, iconos al hacer scroll (estilo mobile dock) */}
        <nav className="flex items-center gap-2 lg:gap-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
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
                    "relative flex flex-col items-center gap-1 transition-all duration-300",
                    atTop
                      ? "text-zinc-900 hover:text-orange-500 dark:text-white"
                      : "text-zinc-600 hover:text-orange-500 dark:text-zinc-400",
                    active ? "text-orange-500 dark:text-orange-400" : "",
                  )}
                >
                  {atTop ? (
                    <>
                      <span className="transition-all duration-300 max-h-6 opacity-100">
                        {navLabel(item.labelKey)}
                      </span>
                      <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                    </>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-zinc-900 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white transition-colors hover:bg-orange-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right: controls */}
        <div className="flex shrink-0 items-center gap-1">
          <motion.div {...entry} transition={entryTransition(0.15)}>
            <BlogControls />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
