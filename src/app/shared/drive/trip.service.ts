import { Injectable, computed, signal } from '@angular/core';

export type AchievementId =
  | 'engine-on' | 'road-trip' | 'pit-stop' | 'say-hello' | 'turbo'
  | 'beep' | 'drifter' | 'collector' | 'parked' | 'tour' | 'deep-dive';

export interface Achievement {
  id: AchievementId;
  title: string;
  hint: string;
  /** Hidden until found; the hint is shown instead of the title. */
  secret?: boolean;
  /** Needs the mouse-driven car, so it is only offered on mouse and trackpad devices. */
  needsCar?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'engine-on', title: 'Engine on', hint: 'Drive the car around for a bit', needsCar: true },
  { id: 'road-trip', title: 'Road trip', hint: 'Pass every checkpoint' },
  { id: 'tour', title: 'Grand tour', hint: 'Take the guided tour to the end' },
  { id: 'deep-dive', title: 'Deep diver', hint: 'Finish the deep-dive tour' },
  { id: 'pit-stop', title: 'Pit stop', hint: 'Open a live demo or repository' },
  { id: 'say-hello', title: 'Say hello', hint: 'Use any contact option' },
  { id: 'beep', title: 'Beep beep', hint: 'Find the horn', needsCar: true },
  { id: 'drifter', title: 'Drifter', hint: 'Slide through three sharp turns', needsCar: true },
  { id: 'collector', title: 'Collector', hint: 'Find all six coins', needsCar: true },
  { id: 'parked', title: 'Parallel parker', hint: 'Park neatly in the bay by Contact', needsCar: true },
  { id: 'turbo', title: 'Turbo', hint: 'Type a car sound', secret: true },
];

export interface Paint {
  id: string;
  name: string;
  /** Achievements needed before this paint can be chosen. */
  needs: number;
  hi: string;
  mid: string;
  lo: string;
  roof: string;
}

/** The garage: new paint unlocks as achievements add up. */
export const PAINTS: Paint[] = [
  { id: 'gold', name: 'Gold', needs: 0, hi: '#ffd27a', mid: '#f2b84b', lo: '#c98a1c', roof: '#d99d2c' },
  { id: 'red', name: 'Rosso', needs: 2, hi: '#ff8a7a', mid: '#e5483a', lo: '#a92a20', roof: '#c23a2e' },
  { id: 'blue', name: 'Gulf blue', needs: 4, hi: '#a8dcff', mid: '#5fb2ec', lo: '#2f7fbd', roof: '#4c9bd6' },
  { id: 'green', name: 'Racing green', needs: 6, hi: '#8fd6a6', mid: '#2f8f57', lo: '#1c5c37', roof: '#267a49' },
  { id: 'chrome', name: 'Chrome', needs: 8, hi: '#ffffff', mid: '#c9ced6', lo: '#7d848f', roof: '#a9b0ba' },
];

export const COIN_COUNT = 6;

export interface Toast {
  id: number;
  title: string;
  text: string;
}

const STORAGE_KEY = 'dk-trip';

/**
 * The optional road-trip layer: checkpoints passed, achievements unlocked, turbo mode.
 * Nothing here gates content — it only decorates exploring the page. Progress is kept in
 * this browser so a returning visitor keeps their badges.
 */
@Injectable({ providedIn: 'root' })
export class TripService {
  readonly checkpoints = signal<string[]>([]);
  readonly unlocked = signal<AchievementId[]>([]);
  readonly toasts = signal<Toast[]>([]);
  readonly turbo = signal(false);
  readonly coins = signal<string[]>([]);
  readonly paint = signal('gold');
  readonly sound = signal(false);
  /** True once a mouse-driven car exists; hides car-only achievements on touch devices. */
  readonly carEnabled = signal(false);

  readonly available = computed(() => ACHIEVEMENTS.filter((a) => !a.needsCar || this.carEnabled()));
  readonly score = computed(() => this.available().filter((a) => this.unlocked().includes(a.id)).length);

  private toastId = 0;
  private sectionCount = 0;
  private restored = false;

  /** Browser only: restores saved progress. */
  restore(sectionCount: number): void {
    this.sectionCount = sectionCount;
    this.restored = true;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      if (Array.isArray(saved.checkpoints)) this.checkpoints.set(saved.checkpoints);
      if (Array.isArray(saved.unlocked)) this.unlocked.set(saved.unlocked);
      if (Array.isArray(saved.coins)) this.coins.set(saved.coins);
      if (typeof saved.paint === 'string') this.paint.set(saved.paint);
      if (typeof saved.sound === 'boolean') this.sound.set(saved.sound);
    } catch {
      /* no storage — progress just lasts this visit */
    }
  }

  checkpoint(id: string): void {
    if (!this.restored || this.checkpoints().includes(id)) return;
    this.checkpoints.update((c) => [...c, id]);
    if (this.checkpoints().length >= this.sectionCount) this.unlock('road-trip');
    this.save();
  }

  unlock(id: AchievementId): void {
    if (!this.restored || this.unlocked().includes(id)) return;
    this.unlocked.update((u) => [...u, id]);
    const a = ACHIEVEMENTS.find((x) => x.id === id)!;
    this.toast('Achievement unlocked', a.title);
    // A new paint may have just opened up in the garage
    const opened = PAINTS.find((p) => p.needs === this.unlocked().length && p.needs > 0);
    if (opened) this.toast('Garage', `${opened.name} paint unlocked`);
    this.save();
  }

  collectCoin(id: string): void {
    if (!this.restored || this.coins().includes(id)) return;
    this.coins.update((c) => [...c, id]);
    const n = this.coins().length;
    if (n >= COIN_COUNT) this.unlock('collector');
    else this.toast('Coin', `${n} of ${COIN_COUNT} found`);
    this.save();
  }

  /** Paints the visitor can choose right now. */
  readonly paints = computed(() => PAINTS.map((p) => ({ ...p, open: this.unlocked().length >= p.needs })));

  setPaint(id: string): void {
    const paint = this.paints().find((p) => p.id === id);
    if (!paint?.open) return;
    this.paint.set(id);
    this.save();
  }

  toggleSound(): void {
    this.sound.update((s) => !s);
    this.save();
  }

  toggleTurbo(): void {
    const first = !this.unlocked().includes('turbo');
    this.turbo.update((t) => !t);
    if (first) this.unlock('turbo');
    else this.toast('Turbo', this.turbo() ? 'Engaged — hold on' : 'Back to cruising');
  }

  toast(title: string, text: string): void {
    const id = ++this.toastId;
    this.toasts.update((t) => [...t.slice(-2), { id, title, text }]);
    setTimeout(() => this.toasts.update((t) => t.filter((x) => x.id !== id)), 3400);
  }

  reset(): void {
    this.checkpoints.set([]);
    this.unlocked.set([]);
    this.coins.set([]);
    this.paint.set('gold');
    this.turbo.set(false);
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          checkpoints: this.checkpoints(),
          unlocked: this.unlocked(),
          coins: this.coins(),
          paint: this.paint(),
          sound: this.sound(),
        }),
      );
    } catch {
      /* storage unavailable */
    }
  }
}
