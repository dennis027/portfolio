import { Component, OnDestroy, afterNextRender, computed, signal } from '@angular/core';
import { FlowDiagramComponent } from '../flow-diagram/flow-diagram';
import { HERO_SYSTEMS } from '../../portfolio/portfolio.data';

const ROTATE_MS = 7000;

/**
 * Tabbed console of real system architectures. Rotates on its own until the
 * visitor interacts with it, and never auto-rotates under reduced motion.
 */
@Component({
  selector: 'app-systems-console',
  imports: [FlowDiagramComponent],
  templateUrl: './systems-console.html',
  styleUrl: './systems-console.css',
})
export class SystemsConsole implements OnDestroy {
  protected readonly systems = HERO_SYSTEMS;
  protected readonly activeIndex = signal(0);
  protected readonly active = computed(() => this.systems[this.activeIndex()]);
  protected readonly autoplay = signal(false);
  /** File path as it is being typed; null shows the full path (server render, reduced motion). */
  protected readonly typed = signal<string | null>(null);
  private typer?: ReturnType<typeof setInterval>;
  private motion = false;

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.motion = true;
      this.autoplay.set(true);
      this.timer = setInterval(() => {
        this.activeIndex.update((i) => (i + 1) % this.systems.length);
        this.typeFile();
      }, ROTATE_MS);
    });
  }

  select(index: number): void {
    this.stopAutoplay();
    if (index === this.activeIndex()) return;
    this.activeIndex.set(index);
    this.typeFile();
  }

  /** Types the active system's file path out character by character. */
  private typeFile(): void {
    if (!this.motion) return;
    clearInterval(this.typer);
    const full = this.active().file;
    let n = 0;
    this.typed.set('');
    this.typer = setInterval(() => {
      n++;
      this.typed.set(full.slice(0, n));
      if (n >= full.length) {
        clearInterval(this.typer);
        this.typed.set(null);
      }
    }, 28);
  }

  onTabKey(event: KeyboardEvent): void {
    const n = this.systems.length;
    let next = -1;
    if (event.key === 'ArrowRight') next = (this.activeIndex() + 1) % n;
    else if (event.key === 'ArrowLeft') next = (this.activeIndex() - 1 + n) % n;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = n - 1;
    if (next < 0) return;
    event.preventDefault();
    this.select(next);
    const tabs = (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[next]?.focus();
  }

  stopAutoplay(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.autoplay.set(false);
  }

  ngOnDestroy(): void {
    clearInterval(this.typer);
    this.stopAutoplay();
  }
}
