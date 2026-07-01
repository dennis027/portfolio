import { Component, signal, computed, HostListener, inject, OnDestroy, afterNextRender, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PortraitSection, PortraitScene } from '../portrait-scene/portrait-scene';
export interface Project {
  id: string; title: string; description: string;
  tags: string[]; role: string; duration: string; users: string;
  achievements: string[]; liveUrl?: string; githubUrl?: string;
  color: string; icon: string; status: string;
}
export interface Skill {
  name: string; description: string; icon: string;
  level: number; category: string;
  color: string;   /* neon accent for this skill   */
  bgIcon: string;  /* large background icon class  */
  detail: string;  /* one-liner shown on hover     */
}
export interface Stat { value: string; label: string; icon: string; }
export interface Experience {
  role: string; company: string; period: string;
  description: string; tags: string[]; icon: string; color: string;
}
export interface Certification {
  name: string; issuer: string; year: string; iconClass: string; color: string;
}
type ShellEntryType = 'project' | 'ls' | 'help' | 'error' | 'text';
export interface ShellEntry {
  id: number; cmd: string; type: ShellEntryType;
  message?: string; project?: Project; fresh: boolean;
}
@Component({
  selector: 'app-portfolio',
  imports: [CommonModule, PortraitScene],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})


export class Portfolio{
    private readonly document = inject(DOCUMENT);
  private observer: IntersectionObserver | null = null;
 
  @ViewChild('shellOutput') shellOutputRef!: ElementRef<HTMLDivElement>;
  @ViewChild('shellInput')  shellInputRef!: ElementRef<HTMLInputElement>;
 
  // ── Signals ──────────────────────────────────────────
  readonly menuOpen            = signal(false);
  readonly scrolled            = signal(false);
  readonly activeSection       = signal<PortraitSection>('hero');
  readonly activeSkillCategory = signal('all');
  readonly shellHistory        = signal<ShellEntry[]>([]);
  readonly shellInputValue     = signal('');
  readonly activeCmdIndex      = signal(0);
  readonly currentYear         = new Date().getFullYear();
 
  private shellIdCounter   = 0;
  private cmdHistory: string[] = [];
  private cmdHistoryIndex  = -1;
 
  // ── Nav ──────────────────────────────────────────────
  readonly navLinks = [
    { label: 'About',      anchor: 'about' },
    { label: 'Skills',     anchor: 'skills' },
    { label: 'Projects',   anchor: 'projects' },
    { label: 'Experience', anchor: 'experience' },
    { label: 'Contact',    anchor: 'contact' },
  ];
 
  // ── Stats ────────────────────────────────────────────
  readonly stats: Stat[] = [
    { value: '5+',  label: 'Projects shipped',   icon: 'fa-solid fa-rocket'  },
    { value: '3+',  label: 'Production deploys', icon: 'fa-solid fa-server'  },
    { value: '10+', label: 'APIs built',          icon: 'fa-solid fa-plug'    },
    { value: '2+',  label: 'Years building',      icon: 'fa-solid fa-code'    },
  ];
 
  // ── Skills ───────────────────────────────────────────
  readonly skillCategories = ['all', 'frontend', 'backend', 'mobile', 'devops', 'security'];
 
