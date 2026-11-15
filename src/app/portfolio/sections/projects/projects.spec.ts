import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projects } from './projects';
import { FEATURED_PROJECT, MORE_PROJECTS, SOLO_PROJECTS, SUPPORTING_PROJECTS, TEAM_PROJECTS } from '../../portfolio.data';

describe('Projects', () => {
  let fixture: ComponentFixture<Projects>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(Projects);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders a case study row for every team and supporting project, and an index row for the rest', () => {
    expect(el.querySelectorAll('app-project-card').length).toBe(SOLO_PROJECTS.length + TEAM_PROJECTS.length + SUPPORTING_PROJECTS.length);
    expect(el.querySelectorAll('.index__row').length).toBe(MORE_PROJECTS.length);
    for (const p of [FEATURED_PROJECT, ...SOLO_PROJECTS, ...TEAM_PROJECTS, ...SUPPORTING_PROJECTS, ...MORE_PROJECTS]) {
      expect(el.querySelector('#project-' + p.id)).withContext(p.id).not.toBeNull();
    }
  });

  it('tells the featured project as one step per screenshot, each with a caption', () => {
    const steps = el.querySelectorAll('.step');
    expect(steps.length).toBe(FEATURED_PROJECT.screenshots!.length);
    for (const s of FEATURED_PROJECT.screenshots!) {
      expect(s.title).withContext(s.label).toBeTruthy();
      expect(s.note).withContext(s.label).toBeTruthy();
    }
  });

  it('shows the solo projects straight after the featured one, with their screenshots', () => {
    const first = el.querySelector('app-project-card')!;
    expect(first.id).toBe('project-' + SOLO_PROJECTS[0].id);
    expect(first.querySelectorAll('.shots__screen img').length).toBe(SOLO_PROJECTS[0].screenshots!.length);
  });

  it('switches the pinned screenshot from the screen buttons', async () => {
    const tabs = el.querySelectorAll<HTMLButtonElement>('.story__tab');
    tabs[2].click();
    await fixture.whenStable();
    expect(tabs[2].getAttribute('aria-pressed')).toBe('true');
    expect(tabs[0].getAttribute('aria-pressed')).toBe('false');
    const imgs = el.querySelectorAll('.story .browser__screen img');
    expect(imgs[2].classList).toContain('is-active');
    expect(imgs[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('opens one "Also built" row at a time to show its case notes', async () => {
    const toggles = el.querySelectorAll<HTMLButtonElement>('.index__toggle');
    const details = el.querySelectorAll<HTMLElement>('.index__detail');
    expect(details[0].hasAttribute('inert')).toBeTrue();

    toggles[0].click();
    await fixture.whenStable();
    expect(toggles[0].getAttribute('aria-expanded')).toBe('true');
    expect(details[0].hasAttribute('inert')).toBeFalse();
    expect(details[0].textContent).toContain(MORE_PROJECTS[0].contributions[0]);

    if (toggles.length > 1) {
      toggles[1].click();
      await fixture.whenStable();
      expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
      expect(details[1].classList).toContain('is-open');
    } else {
      toggles[0].click();
      await fixture.whenStable();
      expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    }
  });
});
