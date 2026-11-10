'use client'

import { useEffect, useRef, useState } from 'react'

type HeroShaderProps = {
  className?: string
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_themeProgress; // 0.0 = dark mode, 1.0 = light mode

// Hash function for procedural noise & subtle film grain
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// Quintic smooth noise for liquid domain distortion
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  
  float a = (hash22(i).x - 0.5) * 2.0;
  float b = (hash22(i + vec2(1.0, 0.0)).x - 0.5) * 2.0;
  float c = (hash22(i + vec2(0.0, 1.0)).x - 0.5) * 2.0;
  float d = (hash22(i + vec2(1.0, 1.0)).x - 0.5) * 2.0;
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// ACES filmic tonemapping for natural highlight roll-off
vec3 tonemapACES(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  
  // Smooth mouse deflection with damped edge falloff
  vec2 mouseOffset = (u_mouse - 0.5) * 0.06;
  p += mouseOffset * (0.6 - length(p));

  float aspect = u_resolution.x / u_resolution.y;
  float isPortrait = step(aspect, 1.0);
  
  // Normalized coordinates: desktop vs mobile framing
  float u = p.x;
  float v = -p.y; // Positive v goes downward
  
  float u_scaled = mix(u * aspect * 0.78, u * 1.05, isPortrait);
  float v_scaled = mix(v * 1.0, v * 0.95, isPortrait);

  float t = u_time;
  // Natural separation and approach cycle (slow breathing motion)
  float breath = sin(t * 0.28) * 0.045;

  // Domain warping for organic liquid eddies
  float warp1 = vnoise(vec2(u_scaled * 1.15 + t * 0.07, v_scaled * 1.15 - t * 0.06)) * 0.09;
  float warp2 = vnoise(vec2(u_scaled * 1.25 - t * 0.06, v_scaled * 1.25 + t * 0.07)) * 0.08;
  float warp3 = vnoise(vec2(u_scaled * 1.05 + t * 0.05, v_scaled * 0.95 - t * 0.04)) * 0.10;

  // --- WAVE 1: Left quadrant (vertical curve) ---
  float wave1_base = mix(-0.50, -0.32, isPortrait);
  float curve1_x = wave1_base - breath + 0.21 * cos(v_scaled * 2.7 + t * 0.14)
                   + 0.07 * sin(v_scaled * 4.1 - t * 0.09) + warp1;
  float d1 = u_scaled - curve1_x;

  // --- WAVE 2: Lower-right quadrant (horizontal curve) ---
  float wave2_base = mix(0.24, 0.26, isPortrait);
  float curve2_y = wave2_base + breath + 0.17 * sin(u_scaled * 2.2 - t * 0.15)
                   + 0.06 * cos(u_scaled * 1.2 + t * 0.11) + warp2;
  float d2 = v_scaled - curve2_y;
  float mask2 = clamp((u_scaled + mix(0.35, 0.30, isPortrait)) * 1.8, 0.0, 1.0);

  // --- WAVE 3: Top center (horizontal curve, completes the triangle) ---
  float wave3_base = mix(-0.32, -0.22, isPortrait);
  float curve3_y = wave3_base + breath + 0.16 * cos(u_scaled * 2.0 + t * 0.13)
                   + 0.05 * sin(u_scaled * 3.4 - t * 0.10) + warp3;
  float d3 = v_scaled - curve3_y;
  float mask3 = clamp((-v_scaled + 0.18) * 2.2, 0.0, 1.0);

  // Brand colors: Purple, Blue, White
  vec3 PURPLE   = vec3(0.482, 0.169, 0.851); // #7B2BD9
  vec3 CORE_WHITE = vec3(0.985, 0.995, 1.000);
  vec3 ELEC_BLUE  = vec3(0.237, 0.510, 0.969); // #3C82F7-ish
  vec3 BG_LIGHT   = vec3(0.980, 0.957, 0.925); // bone white

  // Wave 1 fields
  float core1 = exp(-pow(d1 / 0.024, 2.0));
  float coreHalo1 = exp(-pow(d1 / 0.058, 2.0)) * 0.55;

  float purpleLip1 = exp(-pow((d1 + 0.042) / 0.038, 2.0)) * 0.95
                + exp(-pow((d1 + 0.078) / 0.055, 2.0)) * 0.35;

  float blueBody1 = exp(-pow((d1 - 0.055) / 0.065, 2.0)) * 0.95
               + exp(-pow((d1 - 0.130) / 0.100, 2.0)) * 0.70
               + exp(-pow((d1 - 0.240) / 0.150, 2.0)) * 0.30;

  // Wave 2 fields
  float core2 = exp(-pow(d2 / 0.025, 2.0)) * mask2;
  float coreHalo2 = exp(-pow(d2 / 0.060, 2.0)) * 0.55 * mask2;

  float blueBody2 = (exp(-pow((d2 + 0.055) / 0.065, 2.0)) * 0.95
                  + exp(-pow((d2 + 0.130) / 0.110, 2.0)) * 0.65
                  + exp(-pow((d2 + 0.230) / 0.160, 2.0)) * 0.25) * mask2;

  float purpleLip2 = (exp(-pow((d2 - 0.040) / 0.040, 2.0)) * 0.85
                   + exp(-pow((d2 - 0.075) / 0.060, 2.0)) * 0.25) * mask2;

  // Wave 3 fields (top)
  float core3 = exp(-pow(d3 / 0.026, 2.0)) * mask3;
  float coreHalo3 = exp(-pow(d3 / 0.064, 2.0)) * 0.55 * mask3;

  float purpleLip3 = (exp(-pow((d3 - 0.045) / 0.042, 2.0)) * 0.90
                   + exp(-pow((d3 + 0.070) / 0.058, 2.0)) * 0.30) * mask3;

  float blueBody3 = (exp(-pow((d3 + 0.050) / 0.068, 2.0)) * 0.95
                  + exp(-pow((d3 + 0.120) / 0.105, 2.0)) * 0.60
                  + exp(-pow((d3 + 0.210) / 0.155, 2.0)) * 0.28) * mask3;

  // --- Dark Mode Rendering (Luminous waves over pure black) ---
  vec3 colDark = vec3(0.0);
  colDark += CORE_WHITE * (core1 * 1.25 + coreHalo1 * 0.6 + core2 * 1.25 + coreHalo2 * 0.6 + core3 * 1.25 + coreHalo3 * 0.6);
  colDark += PURPLE * (purpleLip1 + purpleLip2 + purpleLip3);
  float totalBlue = blueBody1 + blueBody2 + blueBody3;
  colDark += ELEC_BLUE * vec3(totalBlue * 0.85, totalBlue * 0.85, totalBlue * 1.05);

  // --- Light Mode Rendering (Atmospheric luminous ribbons over warm bone) ---
  vec3 colLight = BG_LIGHT;
  // Blend blue fluid body
  colLight = mix(colLight, vec3(0.08, 0.38, 0.90), clamp(totalBlue * 0.55, 0.0, 1.0));
  // Blend purple accent rim
  colLight = mix(colLight, PURPLE, clamp((purpleLip1 + purpleLip2 + purpleLip3) * 0.65, 0.0, 1.0));
  // Blend luminous core highlight
  colLight = mix(colLight, vec3(1.0, 1.0, 1.0), clamp((core1 + core2 + core3) * 0.8, 0.0, 1.0));

  // --- Smooth atmospheric transition between dark and light ---
  vec3 col = mix(colDark, colLight, u_themeProgress);

  // Subtle analog film grain / dither for tactile finish
  float grain = (hash22(gl_FragCoord.xy * 0.37 + fract(t)).x - 0.5) * 0.022;
  col += vec3(grain);

  gl_FragColor = vec4(tonemapACES(col), 1.0);
}
`

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

export function HeroShader({ className }: HeroShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize WebGL context
    const gl =
      canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)

    if (!gl) {
      setHasWebGL(false)
      return
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
    if (!vertexShader || !fragmentShader) {
      setHasWebGL(false)
      return
    }

    const program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) {
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      setHasWebGL(false)
      return
    }

    // Geometry: Full-screen quad
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse')
    const themeProgressLocation = gl.getUniformLocation(program, 'u_themeProgress')

    // Motion & interaction state
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = prefersReducedMotion.matches

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches
    }
    prefersReducedMotion.addEventListener?.('change', onReducedMotionChange)

    // Theme state (0.0 = dark, 1.0 = light)
    const getIsDark = () => document.documentElement.classList.contains('dark')
    let targetThemeProgress = getIsDark() ? 0.0 : 1.0
    let currentThemeProgress = targetThemeProgress

    // Observe theme toggle on <html class="...">
    const themeObserver = new MutationObserver(() => {
      targetThemeProgress = getIsDark() ? 0.0 : 1.0
      if (reducedMotion) {
        currentThemeProgress = targetThemeProgress
      }
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    let mouse = { x: 0.5, y: 0.5 }
    let targetMouse = { x: 0.5, y: 0.5 }
    let animationFrameId = 0
    let isVisible = true
    let width = 0
    let height = 0
    let startTime = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      // Limit dpr to 1.5 to maintain great fidelity while conserving GPU fillrate
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (reducedMotion) {
        renderFrame(3.5)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        targetMouse.x = (e.clientX - rect.left) / rect.width
        targetMouse.y = (e.clientY - rect.top) / rect.height
      }
    }

    const renderFrame = (t: number) => {
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, t)
      gl.uniform2f(mouseLocation, mouse.x, mouse.y)
      gl.uniform1f(themeProgressLocation, currentThemeProgress)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const loop = (now: number) => {
      if (!isVisible) return

      // Smooth atmospheric theme interpolation (700-800ms feel)
      if (!reducedMotion) {
        const themeDiff = targetThemeProgress - currentThemeProgress
        if (Math.abs(themeDiff) > 0.0005) {
          currentThemeProgress += themeDiff * 0.082
        } else {
          currentThemeProgress = targetThemeProgress
        }
      } else {
        currentThemeProgress = targetThemeProgress
      }

      if (reducedMotion) {
        renderFrame(3.5)
        return
      }

      // Smooth mouse lerping
      mouse.x += (targetMouse.x - mouse.x) * 0.035
      mouse.y += (targetMouse.y - mouse.y) * 0.035

      const elapsed = (now - startTime) * 0.001
      renderFrame(elapsed)

      animationFrameId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Pause rendering when tab is not focused
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId)
      } else if (isVisible && !reducedMotion) {
        animationFrameId = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Pause rendering when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? true
        if (visible !== isVisible) {
          isVisible = visible
          if (isVisible && !reducedMotion) {
            animationFrameId = requestAnimationFrame(loop)
          } else {
            cancelAnimationFrame(animationFrameId)
          }
        }
      },
      { rootMargin: '100px 0px 100px 0px' }
    )
    observer.observe(canvas)

    // Start render loop
    animationFrameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      prefersReducedMotion.removeEventListener?.('change', onReducedMotionChange)

      // Clean up WebGL resources
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
      aria-hidden="true"
    >
      {hasWebGL ? (
        <canvas ref={canvasRef} className="h-full w-full" />
      ) : (
        /* Accessible Fallback when WebGL is unavailable */
        <div className="relative h-full w-full bg-black transition-colors duration-700 dark:bg-black">
          <div
            className="absolute -left-1/4 top-1/4 h-[70vw] w-[70vw] rounded-full opacity-60 blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(123,43,217,0.35) 0%, rgba(59,130,246,0.5) 45%, transparent 70%)',
            }}
          />
          <div
            className="absolute -right-1/4 bottom-0 h-[65vw] w-[65vw] rounded-full opacity-50 blur-[130px]"
            style={{
              background:
                'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(123,43,217,0.25) 50%, transparent 75%)',
            }}
          />
          <div
            className="absolute top-0 left-1/3 h-[55vw] w-[55vw] rounded-full opacity-45 blur-[110px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.30) 0%, rgba(123,43,217,0.20) 50%, transparent 70%)',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default HeroShader
