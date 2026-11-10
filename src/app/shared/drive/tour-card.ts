import { Component, ElementRef, OnDestroy, afterNextRender, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { TourAction, TourService, TrackId } from './tour.service';
import { TripService } from './trip.service';
import { PROFILE } from '../../portfolio/portfolio.data';

const CARD_GAP = 28;
const SPOT_PAD = 14;

/**
 * The guided tour's visuals: a spotlight that dims everything but the current stop, and the
 * caption card — anchored beside the stop when there is room, docked at the bottom otherwise.
 * Both follow the stop as the page scrolls.
 */
@Component({
  selector: 'app-tour-card',
  templateUrl: './tour-card.html',
  styleUrl: './tour-card.css',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class TourCard implements OnDestroy {
  protected readonly tour = inject(TourService);
  private readonly trip = inject(TripService);
  protected readonly email = PROFILE.email;
  protected readonly trackIds: TrackId[] = ['quick', 'deep'];
  /** 'right' | 'left' when anchored beside the stop; 'dock' otherwise. */
  protected readonly placement = signal<'right' | 'left' | 'dock'>('dock');

  private readonly card = viewChild<ElementRef<HTMLElement>>('card');
  private readonly spot = viewChild<ElementRef<HTMLElement>>('spot');
  private frame = 0;
  private readonly browser = signal(false);

  constructor() {
    // Focus the card when the tour opens, so keyboard users land on its controls
    effect(() => {
      const card = this.card()?.nativeElement;
      if (card && this.tour.active()) requestAnimationFrame(() => card.focus({ preventScroll: true }));
    });
    // Track the stop every frame while the tour runs (the page scrolls under it). Browser only.
    afterNextRender(() => this.browser.set(true));
    effect(() => {
      const on = this.tour.active() && this.browser();
      untracked(() => {
        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = on ? requestAnimationFrame(() => this.follow()) : 0;
      });
    });
  }

  private follow(): void {
    const card = this.card()?.nativeElement;
    const spot = this.spot()?.nativeElement;
    if (card && spot) this.place(card, spot);
    if (this.tour.active()) this.frame = requestAnimationFrame(() => this.follow());
  }

  private place(card: HTMLElement, spot: HTMLElement): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const target = this.tour.target();
    const r = target?.getBoundingClientRect();

    // Spotlight: a padded cut-out around the stop; without a stop, the whole page dims evenly
    if (r && r.bottom > 0 && r.top < vh) {
      spot.classList.add('is-on');
      spot.style.transform = `translate3d(${r.left - SPOT_PAD}px, ${r.top - SPOT_PAD}px, 0)`;
      spot.style.width = `${r.width + SPOT_PAD * 2}px`;
      spot.style.height = `${r.height + SPOT_PAD * 2}px`;
    } else {
      spot.classList.remove('is-on');
    }

    // Caption: beside the stop if it fits, else docked
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    let placement: 'right' | 'left' | 'dock' = 'dock';
    let x = 0;
    let y = 0;
    if (r && vw >= 1000) {
      y = Math.min(Math.max(r.top, 96), vh - ch - 24);
      if (r.right + CARD_GAP + cw <= vw - 24) {
        placement = 'right';
        x = r.right + CARD_GAP;
      } else if (r.left - CARD_GAP - cw >= 24) {
        placement = 'left';
        x = r.left - CARD_GAP - cw;
      }
    }
    if (placement !== this.placement()) this.placement.set(placement);
    card.style.transform = placement === 'dock' ? '' : `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
  }

  protected act(a: TourAction): void {
    if (a.copy) {
      navigator.clipboard?.writeText(a.copy).then(
        () => this.trip.toast('Copied', a.copy!),
        () => this.trip.toast('Copy failed', a.copy!),
      );
      this.trip.unlock('say-hello');
    } else if (a.focus) {
      this.tour.end();
      const el = document.querySelector<HTMLElement>(a.focus);
      el?.scrollIntoView({ block: 'center' });
      el?.focus({ preventScroll: true });
    } else if (a.href) {
      // Leaving to look at the work: pause, so the tour is where they left it on return
      if (this.tour.playing()) this.tour.togglePlay();
      this.trip.unlock('pit-stop');
    }
  }

  protected copyShareLink(): void {
    const link = this.tour.shareLink();
    navigator.clipboard?.writeText(link).then(
      () => this.trip.toast('Tour link copied', 'Send it to a colleague'),
      () => this.trip.toast('Tour link', link),
    );
  }

  onKey(e: KeyboardEvent): void {
    if (!this.tour.active()) return;
    const t = e.target as Element | null;
    if (t?.closest('input, textarea, select')) return;
    if (e.key === 'Escape') this.tour.end();
    else if (e.key === 'ArrowRight') this.tour.next();
    else if (e.key === 'ArrowLeft') this.tour.prev();
    else if (e.key === ' ' && t?.closest('.tour')) this.tour.togglePlay();
    else return;
    e.preventDefault();
  }

  ngOnDestroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
  }
}