  readonly skills: Skill[] = [
    { name:'Angular',    description:'Web applications', icon:'fa-brands fa-angular',     level:90, category:'frontend', color:'#dd1b16', bgIcon:'fa-brands fa-angular',     detail:'Signals, standalone components, SSR, reactive forms' },
    { name:'TypeScript', description:'Type-safe code',   icon:'fa-solid fa-code',          level:65, category:'frontend', color:'#3178c6', bgIcon:'fa-solid fa-code',          detail:'Strict types, generics, decorators, utility types' },
    { name:'HTML / CSS', description:'Semantic markup',  icon:'fa-brands fa-html5',        level:75, category:'frontend', color:'#e34f26', bgIcon:'fa-brands fa-html5',        detail:'Semantic HTML5, CSS Grid, Flexbox, animations' },
    { name:'Django',     description:'Backend APIs',     icon:'fa-solid fa-server',        level:65, category:'backend',  color:'#092e20', bgIcon:'fa-solid fa-server',        detail:'DRF, ORM, signals, celery, JWT auth' },
    { name:'Laravel',    description:'PHP framework',    icon:'fa-brands fa-php',          level:50, category:'backend',  color:'#ff2d20', bgIcon:'fa-brands fa-laravel',      detail:'Eloquent ORM, queues, events, Docker' },
    { name:'PostgreSQL', description:'Databases',        icon:'fa-solid fa-database',      level:60, category:'backend',  color:'#336791', bgIcon:'fa-solid fa-database',      detail:'Indexing, transactions, row locking, migrations' },
    { name:'Flutter',    description:'Mobile apps',      icon:'fa-solid fa-mobile-screen', level:60, category:'mobile',   color:'#54c5f8', bgIcon:'fa-solid fa-mobile-screen', detail:'Hive, offline sync, BLoC/Provider, animations' },
    { name:'Dart',       description:'Mobile language',  icon:'fa-solid fa-d',             level:60, category:'mobile',   color:'#0175c2', bgIcon:'fa-solid fa-d',             detail:'Async/await, streams, null safety' },
    { name:'Docker',     description:'Containers',       icon:'fa-brands fa-docker',       level:55, category:'devops',   color:'#2496ed', bgIcon:'fa-brands fa-docker',       detail:'Compose, multi-stage builds, nginx, volumes' },
    { name:'Git',        description:'Version control',  icon:'fa-brands fa-git-alt',      level:80, category:'devops',   color:'#f05032', bgIcon:'fa-brands fa-git-alt',      detail:'Branching, rebasing, hooks, CI pipelines' },
    { name:'Linux',      description:'Server admin',     icon:'fa-brands fa-linux',        level:65, category:'devops',   color:'#fcc624', bgIcon:'fa-brands fa-linux',        detail:'Bash scripting, cron, systemd, SSH' },
    { name:'Security',   description:'CTF & pentesting', icon:'fa-solid fa-shield-halved', level:75, category:'security', color:'#ef4444', bgIcon:'fa-solid fa-shield-halved', detail:'OWASP, SQL injection, XSS, CTF labs' },
  ];
 
  readonly filteredSkills = computed(() => {
    const cat = this.activeSkillCategory();
    return cat === 'all' ? this.skills : this.skills.filter(s => s.category === cat);
  });
 
  // ── Projects ─────────────────────────────────────────
  readonly projects: Project[] = [
    {
      id: 'votegrip', title: 'VoteGrip',
      description: 'Offline-first election monitoring platform for field agents. Resilient by design — works without connectivity, syncs when restored.',
      tags: ['Flutter', 'Django', 'Angular', 'PostgreSQL', 'Swagger API'],
      role: 'Full-stack & Mobile', duration: 'Ongoing', users: 'Field agents',
      achievements: [
        'SHA-256 offline credential caching with Hive',
        'Background sync queue — zero data loss',
        'Connectivity-aware UI with graceful degradation',
        'Android manifest for split media permissions',
      ],
      githubUrl: 'https://github.com/dennis027/test-votegrip', color: '#6366f1', icon: 'fa-solid fa-shield-halved', status: 'Active',
    },
    {
      id: 'fundi-jenga-pro', title: 'Fundi & Jenga Pro',
      description: 'A digital marketplace that helps customers find, hire, and pay verified fundis (artisans and tradespeople) for home, construction, and maintenance services.',
      tags: ['Django', 'Angular', 'PostgreSQL', 'REST API','Flutter'],
      role: 'Full-stack Developer', duration: '5 months', users: 'Homeowners, fundis, and contractors',
      achievements: [
        'Role-based access control across all modules',
        'JWT authentication with permission layers',
        'Production deployment, zero-downtime release',
      ],
      liveUrl: 'https://github.com/dennis027/new-fundi-pro', githubUrl: '#', color: '#10b981', icon: 'fa-solid fa-book-open', status: 'Live',
    },
    {
      id: 'bulk-sms', title: 'Bulk SMS Platform',
      description: 'High-volume messaging system with campaign management, contact lists, delivery tracking, and a retry engine.',
      tags: ['Laravel', 'Vue 3', 'MySQL', 'Docker', 'Redis'],
      role: 'Backend Developer', duration: '2 months', users: 'Marketing teams',
      achievements: [
        'Atomic retry system for failed delivery',
        'Race condition resolution in concurrent sends',
        'Full Docker Compose containerisation',
      ],
      githubUrl: '#', color: '#f59e0b', icon: 'fa-solid fa-paper-plane', status: 'Deployed',
    },
    {
      id: 'rental', title: 'Rental Management System',
      description: 'Property and contract management dashboard with automated tracking, tenant records, and reactive state architecture.',
      tags: ['Angular', 'Laravel', 'PostgreSQL', 'RxJS'],
      role: 'Full-stack Developer', duration: '2 months', users: 'Property managers',
      achievements: [
        'Fixed forkJoin race conditions in contract loading',
        'Angular Signals reactive state architecture',
        'Custom typography and responsive sidebar',
      ],
      githubUrl: 'https://github.com/dennis027/rental-management', color: '#8b5cf6', icon: 'fa-solid fa-building', status: 'Deployed',
    },
  ];
 
