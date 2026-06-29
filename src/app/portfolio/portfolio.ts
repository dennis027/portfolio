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
}
 
export interface Skill {
  name: string;
  description: string;
  icon: string;
}
 
export interface Stat {
  value: string;
  label: string;
}
 
export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}
 
export interface Certification {
  name: string;
  issuer: string;
  year: string;
  iconClass: string;
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
 
  constructor() {
    // afterNextRender only executes in the browser — safe for SSR
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal--visible');
            }
          });
        },
        { threshold: 0.12 }
      );
 
      this.document
        .querySelectorAll('.reveal')
        .forEach((el) => this.observer!.observe(el));
    });
  }
 
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
 
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  readonly activeSection = signal<PortraitSection>('hero');
  readonly scrollY = signal(0);
  readonly currentYear = new Date().getFullYear();
 
  readonly navLinks = [
    { label: 'About', anchor: 'about' },
    { label: 'Projects', anchor: 'projects' },
    { label: 'Skills', anchor: 'skills' },
    { label: 'Experience', anchor: 'experience' },
    { label: 'Contact', anchor: 'contact' },
  ];
 
  readonly stats: Stat[] = [
    { value: '5+', label: 'Completed projects' },
    { value: '3+', label: 'Production deployments' },
    { value: '10+', label: 'APIs built' },
    { value: '2+', label: 'Years building' },
  ];
 
  readonly skills: Skill[] = [
    { name: 'HTML', description: 'Semantic markup', icon: 'fa-brands fa-html5' },
    { name: 'CSS', description: 'Responsive design', icon: 'fa-brands fa-css3-alt' },
    { name: 'JavaScript', description: 'Frontend logic', icon: 'fa-brands fa-js' },
    { name: 'TypeScript', description: 'Type-safe code', icon: 'fa-solid fa-code' },
    { name: 'Django', description: 'Backend APIs', icon: 'fa-solid fa-server' },
    { name: 'Angular', description: 'Web applications', icon: 'fa-brands fa-angular' },
    { name: 'Flutter', description: 'Mobile apps', icon: 'fa-solid fa-mobile-screen' },
    { name: 'PostgreSQL', description: 'Databases', icon: 'fa-solid fa-database' },
    { name: 'Docker', description: 'Containerisation', icon: 'fa-brands fa-docker' },
    { name: 'Security', description: 'Best practices', icon: 'fa-solid fa-shield-halved' },
  ];
 
  readonly projects: Project[] = [
    {
      id: 'mwangaza',
      title: 'Mwangaza Little Readers',
      description:
        'NGO management and information platform built to streamline operations, content publishing, and stakeholder communication.',
      tags: ['Django', 'Angular', 'PostgreSQL', 'REST API'],
      role: 'Full-stack Developer',
      duration: '3 months',
      users: 'NGO staff',
      achievements: [
        'Built a responsive admin dashboard with role-based access control',
        'Implemented secure JWT authentication and permission layers',
        'Deployed to production with zero-downtime release process',
      ],
      liveUrl: '#',
      githubUrl: '#',
      featured: true,
    },
    {
      id: 'votegrip',
      title: 'VoteGrip',
      description:
        'Offline-first election monitoring app for field agents with a resilient sync queue when connectivity is restored.',
      tags: ['Flutter', 'Hive', 'Django', 'SQLite'],
      role: 'Mobile Developer',
      duration: 'Ongoing',
      users: 'Field agents',
      achievements: [
        'Built offline login with SHA-256 credential caching via Hive',
        'Implemented a background sync queue for resilient data submission',
        'Integrated connectivity-aware UI with dynamic offline banners',
      ],
      githubUrl: '#',
    },
    {
      id: 'bulk-sms',
      title: 'Bulk SMS Platform',
      description:
        'High-volume messaging platform supporting campaign management, contact lists, and real-time delivery reporting.',
      tags: ['Laravel', 'Vue 3', 'MySQL', 'Docker'],
      role: 'Backend Developer',
      duration: '2 months',
      users: 'Marketing teams',
      achievements: [
        'Architected a retry system for failed message delivery',
        'Resolved race conditions in concurrent bulk-send operations',
        'Containerised the full stack with Docker Compose',
      ],
      githubUrl: '#',
    },
    {
      id: 'rental',
      title: 'Rental Management System',
      description:
        'Property and contract management platform with automated payment tracking and tenant records.',
      tags: ['Angular', 'Laravel', 'PostgreSQL', 'RxJS'],
      role: 'Full-stack Developer',
      duration: '2 months',
      users: 'Property managers',
      achievements: [
        'Fixed RxJS forkJoin race conditions in contract data loading',
        'Redesigned dashboard with Angular Signals for reactive state',
        'Built a responsive sidebar and custom typography system',
      ],
      githubUrl: '#',
    },
  ];
 
  readonly experiences: Experience[] = [
    {
      role: 'Full-Stack Developer',
      company: 'Freelance / Contract',
      period: '2023 — Present',
      description:
        'Building and deploying full-stack web and mobile applications for clients across NGO, property, and civic-tech sectors.',
      tags: ['Django', 'Angular', 'Flutter', 'Laravel'],
    },
  ];
 
  readonly certifications: Certification[] = [
    {
      name: 'Cybersecurity Fundamentals',
      issuer: 'CTF Labs & self-directed study',
      year: '2024',
      iconClass: 'fa-solid fa-shield-halved',
    },
    {
      name: 'Django REST Framework',
      issuer: 'Project-based learning',
      year: '2023',
      iconClass: 'fa-solid fa-server',
    },
    {
      name: 'Flutter Mobile Development',
      issuer: 'Project-based learning',
      year: '2024',
      iconClass: 'fa-solid fa-mobile-screen',
    },
  ];
 
  readonly featuredProject = computed(() =>
    this.projects.find((p) => p.featured)
  );
 
  readonly otherProjects = computed(() =>
    this.projects.filter((p) => !p.featured)
  );
 
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
    this.scrollY.set(window.scrollY);
 
    const sections: PortraitSection[] = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
    for (const id of sections) {
      const el = this.document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 160 && rect.bottom > 160) {
          this.activeSection.set(id);
          break;
        }
      }
    }
  }
 
  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
 
  closeMenu(): void {
    this.menuOpen.set(false);
  }
 
  scrollTo(anchor: string): void {
    this.closeMenu();
    const el = this.document.getElementById(anchor);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 
  isActive(anchor: string): boolean {
    return this.activeSection() === anchor;
  }
}
 