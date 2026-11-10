import { Coin } from '../../../shared/drive/coin';
import { Component, inject } from '@angular/core';
import { ScrollService } from '../../../shared/scroll.service';
import { RevealDirective } from '../../../shared/reveal.directive';
import { ScrambleDirective } from '../../../shared/motion/scramble.directive';
import { SplitDirective } from '../../../shared/motion/split.directive';
import { CORE_STACK, FEATURED_PROJECT, MORE_PROJECTS, SKILL_GROUPS, SUPPORTING_PROJECTS, TEAM_PROJECTS } from '../../portfolio.data';

@Component({
  selector: 'app-skills',
  imports: [RevealDirective, ScrambleDirective, SplitDirective, Coin],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills {
  protected readonly groups = SKILL_GROUPS;
  protected readonly core = CORE_STACK;
  protected readonly scroll = inject(ScrollService);
  protected readonly projectName = new Map(
    [FEATURED_PROJECT, ...TEAM_PROJECTS, ...SUPPORTING_PROJECTS, ...MORE_PROJECTS].map((p) => [p.id, p.name]),
  );
}
