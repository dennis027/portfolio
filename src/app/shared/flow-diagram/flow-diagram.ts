import { Component, input } from '@angular/core';
import { FlowDiagram } from '../../portfolio/portfolio.data';

/** Renders a small top-to-bottom architecture diagram from real project structure. */
@Component({
  selector: 'app-flow-diagram',
  templateUrl: './flow-diagram.html',
  styleUrl: './flow-diagram.css',
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
  },
})
export class FlowDiagramComponent {
  readonly diagram = input.required<FlowDiagram>();
  readonly showCaption = input(true);

  label(): string {
    const rows = this.diagram().rows.map((row) => row.map((n) => n.label).join(' and '));
    return `Architecture: ${rows.join(', then ')}.`;
  }
}
