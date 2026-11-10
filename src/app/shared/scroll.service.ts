import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly document = inject(DOCUMENT);

  /**
   * In-page navigation that works under any base href and moves keyboard
   * focus to the target section. Links keep a real href for no-JS / new-tab use.
   */
  to(anchor: string, event?: Event): void {
    const target = this.document.getElementById(anchor);
    if (!target) return;
    event?.preventDefault();
    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}
