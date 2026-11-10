'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";
import { HeroShader } from "@/components/common/hero-shader";

export function Landing() {
  const router = useRouter();
  const t = useTranslations("landing");

  useEffect(() => {
    const routes = ['/about', '/web3', '/projects'];
    for (const route of routes) {
      router.prefetch(route);
    }
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Shader WebGL estilo Amaxing: ondas fluidas morado + azul + blanco */}
      <HeroShader />

      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in">
        <h1 className="landing-reveal-title whitespace-nowrap text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          <span className="landing-reveal-title__line">
            <span className="bg-gradient-to-b from-foreground to-zinc-500 bg-clip-text text-transparent">Donovan Riaño</span>
          </span>
        </h1>
        <p className="landing-reveal-subtitle mt-4 text-lg text-muted-foreground">
          {t("subtitle")}
        </p>

        <nav className="landing-reveal-nav my-16 flex items-center justify-center gap-4">
          <Link href="/about" prefetch className="text-sm duration-500 text-zinc-500 hover:text-zinc-300">
            {t("about")}
          </Link>
          <Link href="/web3" prefetch className="text-sm duration-500 text-zinc-500 hover:text-zinc-300">
            {t("web3")}
          </Link>
          <Link href="/projects" prefetch className="text-sm duration-500 text-zinc-500 hover:text-zinc-300">
            {t("projects")}
          </Link>
        </nav>
      </div>
    </div>
  );
}
