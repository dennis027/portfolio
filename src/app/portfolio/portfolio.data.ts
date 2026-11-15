/**
 * Portfolio content.
 *
 * Everything here is sourced from the previous portfolio, the project READMEs,
 * or commit history in the project repositories. Keep it that way: no invented
 * metrics, employers, or capabilities.
 */

// ── Profile ─────────────────────────────────────────────────────────────────

export const PROFILE = {
  name: 'Dennis Kimani',
  role: 'Full-Stack Engineer',
  location: 'Nairobi, Kenya',
  coordinates: '1°17′S 36°49′E',
  timeZone: 'Africa/Nairobi',
  email: 'machariad196@gmail.com',
  phone: '+254 799 157 137',
  phoneHref: 'tel:+254799157137',
  /** Set to e.g. 'assets/dennis-kimani-cv.pdf' once the file is added to src/assets. */
  cvUrl: null as string | null,
};

/** The About statement. Words in *asterisks* are set in the serif accent on the page. */
export const ABOUT_STATEMENT =
  'I build full-stack systems end to end — apps, APIs, dashboards and the data underneath. ' +
  'My work sits where failure is expensive: payments, messaging and field reporting on patchy networks. ' +
  'A background in security and forensics means I *design for failure first.*';

export const PORTFOLIO_URL = 'https://dennis027.github.io/portfolio/';

export interface SocialLink {
  label: string;
  handle: string;
  url: string;
  icon: string;
}

export const SOCIALS: SocialLink[] = [
  { label: 'GitHub', handle: 'dennis027', url: 'https://github.com/dennis027', icon: 'fa-brands fa-github' },
  { label: 'LinkedIn', handle: 'dennis-kimani', url: 'https://www.linkedin.com/in/dennis-kimani-6a965939b/', icon: 'fa-brands fa-linkedin-in' },
  { label: 'X', handle: '@deman_254', url: 'https://x.com/deman_254', icon: 'fa-brands fa-x-twitter' },
];

export interface NavLink {
  label: string;
  anchor: SectionId;
}

export type SectionId = 'top' | 'about' | 'work' | 'skills' | 'experience' | 'contact';

/** Ordered by what a recruiter asks: what has he built, what can he do, where, who, how to reach him. */
export const NAV_LINKS: NavLink[] = [
  { label: 'Work', anchor: 'work' },
  { label: 'Skills', anchor: 'skills' },
  { label: 'Experience', anchor: 'experience' },
  { label: 'About', anchor: 'about' },
  { label: 'Contact', anchor: 'contact' },
];

// ── Architecture diagrams (hero console + project visuals) ──────────────────

export type FlowTone = 'client' | 'edge' | 'service' | 'data' | 'external' | 'planned';

export interface FlowNode {
  label: string;
  detail?: string;
  tone: FlowTone;
}

export interface FlowDiagram {
  /** Each row renders left-to-right; rows are connected top-to-bottom. */
  rows: FlowNode[][];
  caption: string;
}

export interface HeroSystem {
  id: string;
  name: string;
  file: string;
  diagram: FlowDiagram;
  stack: string[];
}

