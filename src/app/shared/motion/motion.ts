/** Shared checks for the motion layer. Call only in the browser (inside afterNextRender). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for a mouse or trackpad — cursor-driven effects are skipped on touch. */
export function hasFinePointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Runs `fn` once, the first time `node` scrolls into view. Returns a disposer. */
export function onceInView(node: Element, fn: () => void, threshold = 0.2): () => void {
  if (!('IntersectionObserver' in window)) {
    fn();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { threshold },
  );
  io.observe(node);
  return () => io.disconnect();
}
