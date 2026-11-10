import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCard } from './project-card';
import { TEAM_PROJECTS } from '../../portfolio.data';

describe('ProjectCard', () => {
  let fixture: ComponentFixture<ProjectCard>;
  const project = TEAM_PROJECTS[0];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', project);
    await fixture.whenStable();
  });

  it('renders every contribution and the project visual', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.card__list li').length).toBe(project.contributions.length);
    expect(el.querySelector('app-project-visual')).not.toBeNull();
    expect(el.id).toBe('project-' + project.id);
  });

  it('toggles the collapsed contribution list', async () => {
    const el = fixture.nativeElement as HTMLElement;
    const list = el.querySelector('.card__list')!;
    const button = el.querySelector<HTMLButtonElement>('.card__more')!;
    expect(list.classList).toContain('is-collapsed');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(list.classList).not.toContain('is-collapsed');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
