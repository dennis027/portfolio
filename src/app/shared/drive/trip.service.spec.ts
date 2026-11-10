import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TripService } from './trip.service';

describe('TripService', () => {
  let trip: TripService;

  beforeEach(() => {
    localStorage.removeItem('dk-trip');
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    trip = TestBed.inject(TripService);
    trip.restore(3);
  });

  afterEach(() => localStorage.removeItem('dk-trip'));

  it('collects each checkpoint once and unlocks the road trip after all of them', () => {
    trip.checkpoint('work');
    trip.checkpoint('work');
    trip.checkpoint('skills');
    expect(trip.checkpoints()).toEqual(['work', 'skills']);
    expect(trip.unlocked()).not.toContain('road-trip');
    trip.checkpoint('contact');
    expect(trip.unlocked()).toContain('road-trip');
  });

  it('keeps progress across visits', () => {
    trip.checkpoint('work');
    trip.unlock('pit-stop');
    const next = new TripService();
    next.restore(3);
    expect(next.checkpoints()).toEqual(['work']);
    expect(next.unlocked()).toEqual(['pit-stop']);
  });

  it('only offers car achievements when the car exists', () => {
    expect(trip.available().some((a) => a.id === 'engine-on')).toBeFalse();
    trip.carEnabled.set(true);
    expect(trip.available().some((a) => a.id === 'engine-on')).toBeTrue();
  });

  it('toggles turbo, unlocking it the first time with a single toast', () => {
    trip.toggleTurbo();
    expect(trip.turbo()).toBeTrue();
    expect(trip.unlocked()).toContain('turbo');
    expect(trip.toasts().length).toBe(1);
    trip.toggleTurbo();
    expect(trip.turbo()).toBeFalse();
  });

  it('ignores everything before progress is restored (server render)', () => {
    const fresh = new TripService();
    fresh.checkpoint('work');
    fresh.unlock('pit-stop');
    expect(fresh.checkpoints()).toEqual([]);
    expect(fresh.unlocked()).toEqual([]);
  });

  it('counts coins once each and unlocks the collector at six', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e']) trip.collectCoin(id);
    trip.collectCoin('a');
    expect(trip.coins().length).toBe(5);
    expect(trip.unlocked()).not.toContain('collector');
    trip.collectCoin('f');
    expect(trip.unlocked()).toContain('collector');
  });

  it('only lets the garage use paints that have been unlocked', () => {
    trip.setPaint('red');
    expect(trip.paint()).toBe('gold');
    trip.unlock('pit-stop');
    trip.unlock('say-hello');
    trip.setPaint('red');
    expect(trip.paint()).toBe('red');
    trip.setPaint('chrome');
    expect(trip.paint()).toBe('red');
  });
});
