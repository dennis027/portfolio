import { Component, DOCUMENT, ElementRef, OnDestroy, ViewEncapsulation, afterNextRender, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { hasFinePointer, prefersReducedMotion } from '../motion/motion';
import { CarIcon } from './car-icon';
import { TourService } from './tour.service';
import { TripService } from './trip.service';

const INTERACTIVE = 'a, button, [role="tab"], label, summary, input, textarea, select, .trip';
const FIELDS = 'input, textarea, select';
const STOP_DISTANCE = 30; // parks this far behind the pointer so it never sits on what you point at
const SLOW_RADIUS = 170;
const IDLE_MS = 2600; // pointer still this long → the car circles lazily…
const WANDER_MS = 7000; // …for this long, then parks and the loop stops
const MARK_POOL = 140;
const PUFF_POOL = 18;
const ENGINE_ON_PX = 4000;
const NITRO_MS = 1100;
const NITRO_COOLDOWN_MS = 2500;
const DRIFT_SLIP = 0.55; // radians between nose and travel direction that counts as a slide
const DRIFTS_FOR_BADGE = 3;
const COIN_RADIUS = 28;

/**
 * A small car that drives after the mouse pointer — and a little toy to play with:
 * it drifts through sharp turns, boosts on Shift, honks on a click into empty space (or H),
 * picks up coins, can be parked in the bay by Contact, and bumps the footer letters.
 * Native cursor, clicks and text selection are untouched (pointer-events: none).
 * Mouse and trackpad only; absent under reduced motion.
 */
@Component({
  selector: 'app-car-cursor',
  imports: [CarIcon],
  templateUrl: './car-cursor.html',
  styleUrl: './car-cursor.css',
  // Tire marks and dust are created in script, so these styles must not be view-scoped
  encapsulation: ViewEncapsulation.None,
})
export class CarCursor implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  protected readonly trip = inject(TripService);
  private readonly tour = inject(TourService);
  /** Restarts the driving loop from outside (set once the car has started). */
  private kick?: () => void;
  protected readonly enabled = signal(false);
  private readonly car = viewChild<ElementRef<HTMLElement>>('car');
  private readonly trail = viewChild<ElementRef<HTMLElement>>('trail');
  private readonly bubble = viewChild<ElementRef<HTMLElement>>('bubble');
  private frame = 0;
  private cleanup: (() => void)[] = [];
  private audio?: AudioContext;
  private started = false;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion() || !hasFinePointer()) return;
      this.enabled.set(true);
      this.trip.carEnabled.set(true);
      this.document.documentElement.classList.add('has-car');
    });
    // Start the engine as soon as the car has actually rendered — however long the first
    // render takes (development builds and slow devices can take many frames).
    effect(() => {
      const car = this.car()?.nativeElement;
      const trail = this.trail()?.nativeElement;
      if (!car || !trail || this.started) return;
      this.started = true;
      untracked(() => this.start(car, trail));
    });
    // Autopilot: a tour starting, or moving to the next stop, gets the car rolling
    effect(() => {
      this.tour.active();
      this.tour.index();
      untracked(() => this.kick?.());
    });
  }

  private start(car: HTMLElement, trail: HTMLElement): void {
    const doc = this.document;
    const win = doc.defaultView!;

    // Pools: marks and puffs are reused, never created while driving
    const marks = Array.from({ length: MARK_POOL }, () => trail.appendChild(doc.createElement('i')));
    const puffs = Array.from({ length: PUFF_POOL }, () => trail.appendChild(doc.createElement('b')));
    let markIndex = 0;
    let puffIndex = 0;

    // Entrance: roll in from the left and park just past the hero buttons, in the open space beside them.
    // The spot is re-read every frame until the visitor takes over, because the buttons are still
    // animating into place when the car sets off.
    const cta = doc.querySelector<HTMLElement>('.hero__actions .btn:last-child');
    const parking = () => {
      const r = cta?.getBoundingClientRect();
      return r && r.width
        ? { x: Math.min(r.right + 56, win.innerWidth - 60), y: r.top + r.height / 2 }
        : { x: win.innerWidth * 0.12, y: win.innerHeight * 0.8 };
    };
    let { x: tx, y: ty } = parking();
    let x = -60;
    let y = ty;
    let vx = 0, vy = 0, angle = 0, prevSpeed = 0;
    let mx = tx, my = ty;
    let following = false;
    let lastMove = performance.now();
    let wanderPhase = 0;
    let markDistance = 0;
    let driven = 0;
    let lastPuff = 0;
    let last = 0;
    let running = false;
    const startedAt = performance.now();
    const ENTRANCE_MS = 4500; // hero entrance (and intro) settle within this

    // Toys
    let nitroUntil = 0;
    let nitroReadyAt = 0;
    let drifting = false;
    let drifts = 0;
    let tipShown = false;
    let frameNo = 0;
    let wasAutopilot = false;
    const wordmark = Array.from(doc.querySelectorAll<HTMLElement>('.footer__wordmark i'));

    const emitMark = (px: number, py: number, a: number, hot: boolean, dark: boolean) => {
      const m = marks[markIndex++ % MARK_POOL];
      m.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) rotate(${a}rad)`;
      m.className = hot ? 'is-turbo' : dark ? 'is-drift' : '';
      m.animate([{ opacity: hot ? 0.7 : dark ? 0.55 : 0.32 }, { opacity: 0 }], {
        duration: hot || dark ? 1800 : 1100,
        easing: 'ease-out',
      });
    };
    const emitPuff = (px: number, py: number, flame = false) => {
      const p = puffs[puffIndex++ % PUFF_POOL];
      p.className = flame ? 'is-flame' : '';
      const drift = (Math.random() - 0.5) * 16;
      p.animate(
        [
          { transform: `translate3d(${px}px, ${py}px, 0) scale(0.4)`, opacity: flame ? 0.9 : 0.5 },
          { transform: `translate3d(${px + drift}px, ${py + drift}px, 0) scale(${flame ? 1.4 : 2})`, opacity: 0 },
        ],
        { duration: flame ? 380 : 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    };

    /** Coins under the car get collected. */
    const checkCoins = () => {
      for (const coin of doc.querySelectorAll<HTMLElement>('.coin:not(.is-collected)')) {
        const r = coin.getBoundingClientRect();
        if (!r.width) continue;
        if (Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y) < COIN_RADIUS) {
          const id = coin.dataset['coin'];
          if (id) {
            emitSparkle(r.left + r.width / 2, r.top + r.height / 2);
            this.trip.collectCoin(id);
          }
        }
      }
    };
    const emitSparkle = (px: number, py: number) => {
      for (let i = 0; i < 6; i++) {
        const p = puffs[puffIndex++ % PUFF_POOL];
        p.className = 'is-spark';
        const a = (i / 6) * Math.PI * 2;
        p.animate(
          [
            { transform: `translate3d(${px - 7}px, ${py - 7}px, 0) scale(0.6)`, opacity: 1 },
            { transform: `translate3d(${px - 7 + Math.cos(a) * 34}px, ${py - 7 + Math.sin(a) * 34}px, 0) scale(0.2)`, opacity: 0 },
          ],
          { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
    };

    /** Stopped neatly (nose roughly level) inside the bay by Contact. */
    const checkParking = (speed: number) => {
      const bay = doc.querySelector<HTMLElement>('.parking-spot');
      if (!bay) return;
      const r = bay.getBoundingClientRect();
      const inside = x > r.left + 8 && x < r.right - 8 && y > r.top + 4 && y < r.bottom - 4;
      bay.classList.toggle('is-near', inside);
      const level = Math.abs(Math.sin(angle)) < 0.3;
      if (inside && level && speed < 6) this.trip.unlock('parked');
    };

    /** Driving through the giant footer name knocks its letters. */
    const checkWordmark = () => {
      if (y < win.innerHeight * 0.5) return;
      for (const l of wordmark) {
        const r = l.getBoundingClientRect();
        if (x > r.left && x < r.right && y > r.top && y < r.bottom && !l.classList.contains('is-bumped')) {
          l.classList.add('is-bumped');
          setTimeout(() => l.classList.remove('is-bumped'), 700);
        }
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.033) : 0.016;
      last = now;
      frameNo++;
      const turbo = this.trip.turbo();
      const nitro = now < nitroUntil;
      car.classList.toggle('is-nitro', nitro);
      const boost = (turbo ? 1.8 : 1) * (nitro ? 1.9 : 1);
      const maxSpeed = 820 * boost;
      const maxAccel = 2600 * boost;

      // Target: the guided tour's current stop (autopilot), the pointer, or a lazy orbit
      // around the pointer while it rests
      const autopilot = this.tour.active() ? this.tour.anchorPoint() : null;
      // After a tour, stay where it ended rather than driving back to the hero
      if (wasAutopilot && !autopilot && !following) {
        following = true;
        mx = x;
        my = y;
        lastMove = now;
      }
      wasAutopilot = !!autopilot;
      const idle = !autopilot && following && now - lastMove > IDLE_MS;
      const wandering = idle && now - lastMove < IDLE_MS + WANDER_MS;
      if (autopilot) {
        tx = autopilot.x;
        ty = autopilot.y;
      } else if (!following) ({ x: tx, y: ty } = parking());
      else {
        if (wandering) {
          wanderPhase += dt * 1.15;
          tx = mx + Math.cos(wanderPhase) * 64;
          ty = my + Math.sin(wanderPhase) * 34;
        } else {
          tx = mx;
          ty = my;
        }
      }

      // Arrive: full speed when far, easing off inside SLOW_RADIUS, stopping short of the target
      const dx = tx - x, dy = ty - y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const stop = following && !wandering && !autopilot ? STOP_DISTANCE : 0;
      const desired = dist > stop ? maxSpeed * Math.min(1, (dist - stop) / SLOW_RADIUS) : 0;
      let sx = (dx / dist) * desired - vx;
      let sy = (dy / dist) * desired - vy;
      const steerMag = Math.hypot(sx, sy);
      const limit = maxAccel * dt;
      if (steerMag > limit) {
        sx = (sx / steerMag) * limit;
        sy = (sy / steerMag) * limit;
      }
      vx += sx;
      vy += sy;
      x += vx * dt;
      y += vy * dt;

      const speed = Math.hypot(vx, vy);
      const accel = (speed - prevSpeed) / dt;
      prevSpeed = speed;

      // Heading follows velocity, but turns slower at speed — so sharp turns slide (a drift)
      let steer = 0;
      let slip = 0;
      if (speed > (following ? 24 : 160)) {
        let diff = Math.atan2(vy, vx) - angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        slip = Math.abs(diff);
        const turnRate = 12 - Math.min(8, speed / 120);
        angle += diff * Math.min(1, dt * turnRate);
        steer = Math.max(-34, Math.min(34, diff * 57.3 * 1.6));
      }
      const nowDrifting = slip > DRIFT_SLIP && speed > 420;
      if (nowDrifting && !drifting && following) {
        drifts++;
        if (drifts >= DRIFTS_FOR_BADGE) this.trip.unlock('drifter');
      }
      drifting = nowDrifting;
      car.classList.toggle('is-drift', drifting);

      car.style.transform = `translate3d(${(x - 22).toFixed(1)}px, ${(y - 12).toFixed(1)}px, 0) rotate(${angle.toFixed(4)}rad)`;
      car.style.setProperty('--steer', `${steer.toFixed(1)}deg`);
      car.style.setProperty('--brake', Math.max(0, Math.min(1, -accel / 1400)).toFixed(2));

      // Tire marks from the rear wheels; smoke when drifting, flames on nitro, dust on hard launches
      markDistance += speed * dt;
      if (following) driven += speed * dt;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      if (markDistance > (drifting ? 8 : 14) && speed > 140) {
        markDistance = 0;
        const rx = x - cos * 10, ry = y - sin * 10;
        emitMark(rx - sin * 8, ry + cos * 8, angle, turbo || nitro, drifting);
        emitMark(rx + sin * 8, ry - cos * 8, angle, turbo || nitro, drifting);
      }
      const exhaustX = x - cos * 24 - 7, exhaustY = y - sin * 24 - 7;
      if (nitro && now - lastPuff > 30) {
        lastPuff = now;
        emitPuff(exhaustX, exhaustY, true);
      } else if ((drifting || accel > 2000 || (turbo && speed > 900)) && now - lastPuff > 60) {
        lastPuff = now;
        emitPuff(exhaustX, exhaustY);
      }

      if (driven > ENGINE_ON_PX) {
        driven = -Infinity;
        this.trip.unlock('engine-on');
        if (!tipShown) {
          tipShown = true;
          setTimeout(() => this.trip.toast('Tip', 'Hold Shift for nitro · click empty space to honk'), 1600);
        }
      }

      // Collisions are cheap but not free: check every other frame, and only once driving
      if (following && frameNo % 2 === 0) {
        checkCoins();
        checkWordmark();
        if (speed < 60) checkParking(speed);
      }

      // Park and stop the loop once settled (it restarts on the next pointer move)
      // (never while touring: the page scrolls under the car, so the stop keeps moving)
      const settled =
        !autopilot &&
        speed < 3 && dist <= stop + 2 && !wandering && !nitro && (following || now - startedAt > ENTRANCE_MS);
      if (settled) {
        if (following) checkParking(0);
        running = false;
        last = 0;
        car.style.setProperty('--brake', '0');
        car.classList.remove('is-drift', 'is-nitro');
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (running) return;
      running = true;
      this.frame = requestAnimationFrame(tick);
    };
    this.kick = run;

    const honk = () => {
      car.classList.remove('is-honk');
      void car.offsetWidth; // restart the bubble animation
      car.classList.add('is-honk');
      const b = this.bubble()?.nativeElement;
      if (b) {
        b.style.transform = `translate3d(${(x + 6).toFixed(0)}px, ${(y - 46).toFixed(0)}px, 0)`;
        b.animate(
          [
            { opacity: 0, scale: 0.4, translate: '0 6px' },
            { opacity: 1, scale: 1.12, translate: '0 0', offset: 0.15 },
            { opacity: 1, scale: 1, translate: '0 0', offset: 0.3 },
            { opacity: 1, scale: 1, translate: '0 -4px', offset: 0.8 },
            { opacity: 0, scale: 1, translate: '0 -14px' },
          ],
          { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
      this.trip.unlock('beep');
      if (this.trip.sound()) this.playHorn();
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      following = true;
      car.classList.add('is-on');
      run();
    };
    const over = (e: Event) => {
      const t = e.target as Element | null;
      car.classList.toggle('is-hover', !!t?.closest('a, button, [role="tab"], label, summary'));
      car.classList.toggle('is-yield', !!t?.closest(FIELDS));
    };
    // A click on empty space honks; clicks on anything interactive or on text being selected don't
    const click = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!following || t?.closest(INTERACTIVE)) return;
      if (win.getSelection()?.toString()) return;
      honk();
    };
    const key = (e: KeyboardEvent) => {
      const t = e.target as Element | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Shift' && !e.repeat && following) {
        const now = performance.now();
        if (now < nitroReadyAt) return;
        nitroUntil = now + NITRO_MS;
        nitroReadyAt = now + NITRO_MS + NITRO_COOLDOWN_MS;
        run();
      } else if ((e.key === 'h' || e.key === 'H') && !e.repeat && following) {
        honk();
      }
    };
    // After resting, a timer lets the loop begin circling while idle
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleWander = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(run, IDLE_MS + 30);
    };

    doc.addEventListener('pointermove', move, { passive: true });
    doc.addEventListener('pointermove', scheduleWander, { passive: true });
    doc.addEventListener('pointerover', over, { passive: true });
    doc.addEventListener('click', click);
    doc.addEventListener('keydown', key);
    car.classList.add('is-on');
    run();

    this.cleanup.push(() => {
      clearTimeout(idleTimer);
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointermove', scheduleWander);
      doc.removeEventListener('pointerover', over);
      doc.removeEventListener('click', click);
      doc.removeEventListener('keydown', key);
    });
  }

  /** A short two-tone horn, synthesised — only when the visitor has switched sound on. */
  private playHorn(): void {
    try {
      this.audio ??= new AudioContext();
      const ctx = this.audio;
      const t = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      gain.gain.setValueAtTime(0.08, t + 0.11);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      gain.connect(filter).connect(ctx.destination);
      for (const f of [392, 494]) {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = f;
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.3);
      }
    } catch {
      /* no audio — the bubble still shows */
    }
  }

  ngOnDestroy(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    for (const fn of this.cleanup) fn();
    this.document.documentElement.classList.remove('has-car');
    void this.audio?.close();
  }
}
