import { Component } from '@angular/core';

let seq = 0;

/**
 * Top-down sports car, nose pointing right (+x). Purely decorative.
 * Driven from outside through custom properties on the host:
 *   --steer      front-wheel angle (deg)
 *   --headlight  0…1 headlight glow
 *   --brake      0…1 brake-light glow
 *   --paint-*    body colours (set page-wide by the garage)
 */
@Component({
  selector: 'app-car-icon',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 44 24" width="44" height="24" focusable="false">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: var(--paint-hi, #ffd27a)" />
          <stop offset="0.5" style="stop-color: var(--paint-mid, #f2b84b)" />
          <stop offset="1" style="stop-color: var(--paint-lo, #c98a1c)" />
        </linearGradient>
      </defs>
      <ellipse class="shadow" cx="22" cy="13" rx="21" ry="10" />
      <!-- rear wheels -->
      <rect class="wheel" x="7" y="0.5" width="9" height="4" rx="1.6" />
      <rect class="wheel" x="7" y="19.5" width="9" height="4" rx="1.6" />
      <!-- front wheels steer -->
      <rect class="wheel front" x="29" y="0.5" width="9" height="4" rx="1.6" />
      <rect class="wheel front" x="29" y="19.5" width="9" height="4" rx="1.6" />
      <!-- body -->
      <path class="body" d="M5 4.5 C 9 2.5, 31 2.2, 37 3.6 C 41.5 4.8, 43 8, 43 12 C 43 16, 41.5 19.2, 37 20.4 C 31 21.8, 9 21.5, 5 19.5 C 2.2 18, 1.5 15, 1.5 12 C 1.5 9, 2.2 6, 5 4.5 Z" [attr.fill]="'url(#' + gradientId + ')'" />
      <!-- racing stripe -->
      <rect class="stripe" x="3" y="10.6" width="38" height="2.8" rx="1.4" />
      <!-- cabin: rear window, roof, windscreen -->
      <path class="glass" d="M13 6.5 C 16 5.6, 18 5.5, 19 5.6 L 19 18.4 C 18 18.5, 16 18.4, 13 17.5 C 12.2 15, 12.2 9, 13 6.5 Z" />
      <rect class="roof" x="19" y="5.4" width="8" height="13.2" rx="2" />
      <path class="glass" d="M27 5.6 C 29.5 5.9, 31.5 6.6, 32.6 7.6 C 33.4 10.2, 33.4 13.8, 32.6 16.4 C 31.5 17.4, 29.5 18.1, 27 18.4 Z" />
      <!-- lights -->
      <rect class="tail" x="1.6" y="5.6" width="2" height="3.6" rx="1" />
      <rect class="tail" x="1.6" y="14.8" width="2" height="3.6" rx="1" />
      <rect class="head" x="40.4" y="5.2" width="2.4" height="3.8" rx="1.1" />
      <rect class="head" x="40.4" y="15" width="2.4" height="3.8" rx="1.1" />
      <!-- headlight beams -->
      <path class="beam" d="M42.5 5.5 L 66 -2 L 66 12 L 42.5 9 Z" />
      <path class="beam" d="M42.5 15 L 66 12 L 66 26 L 42.5 18.5 Z" />
    </svg>
  `,
  styles: `
    :host { display: block; line-height: 0; }
    svg { display: block; width: 100%; height: auto; overflow: visible; }
    .shadow { fill: rgba(0, 0, 0, 0.35); filter: blur(1.5px); transform: translate(0.5px, 1.5px); }
    .wheel { fill: #141414; }
    .front { transform-box: fill-box; transform-origin: center; transform: rotate(var(--steer, 0deg)); transition: transform 0.12s linear; }
    .stripe { fill: rgba(26, 19, 5, 0.22); }
    .glass { fill: #1b2230; }
    .roof { fill: var(--paint-roof, #d99d2c); }
    .tail { fill: #c0392b; opacity: calc(0.55 + var(--brake, 0) * 0.45); filter: drop-shadow(0 0 calc(var(--brake, 0) * 3px) #ff4d3a); }
    .head { fill: #fff6d8; }
    .beam { fill: #fff3c4; opacity: calc(var(--headlight, 0) * 0.28); transition: opacity 0.25s; }
  `,
})
export class CarIcon {
  /** Unique per instance — several cars can be on the page at once. */
  protected readonly gradientId = `car-body-${++seq}`;
}
