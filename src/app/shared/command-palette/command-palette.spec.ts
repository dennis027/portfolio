import { matchScore } from './command-palette';

describe('matchScore', () => {
  it('ranks prefix over word prefix over substring over scattered letters', () => {
    expect(matchScore('safari', 'SafariBucks')).toBe(4);
    expect(matchScore('sms', 'Bulk SMS Platform')).toBe(3);
    expect(matchScore('bucks', 'SafariBucks')).toBe(2);
    expect(matchScore('sfb', 'SafariBucks')).toBe(1);
    expect(matchScore('zzz', 'SafariBucks')).toBe(0);
  });

  it('matches everything when the query is empty', () => {
    expect(matchScore('  ', 'anything')).toBe(1);
  });
});
