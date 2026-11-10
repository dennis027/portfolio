import { Coin } from '../../../shared/drive/coin';
import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/reveal.directive';
import { ScrambleDirective } from '../../../shared/motion/scramble.directive';
import { SplitDirective } from '../../../shared/motion/split.directive';
import { EDUCATION, EXPERIENCE, HIGHLIGHTS, PRACTICE } from '../../portfolio.data';

@Component({
  selector: 'app-experience',
  imports: [RevealDirective, ScrambleDirective, SplitDirective, Coin],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class ExperienceSection {
  protected readonly roles = EXPERIENCE;
  protected readonly education = EDUCATION;
  protected readonly highlights = HIGHLIGHTS;
  protected readonly practice = PRACTICE;
}
