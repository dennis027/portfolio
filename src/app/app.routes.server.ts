import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  // Unknown URLs render the 404 page with a real 404 status on the Node server.
  // On static hosting, 404.html (see the deploy script) serves the same page client-side.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
