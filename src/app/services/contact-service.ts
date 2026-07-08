import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ContactForm {
  full_name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  sendContact(payload: ContactForm): Promise<void> {
    return firstValueFrom(this.http.post<void>('https://portfolio-backend-kbjr.onrender.com/api/contact/', payload));
  }
}
