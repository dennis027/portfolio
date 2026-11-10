import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';
import { hasFinePointer, prefersReducedMotion } from './motion';

/**
 * Exposes the pointer position as --rx / --ry rotation (degrees) so a panel can lean toward
 * the cursor. The consuming stylesheet decides how to use them.
 */
@Directive({
  selector: '[appTilt]',
  host: { class: 'tilt' },
})
export class TiltDirective implements OnDestroy {
  readonly max = input(6, { alias: 'appTilt', transform: (v: unknown) => Number(v) || 6 });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion() || !hasFinePointer()) return;
      const node = this.el.nativeElement;
      let rect: DOMRect | undefined;
      let frame = 0;
      const enter = () => (rect = node.getBoundingClientRect());
      const move = (e: PointerEvent) => {
        if (!rect) rect = node.getBoundingClientRect();
        const r = rect;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          node.style.setProperty('--ry', `${(px * this.max()).toFixed(2)}deg`);
          node.style.setProperty('--rx', `${(-py * this.max()).toFixed(2)}deg`);
        });
      };
      const leave = () => {
        cancelAnimationFrame(frame);
        rect = undefined;
        node.style.setProperty('--rx', '0deg');
        node.style.setProperty('--ry', '0deg');
      };
      node.addEventListener('pointerenter', enter);
      node.addEventListener('pointermove', move, { passive: true });
      node.addEventListener('pointerleave', leave);
      this.cleanup = () => {
        cancelAnimationFrame(frame);
        node.removeEventListener('pointerenter', enter);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', leave);
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
