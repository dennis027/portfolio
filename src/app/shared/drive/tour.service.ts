import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { FEATURED_PROJECT, PROFILE } from '../../portfolio/portfolio.data';
import { prefersReducedMotion } from '../motion/motion';
import { TripService } from './trip.service';

export interface TourAction {
  label: string;
  icon: string;
  /** Opens in a new tab. */
  href?: string;
  /** Copies this text to the clipboard. */
  copy?: string;
  /** Moves focus to this element (e.g. the first form field). */
  focus?: string;
}

export interface TourStop {
  id: string;
  /** Element to spotlight. */
  target: string;
  title: string;
  /** One or two short lines; the stop lasts as long as they take to read. */
  text: string;
  actions?: TourAction[];
}

export type TrackId = 'quick' | 'deep';

const live = FEATURED_PROJECT.links.find((l) => l.kind === 'live');
const source = FEATURED_PROJECT.links.find((l) => l.kind === 'code');

/** Every stop either track can visit. Copy is shortened from the page itself — nothing new. */
const STOPS: Record<string, TourStop> = {
  hello: {
    id: 'hello',
    target: '#hero-title',
    title: "Hi, I'm Dennis",
    text: "A full-stack engineer in Nairobi. I build payment, messaging and billing systems that keep working when networks don't.",
  },
  rental: {
    id: 'rental',
    target: '#project-rental .feature__intro',
    title: 'Built solo: the Rental System',
    text: 'Rent billing for Kenyan landlords — invoices from meter readings, M-Pesa matching and arrears, designed, built and deployed on my own.',
    actions: [
      ...(live ? [{ label: 'Open live demo', icon: 'fa-solid fa-arrow-up-right-from-square', href: live.url }] : []),
      ...(source ? [{ label: 'View source', icon: 'fa-brands fa-github', href: source.url }] : []),
    ],
  },
  teams: {
    id: 'teams',
    target: '#project-silkcommerce .case__content',
    title: 'Shipped with product teams',
    text: 'A storefront theme for a multi-tenant SaaS, a PIN layer for a wallet app, SMS gateway routing and offline field reporting.',
  },
  silk: {
    id: 'silk',
    target: '#project-silkcommerce .case__content',
    title: 'SilkCommerce',
    text: 'Multi-tenant commerce. I built its second storefront theme end to end — catalogue, cart, account and checkout.',
  },
  safari: {
    id: 'safari',
    target: '#project-safaribucks .case__content',
    title: 'SafariBucks',
    text: 'A wallet on web and mobile. I designed its PIN system: five rate-limited endpoints with feature tests, enforced app-wide.',
  },
  sms: {
    id: 'sms',
    target: '#project-bulk-sms .case__content',
    title: 'Bulk SMS',
    text: 'Messages that survive a gateway failure: routing across Infobip and Onfon, delivery analytics and a failed-message outbox.',
  },
  votegrip: {
    id: 'votegrip',
    target: '#project-votegrip .case__content',
    title: 'VoteGrip',
    text: 'Election monitoring that works with no signal — cached logins and a sync queue so no field report is lost.',
  },
  stack: {
    id: 'stack',
    target: '#skills .core',
    title: 'The stack',
    text: 'Angular and Vue up front, Django, Laravel and Go behind, Flutter on mobile — PostgreSQL and Docker underneath.',
  },
  experience: {
    id: 'experience',
    target: '#experience .timeline',
    title: 'Experience',
    text: 'Freelance and contract work since 2022, including a core banking platform with an integrated general ledger.',
  },
  highlights: {
    id: 'highlights',
    target: '#experience .highlights',
    title: 'Achievements',
    text: 'A wallet PIN layer, SMS that survives outages, rent billing end to end, and an app that works offline.',
  },
  about: {
    id: 'about',
    target: '#about .statement',
    title: 'How I work',
    text: 'Security and forensics trained, so I design for failure first.',
  },
  contact: {
    id: 'contact',
    target: '#contact .contact__email',
    title: "Let's talk",
    text: "Email, phone or the form — I'm open to full-time, contract and freelance roles.",
    actions: [
      { label: 'Copy email', icon: 'fa-regular fa-copy', copy: PROFILE.email },
      { label: 'Write a message', icon: 'fa-regular fa-pen-to-square', focus: '#cf-name' },
    ],
  },
};

export const TRACKS: Record<TrackId, { label: string; stops: string[] }> = {
  quick: { label: 'Quick · 30s', stops: ['hello', 'rental', 'teams', 'stack', 'experience', 'contact'] },
  deep: {
    label: 'Deep dive · 90s',
    stops: ['hello', 'rental', 'silk', 'safari', 'sms', 'votegrip', 'stack', 'experience', 'highlights', 'about', 'contact'],
  },
};

/** Long enough to read the caption (≈ 220 wpm) plus a beat to look, within sensible bounds. */
function readingMs(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.min(9000, Math.max(4500, words * 270 + 1800));
}

