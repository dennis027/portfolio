import { Component, DOCUMENT, ElementRef, OnDestroy, afterNextRender, computed, inject, signal, viewChildren } from '@angular/core';
import { ScrollService } from '../shared/scroll.service';
import { CarCursor } from '../shared/drive/car-cursor';
import { CarIcon } from '../shared/drive/car-icon';
import { Road } from '../shared/drive/road';
import { TripHud } from '../shared/drive/trip-hud';
import { TripService } from '../shared/drive/trip.service';
import { TourCard } from '../shared/drive/tour-card';
import { TourService } from '../shared/drive/tour.service';
import { CvService } from '../shared/cv/cv.service';
import { PrintCv } from '../shared/cv/print-cv';
import { Command, CommandPalette } from '../shared/command-palette/command-palette';
import { ShareService } from '../shared/share.service';
import { MagneticDirective } from '../shared/motion/magnetic.directive';
import { prefersReducedMotion } from '../shared/motion/motion';
import { ProximityDirective } from '../shared/motion/proximity.directive';
import { startSmoothScroll } from '../shared/motion/smooth-scroll';
import {
  FEATURED_PROJECT,
  MORE_PROJECTS,
  SOLO_PROJECTS,
  NAV_LINKS,
  PROFILE,
  SOCIALS,
  SUPPORTING_PROJECTS,
  SectionId,
  TEAM_PROJECTS,
} from './portfolio.data';
import { Hero } from './sections/hero/hero';
import { About } from './sections/about/about';
import { Projects } from './sections/projects/projects';
import { Skills } from './sections/skills/skills';
import { ExperienceSection } from './sections/experience/experience';
import { Contact } from './sections/contact/contact';

type Theme = 'dark' | 'light';

interface Indicator {
  x: number;
  w: number;
}

