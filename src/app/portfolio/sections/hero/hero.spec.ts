import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hero } from './hero';

describe('Hero', () => {
  let fixture: ComponentFixture<Hero>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(Hero);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('exposes the name as a single readable heading', () => {
    const h1 = el.querySelector('h1')!;
    expect(h1.textContent!.replace(/\s+/g, ' ')).toContain('Dennis Kimani');
    // the split letters are decorative; assistive tech reads the sr-only name once
    for (const word of Array.from(h1.querySelectorAll('.hero__word'))) {
      expect(word.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('layers the first name behind the figure and the surname in front', () => {
    const back = el.querySelector('.hero__word--back')!.textContent!.replace(/\s/g, '');
    const front = el.querySelector('.hero__word--front')!.textContent!.replace(/\s/g, '');
    expect(back).toBe('Dennis');
    expect(front).toBe('Kimani');
    expect(el.querySelector<HTMLImageElement>('.hero__figure img')!.alt).toContain('Dennis Kimani');
  });

  it('links the calls to action to real sections', () => {
    const hrefs = Array.from(el.querySelectorAll('.hero__actions a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#work', '#contact']);
  });

  it('offers the CV on the first screen', () => {
    expect(el.querySelector('.hero__actions .hero__cv')!.textContent).toContain('Download CV');
  });
});
