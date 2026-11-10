"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { Repository } from "@/app/projects/page";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, ChevronDown, ChevronUp, GitFork, Globe2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { GitHubContributions } from "./github-contributions";
import { ScrollRevealStagger } from "@/components/ui/scroll-reveal-stagger";
import { ScrollTyping } from "@/components/ui/scroll-typing";
import { GlassDark, GlassCard, GlassButton } from "@/components/ui/glass-dark";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";

type ProjectsProps = {
  projects: Repository[];
};

function DropdownIconButton({
  open,
  onClick,
  ariaLabel,
}: {
  open: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="no-frosted group relative h-9 w-9 overflow-hidden rounded-full border border-violet-400/35 bg-zinc-900/60 text-zinc-100 transition-transform duration-200 hover:scale-105 hover:border-violet-300/60 active:scale-95 dark:bg-zinc-950/70"
    >
      <span className="pointer-events-none absolute inset-0 theme-toggle-gradient" aria-hidden />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <span className="relative inline-flex h-full w-full items-center justify-center">
        {open ? <ChevronUp className="h-4 w-4 text-violet-200" /> : <ChevronDown className="h-4 w-4 text-violet-200" />}
      </span>
    </button>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const locale = useLocale() as AppLocale;
  const isEs = locale === "es";
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isProjectsVisible, setIsProjectsVisible] = useState(false);
  const [atPageBottom, setAtPageBottom] = useState(false);
  const [calpulliOpen, setCalpulliOpen] = useState(false);
  const [xocoOpen, setXocoOpen] = useState(false);
  const [strawberryOpen, setStrawberryOpen] = useState(false);
  const latestProjects = projects.slice(0, 7);
  const getDisplayProjectName = (name: string) =>
    name.toLowerCase() === "portoflio" ? "Portfolio" : name;

  // Refs y visibilidad para animaciones de scroll
  const githubRef = useRef<HTMLDivElement | null>(null);
  const isGitHubVisible = useInView(githubRef, { amount: 0.15, once: true });

  const calpulliRef = useRef<HTMLDivElement | null>(null);
  const isCalpulliVisible = useInView(calpulliRef, { amount: 0.15, once: true });

  const xocoRef = useRef<HTMLDivElement | null>(null);
  const isXocoVisible = useInView(xocoRef, { amount: 0.15, once: true });

  const strawberryRef = useRef<HTMLDivElement | null>(null);
  const isStrawberryVisible = useInView(strawberryRef, { amount: 0.15, once: true });

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      setAtPageBottom(scrollBottom >= pageHeight - 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsProjectsVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="relative py-20">
      {isProjectsVisible && !atPageBottom ? (
        <div
          aria-hidden
          className="pointer-events-none fixed left-1/2 bottom-28 z-40 -translate-x-1/2 sm:hidden"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/35 bg-zinc-900/70 text-violet-200 shadow-lg backdrop-blur-md dark:bg-zinc-950/75">
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </span>
        </div>
      ) : null}
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="mx-auto mb-8 max-w-5xl text-center">
          <h2 className="landing-reveal-title text-4xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            <span className="landing-reveal-title__line">
              <span>
                {isEs ? (
                  <>
                    Mis portafolios y <span className="text-violet-500 dark:text-violet-400">contribuciones</span> en tiempo real
                  </>
                ) : (
                  <>
                    My portfolios and real-time <span className="text-violet-500 dark:text-violet-400">contributions</span>
                  </>
                )}
              </span>
            </span>
          </h2>
          <ScrollTyping className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
            {isEs
              ? "Seguimiento profesional de actividad en GitHub con visualización de contribuciones y una selección curada de repositorios recientes."
              : "Professional tracking of GitHub activity with contribution visualization and a curated selection of recent repositories."}
          </ScrollTyping>
        </div>

        <motion.div
          ref={githubRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isGitHubVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-[2rem] border border-violet-300/40 bg-zinc-100/70 p-4 dark:border-violet-500/20 dark:bg-zinc-950/70 md:p-6"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/50 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/40 dark:text-violet-300">
            <CalendarClock className="h-3.5 w-3.5" />
            {isEs ? "Contribuciones de GitHub" : "GitHub Contributions"}
          </div>
          <GitHubContributions username="driano7" />
        </motion.div>

        <motion.div
          ref={calpulliRef}
          initial={{ opacity: 0, y: -30 }}
          animate={isCalpulliVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-8 border border-white/10 bg-zinc-900/30 p-5 md:p-6"
        >
          <GlassCard className="border-none bg-transparent p-0 md:p-0 shadow-none">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400 dark:border-white/10 dark:text-zinc-300">
                {isEs ? "Producto vivo · Co-fundador & Producto" : "Live product · Co-founder & Product"}
              </div>
              <DropdownIconButton
                open={calpulliOpen}
                onClick={() => setCalpulliOpen((prev) => !prev)}
                ariaLabel={isEs ? "Desplegar información de Calpulli" : "Toggle Calpulli details"}
              />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
              {isEs ? "Calpulli CDMX — tours con alma local en CDMX" : "Calpulli CDMX — Local soul tours in Mexico City"}
            </h3>
          <p className="mt-3 max-w-5xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-base">
            {isEs
              ? "Calpulli nace del cruce de dos historias en la Ciudad de México: uno de nosotros vive aquí y la camina todos los días; el otro la mira desde lejos y con ganas. Juntos diseñamos recorridos a pie en grupos pequeños — comida callejera, historia, barrios y museos — guiados por locales que conocen la ciudad real, sin trampas para turistas. 'Calpulli' es la palabra náhuatl para el barrio: la ciudad vivida como vecindario, con la gente que la habita."
              : "Calpulli was born from two stories crossing in Mexico City: one of us lives here and walks it every day; the other sees it from afar and misses it. Together we design small-group walking journeys — street food, history, neighborhoods and museums — led by locals who know the real city, with zero tourist traps. 'Calpulli' is the Nahuatl word for the barrio: the city lived as a neighborhood, with the people who inhabit it."}
          </p>
          {calpulliOpen ? (
            <GlassDark className="defi-dropdown-reveal mt-3 p-4 border-white/5 bg-zinc-900/20">
              <p className="mt-3 max-w-5xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
                {isEs
                  ? "Qué ofrecemos: journeys bookables en grupos pequeños (Luchas, Centro Histórico, Antropología, Chapultepec, Jamaica, Roma & Condesa, Coyoacán), con entrada resuelta y punto de encuentro confirmado al reservar. También walks autoguiados gratuitos (60–90 min), mapas interactivos de la CDMX y Local Picks mensuales con lo mejor de la ciudad."
                  : "What we offer: bookable journeys in small groups (Luchas, Centro Histórico, Anthropology, Chapultepec, Jamaica, Roma & Condesa, Coyoacán), with entry logistics solved and meeting point confirmed on booking. Also free self-guided walks (60–90 min), interactive CDMX maps and monthly Local Picks with the best of the city."}
              </p>
              <p className="mt-2 max-w-5xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
                {isEs ? (
                  <>
                    La experiencia incluye un{" "}
                    <span className="font-mono text-xs">chatbot flotante</span> estilo WhatsApp (Calpulli AI) que te guía en tiempo real: qué hacer hoy, recomendaciones de comida, si es seguro moverse o cómo reservar un journey. Todo pensado para que planees tu visita como si te lo contara un amigo local. Los QRs de check-in y el panel de reserva cierran el círculo desde el mensaje hasta la puerta del lugar.
                    <br />
                    <br />
                    Vive en{" "}
                    <a
                      href="[DOMINIO_CALPULLI]"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-zinc-900 dark:hover:text-zinc-200"
                    >
                      [DOMINIO_CALPULLI]
                    </a>
                    {" — "}el abrazo de la ciudad que amamos.
                  </>
                ) : (
                  <>
                    The experience includes a floating{" "}
                    <span className="font-mono text-xs">WhatsApp-style chatbot</span> (Calpulli AI) that guides you in real time: what to do today, food recommendations, safety tips, or how to book a journey. Everything designed so you plan your visit as if a local friend were telling you. QR check-in and the booking panel close the loop from message to doorstep.
                    <br />
                    <br />
                    Live at{" "}
                    <a
                      href="[DOMINIO_CALPULLI]"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-zinc-900 dark:hover:text-zinc-200"
                    >
                      [DOMINIO_CALPULLI]
                    </a>
                    {" — "}the embrace of the city we love.
                  </>
                )}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <GlassButton
                  href="[DOMINIO_CALPULLI]"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Ver Calpulli en vivo" : "Visit Calpulli live"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
                <GlassButton
                  href="[DOMINIO_CALPULLI]/journeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Journeys bookables" : "Bookable journeys"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
                <GlassButton
                  href="[DOMINIO_CALPULLI]/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Quiénes somos" : "About us"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
                <GlassButton
                  href="https://github.com/driano7/calpulli"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  GitHub — driano7/calpulli
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
              </div>
            </GlassDark>
          ) : null}
          </GlassCard>
        </motion.div>

        <motion.div
          ref={xocoRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isXocoVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-8 border border-white/10 bg-zinc-900/30 p-5 md:p-6"
        >
          <GlassCard className="border-none bg-transparent p-0 md:p-0 shadow-none">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400 dark:border-white/10 dark:text-zinc-300">
                {isEs ? "Proyecto en desarrollo" : "Project in progress"}
              </div>
              <DropdownIconButton
                open={xocoOpen}
                onClick={() => setXocoOpen((prev) => !prev)}
                ariaLabel={isEs ? "Desplegar información de Xoco Suite" : "Toggle Xoco Suite details"}
              />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
              {isEs
                ? "Xoco Suite - POS, métricas avanzadas y app cliente"
                : "Xoco Suite - POS, advanced metrics, and client app"}
            </h3>
          <p className="mt-3 max-w-5xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-base">
            {isEs
              ? "Proyecto en el que he estado trabajando durante los últimos meses. Xoco Suite es un software integral para restaurantes y negocios de alimentos que conecta sitio web, app de cliente y punto de venta en una sola arquitectura de producto. El POS se integra directamente con la app de cliente para sincronizar pedidos en tiempo real y habilitar una operación continua entre atención, cocina y servicio."
              : "A project I have been building over the last few months. Xoco Suite is an integrated software product for restaurants and food businesses that connects website, client app, and point of sale in one architecture. The POS is directly integrated with the client app to sync orders in real time and enable continuous operations across service, kitchen, and support."}
          </p>
          {xocoOpen ? (
            <GlassDark className="defi-dropdown-reveal mt-3 p-4 border-white/5 bg-zinc-900/20">
              <p className="mt-3 max-w-5xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
                {isEs
                  ? "La solución incorpora métricas avanzadas, gestión de higiene y cumplimiento alineada a organismos gubernamentales, y una capa de pagos moderna: gracias al acuerdo con "
                  : "The solution includes advanced metrics, hygiene and compliance management aligned with government entities, and a modern payment layer: thanks to an agreement with "}
                <a
                  href="https://blokko.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  blokko.io
                </a>
                {isEs
                  ? ", permite recibir pagos en cripto o en rieles latinoamericanos como PIX, SPEI y Mercado Libre, con liquidación al día siguiente en moneda local, bajo una experiencia equivalente a una transacción con tarjeta Visa o Master card."
                  : ", it supports crypto payments and LATAM payment rails such as PIX, SPEI, and Mercado Libre, with next-day settlement in local currency under an experience equivalent to a Visa or Master card transaction."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <GlassButton
                  href="https://v0-xoco-suite-landing.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Landing Xoco Suite" : "Xoco Suite landing"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
                <GlassButton
                  href="https://xococafe.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Demo app cliente" : "Client app demo"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
              </div>
            </GlassDark>
          ) : null}
          </GlassCard>
        </motion.div>

        <motion.div
          ref={strawberryRef}
          initial={{ opacity: 0, y: -30 }}
          animate={isStrawberryVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-8 border border-white/10 bg-zinc-900/30 p-5 md:p-6"
        >
          <GlassCard className="border-none bg-transparent p-0 md:p-0 shadow-none">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400 dark:border-white/10 dark:text-zinc-300">
                {isEs ? "Proyecto conceptual" : "Concept project"}
              </div>
              <DropdownIconButton
                open={strawberryOpen}
                onClick={() => setStrawberryOpen((prev) => !prev)}
                ariaLabel={isEs ? "Desplegar información de Strawberry Wallet" : "Toggle Strawberry Wallet details"}
              />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
              {isEs
                ? "Strawberry Wallet + ZK Proofs"
                : "Strawberry Wallet + ZK Proofs"}
            </h3>
          {strawberryOpen ? (
            <GlassDark className="defi-dropdown-reveal mt-3 p-4 border-white/5 bg-zinc-900/20">
              <p className="mt-3 max-w-5xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-base">
                {isEs
                  ? "Concepto de wallet enfocada en privacidad y usabilidad. Usa Zero-Knowledge Proofs para validar información sin exponer datos sensibles."
                  : "A wallet concept focused on privacy and usability. It uses Zero-Knowledge Proofs to validate information without exposing sensitive data."}
              </p>
              <p className="mt-2 max-w-5xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
                {isEs
                  ? "Objetivo: seguridad operativa con mejor experiencia de usuario para pagos y transferencias en entornos Web3."
                  : "Goal: stronger operational security with a better user experience for Web3 payments and transfers."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <GlassButton
                  href="https://strawberrywallet.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Abrir app Strawberry" : "Open Strawberry app"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
                <GlassButton
                  href="https://github.com/driano7/StrawberryWallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  accent="violet"
                >
                  {isEs ? "Repo Strawberry Wallet" : "Strawberry Wallet repo"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </GlassButton>
              </div>
            </GlassDark>
          ) : null}
          </GlassCard>
        </motion.div>

        <div className="mt-12 mb-6 flex items-center justify-between gap-3">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
            {isEs ? "Repositorios recientes destacados" : "Featured recent repositories"}
          </h3>
          <span className="rounded-full border border-zinc-300 bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
            {isEs ? "Showcase técnico" : "Technical showcase"}
          </span>
        </div>

        <ScrollRevealStagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {latestProjects.map((project, index) => {
            const displayName = getDisplayProjectName(project.name);
            const hasCover = Boolean(project.coverImageUrl);
            const bars = [24, 40, 58, 76].map((base, barIndex) => {
              const activityBoost = Math.min(22, Math.floor((project.stargazers_count + project.forks_count) / (barIndex + 3)));
              return Math.min(92, base + activityBoost);
            });

            return (
              <article
                key={project.id}
                className="rounded-[2rem] border border-zinc-300 bg-white/80 p-3 transition-colors hover:border-violet-400/60 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-violet-500/45"
              >
                <div className="relative mb-4 h-44 overflow-hidden rounded-[1.4rem] border border-zinc-300/80 bg-gradient-to-br from-violet-500/20 via-zinc-100 to-sky-500/15 p-4 dark:border-zinc-700/70 dark:via-zinc-900">
                  {hasCover ? (
                    <>
                      <img
                        src={project.coverImageUrl ?? ""}
                        alt={`${displayName} cover`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/45" />
                    </>
                  ) : (
                    <>
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-400/20 blur-xl" />
                      <div className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-sky-400/15 blur-xl" />
                    </>
                  )}
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-zinc-300 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-200">
                      <Globe2 className="h-3.5 w-3.5 text-violet-500 dark:text-violet-300" />
                      {project.language ?? (isEs ? "Repositorio" : "Repository")}
                    </div>
                    {!hasCover ? (
                      <div className="flex items-end gap-2">
                        {bars.map((height, barIndex) => (
                          <div
                            key={`${project.id}-bar-${barIndex}`}
                            className="w-10 rounded-t-xl border border-violet-500/30 bg-violet-500/70"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-300">
                    #{index + 1} {isEs ? "Portafolio" : "Portfolio"}
                  </div>

                  <h4 className="text-xl font-bold leading-tight text-zinc-900 dark:text-white">{displayName}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {project.description ?? (isEs ? "Repositorio sin descripción por el momento." : "Repository without description yet.")}
                  </p>

                  <div className="mt-3 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-violet-500 dark:text-violet-300" />
                        {project.stargazers_count}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <GitFork className="h-4 w-4 text-violet-500 dark:text-violet-300" />
                        {project.forks_count}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {isEs ? "Actualizado " : "Updated "} {formatDistanceToNow(new Date(project.pushed_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-frosted mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {isEs ? "Abrir repositorio" : "Open repository"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </ScrollRevealStagger>

        {latestProjects.length === 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-300 bg-white/70 px-4 py-5 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            {isEs ? "No hay proyectos disponibles en este momento." : "No projects available right now."}
          </div>
        )}
      </div>
    </section>
  );
}
