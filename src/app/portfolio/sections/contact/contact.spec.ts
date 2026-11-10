import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Contact, timeDifference } from './contact';

const API = 'https://portfolio-backend-kbjr.onrender.com/api/contact/';

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let component: Contact;
  let http: HttpTestingController;

  const fill = () => {
    component.updateContact('full_name', 'Ada Lovelace');
    component.updateContact('email', 'ada@example.com');
    component.updateContact('subject', 'Backend role');
    component.updateContact('message', 'Would love to talk about a role.');
  };

  beforeEach(async () => {
    localStorage.removeItem('dk-contact-draft');
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('dk-contact-draft');
  });

  it('blocks submission and shows errors when fields are invalid', async () => {
    await component.sendContact(new Event('submit'));
    await fixture.whenStable();
    http.expectNone(API);
    expect(component.contactStatus()).toBe('error');
    expect(component.contactMessage()).toBe('Full name is required.');
    const errors = (fixture.nativeElement as HTMLElement).querySelectorAll('.field__error');
    expect(errors.length).toBe(4);
  });

  it('rejects a malformed email and a short message', () => {
    fill();
    component.updateContact('email', 'not-an-email');
    component.updateContact('message', 'short');
    expect(component.contactErrors().email).toBe('Invalid email format.');
    expect(component.contactErrors().message).toBe('Message should be more than 10 characters.');
    expect(component.contactValid()).toBeFalse();
  });

  it('posts the payload to the contact API and resets on success', async () => {
    fill();
    const pending = component.sendContact(new Event('submit'));
    expect(component.contactStatus()).toBe('sending');

    const req = http.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      full_name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Backend role',
      message: 'Would love to talk about a role.',
    });
    req.flush(null);
    await pending;

    expect(component.contactStatus()).toBe('success');
    expect(component.contact().full_name).toBe('');
  });

  it('reports a failure from the API without clearing the form', async () => {
    spyOn(console, 'error');
    fill();
    const pending = component.sendContact(new Event('submit'));
    http.expectOne(API).flush('boom', { status: 500, statusText: 'Server Error' });
    await pending;

    expect(component.contactStatus()).toBe('error');
    expect(component.contactMessage()).toBe('Unable to send message. Please try again later.');
    expect(component.contact().email).toBe('ada@example.com');
  });

  it('copies the email address and confirms it', async () => {
    const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    await component.copyEmail();
    await fixture.whenStable();
    expect(write).toHaveBeenCalledWith(jasmine.stringMatching(/@/));
    expect(component.emailCopied()).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).querySelector('.contact__copy')!.textContent).toContain('Copied');
  });

  it('leaves the state alone when the clipboard is blocked', async () => {
    spyOn(navigator.clipboard, 'writeText').and.rejectWith(new Error('denied'));
    await component.copyEmail();
    expect(component.emailCopied()).toBeFalse();
  });

  it('saves a draft as you type and clears it once the message is sent', async () => {
    fill();
    expect(JSON.parse(localStorage.getItem('dk-contact-draft')!).full_name).toBe('Ada Lovelace');
    const pending = component.sendContact(new Event('submit'));
    http.expectOne(API).flush(null);
    await pending;
    expect(localStorage.getItem('dk-contact-draft')).toBeNull();
  });

  it('restores a saved draft on the next visit', async () => {
    localStorage.setItem('dk-contact-draft', JSON.stringify({ full_name: 'Grace', email: 'g@example.com', subject: '', message: '' }));
    const again = TestBed.createComponent(Contact);
    await again.whenStable();
    expect(again.componentInstance.contact().full_name).toBe('Grace');
    expect(again.componentInstance.contact().subject).toBe('');
  });

  it('sends on Ctrl+Enter', async () => {
    fill();
    component.onFormKey(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    http.expectOne(API).flush(null);
    await fixture.whenStable();
    expect(component.contactStatus()).toBe('success');
  });

  it('describes the time difference to Nairobi (UTC+3)', () => {
    expect(timeDifference(180)).toBe('same time as you');
    expect(timeDifference(60)).toBe('2 hours ahead of you');
    expect(timeDifference(240)).toBe('1 hour behind you');
    expect(timeDifference(330)).toBe('2.5 hours behind you');
  });
});
