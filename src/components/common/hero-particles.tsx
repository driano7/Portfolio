'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
};

// Colores del hero: azul, blanco, morado (en lugar del rosa de Calpulli/Amaxing)
const BLUE_RGB = '59, 130, 246';      // blue-500
const WHITE_RGB = '255, 255, 255';    // blanco
const PURPLE_RGB = '168, 85, 247';    // violet-500

const ACCENT_COLORS = [BLUE_RGB, WHITE_RGB, PURPLE_RGB];

export function HeroParticles({
  className,
  quantity = 70,
  speed = 0.4,
  accentRatio = 0.35,
}: {
  className?: string;
  quantity?: number;
  speed?: number;
  accentRatio?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      window.matchMedia('(min-width: 1024px)').matches ? 2 : 1.5
    );
    const particleCount = Math.max(0, Math.floor(quantity));
    const normalizedAccentRatio = Math.min(1, Math.max(0, accentRatio));
    const effectiveTheme = resolvedTheme || theme;
    const isLightTheme = effectiveTheme === 'light';

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        dotsRef.current = [];
        return;
      }

      const isDesktopViewport = window.matchMedia('(min-width: 1024px)').matches;
      const effectiveParticleCount = isDesktopViewport
        ? Math.round(particleCount * 1.2)
        : Math.round(particleCount * 0.4);
      const effectiveSpeed = isDesktopViewport ? speed : speed * 0.7;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const baseColor = isLightTheme ? '15, 23, 42' : '255, 255, 255'; // slate-900 / blanco
      const accentCount = Math.round(effectiveParticleCount * normalizedAccentRatio);
      const accentMap = Array.from({ length: effectiveParticleCount }, (_, index) => index < accentCount);

      for (let i = accentMap.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [accentMap[i], accentMap[j]] = [accentMap[j], accentMap[i]];
      }

      dotsRef.current = Array.from({ length: effectiveParticleCount }, (_, index) => {
        const isAccent = accentMap[index];
        const color = isAccent
          ? ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
          : baseColor;

        return {
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * effectiveSpeed,
          vy: (Math.random() - 0.5) * effectiveSpeed,
          radius: isDesktopViewport
            ? isAccent
              ? 1.6 + Math.random() * 2.0
              : 1.0 + Math.random() * 1.6
            : isAccent
            ? 1.0 + Math.random() * 1.2
            : 0.6 + Math.random() * 1.0,
          alpha: isLightTheme
            ? isAccent
              ? 0.7 + Math.random() * 0.3
              : 0.25 + Math.random() * 0.25
            : isAccent
            ? 0.55 + Math.random() * 0.35
            : 0.3 + Math.random() * 0.3,
          color,
        };
      });
    };

    const draw = () => {
      const rect = container.getBoundingClientRect();

      // Fondo suave para rastro leve (opcional: descomentar para estela)
      // ctx.fillStyle = isLightTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)';
      // ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Dibujar partículas
      for (const dot of dotsRef.current) {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x <= 0 || dot.x >= rect.width) dot.vx *= -1;
        if (dot.y <= 0 || dot.y >= rect.height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.color}, ${dot.alpha})`;
        ctx.fill();
      }

      // Conexiones sutiles entre partículas cercanas (efecto red / shader ligero)
      const maxDistance = 120;
      for (let i = 0; i < dotsRef.current.length; i++) {
        for (let j = i + 1; j < dotsRef.current.length; j++) {
          const a = dotsRef.current[i];
          const b = dotsRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.25})`; // violeta tenue
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    resize();
    rafRef.current = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = window.requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [quantity, speed, theme, resolvedTheme, accentRatio]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className || ''}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default HeroParticles;
