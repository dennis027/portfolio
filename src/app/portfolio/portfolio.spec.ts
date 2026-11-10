import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Portfolio } from './portfolio';
import { NAV_LINKS } from './portfolio.data';

describe('Portfolio', () => {
  let component: Portfolio;
  let fixture: ComponentFixture<Portfolio>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portfolio],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Portfolio);
    component = fixture.componentInstance;
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.removeItem('theme'); } catch { /* ignore */ }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders every section the navigation links to', () => {
    for (const link of NAV_LINKS) {
      expect(el.querySelector(`#${link.anchor}`)).withContext(link.anchor).not.toBeNull();
    }
  });

  it('has no placeholder or empty links', () => {
    const hrefs = Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  it('opens external links safely in a new tab', () => {
    for (const a of Array.from(el.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'))) {
      expect(a.rel).toContain('noopener');
    }
  });

  it('toggles the mobile menu', async () => {
    const burger = el.querySelector<HTMLButtonElement>('.nav__burger')!;
    expect(burger.getAttribute('aria-expanded')).toBe('false');
    burger.click();
    await fixture.whenStable();
    expect(burger.getAttribute('aria-expanded')).toBe('true');
    component.closeMenu();
    await fixture.whenStable();
    expect(burger.getAttribute('aria-expanded')).toBe('false');
  });

  it('switches and persists the colour theme', () => {
    component.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    component.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
