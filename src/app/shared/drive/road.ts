import { Component, DOCUMENT, ElementRef, OnDestroy, afterNextRender, inject, input, output, signal, viewChild } from '@angular/core';
import { NavLink } from '../../portfolio/portfolio.data';
import { CarIcon } from './car-icon';
import { TripService } from './trip.service';

interface Checkpoint {
  id: string;
  label: string;
  /** 0…1 position along the road, where the section reaches the reading line. */
  at: number;
}

/**
 * Scroll progress drawn as a road: a lane line that moves with the page, a flag per
 * section, and a small car that drives down (or back up) as you scroll.
 * A mouse shortcut that mirrors the main navigation, so it is hidden from assistive tech.
 */
@Component({
  selector: 'app-road',
  imports: [CarIcon],
  templateUrl: './road.html',
  styleUrl: './road.css',
})
export class Road implements OnDestroy {
  readonly links = input.required<NavLink[]>();
  readonly active = input<string>('top');
  readonly go = output<{ anchor: string; event: Event }>();

  protected readonly trip = inject(TripService);
  private readonly document = inject(DOCUMENT);
  protected readonly checkpoints = signal<Checkpoint[]>([]);
  private readonly road = viewChild.required<ElementRef<HTMLElement>>('road');
  private frame = 0;
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      const win = this.document.defaultView!;
      const el = this.road().nativeElement;
      let lastY = win.scrollY;
      const update = () => {
        this.frame = 0;
        const y = win.scrollY;
        const max = this.document.documentElement.scrollHeight - win.innerHeight;
        el.style.setProperty('--road-p', max > 0 ? (y / max).toFixed(4) : '0');
        if (Math.abs(y - lastY) > 2) el.classList.toggle('is-reverse', y < lastY);
        lastY = y;
      };
      const onScroll = () => {
        if (!this.frame) this.frame = requestAnimationFrame(update);
      };
      const measure = () => {
        const max = this.document.documentElement.scrollHeight - win.innerHeight;
        this.checkpoints.set(
          this.links().map((l) => {
            const section = this.document.getElementById(l.anchor);
            const top = section ? section.getBoundingClientRect().top + win.scrollY - win.innerHeight * 0.35 : 0;
            return { id: l.anchor, label: l.label, at: max > 0 ? Math.min(1, Math.max(0, top / max)) : 0 };
          }),
        );
        update();
      };
      // Sections move as fonts and images load, so re-measure whenever the page resizes
      const ro = new ResizeObserver(measure);
      ro.observe(this.document.body);
      win.addEventListener('scroll', onScroll, { passive: true });
      measure();
      this.cleanup.push(() => {
        ro.disconnect();
        win.removeEventListener('scroll', onScroll);
      });
    });
  }

  protected passed(id: string): boolean {
    return this.trip.checkpoints().includes(id);
  }

  ngOnDestroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    for (const fn of this.cleanup) fn();
  }
}
