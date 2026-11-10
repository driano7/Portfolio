"use client";

import { cn } from "@/lib/utils";

type GlassBlur = "none" | "sm" | "md" | "xl" | "2xl";

export function GlassDark({
  children,
  className = "",
  blur = "md",
  border = "border-white/10",
  bg = "bg-zinc-900/40",
  shadow = "shadow-lg",
}: {
  children: React.ReactNode;
  className?: string;
  blur?: GlassBlur;
  border?: string;
  bg?: string;
  shadow?: string;
}) {
  const blurMap: Record<GlassBlur, string> = {
    none: "",
    sm: "blur-sm backdrop-blur-sm",
    md: "blur backdrop-blur-md",
    xl: "blur-xl backdrop-blur-xl",
    "2xl": "blur-[20px] backdrop-blur-[20px]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        border,
        bg,
        shadow,
        blurMap[blur],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <GlassDark
      className={cn(
        "border-white/5 bg-zinc-900/30 transition-all duration-300",
        hover
          ? "hover:border-violet-400/50 hover:bg-zinc-900/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)]"
          : "",
        className,
      )}
    >
      {children}
    </GlassDark>
  );
}

export function GlassButton({
  children,
  className = "",
  accent = "violet",
  href,
  target,
  rel,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: "violet" | "emerald" | "pink" | "amber";
  href?: string;
  target?: string;
  rel?: string;
}) {
  const accentMap: Record<string, string> = {
    violet:
      "text-violet-300 hover:text-violet-200 border-violet-400/30 hover:border-violet-400/60 shadow-[0_0_16px_rgba(139,92,246,0.12)]",
    emerald:
      "text-emerald-300 hover:text-emerald-200 border-emerald-400/30 hover:border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.12)]",
    pink:
      "text-pink-300 hover:text-pink-200 border-pink-400/30 hover:border-pink-400/60 shadow-[0_0_16px_rgba(236,72,153,0.12)]",
    amber:
      "text-amber-300 hover:text-amber-200 border-amber-400/30 hover:border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.12)]",
  };

  const base = cn(
    "relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
    "border border-white/10 bg-zinc-900/50 backdrop-blur-md",
    accentMap[accent],
    "hover:bg-zinc-900/70 hover:scale-105 active:scale-95",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={base}
      >
        <span className="relative z-10">{children}</span>
        <span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        />
      </a>
    );
  }

  return (
    <button className={base}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />
    </button>
  );
}
