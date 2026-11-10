import { Component, ElementRef, afterNextRender, computed, input, signal, viewChild } from '@angular/core';

export interface Command {
  id: string;
  group: 'Navigate' | 'Projects' | 'Actions' | 'Links';
  label: string;
  icon: string;
  /** Extra words that should match (e.g. tech used in a project). */
  keywords?: string;
  hint?: string;
  run: () => void;
}

/** Ranks how well a query matches text: prefix > word prefix > substring > in-order letters. */
export function matchScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 4;
  if (t.split(/[\s·—-]+/).some((w) => w.startsWith(q))) return 3;
  if (t.includes(q)) return 2;
  let i = 0;
  for (const ch of t) if (ch === q[i]) i++;
  return i === q.length ? 1 : 0;
}

/**
 * Ctrl/⌘ + K: a searchable list of everything you can do on the page — jump to a section or
 * project, download the CV, copy the email, start a tour, switch theme, open a profile.
 * An accessible combobox: arrow keys move, Enter runs, Escape closes.
 */
@Component({
  selector: 'app-command-palette',
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.css',
  host: { '(document:keydown)': 'onGlobalKey($event)' },
})
export class CommandPalette {
  readonly commands = input.required<Command[]>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);
  /** "⌘" on Apple devices, "Ctrl" elsewhere — set in the browser. */
  readonly modKey = signal('Ctrl');

  protected readonly results = computed(() => {
    const q = this.query();
    return this.commands()
      .map((c) => ({ c, score: Math.max(matchScore(q, c.label), matchScore(q, c.keywords ?? '') - 1) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.c);
  });
  /** Results with a group heading before the first item of each group (only when not searching). */
  protected readonly rows = computed(() => {
    const searching = !!this.query().trim();
    let last = '';
    return this.results().map((c, i) => {
      const heading = !searching && c.group !== last ? c.group : null;
      last = c.group;
      return { c, i, heading };
    });
  });

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private returnFocus?: HTMLElement | null;

  constructor() {
    afterNextRender(() => {
      if (/Mac|iPhone|iPad/.test(navigator.platform)) this.modKey.set('⌘');
    });
  }

  show(): void {
    this.returnFocus = document.activeElement as HTMLElement | null;
    this.query.set('');
    this.active.set(0);
    this.open.set(true);
    requestAnimationFrame(() => this.field()?.nativeElement.focus());
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.returnFocus?.focus?.({ preventScroll: true });
  }

  protected run(c: Command): void {
    this.open.set(false);
    // Let the dialog close before the command scrolls or moves focus
    requestAnimationFrame(() => c.run());
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.active.set(0);
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.results().length;
    if (e.key === 'ArrowDown') this.move(n ? (this.active() + 1) % n : 0);
    else if (e.key === 'ArrowUp') this.move(n ? (this.active() - 1 + n) % n : 0);
    else if (e.key === 'Enter') {
      const c = this.results()[this.active()];
      if (c) this.run(c);
    } else if (e.key === 'Escape') this.close();
    else if (e.key === 'Tab') {
      /* the field is the only stop inside the dialog */
    } else return;
    e.preventDefault();
  }

  private move(i: number): void {
    this.active.set(i);
    requestAnimationFrame(() =>
      this.list()?.nativeElement.querySelector(`#cmd-${i}`)?.scrollIntoView({ block: 'nearest' }),
    );
  }

  onGlobalKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.open() ? this.close() : this.show();
    }
  }
}