/**
 * A guided tour of the page. Each stop is spotlit and captioned (see TourCard); the car,
 * where there is one, drives itself to it (see CarCursor). Auto-advances at reading pace,
 * pauses when the visitor starts exploring on their own, and can be started from a link
 * (?tour, ?tour=deep, ?tour=3). Works the same on touch screens, minus the car.
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly document = inject(DOCUMENT);
  private readonly trip = inject(TripService);

  readonly tracks = TRACKS;
  readonly active = signal(false);
  readonly track = signal<TrackId>('quick');
  readonly index = signal(0);
  readonly playing = signal(false);
  /** The visitor scrolled away on their own; the tour waits for them. */
  readonly exploring = signal(false);
  /** Past the last stop: the closing card with next steps. */
  readonly finished = signal(false);

  readonly stops = computed(() => TRACKS[this.track()].stops.map((id) => STOPS[id]));
  readonly current = computed(() => this.stops()[this.index()]);
  readonly isLast = computed(() => this.index() === this.stops().length - 1);
  readonly durationMs = computed(() => readingMs(this.current().text));

  private timer?: ReturnType<typeof setTimeout>;
  private highlighted?: Element;
  private returnFocus?: HTMLElement;
  private programmaticScrollUntil = 0;
  private detachInterrupts?: () => void;

  start(track: TrackId = 'quick', at = 0): void {
    if (!this.active()) this.returnFocus = this.document.activeElement as HTMLElement | undefined;
    this.track.set(track);
    this.active.set(true);
    this.finished.set(false);
    this.playing.set(true);
    this.exploring.set(false);
    this.document.documentElement.classList.add('is-touring');
    this.watchForExploring();
    this.show(Math.min(Math.max(at, 0), this.stops().length - 1));
  }

  /** Switch tracks without losing your place: carry on from the same stop, or the nearest one before it. */
  switchTrack(track: TrackId): void {
    if (track === this.track()) return;
    const here = TRACKS[this.track()].stops.slice(0, this.index() + 1);
    const next = TRACKS[track].stops;
    let at = 0;
    for (let i = here.length - 1; i >= 0; i--) {
      const j = next.indexOf(here[i]);
      if (j >= 0) {
        at = j;
        break;
      }
    }
    this.start(track, at);
  }

  end(): void {
    if (!this.active()) return;
    clearTimeout(this.timer);
    this.detachInterrupts?.();
    this.active.set(false);
    this.playing.set(false);
    this.finished.set(false);
    this.exploring.set(false);
    this.highlight(undefined);
    this.document.documentElement.classList.remove('is-touring');
    this.returnFocus?.focus?.({ preventScroll: true });
  }

  next(): void {
    if (this.finished()) this.end();
    else if (this.isLast()) this.finish();
    else this.show(this.index() + 1);
  }

  prev(): void {
    if (this.finished()) this.show(this.stops().length - 1);
    else this.show(Math.max(0, this.index() - 1));
  }

  goTo(i: number): void {
    this.show(i);
  }

  togglePlay(): void {
    if (this.exploring()) return this.resume();
    this.playing.update((p) => !p);
    this.schedule();
  }

  /** Back from exploring: return to the current stop and carry on. */
  resume(): void {
    this.playing.set(true);
    this.show(this.index());
  }

  replay(): void {
    this.start(this.track(), 0);
  }

  /** A link that starts this tour, for sharing with a colleague. */
  shareLink(): string {
    const loc = this.document.location;
    return `${loc.origin}${loc.pathname}?tour${this.track() === 'deep' ? '=deep' : ''}`;
  }

  /** The current stop's element, if it is on the page. */
  target(): HTMLElement | null {
    return this.active() && !this.finished() ? this.document.querySelector<HTMLElement>(this.current().target) : null;
  }

  /** Where the car should park for the current stop: just off the target's top-left corner, kept on screen. */
  anchorPoint(): { x: number; y: number } | null {
    const r = this.target()?.getBoundingClientRect();
    if (!r) return null;
    const win = this.document.defaultView!;
    return {
      x: Math.min(Math.max(r.left - 34, 40), win.innerWidth - 60),
      y: Math.min(Math.max(r.top + 22, 96), win.innerHeight - 120),
    };
  }

  private finish(): void {
    clearTimeout(this.timer);
    this.finished.set(true);
    this.playing.set(false);
    this.highlight(undefined);
    this.trip.unlock('tour');
    if (this.track() === 'deep') this.trip.unlock('deep-dive');
  }

  private show(i: number): void {
    this.finished.set(false);
    this.exploring.set(false);
    this.index.set(i);
    const el = this.target();
    this.highlight(el ?? undefined);
    // Just under the nav, so the bottom of the screen stays free for a docked caption
    this.programmaticScrollUntil = Date.now() + 1400;
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    this.schedule();
  }

  private schedule(): void {
    clearTimeout(this.timer);
    if (this.active() && this.playing() && !this.finished() && !this.exploring()) {
      this.timer = setTimeout(() => this.next(), this.durationMs());
    }
  }

  /**
   * The visitor reaching for the wheel, the scrollbar keys or a touch-scroll means they want to
   * look around: pause instead of yanking them back to the next stop.
   */
  private watchForExploring(): void {
    this.detachInterrupts?.();
    const win = this.document.defaultView!;
    const onInput = (e: Event) => {
      if (!this.active() || this.finished() || Date.now() < this.programmaticScrollUntil) return;
      if (e instanceof KeyboardEvent && !['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      if (e instanceof KeyboardEvent && (e.target as Element | null)?.closest('.tour, input, textarea')) return;
      if ((e.target as Element | null)?.closest?.('.tour')) return;
      clearTimeout(this.timer);
      this.exploring.set(true);
      this.playing.set(false);
    };
    win.addEventListener('wheel', onInput, { passive: true });
    win.addEventListener('touchmove', onInput, { passive: true });
    win.addEventListener('keydown', onInput);
    this.detachInterrupts = () => {
      win.removeEventListener('wheel', onInput);
      win.removeEventListener('touchmove', onInput);
      win.removeEventListener('keydown', onInput);
    };
  }

  private highlight(el: Element | undefined): void {
    this.highlighted?.classList.remove('is-touring-target');
    this.highlighted = el;
    el?.classList.add('is-touring-target');
  }
}
