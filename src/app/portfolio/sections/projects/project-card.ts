import { Component, inject, input, signal } from '@angular/core';
import { SpotlightDirective } from '../../../shared/spotlight.directive';
import { TiltDirective } from '../../../shared/motion/tilt.directive';
import { ShareService } from '../../../shared/share.service';
import { Project, ProjectLink } from '../../portfolio.data';
import { ProjectVisual } from './project-visual/project-visual';

export function linkIcon(link: ProjectLink): string {
  switch (link.kind) {
    case 'code': return 'fa-brands fa-github';
    case 'site': return 'fa-solid fa-globe';
    default: return 'fa-solid fa-arrow-up-right-from-square';
  }
}

export function statusClass(status: string): string {
  if (/development|active/i.test(status)) return 'status status--progress';
  if (/built/i.test(status)) return 'status status--muted';
  return 'status';
}

/** A case-study row: screenshots or a project illustration on one side, problem → role → contributions on the other. */
@Component({
  selector: 'app-project-card',
  imports: [ProjectVisual, SpotlightDirective, TiltDirective],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
  host: {
    class: 'case',
    '[class.case--reverse]': 'reverse()',
    '[attr.id]': '"project-" + project().id',
  },
})
export class ProjectCard {
  readonly project = input.required<Project>();
  /** Position in the overall work list, shown as the large index numeral. */
  readonly index = input(1);
  readonly reverse = input(false);

  /** On narrow screens only the first few contributions show until expanded (see CSS). */
  protected readonly preview = 2;
  protected readonly expanded = signal(false);
  /** Index of the screenshot on show, for projects that have screenshots. */
  protected readonly shot = signal(0);

  protected readonly linkIcon = linkIcon;
  protected readonly statusClass = statusClass;
  protected readonly share = inject(ShareService);
}
