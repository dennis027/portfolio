import { DOCUMENT, Injectable, inject } from '@angular/core';
import { prefersReducedMotion } from './motion/motion';
import { TripService } from './drive/trip.service';

/** Direct links to a section or project, and the highlight a visitor sees when they arrive by one. */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly document = inject(DOCUMENT);
  private readonly trip = inject(TripService);

  /** A link straight to an element on this page, e.g. …/portfolio/#project-safaribucks */
  linkTo(id: string): string {
    const loc = this.document.location;
    return `${loc.origin}${loc.pathname}#${id}`;
  }

  copyLink(id: string, label: string): void {
    const link = this.linkTo(id);
    const done = () => this.trip.toast('Link copied', label);
    navigator.clipboard?.writeText(link).then(done, () => this.trip.toast('Link', link)) ?? this.trip.toast('Link', link);
  }

  /** Scrolls to an element and gives it a brief highlight, so the visitor sees what they were sent to. */
  arrive(id: string, delay = 0): void {
    const el = this.document.getElementById(id);
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      el.classList.remove('is-arrived');
      void el.offsetWidth; // restart the highlight if it is already showing
      el.classList.add('is-arrived');
      setTimeout(() => el.classList.remove('is-arrived'), 2600);
    }, delay);
  }
}
