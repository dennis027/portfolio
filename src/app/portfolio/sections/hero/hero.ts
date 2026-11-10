import { Coin } from '../../../shared/drive/coin';
import { Component, ElementRef, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import { ScrollService } from '../../../shared/scroll.service';
import { Marquee } from '../../../shared/marquee/marquee';
import { MagneticDirective } from '../../../shared/motion/magnetic.directive';
import { ScrambleDirective } from '../../../shared/motion/scramble.directive';
import { PacketField } from './packet-field';
import { TourService } from '../../../shared/drive/tour.service';
import { CvService } from '../../../shared/cv/cv.service';
import { FOCUS_AREAS, PROFILE, SOCIALS } from '../../portfolio.data';

@Component({
  selector: 'app-hero',
  imports: [Marquee, MagneticDirective, ScrambleDirective, PacketField, Coin],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnDestroy {
  protected readonly scroll = inject(ScrollService);
  protected readonly tour = inject(TourService);
  protected readonly cv = inject(CvService);
  protected readonly profile = PROFILE;
  protected readonly socials = SOCIALS;

  /** The name is set as two words on separate depth layers: one behind the figure, one in front. */
  protected readonly first = [...'Dennis'];
  protected readonly last = [...'Kimani'];
  /** Capabilities for the band under the hero — the same focus areas detailed in About. */
  protected readonly capabilities = [...FOCUS_AREAS.map((f) => f.title), 'Nairobi, Kenya'];

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const node = this.hero().nativeElement;
      this.trackScroll(node);
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) this.trackPointer(node);
    });
  }

  /** --p goes 0 → 1 as the hero scrolls away; layers use it for parallax at different rates. */
  private trackScroll(node: HTMLElement): void {
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = node.getBoundingClientRect();
      if (r.bottom < 0) return;
      const p = Math.min(Math.max(-r.top / r.height, 0), 1);
      node.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    this.cleanup.push(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    });
  }

  /** --px/--py (-1…1) drive a few pixels of depth shift; --mx/--my position the light on the dot grid. */
  private trackPointer(node: HTMLElement): void {
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        node.style.setProperty('--mx', `${x}px`);
        node.style.setProperty('--my', `${y}px`);
        node.style.setProperty('--px', ((x / r.width) * 2 - 1).toFixed(3));
        node.style.setProperty('--py', ((y / r.height) * 2 - 1).toFixed(3));
      });
    };
    node.addEventListener('pointermove', move, { passive: true });
    this.cleanup.push(() => {
      cancelAnimationFrame(frame);
      node.removeEventListener('pointermove', move);
    });
  }

  ngOnDestroy(): void {
    for (const fn of this.cleanup) fn();
  }
}
