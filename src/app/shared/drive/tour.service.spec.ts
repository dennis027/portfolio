import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TourService } from './tour.service';
import { TripService } from './trip.service';

describe('TourService', () => {
  let tour: TourService;
  let trip: TripService;
  let host: HTMLElement;

  beforeEach(() => {
    localStorage.removeItem('dk-trip');
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    tour = TestBed.inject(TourService);
    trip = TestBed.inject(TripService);
    trip.restore(5);
    host = document.createElement('div');
    host.innerHTML = '<h1 id="hero-title">Dennis Kimani</h1>';
    document.body.append(host);
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
  });

  afterEach(() => {
    tour.end();
    jasmine.clock().uninstall();
    host.remove();
    localStorage.removeItem('dk-trip');
  });

  it('starts at the first stop, highlights it and flags the page', () => {
    tour.start();
    expect(tour.active()).toBeTrue();
    expect(tour.index()).toBe(0);
    expect(document.documentElement.classList).toContain('is-touring');
    expect(host.querySelector('#hero-title')!.classList).toContain('is-touring-target');
  });

  it('auto-advances while playing, and holds when paused', () => {
    tour.start();
    jasmine.clock().tick(tour.durationMs() + 10);
    expect(tour.index()).toBe(1);
    tour.togglePlay();
    jasmine.clock().tick(tour.durationMs() * 3);
    expect(tour.index()).toBe(1);
  });

  it('finishes onto a closing card, awards the badge, and cleans up on end', () => {
    tour.start();
    for (let i = 0; i < tour.stops().length - 1; i++) tour.next();
    expect(tour.isLast()).toBeTrue();
    tour.next(); // "Finish"
    expect(tour.finished()).toBeTrue();
    expect(trip.unlocked()).toContain('tour');
    expect(trip.unlocked()).not.toContain('deep-dive');
    tour.next(); // close the closing card
    expect(tour.active()).toBeFalse();
    expect(document.documentElement.classList).not.toContain('is-touring');
    expect(host.querySelector('.is-touring-target')).toBeNull();
  });

  it('never goes before the first stop', () => {
    tour.start();
    tour.prev();
    expect(tour.index()).toBe(0);
  });

  it('switches track without losing its place', () => {
    tour.start('quick');
    tour.goTo(3); // "The stack"
    tour.switchTrack('deep');
    expect(tour.track()).toBe('deep');
    expect(tour.current().id).toBe('stack');
  });

  it('pauses when the visitor scrolls on their own, and resumes on request', () => {
    tour.start();
    jasmine.clock().tick(2000); // past the tour's own scroll
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    expect(tour.exploring()).toBeTrue();
    expect(tour.playing()).toBeFalse();
    jasmine.clock().tick(tour.durationMs() * 2);
    expect(tour.index()).toBe(0);
    tour.resume();
    expect(tour.exploring()).toBeFalse();
    expect(tour.playing()).toBeTrue();
  });

  it('awards the deep-dive badge only for the deep dive', () => {
    tour.start('deep');
    for (let i = 0; i < tour.stops().length; i++) tour.next();
    expect(tour.finished()).toBeTrue();
    expect(trip.unlocked()).toContain('deep-dive');
  });
});
