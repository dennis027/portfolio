import { Component } from '@angular/core';
import {
  ABOUT_STATEMENT,
  EDUCATION,
  EXPERIENCE,
  FEATURED_PROJECT,
  MORE_PROJECTS,
  PORTFOLIO_URL,
  PROFILE,
  SKILL_GROUPS,
  SOCIALS,
  SUPPORTING_PROJECTS,
  TEAM_PROJECTS,
} from '../../portfolio/portfolio.data';

/**
 * A one-to-two-page résumé generated from the same data as the site, shown only when
 * printing (see CvService). Hidden from the screen and from assistive tech on screen.
 */
@Component({
  selector: 'app-print-cv',
  templateUrl: './print-cv.html',
  styleUrl: './print-cv.css',
  host: { 'aria-hidden': 'true' },
})
export class PrintCv {
  protected readonly profile = PROFILE;
  protected readonly summary = ABOUT_STATEMENT.replaceAll('*', '');
  protected readonly portfolio = PORTFOLIO_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  protected readonly socials = SOCIALS.map((s) => ({ ...s, short: s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') }));
  protected readonly experience = EXPERIENCE;
  protected readonly education = EDUCATION;
  protected readonly projects = [FEATURED_PROJECT, ...TEAM_PROJECTS, ...SUPPORTING_PROJECTS];
  protected readonly more = MORE_PROJECTS;
  protected readonly skills = SKILL_GROUPS;

  protected shortUrl(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}
