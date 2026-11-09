import React, { useEffect, useRef, useState } from 'react';
import {
  mrfHex,
  mrfSmooth,
  mrfEase,
  mrfNoiseTable,
  mrfLayerSpec,
  mrfCrestAt,
  mrfPaintLayer,
  mrfMistBand,
  type MrfLayerSpec,
} from './meadow-rise-footer';

export const MEADOW_PALETTE = {
  sky: ["#f4f4ef", "#e9ece3"] as [string, string],
  haze: "#e3e7dc",
  glow: "#fffbef",
  hills: [
    ["#b7c2ab", "#9fac95"],
    ["#a3b384", "#7d8f63"],
    ["#93a964", "#677c42"],
    ["#829a52", "#556a33"],
    ["#6c8240", "#415325"],
    ["#4d5d2c", "#283318"],
  ] as [string, string][],
  ground: "#253019",
  ink: "#11140d",
  sub: "#3b4234",
  pill: "#ffffff",
  pillInk: "#11140d",
  text: "#eef1e6",
  muted: "#a9b49c",
  line: "rgba(238, 241, 230, 0.16)",
  night: false,
};

interface MeadowRiseHeroProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
  onOpenPricing: () => void;
  authUser?: unknown;
  onEnterApp?: () => void;
  operatorName?: string;
  seed?: number;
}

