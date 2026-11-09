import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  mrfHex,
  mrfSmooth,
  mrfEase,
  mrfRng,
  mrfNoiseTable,
  mrfLayerSpec,
  mrfCrestAt,
  mrfPaintLayer,
  mrfMistBand,
  type MrfLayerSpec,
} from './meadow-rise-footer';
import { MEADOW_PALETTE } from './meadow-rise-hero';
import { sounds } from '../../utils/audio';

interface MeadowRiseFooterExactProps {
  onStartFree: () => void;
  onOpenPricing: () => void;
  onOpenDemoChoice: () => void;
  onNavigate: (path: string) => void;
  authUser?: unknown;
  operatorName?: string;
  seed?: number;
}

export const MeadowRiseFooterExact: React.FC<MeadowRiseFooterExactProps> = ({
  onStartFree,
  onOpenPricing,
  onOpenDemoChoice,
  onNavigate,
  authUser,
  operatorName = 'Operator',
  seed = 7,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inView, setInView] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
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
    const hillC = colors.hills.map((h) => [rgb(h[0], [120, 140, 80]), rgb(h[1], [80, 100, 50])]);

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
      H = container?.clientHeight || 600;
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

      // Sunlight Glow
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

      // Horizon line
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

      // Six Ridges Rising
      for (let i = 0; i < n; i++) {
        const L = layers[i];
        if (!L) continue;
        const e = mrfEase((dt - 150 - i * 120) / 1700);
        const rise = (1 - e) * H * (0.2 + 0.07 * i);
        const lx = -px * (2 + i * 5);
        const ly = -py * (1 + i * 2);

        ctx.drawImage(L.c, -MX + lx, L.top + rise + ly, L.w, L.h);

        if (mistC && (i === 1 || i === 3) && i + 1 < n) {
          const bw = W * 1.7;
          const bh = H * (i === 1 ? 0.26 : 0.2);
          const speed = i === 1 ? 7 : 11;
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

      // Fog lifting
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

  const flowers = useMemo(() => {
    const count = 9;
    const rnd = mrfRng(31 + 5);
    const items = [];
    const B = 420;
    for (let k = 0; k < count; k++) {
      const x = 70 + (k + 0.2 + rnd() * 0.6) * (1060 / count);
      const hgt = 150 + rnd() * 230;
      const lean = (rnd() - 0.5) * 110;
      const ax = x;
      const ay = B;
      const bx = x + lean;
      const by = B - hgt;
      const cx = x + lean * 0.1;
      const cy = B - hgt * 0.55;
      const order = k / (count - 1);
      const dStem = 1400 + order * 900;
      const r = 15 + rnd() * 9;
      items.push({
        ax,
        ay,
        bx,
        by,
        cx,
        cy,
        dStem,
        r,
        sd: (k * 1.7).toFixed(1),
      });
    }
    return items;
  }, []);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      sounds.playVictorySound();
    }, 700);
  };

  return (
    <footer
      id="footerRoot"
      className={`relative overflow-hidden bg-[#253019] text-[#eef1e6] border-t border-[rgba(238,241,230,0.14)] ${
        inView ? 'mrf-in' : ''
      }`}
    >
      {/* Foothills Canvas Background Scene */}
      <div ref={containerRef} id="footerScene" className="mrf-scene">
        <canvas ref={canvasRef} id="footerCanvas" aria-hidden="true" />
      </div>

      {/* Wildflower Botanical Line Drawings */}
      <svg className="mrf-botany" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <g id="botanyGroup">
          {flowers.map((f, i) => (
            <g
              key={i}
              className="mrf-stem"
              style={{ transformOrigin: `${f.ax}px 420px`, '--sd': f.sd } as React.CSSProperties}
            >
              <path
                className="mrf-draw"
                d={`M${f.ax.toFixed(1)} ${f.ay} Q${f.cx.toFixed(1)} ${f.cy.toFixed(1)} ${f.bx.toFixed(1)} ${f.by.toFixed(1)}`}
                pathLength={1}
                style={{ '--d': f.dStem.toFixed(0) } as React.CSSProperties}
              />
              <circle
                className="mrf-draw"
                cx={f.bx.toFixed(1)}
                cy={f.by.toFixed(1)}
                r={(f.r * 0.35).toFixed(1)}
                pathLength={1}
                style={{ '--d': (f.dStem + 200).toFixed(0) } as React.CSSProperties}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Footer Hero Header & Magnetic CTA */}
      <div className="relative z-10 pt-20 pb-16 px-5 text-center flex flex-col items-center">
        <h2 className="mrf-h text-center max-w-2xl">
          <span className="mrf-line">
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 520 } as React.CSSProperties}>
                Master
              </span>
            </span>
            {' '}
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 595 } as React.CSSProperties}>
                140
              </span>
            </span>
            {' '}
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 670 } as React.CSSProperties}>
                days
              </span>
            </span>
            {' '}
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 745 } as React.CSSProperties}>
                of
              </span>
            </span>
          </span>
          <span className="mrf-line">
            <span className="mrf-w mrf-acc">
              <span className="mrf-wi" style={{ '--d': 900 } as React.CSSProperties}>
                algorithmic
              </span>
            </span>
            {' '}
            <span className="mrf-w mrf-acc">
              <span className="mrf-wi" style={{ '--d': 975 } as React.CSSProperties}>
                prep
              </span>
            </span>
            {' '}
            <span className="mrf-w">
              <span className="mrf-wi" style={{ '--d': 1050 } as React.CSSProperties}>
                today.
              </span>
            </span>
          </span>
        </h2>

        <p className="mrf-sub mrf-r max-w-xl mx-auto mb-7 leading-relaxed" style={{ '--d': 1150 } as React.CSSProperties}>
          332 curated LeetCode problems. Spaced repetition telemetry. Dual-engine workstation.
        </p>

        {/* Magnetic CTA Pill */}
        <div className="mrf-cta-wrap mrf-r" style={{ '--d': 1300 } as React.CSSProperties}>
          <button
            id="footerCta"
            className="mrf-cta cursor-pointer"
            onClick={onStartFree}
            onPointerMove={handleCtaPointerMove}
            onPointerLeave={handleCtaPointerLeave}
          >
            <span>{authUser ? `Enter App (${operatorName})` : "Start 140-Day Prep Free"}</span>
            <span className="mrf-cta-arrow">
              <svg className="mrf-a1" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg className="mrf-a2" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Footer Content Grid */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8 pb-12 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[rgba(238,241,230,0.14)]">
          {/* Brand & Newsletter */}
          <div className="md:col-span-4 flex flex-col items-start">
            <button
              className="mrf-logo mrf-r inline-flex items-center gap-3 text-[#eef1e6] text-lg font-medium tracking-tight mb-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ '--d': 1250 } as React.CSSProperties}
            >
              <svg className="mrf-mark size-8" viewBox="0 0 32 32" fill="none">
                <circle className="mrf-draw" cx="16" cy="16" r="14.6" style={{ '--d': 1250 } as React.CSSProperties} />
                <g className="mrf-petals">
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" style={{ '--d': 1330 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(45 16 16)" style={{ '--d': 1385 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(90 16 16)" style={{ '--d': 1440 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(135 16 16)" style={{ '--d': 1495 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(180 16 16)" style={{ '--d': 1550 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(225 16 16)" style={{ '--d': 1605 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(270 16 16)" style={{ '--d': 1660 } as React.CSSProperties} />
                  <ellipse className="mrf-draw" cx="16" cy="10.4" rx="2.9" ry="5.6" transform="rotate(315 16 16)" style={{ '--d': 1715 } as React.CSSProperties} />
                </g>
                <circle className="mrf-draw" cx="16" cy="16" r="2.2" style={{ '--d': 1800 } as React.CSSProperties} />
              </svg>
              <span>GrindOS</span>
            </button>
            <p className="mrf-r text-xs text-[#a9b49c] leading-relaxed max-w-sm mb-5" style={{ '--d': 1380 } as React.CSSProperties}>
              A disciplined placement operating system designed to get engineers and students placement-ready for Tier-1 tech companies.
            </p>

            {/* Newsletter Form */}
            <form
              onSubmit={handleSubscribeSubmit}
              className="mrf-r relative flex items-center w-full max-w-xs border-b border-[rgba(238,241,230,0.2)] focus-within:border-white transition-colors pb-1"
              style={{ '--d': 1500 } as React.CSSProperties}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for placement drops"
                required
                className="bg-transparent text-xs text-[#eef1e6] placeholder-[#a9b49c]/70 outline-none w-full py-1.5"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="size-7 rounded-full bg-[#ffffff] text-[#11140d] flex items-center justify-center hover:scale-105 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="size-3 border-2 border-[#11140d] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                  </svg>
                )}
              </button>
            </form>
            {isSubscribed && (
              <span className="text-[11px] text-[#a3b384] mt-1.5 font-mono">
                Subscribed for placement drops! 🚀
              </span>
            )}
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#eef1e6] mb-3">Workstation</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[#a9b49c]">
                <li>
                  <button onClick={onOpenDemoChoice} className="hover:text-white transition-colors cursor-pointer text-left">
                    Modern Bento App
                  </button>
                </li>
                <li>
                  <button onClick={onOpenDemoChoice} className="hover:text-white transition-colors cursor-pointer text-left">
                    Retro Terminal OS
                  </button>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Interactive Demo Sandbox
                  </a>
                </li>
                <li>
                  <a href="#curriculum" className="hover:text-white transition-colors">
                    Curriculum Syllabus
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#eef1e6] mb-3">Preparation</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[#a9b49c]">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Placement Tracker
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Global Peer Cohorts
                  </a>
                </li>
                <li>
                  <a href="#compare" className="hover:text-white transition-colors">
                    Top 150 Benchmarks
                  </a>
                </li>
                <li>
                  <button onClick={onOpenPricing} className="hover:text-white transition-colors cursor-pointer text-left">
                    Lifetime Pro License
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#eef1e6] mb-3">Legal &amp; System</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[#a9b49c]">
                <li>
                  <button onClick={onOpenPricing} className="hover:text-white transition-colors cursor-pointer text-left">
                    Pricing &amp; Plans
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/_ops')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Stealth Ops Console
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a9b49c]">
          <div>
            © 2026 GrindOS. All rights reserved. Dual-Engine Placement Workstation.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MeadowRiseFooterExact;
