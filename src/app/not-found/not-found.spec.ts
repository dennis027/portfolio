import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  it('explains the error and offers a way back to the portfolio', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')!.textContent).toContain('Wrong turn');
    const links = Array.from(el.querySelectorAll('.nf__actions a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/', '/#work', '/#contact']);
    expect(el.querySelector('.nf__scene')!.getAttribute('aria-hidden')).toBe('true');
  });
});
