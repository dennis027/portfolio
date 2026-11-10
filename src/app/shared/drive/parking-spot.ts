import { Component, computed, inject } from '@angular/core';
import { TripService } from './trip.service';

/**
 * A painted parking bay for the "Parallel parker" challenge. Only shown with the
 * mouse-driven car; CarCursor checks whether the car has stopped neatly inside it.
 */
@Component({
  selector: 'app-parking-spot',
  host: { class: 'parking-spot', 'aria-hidden': 'true', '[class.is-done]': 'done()' },
  template: `<span class="ps__p">P</span><span class="ps__done">Nicely parked</span>`,
  styles: `
    :host {
      position: absolute; z-index: 1;
      display: none;
      width: 78px; height: 44px;
      border: 2px dashed color-mix(in srgb, var(--text-faint) 70%, transparent);
      border-radius: 6px;
      pointer-events: none;
      transition: border-color 0.4s, background-color 0.4s;
    }
    :host-context(html.has-car) { display: grid; place-items: center; }
    .ps__p {
      font-family: var(--font-display); font-weight: 800; font-size: 1.3rem;
      color: color-mix(in srgb, var(--text-faint) 60%, transparent);
    }
    .ps__done {
      position: absolute; top: calc(100% + 6px); left: 50%; translate: -50% 0;
      font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase;
      white-space: nowrap; color: var(--accent);
      opacity: 0; transition: opacity 0.4s;
    }
    :host(.is-near) { border-color: var(--accent-line); }
    :host(.is-done) { border-color: var(--accent); background: var(--accent-soft); }
    :host(.is-done) .ps__p { color: var(--accent); }
    :host(.is-done) .ps__done { opacity: 1; }
  `,
})
export class ParkingSpot {
  private readonly trip = inject(TripService);
  protected readonly done = computed(() => this.trip.unlocked().includes('parked'));
}