export const HERO_SYSTEMS: HeroSystem[] = [
  {
    id: 'rental',
    name: 'Rental System',
    file: 'rental-incomes / architecture',
    diagram: {
      rows: [
        [{ label: 'Landlord / agent', detail: 'browser', tone: 'client' }],
        [{ label: 'Angular 20', detail: 'SSR · zoneless', tone: 'edge' }],
        [
          { label: 'Django REST API', detail: 'JWT · attempt limits', tone: 'service' },
          { label: 'M-Pesa paybill', detail: 'Safaricom callbacks', tone: 'external' },
        ],
        [{ label: 'PostgreSQL', detail: 'invoices · payments · arrears', tone: 'data' }],
      ],
      caption: 'Monthly billing, arrears and M-Pesa reconciliation for landlords.',
    },
    stack: ['Angular 20', 'Django 5', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'silkcommerce',
    name: 'SilkCommerce',
    file: 'silkcommerce / request path',
    diagram: {
      rows: [
        [
          { label: 'Storefront', detail: 'Vue 3', tone: 'client' },
          { label: 'Backoffice', detail: 'Vue 3', tone: 'client' },
        ],
        [{ label: 'Tenant resolver', detail: 'store ID / hostname → store', tone: 'edge' }],
        [{ label: 'Go · Gin API', detail: '/api/v1 · JWT', tone: 'service' }],
        [
          { label: 'MySQL', detail: 'GORM', tone: 'data' },
          { label: 'S3', detail: 'media', tone: 'external' },
        ],
      ],
      caption: 'One codebase serving many merchant stores, each resolved per request.',
    },
    stack: ['Go', 'Gin', 'Vue 3', 'MySQL'],
  },
  {
    id: 'sentinel',
    name: 'Densight',
    file: 'sentinel-asm / stack',
    diagram: {
      rows: [
        [{ label: 'Angular 20', detail: 'web app', tone: 'client' }],
        [{ label: 'Django + DRF', detail: 'API · JWT · rate limits', tone: 'service' }],
        [
          { label: 'Redis', detail: 'job broker', tone: 'edge' },
          { label: 'Celery workers', detail: 'scan jobs · schedules', tone: 'service' },
        ],
        [
          { label: 'Postgres', detail: 'assets · findings', tone: 'data' },
          { label: '25 scanners', detail: 'subfinder · nmap · nuclei', tone: 'external' },
        ],
      ],
      caption: 'Attack surface management: find every host, scan it, grade the risk.',
    },
    stack: ['Django', 'Celery', 'Redis', 'Postgres'],
  },
];

// ── Projects ────────────────────────────────────────────────────────────────

export interface ProjectLink {
  label: string;
  url: string;
  kind: 'live' | 'code' | 'site';
}

export interface Screenshot {
  src: string;
  alt: string;
  label: string;
  /** Short heading for the scroll-driven case study step. */
  title?: string;
  /** What this screen shows, in terms of what I built — from the contributions above. */
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  kind: string;
  summary: string;
  problem: string;
  role: string;
  contributions: string[];
  stack: string[];
  links: ProjectLink[];
  status: string;
  icon: string;
  screenshots?: Screenshot[];
  /** Project-specific illustration, drawn from documented behaviour (see project-visual). */
  visual?: ProjectVisualKind;
}

export type ProjectVisualKind = 'storefronts' | 'pin' | 'routing' | 'offline';

export const FEATURED_PROJECT: Project = {
  id: 'rental',
  name: 'Rental Management System',
  kind: 'Property & billing platform',
  summary: 'Rent billing for Kenyan landlords: tenants, invoices, M-Pesa payments and arrears in one app.',
  problem: 'Small landlords track rent on spreadsheets and M-Pesa messages, so balances are slow to work out and easy to get wrong.',
  role: 'Sole developer — product design, frontend, backend and deployment',
  contributions: [
    'Invoices from meter readings, with penalties and balances brought forward',
    'M-Pesa paybill payments matched to invoices automatically',
    'Arrears, statements and receipts as print, PDF or WhatsApp',
    'Financial, occupancy and utility reports with CSV export',
    'Attempt-limited login and reset codes; JWT with token renewal',
  ],
  stack: ['Angular 20', 'Angular Material', 'Chart.js', 'jsPDF', 'Django 5', 'DRF', 'SimpleJWT', 'PostgreSQL', 'Docker', 'Render'],
  links: [
    { label: 'Live demo', url: 'https://dennis027.github.io/rental-incomes/', kind: 'live' },
    { label: 'Source', url: 'https://github.com/dennis027/rental-incomes', kind: 'code' },
  ],
  status: 'Live',
  icon: 'fa-solid fa-building',
  screenshots: [
    {
      src: 'assets/projects/rental-dashboard.webp',
      alt: 'Rental System dashboard with monthly collections, contracts ending soon and arrears by age',
      label: 'Dashboard',
      title: 'The month at a glance',
      note: 'Collections against occupancy, renewals due and arrears by age — on one screen.',
    },
    {
      src: 'assets/projects/rental-invoices.webp',
      alt: 'Rental System invoices list with paid, partial and unpaid statuses',
      label: 'Invoices',
      title: 'Bills that add themselves up',
      note: 'Built from meter readings, with penalties and carried balances. M-Pesa payments match themselves.',
    },
    {
      src: 'assets/projects/rental-arrears.webp',
      alt: 'Rental System arrears page grouping unpaid balances by age',
      label: 'Arrears',
      title: 'Chasing what is owed',
      note: 'Overdue balances by age, with statements and receipts sent as PDF or on WhatsApp.',
    },
    {
      src: 'assets/projects/rental-reports.webp',
      alt: 'Rental System financial reports with rent roll and CSV export',
      label: 'Reports',
      title: 'Answers, not spreadsheets',
      note: 'Rent roll, occupancy, defaulters and utilities — each one exports to CSV.',
    },
  ],
};

/** Solo builds shown straight after the featured project, each with its own screenshots. */
export const SOLO_PROJECTS: Project[] = [
  {
    id: 'fundi-jenga-pro',
    name: 'Fundi & Jenga Pro',
    kind: 'Construction workforce platform',
    summary: 'Construction workers log their gigs. Contractors verify them and pay by M-Pesa.',
    problem: 'Day-rate site work leaves no record a worker can show a lender.',
    role: 'Full-stack developer',
    contributions: [
      'Verified gigs build a worker credit score and a shareable certificate',
      'M-Pesa payments, payroll and attendance for contractors',
      'English and Kiswahili, installable as an app',
    ],
    stack: ['Angular 20', 'Django', 'PostgreSQL', 'Docker'],
    links: [
      { label: 'Live demo', url: 'https://dennis027.github.io/Jenga-and-Fundi-Pro/jenga-pro/', kind: 'live' },
      { label: 'Source', url: 'https://github.com/dennis027/Jenga-and-Fundi-Pro', kind: 'code' },
    ],
    status: 'Live',
    icon: 'fa-solid fa-screwdriver-wrench',
    screenshots: [
      {
        src: 'assets/projects/fundi-jenga-contractor.webp',
        alt: 'Jenga Pro contractor dashboard listing gigs waiting for verification, with quick actions',
        label: 'Contractor',
      },
      {
        src: 'assets/projects/fundi-jenga-worker.webp',
        alt: 'Fundi Pro worker dashboard with credit score, gigs to finish and completed work',
        label: 'Worker',
      },
      {
        src: 'assets/projects/fundi-jenga-score.webp',
        alt: 'Fundi Pro credit score page with score history and a shareable verified work certificate',
        label: 'Credit score',
      },
    ],
  },
  {
    id: 'sentinel-asm',
    name: 'Densight',
    kind: 'Attack surface management',
    summary: 'Point it at a domain you own. It finds every host, scans each one, and tells you what to fix first.',
    problem: 'Teams lose track of what they expose to the internet.',
    role: 'Sole developer',
    contributions: [
      '25 scanners, 21 of them written for this project',
      'Risk grades, a ranked fix plan, and daily change tracking',
      'Two-factor sign-in, rate limits and an audit log',
    ],
    stack: ['Angular 20', 'Django', 'Celery', 'PostgreSQL', 'Docker'],
    links: [
      { label: 'Live demo', url: 'https://dennis027.github.io/sentinel-asm/', kind: 'live' },
      { label: 'Source', url: 'https://github.com/dennis027/sentinel-asm', kind: 'code' },
    ],
    status: 'Live',
    icon: 'fa-solid fa-satellite-dish',
    screenshots: [
      {
        src: 'assets/projects/densight-dashboard.webp',
        alt: 'Densight dashboard with a plain-English summary, risk grade and open issue counts',
        label: 'Dashboard',
      },
      {
        src: 'assets/projects/densight-map.webp',
        alt: 'Densight attack surface map showing every host around the domain, coloured by risk grade',
        label: 'Surface map',
      },
      {
        src: 'assets/projects/densight-findings.webp',
        alt: 'Densight findings list sorted by severity, from critical to high',
        label: 'Findings',
      },
    ],
  },
];

/** Team products — larger cards with an architecture visual. */
export const TEAM_PROJECTS: Project[] = [
  {
    id: 'silkcommerce',
    name: 'SilkCommerce',
    kind: 'Multi-tenant commerce SaaS',
    summary: 'Multi-tenant commerce: one backoffice, and a themed storefront for every merchant.',
    problem: 'Merchants need a store with checkout and content management, without running servers.',
    role: 'Team product · frontend & full-stack contributor',
    contributions: [
      'Built the second storefront theme end to end — catalogue, product, cart, account, checkout',
      'Checkout with persisted form state and payment-status polling',
      'Fixed stale search results; hardened the test-data seeder',
    ],
    stack: ['Go', 'Gin', 'GORM', 'MySQL', 'Vue 3', 'JWT', 'S3', 'Docker'],
    links: [{ label: 'Product site', url: 'https://silkcommerce.business/', kind: 'site' }],
    status: 'Live',
    icon: 'fa-solid fa-store',
    visual: 'storefronts',
  },
  {
    id: 'safaribucks',
    name: 'SafariBucks',
    kind: 'Digital wallet & corporate expenses',
    summary: 'A wallet on web and mobile: send money, pay bills, and fund employee wallets from a company balance.',
    problem: 'Money has to move fast for users and stay traceable for businesses.',
    role: 'Team product · full-stack & mobile contributor',
    contributions: [
      'Designed the PIN system: five rate-limited endpoints with feature tests',
      'App-wide PIN gate in Flutter, re-confirmed before sensitive actions',
      'Web wallet flows: send, pay bill, pay till, top-up',
    ],
    stack: ['Laravel 10', 'Sanctum', 'Vue 3', 'Pinia', 'Flutter', 'Capacitor', 'Docker'],
    links: [{ label: 'Product site', url: 'https://www.safaribucks.com/', kind: 'site' }],
    status: 'Live',
    icon: 'fa-solid fa-wallet',
    visual: 'pin',
  },
];

/** Supporting projects — editorial grid. */
export const SUPPORTING_PROJECTS: Project[] = [
  {
    id: 'bulk-sms',
    name: 'Bulk SMS Platform',
    kind: 'Messaging infrastructure',
    summary: 'High-volume SMS with campaigns, delivery tracking and retries, sold on prepaid units.',
    problem: 'Messages must arrive even when a gateway fails — and clients need proof.',
    role: 'Team product · backend contributor',
    contributions: [
      'Routing across Infobip and Onfon with per-provider delivery callbacks',
      'Delivery analytics and a tested failed-message outbox',
      'API key request, approval and rotation',
    ],
    stack: ['Laravel 10', 'MySQL', 'Redis', 'Horizon', 'Inertia', 'Vue', 'Docker'],
    links: [],
    status: 'In production',
    icon: 'fa-solid fa-paper-plane',
    visual: 'routing',
  },
  {
    id: 'votegrip',
    name: 'VoteGrip',
    kind: 'Election monitoring',
    summary: 'Offline-first election monitoring: field agents keep reporting, and it syncs when the network returns.',
    problem: 'Agents report from places with no signal, and no report can be lost.',
    role: 'Full-stack & mobile',
    contributions: [
      'Offline login with SHA-256 credentials cached in Hive',
      'Background sync queue so reports survive offline',
      'Device-based 2FA — trusted devices skip OTP',
    ],
    stack: ['Flutter', 'Django', 'Angular', 'PostgreSQL', 'Redis'],
    links: [{ label: 'Source', url: 'https://github.com/dennis027/test-votegrip', kind: 'code' }],
    status: 'Active',
    icon: 'fa-solid fa-check-to-slot',
    visual: 'offline',
  },
];

/** Compact cards. */
export const MORE_PROJECTS: Project[] = [
  {
    id: 'nmap',
    name: 'Network Scanner',
    kind: 'Security tooling',
    summary: 'Run and read Nmap scans from the browser — Django backend, Angular frontend.',
    problem: '',
    role: 'Personal project',
    contributions: [
      'Launch Nmap scans from the browser and follow their progress',
      'Filter and sort scan output for analysis',
    ],
    stack: ['Angular', 'Django', 'Nmap', 'Docker'],
    links: [{ label: 'Source', url: 'https://github.com/dennis027/nmap', kind: 'code' }],
    status: 'Built',
    icon: 'fa-solid fa-network-wired',
  },
];

// ── Focus areas (About) ─────────────────────────────────────────────────────

export interface FocusArea {
  title: string;
  evidence: string;
  icon: string;
  /** Ids of the projects on this page that show this work — each matches the evidence above. */
  seenIn: string[];
}

export const FOCUS_AREAS: FocusArea[] = [
  { title: 'Full-stack development', evidence: 'Angular and Vue frontends on Django, Laravel and Go APIs, plus Flutter apps.', icon: 'fa-solid fa-layer-group', seenIn: ['rental', 'silkcommerce', 'votegrip'] },
  { title: 'Backend & API design', evidence: 'REST APIs with JWT, role-based access, rate limits and feature tests.', icon: 'fa-solid fa-diagram-project', seenIn: ['safaribucks', 'bulk-sms', 'fundi-jenga-pro'] },
  { title: 'Data modelling', evidence: 'Billing ledgers, wallet transactions and election data in PostgreSQL and MySQL.', icon: 'fa-solid fa-database', seenIn: ['rental', 'safaribucks', 'votegrip'] },
  { title: 'Security engineering', evidence: 'Information security & forensics background, CTFs, PIN and 2FA flows, scanning tools.', icon: 'fa-solid fa-shield-halved', seenIn: ['safaribucks', 'votegrip', 'sentinel-asm'] },
  { title: 'Multi-tenant SaaS', evidence: 'Storefront and checkout work on a platform serving many merchant stores.', icon: 'fa-solid fa-building-user', seenIn: ['silkcommerce'] },
  { title: 'Product thinking', evidence: 'Shaping features around how landlords, merchants and field agents actually work.', icon: 'fa-solid fa-compass-drafting', seenIn: ['rental', 'silkcommerce', 'votegrip'] },
];

// ── Skills ──────────────────────────────────────────────────────────────────

export interface SkillGroup {
  title: string;
  icon: string;
  items: string[];
  /** Ids of projects on this page that use this group. */
  usedIn: string[];
}

/** Primary tools, shown with icons; every one is used in a project on the page. */
export const CORE_STACK = [
  { name: 'Angular', icon: 'fa-brands fa-angular' },
  { name: 'Vue', icon: 'fa-brands fa-vuejs' },
  { name: 'Django', icon: 'fa-brands fa-python' },
  { name: 'Laravel', icon: 'fa-brands fa-laravel' },
  { name: 'Go', icon: 'fa-brands fa-golang' },
  { name: 'Flutter', icon: 'fa-solid fa-mobile-screen-button' },
  { name: 'PostgreSQL', icon: 'fa-solid fa-database' },
  { name: 'Docker', icon: 'fa-brands fa-docker' },
];

/**
 * Each item is something a project on this page actually uses. Architecture names patterns
 * rather than tools — every one is described in a case study above.
 */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Backend development',
    icon: 'fa-solid fa-server',
    items: ['Django', 'Django REST Framework', 'Laravel', 'Go (Gin)', 'Celery', 'Laravel Horizon', 'M-Pesa', 'Infobip / Onfon'],
    usedIn: ['rental', 'bulk-sms', 'silkcommerce'],
  },
  {
    title: 'Frontend development',
    icon: 'fa-solid fa-window-maximize',
    items: ['Angular', 'TypeScript', 'Signals & SSR', 'RxJS', 'Vue 3', 'Pinia', 'Angular Material', 'Tailwind CSS', 'HTML & CSS'],
    usedIn: ['rental', 'silkcommerce', 'safaribucks'],
  },
  {
    title: 'Mobile',
    icon: 'fa-solid fa-mobile-screen',
    items: ['Flutter', 'Dart', 'Hive', 'Offline sync', 'Capacitor'],
    usedIn: ['votegrip', 'safaribucks'],
  },
  {
    title: 'Databases',
    icon: 'fa-solid fa-database',
    items: ['PostgreSQL', 'MySQL', 'SQL Server', 'Redis', 'Django ORM', 'Eloquent', 'GORM'],
    usedIn: ['rental', 'safaribucks', 'votegrip'],
  },
  {
    title: 'Software architecture',
    icon: 'fa-solid fa-sitemap',
    items: ['REST API design', 'Multi-tenant SaaS', 'Offline-first sync', 'Queues & background jobs', 'Provider failover', 'Role-based access'],
    usedIn: ['silkcommerce', 'votegrip', 'bulk-sms'],
  },
  {
    title: 'DevOps & infrastructure',
    icon: 'fa-solid fa-gears',
    items: ['Docker', 'Docker Compose', 'Linux', 'Nginx / Apache', 'Gunicorn', 'Git'],
    usedIn: ['rental', 'silkcommerce', 'sentinel-asm'],
  },
  {
    title: 'Cloud & deployment',
    icon: 'fa-solid fa-cloud-arrow-up',
    items: ['Render', 'GitHub Pages', 'S3 storage', 'Environment-based config'],
    usedIn: ['rental', 'silkcommerce', 'sentinel-asm'],
  },
  {
    title: 'Cybersecurity',
    icon: 'fa-solid fa-user-shield',
    items: ['JWT & RBAC', 'Rate limiting', 'PIN & 2FA flows', 'OWASP Top 10', 'Nmap', 'CTF practice'],
    usedIn: ['safaribucks', 'votegrip', 'sentinel-asm'],
  },
];

