import { Component, ElementRef, OnDestroy, afterNextRender, input, viewChild } from '@angular/core';
import { prefersReducedMotion } from '../motion/motion';

/**
 * A decorative band of repeating words. It drifts on its own, speeds up and leans with
 * scroll velocity, and only runs while on screen. Hidden from assistive tech: the same
 * words appear as real content elsewhere on the page.
 */
@Component({
  selector: 'app-marquee',
  templateUrl: './marquee.html',
  styleUrl: './marquee.css',
  host: {
    'aria-hidden': 'true',
    '[class.marquee--outline]': 'outline()',
  },
})
export class Marquee implements OnDestroy {
  readonly items = input.required<string[]>();
  /** Drift in px per second; negative runs left to right. */
  readonly speed = input(50);
  readonly outline = input(false);

  protected readonly copies = [0, 1, 2];
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private frame = 0;
  private io?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      const track = this.track().nativeElement;
      let x = 0;
      let skew = 0;
      let last = performance.now();
      let lastY = window.scrollY;
      let running = false;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const y = window.scrollY;
        const velocity = y - lastY; // px this frame
        lastY = y;
        const width = (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        const dir = Math.sign(this.speed()) || 1;
        x -= this.speed() * dt + dir * Math.abs(velocity) * 0.6;
        if (width) x = ((x % width) - width) % width;
        skew += (Math.max(-10, Math.min(10, velocity * 0.25)) - skew) * 0.12;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
        if (running) this.frame = requestAnimationFrame(tick);
      };

      this.io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          last = performance.now();
          lastY = window.scrollY;
          this.frame = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(this.frame);
        }
      });
      this.io.observe(track);
    });
  }

  ngOnDestroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.io?.disconnect();
  }
}
