import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CarIcon } from '../shared/drive/car-icon';
import { PROFILE } from '../portfolio/portfolio.data';

/**
 * 404 — the site's car has run out of road. Lazy-loaded, so it costs the main page nothing.
 * All motion is CSS and stops under prefers-reduced-motion.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, CarIcon],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  protected readonly profile = PROFILE;

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
  }
}
