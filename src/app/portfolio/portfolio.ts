import { Component, signal, computed, HostListener, inject, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PortraitSection, PortraitScene } from '../portrait-scene/portrait-scene';
 
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  role: string;
  duration: string;
  users: string;
  achievements: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  color: string;
  icon: string;
  status: string;
}
 
export interface Skill {
  name: string;
  description: string;
  icon: string;
  level: number;
  category: string;
}
 
export interface Stat {
  value: string;
  label: string;
  icon: string;
}
 
export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
}
 
export interface Certification {
  name: string;
  issuer: string;
  year: string;
  iconClass: string;
  color: string;
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
 
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  readonly activeSection = signal<PortraitSection>('hero');
  readonly activeSkillCategory = signal('all');
  readonly activeProjectId = signal<string | null>(null);
  readonly terminalLines = signal<string[]>([]);
  readonly currentYear = new Date().getFullYear();
 
  readonly navLinks = [
    { label: 'About',      anchor: 'about' },
    { label: 'Skills',     anchor: 'skills' },
    { label: 'Projects',   anchor: 'projects' },
    { label: 'Experience', anchor: 'experience' },
    { label: 'Contact',    anchor: 'contact' },
  ];
 
  readonly stats: Stat[] = [
    { value: '5+',  label: 'Projects shipped',     icon: 'fa-solid fa-rocket' },
    { value: '3+',  label: 'Production deploys',   icon: 'fa-solid fa-server' },
    { value: '10+', label: 'APIs built',            icon: 'fa-solid fa-plug' },
    { value: '2+',  label: 'Years building',        icon: 'fa-solid fa-code' },
  ];
 
  readonly skillCategories = ['all', 'frontend', 'backend', 'mobile', 'devops', 'security'];
 
  readonly skills: Skill[] = [
    { name: 'Angular',     description: 'Web applications', icon: 'fa-brands fa-angular',      level: 90, category: 'frontend'  },
    { name: 'TypeScript',  description: 'Type-safe code',   icon: 'fa-solid fa-code',           level: 85, category: 'frontend'  },
    { name: 'HTML/CSS',    description: 'Semantic markup',  icon: 'fa-brands fa-html5',         level: 95, category: 'frontend'  },
    { name: 'Django',      description: 'Backend APIs',     icon: 'fa-solid fa-server',         level: 88, category: 'backend'   },
    { name: 'Laravel',     description: 'PHP framework',    icon: 'fa-brands fa-php',           level: 80, category: 'backend'   },
    { name: 'PostgreSQL',  description: 'Databases',        icon: 'fa-solid fa-database',       level: 82, category: 'backend'   },
    { name: 'Flutter',     description: 'Mobile apps',      icon: 'fa-solid fa-mobile-screen',  level: 85, category: 'mobile'    },
    { name: 'Dart',        description: 'Mobile language',  icon: 'fa-solid fa-d',              level: 80, category: 'mobile'    },
    { name: 'Docker',      description: 'Containers',       icon: 'fa-brands fa-docker',        level: 78, category: 'devops'    },
    { name: 'Git',         description: 'Version control',  icon: 'fa-brands fa-git-alt',       level: 92, category: 'devops'    },
    { name: 'Linux',       description: 'Server admin',     icon: 'fa-brands fa-linux',         level: 80, category: 'devops'    },
    { name: 'Security',    description: 'CTF & pentesting', icon: 'fa-solid fa-shield-halved',  level: 75, category: 'security'  },
  ];
 
  readonly filteredSkills = computed(() => {
    const cat = this.activeSkillCategory();
    return cat === 'all' ? this.skills : this.skills.filter(s => s.category === cat);
  });
 