  // ── Experience ───────────────────────────────────────
  readonly experiences: Experience[] = [
    {
      role: 'Full-Stack Developer', company: 'Freelance / Contract', period: '2024 — Present',
      description: 'Building and deploying full-stack web and mobile applications for clients in NGO, property, and civic-tech sectors.',
      tags: ['Django', 'Angular', 'Flutter', 'Laravel'],
      icon: 'fa-solid fa-laptop-code', color: '#6366f1',
    },
  {
      role: 'Full-Stack Engineer', company: ' Contract', period: '2022 — 2024',
      description: 'Building and deploying full-stack web and mobile banking systems.',
      tags: ['Django', 'Angular', 'Flutter', 'SQL', 'MySQL', 'Docker','Apache'],
      icon: 'fa-solid fa-laptop-code', color: '#6366f1',
    },
    {
      role: 'Information Security and Forensics', company: 'KCA University', period: '2029 — 2023',
      description: 'Studying computer science with a focus on software engineering and information security.',
      tags: ['Algorithms', 'Networks', 'Security', 'Systems'],
      icon: 'fa-solid fa-graduation-cap', color: '#10b981',
    },
  ];
 
  readonly certifications: Certification[] = [
    { name: 'Cybersecurity Fundamentals', issuer: 'CTF Labs',             year: '2024', iconClass: 'fa-solid fa-shield-halved', color: '#ef4444' },
    { name: 'Django REST Framework',      issuer: 'Project-based',        year: '2023', iconClass: 'fa-solid fa-server',         color: '#10b981' },
    { name: 'Flutter Mobile Dev',         issuer: 'Project-based',        year: '2024', iconClass: 'fa-solid fa-mobile-screen',  color: '#6366f1' },
    { name: 'CTF Competitions',           issuer: 'Ongoing participation', year: '2024', iconClass: 'fa-solid fa-flag',           color: '#f59e0b' },
  ];
 
  // ── Hero terminal ─────────────────────────────────────
  readonly terminalCommands = [
    { cmd: 'whoami',            out: 'dennis-kimani — full-stack developer, cybersecurity enthusiast' },
    { cmd: 'ls skills/',        out: 'angular/  django/  flutter/  docker/  security/' },
    { cmd: 'git log --oneline', out: 'a3f91c2 feat: offline-first sync queue\nb8d04e1 fix: race condition in bulk send\n7c2a109 deploy: zero-downtime release' },
    { cmd: 'cat status.txt',    out: '✓ Available for hire\n✓ Open to remote work\n✓ Based in Nairobi, Kenya' },
  ];
 
