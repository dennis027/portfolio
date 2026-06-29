import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  afterNextRender,
  OnDestroy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
 
export type PortraitSection = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'contact';
 
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}
 
interface FloatingNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
  color: string;
  size: number;
  alpha: number;
}
 
const SECTION_CONFIG: Record<PortraitSection, {
  bgGradient: string[];
  accentColor: string;
  particles: string[];
  label: string;
  pose: string;
  nodes: string[];
}> = {
  hero: {
    bgGradient: ['#0f172a', '#1e1b4b', '#0f172a'],
    accentColor: '#6366f1',
    particles: ['#6366f1', '#818cf8', '#a5b4fc', '#e0e7ff'],
    label: 'Introducing',
    pose: 'confident',
    nodes: [],
  },
  about: {
    bgGradient: ['#0f172a', '#083344', '#0f172a'],
    accentColor: '#0ea5e9',
    particles: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
    label: 'Thinking',
    pose: 'thinking',
    nodes: ['const', 'async', 'REST', 'API', 'SQL', '{...}'],
  },
  skills: {
    bgGradient: ['#0f172a', '#042f2e', '#0f172a'],
    accentColor: '#10b981',
    particles: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    label: 'Building',
    pose: 'building',
    nodes: ['Angular', 'Django', 'Flutter', 'Docker', 'Git', 'SQL'],
  },
  projects: {
    bgGradient: ['#0f172a', '#1c1917', '#0f172a'],
    accentColor: '#f59e0b',
    particles: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
    label: 'Shipping',
    pose: 'working',
    nodes: ['git push', 'npm run', 'deploy', '✓ Build', 'v2.1.0'],
  },
  experience: {
    bgGradient: ['#0f172a', '#1e1b4b', '#0f172a'],
    accentColor: '#8b5cf6',
    particles: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
    label: 'Growing',
    pose: 'leading',
    nodes: ['2023', '2024', '2025', 'Scale', 'Lead'],
  },
  contact: {
    bgGradient: ['#0f172a', '#0c1a2e', '#0f172a'],
    accentColor: '#2563eb',
    particles: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
    label: 'Connect',
    pose: 'welcoming',
    nodes: ['📧', '💬', '🤝', 'Hello!'],
  },
};
 
@Component({
  selector: 'app-portrait-scene',
  imports: [CommonModule],
  templateUrl: './portrait-scene.html',
  styleUrl: './portrait-scene.css',
})
export class PortraitScene {
 @Input() section: PortraitSection = 'hero';
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
 
  readonly activeSection = signal<PortraitSection>('hero');
  readonly transitioning = signal(false);
 
  readonly config = computed(() => SECTION_CONFIG[this.activeSection()]);
  readonly visibleNodes = computed(() => SECTION_CONFIG[this.activeSection()].nodes);
 
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private particles: Particle[] = [];
  private animFrame = 0;
  private ctx: CanvasRenderingContext2D | null = null;
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;
 
  constructor() {
    afterNextRender(() => {
      // afterNextRender already only runs in the browser,
      // but we also guard ngOnDestroy via isBrowser
      this.initCanvas();
      this.animate();
    });
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && !changes['section'].firstChange) {
      this.transitionTo(changes['section'].currentValue);
    } else if (changes['section']?.firstChange) {
      this.activeSection.set(this.section);
    }
  }
 
  private transitionTo(next: PortraitSection): void {
    this.transitioning.set(true);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.activeSection.set(next);
      // burst particles on transition
      this.burstParticles(20);
      setTimeout(() => this.transitioning.set(false), 600);
    }, 250);
  }
 
  private initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    this.sizeCanvas(canvas);
 
    this.resizeObserver = new ResizeObserver(() => this.sizeCanvas(canvas));
    this.resizeObserver.observe(canvas.parentElement!);
 
    // seed initial particles
    this.burstParticles(30);
  }
 
  private sizeCanvas(canvas: HTMLCanvasElement): void {
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
 
  private burstParticles(count: number): void {
    const cfg = this.config();
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    for (let i = 0; i < count; i++) {
      const color = cfg.particles[Math.floor(Math.random() * cfg.particles.length)];
      this.particles.push({
        x: canvas.width * (0.2 + Math.random() * 0.6),
        y: canvas.height * (0.1 + Math.random() * 0.8),
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.3 - Math.random() * 0.6,
        size: 1.5 + Math.random() * 3,
        opacity: 0.6 + Math.random() * 0.4,
        color,
        life: 0,
        maxLife: 120 + Math.random() * 180,
      });
    }
    // cap total
    if (this.particles.length > 120) {
      this.particles = this.particles.slice(-120);
    }
  }
 
  private animate(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) {
      if (this.isBrowser) {
        this.animFrame = requestAnimationFrame(() => this.animate());
      }
      return;
    }
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    // spawn ambient particles slowly
    if (Math.random() < 0.25) this.burstParticles(1);
 
    this.particles = this.particles.filter(p => p.life < p.maxLife);
 
    for (const p of this.particles) {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy *= 0.998; // gentle deceleration
      const progress = p.life / p.maxLife;
      const alpha = p.opacity * (1 - Math.pow(progress, 2));
 
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
 
    this.animFrame = requestAnimationFrame(() => this.animate());
  }
 
  ngOnDestroy(): void {
    if (this.isBrowser) {
      cancelAnimationFrame(this.animFrame);
      this.resizeObserver?.disconnect();
    }
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }
}
 