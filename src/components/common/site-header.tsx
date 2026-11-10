"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, useTransform, useScroll, useReducedMotion } from "framer-motion";
import { Blocks, FolderGit2, Home, UserRound, Compass, Newspaper, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { BlogControls } from "@/components/common/blog-controls";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

type NavItem = {
  href: string;
  labelKey: "home" | "about" | "web3" | "projects";
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/about", labelKey: "about", icon: UserRound },
  { href: "/web3", labelKey: "web3", icon: Blocks },
  { href: "/projects", labelKey: "projects", icon: FolderGit2 },
];

export function SiteHeader({ className }: SiteHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [atTop, setAtTop] = useState(true);

  const navLabel = (labelKey: NavItem["labelKey"], mobile: boolean) => {
    if (labelKey !== "web3") return t(labelKey);
    return mobile ? t("web3Mobile") : t("web3Desktop");
  };

  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY <= 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showLabels = atTop;

  const circleStyle = {
    background:
      "linear-gradient(135deg, #DE1D8D 0%, #BE1588 25%, #9F0E7F 50%, #7B2BD9 75%, #6A0568 100%)",
  };

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
          "pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-3xl border px-3 py-2 shadow-2xl backdrop-blur-md sm:justify-end",
          "border-black/5 bg-white/80 text-zinc-900 dark:border-white/10 dark:bg-black/60 dark:text-zinc-100",
          atTop
            ? "transition-all duration-700"
            : "border-transparent bg-transparent px-3 py-1.5 shadow-none backdrop-blur-none transition-all duration-700",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left: logo + brand */}
        <div className="flex shrink-0 items-center gap-2.5">
          <motion.div {...entry} transition={entryTransition(0)}>
            <Link href="/" className="group flex items-center" aria-label={t("home")}>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-transform group-hover:rotate-6",
                  atTop ? "" : "shadow-lg ring-1 ring-black/10 dark:ring-white/20",
                )}
                style={circleStyle}
              >
                <Home className="h-full w-full object-cover text-white" />
              </div>
            </Link>
          </motion.div>

          <motion.div {...entry} transition={entryTransition(0.05)}>
            <Link
              href="/"
              prefetch
              aria-label={t("home")}
              className={cn(
                "font-serif text-lg font-bold tracking-wide text-zinc-900 transition-colors hover:text-orange-500 dark:text-white",
                atTop ? "hidden sm:block" : "hidden",
              )}
            >
              Donovan Riaño
            </Link>
          </motion.div>
        </div>

        {/* Center: navigation */}
        <motion.div
          {...entry}
          transition={entryTransition(0.1)}
          className={cn("items-center gap-1 lg:gap-2", atTop ? "hidden sm:flex" : "hidden")}
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  prefetch
                  className={cn(
                    "group relative flex flex-col items-center gap-1 text-sm font-semibold tracking-wide transition duration-300",
                    "text-zinc-900 hover:text-orange-500 dark:text-white",
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span
                    className={cn(
                      "transition-all duration-300",
                      showLabels ? "max-h-6 opacity-100" : "hidden max-h-0 opacity-0",
                    )}
                  >
                    {navLabel(item.labelKey, false)}
                  </span>
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

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