@Component({
  selector: 'app-portfolio',
  imports: [Hero, About, Projects, Skills, ExperienceSection, Contact, CarCursor, CarIcon, Road, TripHud, TourCard, PrintCv, CommandPalette, MagneticDirective, ProximityDirective],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
  host: {
    '(document:keydown.escape)': 'closeMenu()',
    '(window:scroll)': 'onScroll()',
    '(window:resize)': 'placeIndicator()',
  },
})
export class Portfolio implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  protected readonly scroll = inject(ScrollService);
  protected readonly trip = inject(TripService);
  protected readonly tour = inject(TourService);
  protected readonly cv = inject(CvService);
  private readonly share = inject(ShareService);

  protected readonly navLinks = NAV_LINKS;
  protected readonly profile = PROFILE;
  protected readonly socials = SOCIALS;
  protected readonly currentYear = new Date().getFullYear();

  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  /** The bar slides away while reading downwards and returns on any upward scroll. */
  readonly navHidden = signal(false);
  readonly showTop = signal(false);
  /** Letters of the name for the intro curtain. */
  protected readonly introLetters = [...'Dennis Kimani'];
  readonly activeSection = signal<SectionId>('top');
  readonly theme = signal<Theme>('dark');
  /** Local time in Nairobi; empty during prerender so server and client markup match. */
  readonly localTime = signal('');
  readonly indicator = signal<Indicator | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly linkEls = viewChildren<ElementRef<HTMLElement>>('navLink');

  private spy?: IntersectionObserver;
  private clock?: ReturnType<typeof setInterval>;
  private frame = 0;
  private lastY = 0;
  private stopSmoothScroll?: () => void;

  constructor() {
    afterNextRender(() => {
      const current = this.document.documentElement.getAttribute('data-theme');
      this.theme.set(current === 'light' ? 'light' : 'dark');
      this.trip.restore(this.navLinks.length);
      this.onScroll();
      this.observeSections();
      this.startClock();
      this.stopSmoothScroll = startSmoothScroll(this.document);
      this.startTourFromLink();
      // Arrived by a shared link (…#project-safaribucks): bring it into view and point it out
      const hash = this.document.location.hash.slice(1);
      if (hash && hash !== 'main') this.share.arrive(hash, 700);
    });
  }

  /** Highlights the nav link for whichever section crosses the upper-middle of the viewport. */
  private observeSections(): void {
    if (!('IntersectionObserver' in window)) return;
    const ids: SectionId[] = ['top', ...this.navLinks.map((l) => l.anchor)];
    this.spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as SectionId;
            this.activeSection.set(id);
            if (id !== 'top') this.trip.checkpoint(id);
            this.placeIndicator();
          }
        }
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    for (const id of ids) {
      const el = this.document.getElementById(id);
      if (el) this.spy.observe(el);
    }
  }

  /**
   * Shareable tour links: ?tour starts the quick tour, ?tour=deep the deep dive, ?tour=3 the
   * quick tour at stop 3. Starts once the hero has settled.
   */
  private startTourFromLink(): void {
    const value = new URLSearchParams(this.document.location.search).get('tour');
    if (value === null) return;
    const track = value === 'deep' ? 'deep' : 'quick';
    const at = Math.max(0, (parseInt(value, 10) || 1) - 1);
    setTimeout(() => this.tour.start(track, at), 1400);
  }

  /** Everything the command palette (Ctrl/⌘ + K) can do. */
  protected readonly commands = computed<Command[]>(() => {
    const projects = [FEATURED_PROJECT, ...SOLO_PROJECTS, ...TEAM_PROJECTS, ...SUPPORTING_PROJECTS, ...MORE_PROJECTS];
    const open = (url: string) => () => this.document.defaultView?.open(url, '_blank', 'noopener');
    const copy = (text: string, label: string) => () =>
      navigator.clipboard?.writeText(text).then(
        () => this.trip.toast('Copied', label),
        () => this.trip.toast(label, text),
      );
    const live = FEATURED_PROJECT.links.find((l) => l.kind === 'live');
    const source = FEATURED_PROJECT.links.find((l) => l.kind === 'code');
    return [
      { id: 'go-top', group: 'Navigate', label: 'Top of the page', icon: 'fa-solid fa-arrow-up', run: () => this.scroll.to('top') },
      ...this.navLinks.map((l): Command => ({
        id: `go-${l.anchor}`, group: 'Navigate', label: l.label, icon: 'fa-solid fa-hashtag', run: () => this.scroll.to(l.anchor),
      })),
      ...projects.map((p): Command => ({
        id: `project-${p.id}`, group: 'Projects', label: p.name, hint: p.kind, icon: p.icon,
        keywords: `${p.kind} ${p.stack.join(' ')}`, run: () => this.share.arrive(`project-${p.id}`),
      })),
      { id: 'cv', group: 'Actions', label: 'Download CV (PDF)', icon: 'fa-solid fa-file-arrow-down', keywords: 'resume print', run: () => this.cv.download() },
      { id: 'email', group: 'Actions', label: 'Copy email address', hint: this.profile.email, icon: 'fa-regular fa-copy', keywords: 'contact mail', run: copy(this.profile.email, this.profile.email) },
      { id: 'link', group: 'Actions', label: 'Copy a link to this page', icon: 'fa-solid fa-link', keywords: 'share url', run: copy(this.share.linkTo('top').replace('#top', ''), 'Page link') },
      { id: 'tour', group: 'Actions', label: 'Take the 30-second tour', icon: 'fa-solid fa-route', keywords: 'guide walkthrough', run: () => this.tour.start('quick') },
      { id: 'deep', group: 'Actions', label: 'Take the deep-dive tour', icon: 'fa-solid fa-person-swimming', keywords: 'guide walkthrough', run: () => this.tour.start('deep') },
      {
        id: 'theme', group: 'Actions', label: this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: this.theme() === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon', keywords: 'dark light mode', run: () => this.toggleTheme(),
      },
      ...this.socials.map((s): Command => ({
        id: `social-${s.label}`, group: 'Links', label: s.label, hint: s.handle, icon: s.icon, run: open(s.url),
      })),
      ...(live ? [{ id: 'live', group: 'Links', label: 'Rental System — live demo', icon: 'fa-solid fa-arrow-up-right-from-square', run: open(live.url) } as Command] : []),
      ...(source ? [{ id: 'source', group: 'Links', label: 'Rental System — source code', icon: 'fa-brands fa-github', run: open(source.url) } as Command] : []),
    ];
  });

  /** Moves the pill behind the active nav link; hidden while the hero is in view. */
  placeIndicator(): void {
    const index = this.navLinks.findIndex((l) => l.anchor === this.activeSection());
    const el = index >= 0 ? this.linkEls()[index]?.nativeElement : undefined;
    if (!el || !el.offsetWidth) {
      this.indicator.set(null);
      return;
    }
    this.indicator.set({ x: el.offsetLeft, w: el.offsetWidth });
  }

  private startClock(): void {
    const format = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.profile.timeZone,
    });
    const tick = () => this.localTime.set(format.format(new Date()));
    tick();
    this.clock = setInterval(tick, 15_000);
  }

  onScroll(): void {
    if (this.frame) return;
    const win = this.document.defaultView;
    if (!win) return;
    this.frame = win.requestAnimationFrame(() => {
      this.frame = 0;
      const y = win.scrollY;
      const delta = y - this.lastY;
      this.lastY = y;
      this.scrolled.set(y > 24);
      this.showTop.set(y > win.innerHeight * 1.2);
      if (this.menuOpen() || y < win.innerHeight * 0.6) this.navHidden.set(false);
      else if (delta > 6) this.navHidden.set(true);
      else if (delta < -6) this.navHidden.set(false);
      const max = this.document.documentElement.scrollHeight - win.innerHeight;
      // Written straight to the host (read by the nav hairline and the back-to-top ring):
      // this runs every frame while scrolling.
      this.host.nativeElement.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
    });
  }

  navigate(anchor: string, event: Event): void {
    this.closeMenu();
    this.scroll.to(anchor, event);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
    this.document.documentElement.classList.toggle('menu-open', this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.document.documentElement.classList.remove('menu-open');
  }

  /**
   * Switches theme. From a click, the new theme grows in a circle out of the toggle
   * (View Transitions API where supported); otherwise it applies immediately.
   */
  toggleTheme(event?: MouseEvent): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      this.theme.set(next);
      this.document.documentElement.setAttribute('data-theme', next);
      this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0c0c0e' : '#f3f0e9');
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable — theme still applies for this visit */
      }
    };
    const doc = this.document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!event || !doc.startViewTransition || prefersReducedMotion()) {
      apply();
      return;
    }
    const root = this.document.documentElement;
    const x = event.clientX;
    const y = event.clientY;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${r}px`);
    doc.startViewTransition(apply);
  }

  isActive(anchor: SectionId): boolean {
    return this.activeSection() === anchor;
  }

  ngOnDestroy(): void {
    this.spy?.disconnect();
    this.stopSmoothScroll?.();
    if (this.clock) clearInterval(this.clock);
    if (this.frame) cancelAnimationFrame(this.frame);
  }
}
