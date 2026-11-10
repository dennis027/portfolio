import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

/**
 * Tracks the pointer over an element and exposes it as --mx / --my, which the
 * global .spotlight styles use for a soft light under the cursor.
 * Only wired up for fine pointers that allow motion, so touch devices do no work.
 */
@Directive({
  selector: '[appSpotlight]',
  host: { class: 'spotlight' },
})
export class SpotlightDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
      if (!fine.matches) return;

      const node = this.el.nativeElement;
      let frame = 0;
      const move = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = node.getBoundingClientRect();
          node.style.setProperty('--mx', `${e.clientX - r.left}px`);
          node.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      };
      const enter = () => node.classList.add('is-lit');
      const leave = () => node.classList.remove('is-lit');

      node.addEventListener('pointermove', move, { passive: true });
      node.addEventListener('pointerenter', enter);
      node.addEventListener('pointerleave', leave);
      this.cleanup = () => {
        cancelAnimationFrame(frame);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerenter', enter);
        node.removeEventListener('pointerleave', leave);
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
