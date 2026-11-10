import { Component, DOCUMENT, ElementRef, OnDestroy, afterNextRender, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { NavLink } from '../../portfolio/portfolio.data';
import { ACHIEVEMENTS, COIN_COUNT, PAINTS, TripService } from './trip.service';

const SECRET = 'vroom';

/**
 * The optional game layer's only UI: a small "trip" counter that opens a panel of
 * checkpoints and achievements, plus toasts when something unlocks. It also watches for the
 * actions that unlock achievements (opening a project link, contacting, the secret word).
 */
@Component({
  selector: 'app-trip-hud',
  templateUrl: './trip-hud.html',
  styleUrl: './trip-hud.css',
  host: {
    '(document:keydown)': 'onKey($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class TripHud implements OnDestroy {
  readonly links = input.required<NavLink[]>();
  /** The section in view; the HUD stays out of the way on the first screen. */
  readonly active = input<string>('top');

  protected readonly trip = inject(TripService);
  private readonly document = inject(DOCUMENT);
  protected readonly coinCount = COIN_COUNT;
  protected readonly open = signal(false);
  protected readonly ready = signal(false);
  protected readonly bump = signal(false);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');
  private typed = '';
  private bumpTimer?: ReturnType<typeof setTimeout>;
  private lastScore = -1;

  /** Checkpoints passed plus achievements unlocked, out of everything on offer. */
  protected readonly score = computed(() => this.trip.score() + this.trip.checkpoints().length);
  protected readonly total = computed(() => this.trip.available().length + this.links().length);

  constructor() {
    // The HUD only appears in the browser, after saved progress is restored
    afterNextRender(() => this.ready.set(true));
    // The garage: chosen paint colours every car on the page (cursor, road, nav)
    effect(() => {
      if (!this.ready()) return; // browser only
      const paint = PAINTS.find((p) => p.id === this.trip.paint()) ?? PAINTS[0];
      const root = this.document.documentElement;
      root.style.setProperty('--paint-hi', paint.hi);
      root.style.setProperty('--paint-mid', paint.mid);
      root.style.setProperty('--paint-lo', paint.lo);
      root.style.setProperty('--paint-roof', paint.roof);
    });
    // Small pulse on the counter whenever the score changes
    effect(() => {
      const s = this.score();
      untracked(() => {
        if (this.lastScore >= 0 && s !== this.lastScore) {
          this.bump.set(true);
          clearTimeout(this.bumpTimer);
          this.bumpTimer = setTimeout(() => this.bump.set(false), 600);
        }
        this.lastScore = s;
      });
    });
  }

  protected achievements() {
    return this.trip.available();
  }

  protected isUnlocked(id: string): boolean {
    return (this.trip.unlocked() as string[]).includes(id);
  }

  protected passed(id: string): boolean {
    return this.trip.checkpoints().includes(id);
  }

  toggleOpen(): void {
    this.open.update((o) => !o);
    if (this.open()) requestAnimationFrame(() => this.panel()?.nativeElement.focus());
  }

  close(returnFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (returnFocus) this.toggle()?.nativeElement.focus();
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.close(true);
      return;
    }
    const target = e.target as Element | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key.length !== 1) return;
    this.typed = (this.typed + e.key.toLowerCase()).slice(-SECRET.length);
    if (this.typed === SECRET) {
      this.typed = '';
      this.trip.toggleTurbo();
    }
  }

  onDocumentClick(e: MouseEvent): void {
    const target = e.target as Element | null;
    if (!target) return;
    if (this.open() && !target.closest('.trip')) this.close();
    if (target.closest('a[href^="mailto:"], a[href^="tel:"], .contact__copy')) this.trip.unlock('say-hello');
    if (target.closest('#work a[target="_blank"]')) this.trip.unlock('pit-stop');
  }

  protected readonly allAchievements = ACHIEVEMENTS;

  protected reset(): void {
    this.trip.reset();
    this.trip.toast('Trip reset', 'Back at the start line');
  }

  ngOnDestroy(): void {
    clearTimeout(this.bumpTimer);
  }
}