  readonly projects: Project[] = [
    {
      id: 'votegrip',
      title: 'VoteGrip',
      description: 'Offline-first election monitoring platform for field agents. Resilient by design — works without connectivity, syncs when restored.',
      tags: ['Flutter', 'Django', 'Hive', 'SQLite', 'REST API'],
      role: 'Full-stack & Mobile',
      duration: 'Ongoing',
      users: 'Field agents',
      achievements: [
        'SHA-256 offline credential caching with Hive',
        'Background sync queue — zero data loss',
        'Connectivity-aware UI with graceful degradation',
        'Android manifest for split media permissions',
      ],
      githubUrl: '#',
      featured: true,
      color: '#6366f1',
      icon: 'fa-solid fa-shield-halved',
      status: 'Active',
    },
    {
      id: 'mwangaza',
      title: 'Mwangaza Little Readers',
      description: 'Full-stack NGO management platform — admin dashboard, secure auth, content publishing, and stakeholder communication.',
      tags: ['Django', 'Angular', 'PostgreSQL', 'REST API'],
      role: 'Full-stack Developer',
      duration: '3 months',
      users: 'NGO staff',
      achievements: [
        'Role-based access control across all modules',
        'JWT authentication with permission layers',
        'Production deployment, zero-downtime release',
      ],
      liveUrl: '#',
      githubUrl: '#',
      color: '#10b981',
      icon: 'fa-solid fa-book-open',
      status: 'Live',
    },
    {
      id: 'bulk-sms',
      title: 'Bulk SMS Platform',
      description: 'High-volume messaging system with campaign management, contact lists, delivery tracking, and a retry engine.',
      tags: ['Laravel', 'Vue 3', 'MySQL', 'Docker', 'Redis'],
      role: 'Backend Developer',
      duration: '2 months',
      users: 'Marketing teams',
      achievements: [
        'Atomic retry system for failed delivery',
        'Race condition resolution in concurrent sends',
        'Full Docker Compose containerisation',
      ],
      githubUrl: '#',
      color: '#f59e0b',
      icon: 'fa-solid fa-paper-plane',
      status: 'Deployed',
    },
    {
      id: 'rental',
      title: 'Rental Management System',
      description: 'Property and contract management dashboard with automated tracking, tenant records, and reactive state architecture.',
      tags: ['Angular', 'Laravel', 'PostgreSQL', 'RxJS'],
      role: 'Full-stack Developer',
      duration: '2 months',
      users: 'Property managers',
      achievements: [
        'Fixed forkJoin race conditions in contract loading',
        'Angular Signals reactive state architecture',
        'Custom typography and responsive sidebar',
      ],
      githubUrl: '#',
      color: '#8b5cf6',
      icon: 'fa-solid fa-building',
      status: 'Deployed',
    },
  ];
 
  readonly activeProject = computed(() =>
    this.projects.find(p => p.id === this.activeProjectId()) ?? this.projects[0]
  );
 
  readonly experiences: Experience[] = [
    {
      role: 'Full-Stack Developer',
      company: 'Freelance / Contract',
      period: '2023 — Present',
      description: 'Building and deploying full-stack web and mobile applications for clients in NGO, property, and civic-tech sectors.',
      tags: ['Django', 'Angular', 'Flutter', 'Laravel'],
      icon: 'fa-solid fa-laptop-code',
      color: '#6366f1',
    },
    {
      role: 'Computer Science',
      company: 'University — Nairobi',
      period: '2022 — Present',
      description: 'Studying computer science with a focus on software engineering and information security.',
      tags: ['Algorithms', 'Networks', 'Security', 'Systems'],
      icon: 'fa-solid fa-graduation-cap',
      color: '#10b981',
    },
  ];
 
  readonly certifications: Certification[] = [
    { name: 'Cybersecurity Fundamentals', issuer: 'CTF Labs',             year: '2024', iconClass: 'fa-solid fa-shield-halved', color: '#ef4444' },
    { name: 'Django REST Framework',      issuer: 'Project-based',        year: '2023', iconClass: 'fa-solid fa-server',         color: '#10b981' },
    { name: 'Flutter Mobile Dev',         issuer: 'Project-based',        year: '2024', iconClass: 'fa-solid fa-mobile-screen',  color: '#6366f1' },
    { name: 'CTF Competitions',           issuer: 'Ongoing participation', year: '2024', iconClass: 'fa-solid fa-flag',           color: '#f59e0b' },
  ];
 
  readonly terminalCommands = [
    { cmd: 'whoami',              out: 'dennis-kimani — full-stack developer, cybersecurity enthusiast' },
    { cmd: 'ls skills/',          out: 'angular/  django/  flutter/  docker/  security/' },
    { cmd: 'git log --oneline',   out: 'a3f91c2 feat: offline-first sync queue\nb8d04e1 fix: race condition in bulk send\n7c2a109 deploy: zero-downtime release' },
    { cmd: 'cat status.txt',      out: '✓ Available for hire\n✓ Open to remote work\n✓ Based in Nairobi, Kenya' },
  ];
  readonly activeCmdIndex = signal(0);
 
  constructor() {
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        (entries) => entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('reveal--visible');
        }),
        { threshold: 0.08 }
      );
      this.document.querySelectorAll('.reveal').forEach(el => this.observer!.observe(el));
 
      // boot terminal
      this.runTerminal();
    });
  }
 
  private async runTerminal(): Promise<void> {
    for (let i = 0; i < this.terminalCommands.length; i++) {
      await this.delay(800 + i * 600);
      this.activeCmdIndex.set(i);
    }
  }
 
  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
 
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
    const sections: PortraitSection[] = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
    for (const id of sections) {
      const el = this.document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 180 && rect.bottom > 180) { this.activeSection.set(id); break; }
      }
    }
  }
 
  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }
 
  scrollTo(anchor: string): void {
    this.closeMenu();
    this.document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 
  isActive(anchor: string): boolean { return this.activeSection() === anchor; }
 
  setSkillCategory(cat: string): void { this.activeSkillCategory.set(cat); }
 
  setActiveProject(id: string): void { this.activeProjectId.set(id); }
 
  ngOnDestroy(): void { this.observer?.disconnect(); }
}
 