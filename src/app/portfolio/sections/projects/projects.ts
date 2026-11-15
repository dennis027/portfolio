import { Coin } from '../../../shared/drive/coin';
import { Component, ElementRef, OnDestroy, afterNextRender, inject, signal, viewChildren } from '@angular/core';
import { RevealDirective } from '../../../shared/reveal.directive';
import { ScrambleDirective } from '../../../shared/motion/scramble.directive';
import { SplitDirective } from '../../../shared/motion/split.directive';
import { SpotlightDirective } from '../../../shared/spotlight.directive';
import { TiltDirective } from '../../../shared/motion/tilt.directive';
import { ShareService } from '../../../shared/share.service';
import { FEATURED_PROJECT, MORE_PROJECTS, SOLO_PROJECTS, SUPPORTING_PROJECTS, TEAM_PROJECTS } from '../../portfolio.data';
import { ProjectCard, linkIcon, statusClass } from './project-card';

@Component({
  selector: 'app-projects',
  imports: [ProjectCard, RevealDirective, ScrambleDirective, SplitDirective, SpotlightDirective, TiltDirective, Coin],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnDestroy {
  protected readonly featured = FEATURED_PROJECT;
  protected readonly solo = SOLO_PROJECTS;
  protected readonly cases = [...TEAM_PROJECTS, ...SUPPORTING_PROJECTS];
  protected readonly more = MORE_PROJECTS;
  /** Feature contributions are told through the screenshots; the last one (security) is shown separately. */
  protected readonly underTheHood = FEATURED_PROJECT.contributions.at(-1);
  protected readonly demo = FEATURED_PROJECT.links.find((l) => l.kind === 'live');

  /** Index of the screenshot shown in the pinned browser frame. */
  protected readonly shot = signal(0);
  /** Id of the "Also built" row whose case notes are open, if any. */
  protected readonly open = signal<string | null>(null);
  protected readonly linkIcon = linkIcon;
  protected readonly statusClass = statusClass;
  protected readonly share = inject(ShareService);

  private readonly steps = viewChildren<ElementRef<HTMLElement>>('step');
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) return;
      // A step becomes active when it crosses the middle band of the viewport.
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.shot.set(Number((entry.target as HTMLElement).dataset['step']));
          }
        },
        { rootMargin: '-45% 0px -45% 0px' },
      );
      for (const step of this.steps()) this.observer.observe(step.nativeElement);
    });
  }

  /** Screen buttons scroll the matching step to the reading line, which then activates it. */
  goTo(index: number): void {
    this.shot.set(index);
    const step = this.steps()[index]?.nativeElement;
    if (!step) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    step.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }

  toggle(id: string): void {
    this.open.update((current) => (current === id ? null : id));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
