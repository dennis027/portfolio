import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { onceInView, prefersReducedMotion } from './motion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/_<>';
const FRAME_MS = 32;

/**
 * Decodes a short static label from random glyphs, left to right, when it first scrolls
 * into view and again on hover. Only for plain text with no bindings inside.
 */
@Directive({
  selector: '[appScramble]',
})
export class ScrambleDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer?: ReturnType<typeof setInterval>;
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      const node = this.el.nativeElement;
      const text = node.textContent ?? '';
      if (!text.trim()) return;
      // Keep the width steady while glyphs change
      node.style.display = 'inline-block';
      node.style.minWidth = `${node.getBoundingClientRect().width}px`;
      const run = () => this.run(node, text);
      this.cleanup.push(onceInView(node, run, 0.6));
      node.addEventListener('pointerenter', run);
      this.cleanup.push(() => node.removeEventListener('pointerenter', run));
    });
  }

  private run(node: HTMLElement, text: string): void {
    clearInterval(this.timer);
    const total = text.length * 1.6 + 6;
    let frame = 0;
    this.timer = setInterval(() => {
      frame++;
      const settled = Math.floor((frame / total) * text.length * 1.15);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < settled || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      node.textContent = out;
      if (settled >= text.length) {
        clearInterval(this.timer);
        node.textContent = text;
      }
    }, FRAME_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    for (const fn of this.cleanup) fn();
  }
}
