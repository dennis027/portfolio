import { Coin } from '../../../shared/drive/coin';
import { ParkingSpot } from '../../../shared/drive/parking-spot';
import { Component, OnDestroy, afterNextRender, computed, inject, signal } from '@angular/core';
import { RevealDirective } from '../../../shared/reveal.directive';
import { ScrambleDirective } from '../../../shared/motion/scramble.directive';
import { SplitDirective } from '../../../shared/motion/split.directive';
import { ContactForm, ContactService } from '../../../services/contact-service';
import { Marquee } from '../../../shared/marquee/marquee';
import { MagneticDirective } from '../../../shared/motion/magnetic.directive';
import { TripService } from '../../../shared/drive/trip.service';
import { CvService } from '../../../shared/cv/cv.service';
import { PROFILE, SOCIALS } from '../../portfolio.data';

type ContactField = keyof ContactForm;

const EMPTY_FORM: ContactForm = { full_name: '', email: '', subject: '', message: '' };
const UNTOUCHED: Record<ContactField, boolean> = { full_name: false, email: false, subject: false, message: false };
const DRAFT_KEY = 'dk-contact-draft';
/** The message must be longer than this (see contactErrors). */
const MESSAGE_MIN = 11;
/** Nairobi is UTC+3 all year (no daylight saving). */
const NAIROBI_OFFSET_MIN = 180;

/** "same time as you" / "3 hours ahead of you" / "1.5 hours behind you" */
export function timeDifference(localOffsetMin: number): string {
  const diff = (NAIROBI_OFFSET_MIN - localOffsetMin) / 60;
  if (diff === 0) return 'same time as you';
  const hours = Math.abs(diff);
  const amount = `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hour${hours === 1 ? '' : 's'}`;
  return `${amount} ${diff > 0 ? 'ahead of' : 'behind'} you`;
}

@Component({
  selector: 'app-contact',
  imports: [RevealDirective, ScrambleDirective, SplitDirective, Marquee, MagneticDirective, Coin, ParkingSpot],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnDestroy {
  private readonly contactService = inject(ContactService);
  private readonly trip = inject(TripService);
  protected readonly cv = inject(CvService);

  protected readonly profile = PROFILE;
  protected readonly socials = SOCIALS;
  protected readonly invite = ["Let's work together", 'Available for new work'];

  readonly contact = signal<ContactForm>({ ...EMPTY_FORM });
  readonly contactTouched = signal<Record<ContactField, boolean>>({ ...UNTOUCHED });
  readonly contactAttempted = signal(false);
  readonly contactStatus = signal<'idle' | 'sending' | 'success' | 'error'>('idle');
  readonly contactMessage = signal('');
  readonly emailCopied = signal(false);
  private copiedTimer?: ReturnType<typeof setTimeout>;

  /** "It's 21:40 in Nairobi — 2 hours ahead of you"; browser only, refreshed each minute. */
  readonly timeNote = signal('');
  readonly messageMin = MESSAGE_MIN;
  readonly messageLength = computed(() => this.contact().message.trim().length);
  private clock?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      this.restoreDraft();
      const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: PROFILE.timeZone });
      const tick = () =>
        this.timeNote.set(`It's ${fmt.format(new Date())} in Nairobi — ${timeDifference(-new Date().getTimezoneOffset())}.`);
      tick();
      this.clock = setInterval(tick, 60_000);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.clock);
    clearTimeout(this.copiedTimer);
  }

  /** Ctrl/⌘ + Enter sends from anywhere in the form. */
  onFormKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') void this.sendContact(e);
  }

  private restoreDraft(): void {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Partial<ContactForm> | null;
      if (!draft) return;
      const restored = { ...EMPTY_FORM };
      for (const k of Object.keys(EMPTY_FORM) as ContactField[]) {
        if (typeof draft[k] === 'string') restored[k] = draft[k];
      }
      if (Object.values(restored).some((v) => v.trim())) this.contact.set(restored);
    } catch {
      /* no storage, or a broken draft — start empty */
    }
  }

  private saveDraft(): void {
    try {
      const form = this.contact();
      if (Object.values(form).some((v) => v.trim())) localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* storage unavailable — the form still works */
    }
  }

  readonly contactErrors = computed(() => {
    const form = this.contact();
    return {
      full_name: form.full_name.trim() ? '' : 'Full name is required.',
      email: form.email.trim()
        ? this.validateEmail(form.email.trim()) ? '' : 'Invalid email format.'
        : 'Email is required.',
      subject: form.subject.trim() ? '' : 'Subject is required.',
      message: form.message.trim()
        ? form.message.trim().length > 10 ? '' : 'Message should be more than 10 characters.'
        : 'Message is required.',
    };
  });

  readonly contactValid = computed(() => {
    const errors = this.contactErrors();
    return !errors.full_name && !errors.email && !errors.subject && !errors.message;
  });

  showError(field: ContactField): string {
    return this.contactTouched()[field] || this.contactAttempted() ? this.contactErrors()[field] : '';
  }

  updateContact(field: ContactField, value: string): void {
    this.contact.update((c) => ({ ...c, [field]: value }));
    this.saveDraft();
    this.contactTouched.update((t) => ({ ...t, [field]: true }));
    if (this.contactStatus() === 'error' || this.contactStatus() === 'success') {
      this.contactStatus.set('idle');
      this.contactMessage.set('');
    }
  }

  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profile.email);
    } catch {
      return; // clipboard blocked — the mailto link next to the button still works
    }
    this.emailCopied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.emailCopied.set(false), 2400);
  }

  private validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async sendContact(event: Event): Promise<void> {
    event.preventDefault();
    if (this.contactStatus() === 'sending') return;
    this.contactAttempted.set(true);
    const payload = this.contact();
    if (!this.contactValid()) {
      const errors = this.contactErrors();
      const firstError = errors.full_name || errors.email || errors.subject || errors.message;
      this.contactStatus.set('error');
      this.contactMessage.set(firstError || 'Please fix the highlighted fields.');
      return;
    }

    this.contactStatus.set('sending');
    this.contactMessage.set('Sending message...');

    try {
      await this.contactService.sendContact(payload);
      this.contactStatus.set('success');
      this.trip.unlock('say-hello');
      this.contactMessage.set('Message sent successfully.');
      this.contact.set({ ...EMPTY_FORM });
      this.saveDraft();
      this.contactTouched.set({ ...UNTOUCHED });
      this.contactAttempted.set(false);
    } catch (error) {
      this.contactStatus.set('error');
      this.contactMessage.set('Unable to send message. Please try again later.');
      console.error('Contact form submit failed', error);
    }
  }
}
