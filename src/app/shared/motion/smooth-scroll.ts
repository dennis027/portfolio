import { hasFinePointer, prefersReducedMotion } from './motion';

const EASE = 0.2; // fraction of the remaining distance covered per 60fps frame — light, so it never lags the hand

/**
 * Inertial wheel scrolling for mouse and trackpad. The page still scrolls natively —
 * this only eases the wheel's target, so sticky elements, scroll events, keyboard,
 * scrollbar dragging and anchor links keep working. Skipped for touch and reduced motion.
 * Returns a disposer.
 */
export function startSmoothScroll(doc: Document): () => void {
  if (prefersReducedMotion() || !hasFinePointer()) return () => {};
  const win = doc.defaultView!;
  const root = doc.documentElement;
  let target = win.scrollY;
  let current = win.scrollY;
  let animating = false;
  let frame = 0;
  let last = 0;

  const max = () => root.scrollHeight - win.innerHeight;

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 16.67, 4) : 1;
    last = now;
    current += (target - current) * (1 - Math.pow(1 - EASE, dt));
    if (Math.abs(target - current) < 0.5) {
      current = target;
      animating = false;
    }
    win.scrollTo({ top: current, behavior: 'instant' });
    if (animating) frame = requestAnimationFrame(tick);
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented || root.classList.contains('menu-open')) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // sideways trackpad gestures stay native
    if (insideScroller(e.target as Element | null, e.deltaY)) return;
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * win.innerHeight : e.deltaY;
    if (!animating) {
      target = current = win.scrollY;
      last = 0;
    }
    target = Math.min(Math.max(target + delta, 0), max());
    if (!animating) {
      animating = true;
      frame = requestAnimationFrame(tick);
    }
  };

  // Anything else that moves the page (keys, scrollbar, anchor links) takes over immediately.
  const stop = () => {
    if (!animating) return;
    animating = false;
    cancelAnimationFrame(frame);
  };
  const onScroll = () => {
    if (!animating) target = current = win.scrollY;
  };

  win.addEventListener('wheel', onWheel, { passive: false });
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('keydown', stop);
  win.addEventListener('pointerdown', stop);
  return () => {
    stop();
    win.removeEventListener('wheel', onWheel);
    win.removeEventListener('scroll', onScroll);
    win.removeEventListener('keydown', stop);
    win.removeEventListener('pointerdown', stop);
  };
}

/** True when the wheel is over an element that can itself scroll in that direction. */
function insideScroller(el: Element | null, deltaY: number): boolean {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    if (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT') return true;
    const style = getComputedStyle(node);
    if (!/(auto|scroll)/.test(style.overflowY) || node.scrollHeight <= node.clientHeight) continue;
    const atTop = node.scrollTop <= 0;
    const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
    if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
  }
  return false;
}