  // ── Shell engine ──────────────────────────────────────
  shellRun(cmd: string): void {
    const raw = cmd.trim();
    if (!raw) return;
    this.cmdHistory.unshift(raw);
    this.cmdHistoryIndex = -1;
    this.shellHistory.update(h => h.map(e => ({ ...e, fresh: false })));
    if (raw.toLowerCase() === 'clear') { this.shellClear(); return; }
    const entry = this.parseCmd(raw);
    this.shellHistory.update(h => [...h, entry]);
    this.shellInputValue.set('');
    setTimeout(() => {
      const el = this.shellOutputRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
 
  private parseCmd(raw: string): ShellEntry {
    const id    = ++this.shellIdCounter;
    const lower = raw.toLowerCase().trim();
    const parts = lower.split(/\s+/);
    const verb  = parts[0];
    const arg   = parts.slice(1).join(' ');
 
    if (verb === 'ls' || verb === 'list')
      return { id, cmd: raw, type: 'ls', fresh: true };
 
    if (verb === 'help' || verb === '?')
      return { id, cmd: raw, type: 'help', fresh: true };
 
    if (['open','show','cat','cd','inspect','view','run'].includes(verb)) {
      const proj = this.projects.find(p => p.id === arg || p.title.toLowerCase() === arg);
      if (proj) return { id, cmd: raw, type: 'project', project: proj, fresh: true };
      return { id, cmd: raw, type: 'error', fresh: true,
        message: `Project "${arg}" not found. Try: ${this.projects.map(p => p.id).join(', ')}` };
    }
 
    const direct = this.projects.find(p => p.id === lower || p.title.toLowerCase() === lower);
    if (direct) return { id, cmd: raw, type: 'project', project: direct, fresh: true };
 
    return { id, cmd: raw, type: 'error', fresh: true,
      message: `Command not found: "${raw}". Type help for available commands.` };
  }
 
  shellClear(): void { this.shellHistory.set([]); this.shellIdCounter = 0; }
 
  onShellInput(event: Event): void {
    this.shellInputValue.set((event.target as HTMLInputElement).value);
  }
 
  onShellKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') { this.shellRun(this.shellInputValue()); return; }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.cmdHistoryIndex = Math.min(this.cmdHistoryIndex + 1, this.cmdHistory.length - 1);
      this.shellInputValue.set(this.cmdHistory[this.cmdHistoryIndex] ?? '');
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.cmdHistoryIndex = Math.max(this.cmdHistoryIndex - 1, -1);
      this.shellInputValue.set(this.cmdHistoryIndex >= 0 ? this.cmdHistory[this.cmdHistoryIndex] : '');
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const val = this.shellInputValue().replace(/^open\s*/i, '').toLowerCase();
      const match = this.projects.find(p => p.id.startsWith(val));
      if (match) this.shellInputValue.set('open ' + match.id);
    }
  }
 
  // ── Lifecycle ─────────────────────────────────────────
  constructor() {
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('reveal--visible');
        }),
        { threshold: 0.08 }
      );
      this.document.querySelectorAll('.reveal').forEach(el => this.observer!.observe(el));
      this.runTerminal();
      // boot shell with project listing
      setTimeout(() => {
        this.shellHistory.set([{
          id: ++this.shellIdCounter, cmd: 'ls projects', type: 'ls', fresh: true,
        }]);
      }, 400);
    });
  }
 
  private async runTerminal(): Promise<void> {
    for (let i = 0; i < this.terminalCommands.length; i++) {
      await this.delay(800 + i * 600);
      this.activeCmdIndex.set(i);
    }
  }
 
  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
 
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
    const sections: PortraitSection[] = ['hero','about','skills','projects','experience','contact'];
    for (const id of sections) {
      const el = this.document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 180 && rect.bottom > 180) { this.activeSection.set(id); break; }
      }
    }
  }
 
  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu():  void { this.menuOpen.set(false); }
  scrollTo(anchor: string): void {
    this.closeMenu();
    this.document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  isActive(anchor: string): boolean { return this.activeSection() === anchor; }
  setSkillCategory(cat: string): void { this.activeSkillCategory.set(cat); }
 
  ngOnDestroy(): void { this.observer?.disconnect(); }
}
 