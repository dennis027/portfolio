import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';
import { hasFinePointer, prefersReducedMotion } from './motion';

/** Pulls an element a fraction of the way toward the pointer while it hovers, then springs back. */
@Directive({
  selector: '[appMagnetic]',
  host: { class: 'magnetic' },
})
export class MagneticDirective implements OnDestroy {
  readonly strength = input(0.3, { alias: 'appMagnetic', transform: (v: unknown) => Number(v) || 0.3 });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion() || !hasFinePointer()) return;
      const node = this.el.nativeElement;
      // Measured on enter: measuring while the element moves would chase its own offset.
      let rect: DOMRect | undefined;
      const enter = () => (rect = node.getBoundingClientRect());
      const move = (e: PointerEvent) => {
        if (!rect) return;
        const s = this.strength();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        node.style.translate = `${(dx * s).toFixed(1)}px ${(dy * s).toFixed(1)}px`;
      };
      const leave = () => {
        rect = undefined;
        node.style.translate = '';
      };
      node.addEventListener('pointerenter', enter);
      node.addEventListener('pointermove', move, { passive: true });
      node.addEventListener('pointerleave', leave);
      this.cleanup = () => {
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
