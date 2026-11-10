import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';
import { hasFinePointer, prefersReducedMotion } from './motion';

/**
 * Sets --prox (0…1) on each child letter by its horizontal distance from the pointer,
 * so the stylesheet can swell letters near the cursor (e.g. through variable-font axes).
 * Listens while the pointer is over the element.
 */
@Directive({
  selector: '[appProximity]',
})
export class ProximityDirective implements OnDestroy {
  /** Distance in px at which a letter is back to rest. */
  readonly radius = input(320, { alias: 'appProximity', transform: (v: unknown) => Number(v) || 320 });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion() || !hasFinePointer()) return;
      const node = this.el.nativeElement;
      const letters = Array.from(node.querySelectorAll<HTMLElement>('i'));
      let frame = 0;
      const move = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = this.radius();
          for (const l of letters) {
            const b = l.getBoundingClientRect();
            const d = Math.abs(e.clientX - (b.left + b.width / 2));
            l.style.setProperty('--prox', Math.max(0, 1 - d / r).toFixed(3));
          }
        });
      };
      const leave = () => {
        cancelAnimationFrame(frame);
        for (const l of letters) l.style.setProperty('--prox', '0');
      };
      node.addEventListener('pointermove', move, { passive: true });
      node.addEventListener('pointerleave', leave);
      this.cleanup = () => {
        cancelAnimationFrame(frame);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', leave);
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
