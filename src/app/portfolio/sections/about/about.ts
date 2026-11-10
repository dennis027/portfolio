import { Coin } from '../../../shared/drive/coin';
import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/reveal.directive';
import { ScrambleDirective } from '../../../shared/motion/scramble.directive';
import { SplitDirective } from '../../../shared/motion/split.directive';
import { SystemsConsole } from '../../../shared/systems-console/systems-console';
import { ABOUT_STATEMENT, EDUCATION, PROFILE } from '../../portfolio.data';

/** Words wrapped in *asterisks* are set in the serif accent. */
const STATEMENT = ABOUT_STATEMENT;

interface Word {
  text: string;
  em: boolean;
}

function splitStatement(source: string): Word[] {
  const words: Word[] = [];
  let em = false;
  for (const raw of source.split(' ')) {
    const opens = raw.startsWith('*');
    const closes = raw.endsWith('*') || raw.endsWith('*.');
    if (opens) em = true;
    words.push({ text: raw.replaceAll('*', ''), em });
    if (closes) em = false;
  }
  return words;
}

@Component({
  selector: 'app-about',
  imports: [RevealDirective, ScrambleDirective, SplitDirective, SystemsConsole, Coin],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly profile = PROFILE;
  protected readonly education = EDUCATION;
  protected readonly statement = STATEMENT.replaceAll('*', '');
  protected readonly words = splitStatement(STATEMENT);
}
