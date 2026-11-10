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

// Colores del hero: morado, azul y blanco (en lugar del rosa de Calpulli/Amaxing)
const PURPLE_RGB = '168, 85, 247'; // violet-500
const BLUE_RGB = '59, 130, 246';   // blue-500
const WHITE_RGB = '255, 255, 255'; // blanco

const ACCENT_COLORS = [PURPLE_RGB, BLUE_RGB, WHITE_RGB];

export function HeroParticles({
  className,
  quantity = 90,
  speed = 0.35,
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

  function getParticleColor(theme?: string) {
    return theme === 'light' ? '0, 0, 0' : '255, 255, 255';
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

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
      const isDesktopViewport = window.matchMedia('(min-width: 1024px)').matches;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        dotsRef.current = [];
        return;
      }
      const effectiveParticleCount = isDesktopViewport
        ? Math.round(particleCount * 1.15)
        : Math.round(particleCount * 0.35);
      const effectiveSpeed = isDesktopViewport ? speed : speed * 0.7;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const baseColor = getParticleColor(effectiveTheme);
      const accentCount = Math.round(effectiveParticleCount * normalizedAccentRatio);
      const accentMap = Array.from(
        { length: effectiveParticleCount },
        (_, index) => index < accentCount
      );

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
          ...(isAccent
            ? {
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                vx: (Math.random() - 0.5) * effectiveSpeed,
                vy: (Math.random() - 0.5) * effectiveSpeed,
                radius: isDesktopViewport ? 1.4 + Math.random() * 2.0 : 1.0 + Math.random() * 1.4,
                alpha: isLightTheme ? 0.85 + Math.random() * 0.15 : 0.65 + Math.random() * 0.3,
                color,
              }
            : {
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                vx: (Math.random() - 0.5) * effectiveSpeed,
                vy: (Math.random() - 0.5) * effectiveSpeed,
                radius: isDesktopViewport ? 1.0 + Math.random() * 1.8 : 0.7 + Math.random() * 1.2,
                alpha: isLightTheme ? 0.35 + Math.random() * 0.35 : 0.4 + Math.random() * 0.4,
                color,
              }),
        };
      });
    };

    const draw = () => {
      const rect = container.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);

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
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 ${className || ''}`}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
    </div>
  );
}

export default HeroParticles;