// ── Highlights ──────────────────────────────────────────────────────────────

export interface Highlight {
  title: string;
  body: string;
  project: string;
}

export const HIGHLIGHTS: Highlight[] = [
  {
    title: 'A PIN layer for a wallet app',
    body: 'Rate-limited, feature-tested PIN endpoints, enforced app-wide.',
    project: 'SafariBucks',
  },
  {
    title: 'SMS that survives a gateway outage',
    body: 'Infobip + Onfon routing, failure analytics and an outbox.',
    project: 'Bulk SMS',
  },
  {
    title: 'Rent billing, end to end',
    body: 'Meter readings to M-Pesa matching — built and shipped solo.',
    project: 'Rental System',
  },
  {
    title: 'Works with no signal',
    body: 'Cached credentials and a sync queue keep agents reporting.',
    project: 'VoteGrip',
  },
];

// ── Experience ──────────────────────────────────────────────────────────────

export interface Experience {
  role: string;
  org: string;
  period: string;
  points: string[];
  tags: string[];
  icon: string;
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'Full-Stack Developer',
    org: 'Freelance / Contract',
    period: '2024 — Present',
    points: ['Build and deploy full-stack web and mobile apps', 'Clients in NGO, property and civic tech'],
    tags: ['Django', 'Angular', 'Flutter', 'Laravel'],
    icon: 'fa-solid fa-laptop-code',
  },
  {
    role: 'Full-Stack Engineer',
    org: 'Contract',
    period: '2022 — 2024',
    points: [
      'Core banking platform with real-time front-office transactions',
      'Back-office batch posting and an integrated general ledger',
      'Web and mobile banking systems, built and deployed',
    ],
    tags: ['Django', 'Angular', 'Flutter', 'SQL Server', 'MySQL', 'Docker', 'Apache'],
    icon: 'fa-solid fa-building-columns',
  },
];

export const EDUCATION = {
  course: 'Information Security and Forensics',
  school: 'KCA University',
  period: '2019 — 2023',
  description: 'Computer science, focused on software engineering and security.',
  tags: ['Algorithms', 'Networks', 'Security', 'Systems'],
};

export const PRACTICE = [
  { title: 'CTF competitions', detail: 'Ongoing participation', icon: 'fa-solid fa-flag' },
  { title: 'Offensive security labs', detail: 'OWASP, SQL injection, XSS', icon: 'fa-solid fa-bug' },
];
