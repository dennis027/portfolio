import { Component, ElementRef, OnDestroy, afterNextRender, viewChild } from '@angular/core';
import { prefersReducedMotion } from '../../../shared/motion/motion';

const GRID = 28; // matches the hero's dot grid
const TRAIL = 14; // points kept per packet
const NEAR = 180; // px — packets inside this radius of the pointer speed up and glow

interface Packet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  trail: { x: number; y: number }[];
  life: number;
}

/**
 * "Data packets" travelling the hero's dot grid: each one runs along a grid line, sometimes
 * turns at an intersection, and leaves a fading trail. Decorative; paused off-screen,
 * in background tabs, and absent under reduced motion.
 */
@Component({
  selector: 'app-packet-field',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    :host { position: absolute; inset: 0; display: block; pointer-events: none; }
    canvas { width: 100%; height: 100%; display: block; }
  `,
})
export class PacketField implements OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private frame = 0;
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      this.start(this.canvas().nativeElement);
    });
  }

  private start(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const host = canvas.parentElement!;
    const hero = host.closest('section') ?? host;
    let w = 0, h = 0, dpr = 1;
    let color = '#f2b84b';
    let px = -9999, py = -9999;
    let running = false;
    let visible = true;
    let last = 0;
    let tickCount = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const readColor = () => {
      color = getComputedStyle(hero).getPropertyValue('--accent').trim() || color;
    };

    const spawn = (): Packet => {
      const horizontal = Math.random() < 0.5;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const x = Math.round((Math.random() * w) / GRID) * GRID;
      const y = Math.round((Math.random() * h) / GRID) * GRID;
      return {
        x, y,
        dx: horizontal ? dir : 0,
        dy: horizontal ? 0 : dir,
        speed: 50 + Math.random() * 90,
        trail: [],
        life: 3 + Math.random() * 5,
      };
    };
    const count = () => Math.round(Math.min(26, Math.max(10, (w * h) / 60000)));
    let packets: Packet[] = [];

    const step = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      if (++tickCount % 60 === 0) readColor();
      ctx.clearRect(0, 0, w, h);
      while (packets.length < count()) packets.push(spawn());

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        const near = Math.max(0, 1 - Math.hypot(p.x - px, p.y - py) / NEAR);
        const prevX = p.x, prevY = p.y;
        p.x += p.dx * p.speed * (1 + near * 2.5) * dt;
        p.y += p.dy * p.speed * (1 + near * 2.5) * dt;
        // Crossing a grid intersection: occasionally turn 90°
        const crossedX = Math.floor(prevX / GRID) !== Math.floor(p.x / GRID);
        const crossedY = Math.floor(prevY / GRID) !== Math.floor(p.y / GRID);
        if ((crossedX || crossedY) && Math.random() < 0.22) {
          p.x = Math.round(p.x / GRID) * GRID;
          p.y = Math.round(p.y / GRID) * GRID;
          const turn = Math.random() < 0.5 ? -1 : 1;
          [p.dx, p.dy] = p.dx ? [0, turn] : [turn, 0];
        }
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL) p.trail.shift();
        p.life -= dt;

        const fade = Math.min(1, p.life) * Math.min(1, p.trail.length / 4);
        if (p.life <= 0 || p.x < -GRID || p.y < -GRID || p.x > w + GRID || p.y > h + GRID) {
          packets.splice(i, 1);
          continue;
        }
        // Trail
        ctx.lineCap = 'round';
        for (let t = 1; t < p.trail.length; t++) {
          const a = (t / p.trail.length) * 0.55 * fade * (0.6 + near * 0.8);
          ctx.strokeStyle = withAlpha(color, a);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y);
          ctx.lineTo(p.trail[t].x, p.trail[t].y);
          ctx.stroke();
        }
        // Head
        ctx.fillStyle = withAlpha(color, 0.9 * fade);
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 + near * 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8 + near * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (running) this.frame = requestAnimationFrame(step);
    };

    const play = () => {
      const should = visible && !document.hidden;
      if (should && !running) {
        running = true;
        last = 0;
        this.frame = requestAnimationFrame(step);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(this.frame);
      }
    };

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const leave = () => (px = py = -9999);

    resize();
    readColor();
    packets = Array.from({ length: count() }, spawn);

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      play();
    });
    io.observe(host);
    document.addEventListener('visibilitychange', play);
    hero.addEventListener('pointermove', move as EventListener, { passive: true });
    hero.addEventListener('pointerleave', leave);
    play();

    this.cleanup.push(() => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', play);
      hero.removeEventListener('pointermove', move as EventListener);
      hero.removeEventListener('pointerleave', leave);
    });
  }

  ngOnDestroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    for (const fn of this.cleanup) fn();
  }
}

/** Accepts #rgb / #rrggbb and returns rgba() with the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return `rgba(242,184,75,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(3)})`;
}