export const MeadowRiseHero: React.FC<MeadowRiseHeroProps> = ({
  onStartFree,
  onExploreDemo,
  onOpenPricing,
  authUser,
  onEnterApp,
  operatorName = 'Operator',
  seed = 3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = MEADOW_PALETTE;
    let W = 1;
    let H = 1;
    let SH = 1;
    let cs = 1;
    const noise = mrfNoiseTable(seed);
    const n = colors.hills.length;
    const specs: MrfLayerSpec[] = colors.hills.map((_, i) => mrfLayerSpec(i, n, seed));
    let layers: ({ c: HTMLCanvasElement; top: number; w: number; h: number } | null)[] = specs.map(() => null);
    let mistC: HTMLCanvasElement | null = null;
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    const revealAt = performance.now();
    let raf = 0;
    const MX = 40;

    function rgb(c: string, fb: [number, number, number]): [number, number, number] {
      return mrfHex(c) || fb;
    }
    function css(c: [number, number, number], a: number): string {
      return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    }

    const sky0 = rgb(colors.sky[0], [244, 244, 239]);
    const sky1 = rgb(colors.sky[1], [233, 236, 227]);
    const hazeC = rgb(colors.haze, sky1);
    const glowC = rgb(colors.glow, [255, 251, 239]);
    const groundC = rgb(colors.ground, [37, 48, 25]);
    const inkC = rgb(colors.ink, [17, 20, 13]);
    const hillC = colors.hills.map(h => [rgb(h[0], [120, 140, 80]), rgb(h[1], [80, 100, 50])]);

    function makeMist() {
      const w = 320;
      const h = 64;
      const a = mrfMistBand(noise, w, h);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      if (!g) return;
      const img = g.createImageData(w, h);
      for (let i = 0; i < a.length; i++) {
        img.data[i * 4] = hazeC[0];
        img.data[i * 4 + 1] = hazeC[1];
        img.data[i * 4 + 2] = hazeC[2];
        img.data[i * 4 + 3] = a[i] * 255;
      }
      g.putImageData(img, 0, 0);
      mistC = c;
    }

    function bakeLayers() {
      layers = specs.map(() => null);
      for (let i = 0; i < n; i++) {
        const spec = specs[i];
        let minC = Infinity;
        for (let x = -MX; x <= W + MX; x += 3) {
          minC = Math.min(minC, mrfCrestAt(spec, x, W, H));
        }
        const top = Math.floor(minC - 4);
        const s = Math.min(window.devicePixelRatio || 1, spec.q > 0.5 ? 1.25 : 1);
        const w = Math.ceil((W + MX * 2) * s);
        const h = Math.ceil((SH - top) * s);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        if (!g) continue;

        let detailTo = H + 200;
        if (i + 1 < n) {
          let maxC = -Infinity;
          for (let x = -MX; x <= W + MX; x += 3) {
            maxC = Math.max(maxC, mrfCrestAt(specs[i + 1], x, W, H));
          }
          detailTo = Math.min(detailTo, maxC + 70);
        }

        const o = {
          s,
          mx: MX,
          top,
          W,
          H,
          spec,
          lit: hillC[i][0],
          shadow: hillC[i][1],
          haze: hazeC,
          noise,
          detailTo,
        };
        const img = g.createImageData(w, h);
        mrfPaintLayer(img.data, w, h, o, 0, w);
        g.putImageData(img, 0, 0);
        layers[i] = { c, top, w: w / s, h: h / s };
      }
    }

    function measure() {
      W = container?.clientWidth || window.innerWidth;
      H = container?.clientHeight || 720;
      SH = H + 180;
      cs = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas) {
        canvas.width = Math.round(W * cs);
        canvas.height = Math.round(SH * cs);
      }
      makeMist();
      bakeLayers();
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.setTransform(cs, 0, 0, cs, 0, 0);
      const dt = now - revealAt;

      // Pale Sky Gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.8);
      sky.addColorStop(0, css(sky0, 1));
      sky.addColorStop(1, css(sky1, 1));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, SH);

      // Sunlight Glow Following Mouse Pointer Across Sky
      const ox = W * (0.7 + px * 0.3);
      const oy = H * 0.14 + py * H * 0.08;
      const dawn = mrfSmooth(0, 1600, dt);

      const R = Math.max(W, H) * 0.62;
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, R);
      glow.addColorStop(0, css(glowC, 0.85 * dawn));
      glow.addColorStop(0.35, css(glowC, 0.32 * dawn));
      glow.addColorStop(1, css(glowC, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, SH);

      // Horizon line drawing out
      if (dt < 1400) {
        const p = Math.min(1, mrfEase(dt / 900));
        const lw = p * W * 0.78;
        const la = (1 - mrfSmooth(150, 1100, dt)) * 0.42;
        if (la > 0 && lw > 0.5) {
          const y = Math.round(H * specs[0].base);
          const lg = ctx.createLinearGradient(W / 2 - lw / 2, 0, W / 2 + lw / 2, 0);
          lg.addColorStop(0, css(inkC, 0));
          lg.addColorStop(0.5, css(inkC, la));
          lg.addColorStop(1, css(inkC, 0));
          ctx.fillStyle = lg;
          ctx.fillRect(W / 2 - lw / 2, y, lw, 1);
        }
      }

      // Six Ridges Rising Through Horizon on Individual Springs
      for (let i = 0; i < n; i++) {
        const L = layers[i];
        if (!L) continue;
        const e = mrfEase((dt - 150 - i * 120) / 1700);
        const rise = (1 - e) * H * (0.2 + 0.07 * i);
        const lx = -px * (2 + i * 5);
        const ly = -py * (1 + i * 2);

        ctx.drawImage(L.c, -MX + lx, L.top + rise + ly, L.w, L.h);

        // Mist Bands Drifting Between Ridges 1 and 3
        if (mistC && (i === 1 || i === 3) && i + 1 < n) {
          const bw = W * 1.7;
          const bh = H * (i === 1 ? 0.26 : 0.2);
          const speed = (i === 1 ? 7 : 11);
          const off = ((now * speed) / 1000) % bw;
          const my = H * specs[i + 1].base - bh * 0.62 + rise * 0.6;
          ctx.globalAlpha = 0.55 * (i === 1 ? 0.9 : 0.65) * mrfSmooth(900, 2600, dt);
          ctx.drawImage(mistC, -off + lx * 1.4, my, bw, bh);
          ctx.drawImage(mistC, bw - off + lx * 1.4, my, bw, bh);
          ctx.globalAlpha = 1;
        }
      }

      // Light Pool on Grass
      ctx.globalCompositeOperation = "soft-light";
      const pool = ctx.createRadialGradient(ox, H * 0.7, 0, ox, H * 0.7, W * 0.5);
      pool.addColorStop(0, css(glowC, 0.45 * dawn));
      pool.addColorStop(1, css(glowC, 0));
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, W, SH);
      ctx.globalCompositeOperation = "source-over";

      // Initial Fog Lifting
      const fog = 1 - mrfSmooth(100, 2100, dt);
      if (fog > 0) {
        const f = ctx.createLinearGradient(0, 0, 0, SH);
        f.addColorStop(0, css(sky0, fog));
        f.addColorStop(1, css(sky1, fog));
        ctx.fillStyle = f;
        ctx.fillRect(0, 0, W, SH);
      }

      // Nearest Hill Darkens into Ground (#253019)
      const g = ctx.createLinearGradient(0, H - 30, 0, SH);
      g.addColorStop(0, css(groundC, 0));
      g.addColorStop(0.55, css(groundC, 0.72));
      g.addColorStop(1, css(groundC, 1));
      ctx.fillStyle = g;
      ctx.fillRect(0, H - 30, W, SH - H + 31);
    }

    function loop(now: number) {
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      if (!container) return;
      const r = container.getBoundingClientRect();
      tx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / Math.max(1, r.width) - 0.5));
      ty = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / Math.max(1, r.height) - 0.5));
    }

    function onPointerLeave() {
      tx = 0;
      ty = 0;
    }

    window.addEventListener('resize', measure);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.body.addEventListener('pointerleave', onPointerLeave);

    measure();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', onPointerMove);
      document.body.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [seed]);

  const handleCtaPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const fx = e.clientX - r.left;
    const fy = e.clientY - r.top;
    el.style.setProperty('--fx', `${fx}px`);
    el.style.setProperty('--fy', `${fy}px`);
    el.style.setProperty('--mx', `${((fx / r.width - 0.5) * 10).toFixed(2)}px`);
    el.style.setProperty('--my', `${((fy / r.height - 0.5) * 8).toFixed(2)}px`);
  };

  const handleCtaPointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--mx', '0px');
    el.style.setProperty('--my', '0px');
  };

  return (
    <section
      id="heroRoot"
      className={`relative w-full min-h-[640px] md:min-h-[740px] flex flex-col items-center justify-start text-center pt-16 pb-24 overflow-hidden ${
        inView ? 'mrf-in' : ''
      }`}
    >
      {/* Exact Procedural Canvas Scene */}
      <div ref={containerRef} id="heroScene" className="mrf-scene">
        <canvas ref={canvasRef} id="heroCanvas" aria-hidden="true" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 flex flex-col items-center">
        {/* 21st.dev Luxury Status Pill */}
        <div
          className="mrf-r inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/75 border border-[#11140d]/10 text-xs text-[#3b4234] mb-7 shadow-xs backdrop-blur-md"
          style={{ '--d': 380 } as React.CSSProperties}
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4d5d2c] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4d5d2c]"></span>
          </span>
          <span className="text-[#253019] font-semibold">100% Shared Cloud State</span>
          <span className="text-[#11140d]/20">/</span>
          <span>Two Interfaces</span>
          <span className="text-[#11140d]/20">/</span>
          <span className="text-[#11140d] font-semibold">Zero Silos</span>
        </div>

        {/* Main Headline with Exact Meadow Word Mask Reveal & Serif Accent */}
        <h1 className="mrf-h">
          <span className="mrf-line">
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 520 } as React.CSSProperties}>
                One
              </span>
            </span>
            {' '}
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 595 } as React.CSSProperties}>
                Structured
              </span>
            </span>
            {' '}
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 670 } as React.CSSProperties}>
                Syllabus.
              </span>
            </span>
          </span>
          <span className="mrf-line">
            <span className="mrf-w mrf-acc">
              <span className="mrf-wi" style={{ '--d': 900 } as React.CSSProperties}>
                Two
              </span>
            </span>
            {' '}
            <span className="mrf-w mrf-acc">
              <span className="mrf-wi" style={{ '--d': 975 } as React.CSSProperties}>
                Distinct
              </span>
            </span>
            {' '}
            <span className="mrf-w mrf-acc">
              <span className="mrf-wi" style={{ '--d': 1050 } as React.CSSProperties}>
                Realities.
              </span>
            </span>
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="mrf-sub mrf-r" style={{ '--d': 1150 } as React.CSSProperties}>
          Master 332 curated algorithmic problems across 20 disciplined weeks. Choose between the deep retro immersion of a 90s terminal OS, or the crisp efficiency of a modern engineering dashboard.
        </p>

        {/* Primary Action CTAs with Exact Meadow Magnetic Pill */}
        <div
          className="mrf-cta-wrap mrf-r flex items-center justify-center gap-3.5 flex-wrap mt-7"
          style={{ '--d': 1300 } as React.CSSProperties}
        >
          {authUser ? (
            <button
              id="heroCta"
              className="mrf-cta cursor-pointer"
              onClick={onEnterApp || onStartFree}
              onPointerMove={handleCtaPointerMove}
              onPointerLeave={handleCtaPointerLeave}
            >
              <span>Enter App ({operatorName})</span>
              <span className="mrf-cta-arrow">
                <svg className="mrf-a1" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg className="mrf-a2" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ) : (
            <button
              id="heroCta"
              className="mrf-cta cursor-pointer"
              onClick={onStartFree}
              onPointerMove={handleCtaPointerMove}
              onPointerLeave={handleCtaPointerLeave}
            >
              <span>Start 140-Day Prep Free</span>
              <span className="mrf-cta-arrow">
                <svg className="mrf-a1" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg className="mrf-a2" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          )}

          {/* Secondary Buttons */}
          <button
            onClick={onExploreDemo}
            className="mrf-cta-sec cursor-pointer"
          >
            <svg className="size-3.5 text-[#556a33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
            </svg>
            <span>Explore Interactive Demo</span>
          </button>

          <button
            onClick={onOpenPricing}
            className="mrf-cta-sec cursor-pointer"
          >
            <svg className="size-3.5 text-[#556a33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <span>Lifetime Pro ($29)</span>
          </button>
        </div>

        {/* Trust Bullet Points */}
        <div
          className="mrf-r text-[11px] text-[#4d5d2c] font-mono flex items-center gap-3 flex-wrap justify-center mt-6"
          style={{ '--d': 1450 } as React.CSSProperties}
        >
          <span className="flex items-center gap-1 font-medium text-[#253019]">
            <span>✓</span> Free Community Tier
          </span>
          <span className="text-[#253019]/30">•</span>
          <span className="flex items-center gap-1 font-medium text-[#253019]">
            <span>✓</span> Real-Time Cloud Sync
          </span>
          <span className="text-[#253019]/30">•</span>
          <span className="flex items-center gap-1 font-medium text-[#253019]">
            <span>✓</span> No Credit Card Required
          </span>
        </div>
      </div>
    </section>
  );
};

export default MeadowRiseHero;
