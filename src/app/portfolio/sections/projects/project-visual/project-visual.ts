import { Component, computed, input } from '@angular/core';
import { ProjectVisualKind } from '../../../portfolio.data';

interface VisualCopy {
  label: string;
  caption: string;
}

/** Captions double as the accessible description of each illustration. */
const COPY: Record<ProjectVisualKind, VisualCopy> = {
  storefronts: {
    label: 'Illustration: two storefront themes rendering the same store catalogue.',
    caption: 'Every store resolves to its own theme over one shared catalogue. I built the second theme end to end.',
  },
  pin: {
    label: 'Illustration: a PIN prompt on the mobile app backed by five rate-limited PIN endpoints.',
    caption: 'Sensitive actions ask for the PIN again; every PIN route sits behind its own rate limiter.',
  },
  routing: {
    label: 'Illustration: outgoing messages routed to Infobip or Onfon, with delivery callbacks and a failed-message outbox.',
    caption: 'Each message records which gateway sent it; callbacks feed delivery analytics and failures land in an outbox.',
  },
  offline: {
    label: 'Illustration: reports queued on a device with no network, then synced to the API when connectivity returns.',
    caption: 'With no signal, reports wait in an on-device queue and sync once the network returns.',
  },
};

@Component({
  selector: 'app-project-visual',
  templateUrl: './project-visual.html',
  styleUrl: './project-visual.css',
})
export class ProjectVisual {
  readonly kind = input.required<ProjectVisualKind>();
  protected readonly copy = computed(() => COPY[this.kind()]);
  protected readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  protected readonly tiles = [0, 1, 2, 3, 4, 5];
}
