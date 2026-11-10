import { Component, computed, inject, input } from '@angular/core';
import { TripService } from './trip.service';

/**
 * A collectible coin placed somewhere on the page. Only shown when the mouse-driven car
 * exists (html.has-car); the car collects it by driving over it (see CarCursor).
 */
@Component({
  selector: 'app-coin',
  host: {
    class: 'coin',
    'aria-hidden': 'true',
    '[attr.data-coin]': 'name()',
    '[class.is-collected]': 'collected()',
  },
  template: `<span class="coin__face">DK</span>`,
  styles: `
    :host {
      position: absolute; z-index: 3;
      display: none;
      width: 26px; height: 26px;
      pointer-events: none;
      perspective: 200px;
    }
    :host-context(html.has-car) { display: block; }
    :host(.is-collected) { display: none; }
    .coin__face {
      display: grid; place-items: center;
      width: 100%; height: 100%; border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #fff3c4, #f2b84b 45%, #b67c14 100%);
      box-shadow: inset 0 0 0 2px rgba(122, 71, 0, 0.45), 0 4px 14px -4px rgba(242, 184, 75, 0.7);
      font-family: var(--font-display); font-weight: 800; font-stretch: 75%; font-size: 0.6rem;
      color: rgba(90, 52, 0, 0.75);
      animation: coin-spin 2.6s linear infinite, coin-bob 2.2s ease-in-out infinite;
    }
    @keyframes coin-spin { to { transform: rotateY(360deg); } }
    @keyframes coin-bob { 50% { translate: 0 -5px; } }
  `,
})
export class Coin {
  /** Coin id (not "id", which would also become the element's DOM id). */
  readonly name = input.required<string>();
  private readonly trip = inject(TripService);
  protected readonly collected = computed(() => this.trip.coins().includes(this.name()));
}
