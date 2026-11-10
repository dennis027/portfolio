import { DOCUMENT, Injectable, inject } from '@angular/core';
import { PROFILE } from '../../portfolio/portfolio.data';

/**
 * "Download CV": opens the browser's print dialog on the print-only résumé (PrintCv),
 * with the document title set so "Save as PDF" suggests a sensible file name.
 */
@Injectable({ providedIn: 'root' })
export class CvService {
  private readonly document = inject(DOCUMENT);

  download(): void {
    const win = this.document.defaultView;
    if (!win) return;
    const title = this.document.title;
    this.document.title = `${PROFILE.name} — CV`;
    win.addEventListener('afterprint', () => (this.document.title = title), { once: true });
    win.print();
  }
}
