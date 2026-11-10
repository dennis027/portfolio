import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { onceInView, prefersReducedMotion } from './motion';

/**
 * Splits a static heading into words that rise out of their own masks, staggered, when it
 * scrolls into view. Inline elements such as <em> are kept and their words split inside them.
 * Use only on text without bindings — the original text nodes are replaced.
 */
@Directive({
  selector: '[appSplit]',
  host: { class: 'split' },
})
export class SplitDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private dispose?: () => void;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      split(node, { i: 0 });
      node.classList.add('is-split');
      if (prefersReducedMotion()) {
        node.classList.add('is-in');
        return;
      }
      this.dispose = onceInView(node, () => node.classList.add('is-in'), 0.1);
    });
  }

  ngOnDestroy(): void {
    this.dispose?.();
  }
}

function split(el: Element, counter: { i: number }): void {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      split(child as Element, counter);
      continue;
    }
    if (child.nodeType !== Node.TEXT_NODE) continue;
    const text = child.textContent ?? '';
    const frag = document.createDocumentFragment();
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(' ');
        continue;
      }
      const outer = document.createElement('span');
      outer.className = 'split__w';
      const inner = document.createElement('span');
      inner.className = 'split__i';
      inner.style.setProperty('--i', String(counter.i++));
      inner.textContent = part;
      outer.append(inner);
      frag.append(outer);
    }
    child.replaceWith(frag);
  }
}
