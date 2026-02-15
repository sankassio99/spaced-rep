import { Injectable, inject, signal, computed } from '@angular/core';
import { SubjectService } from '../subjects/subject.service';
import { ContentService } from '../contents/content.service';

export interface DashboardStats {
  totalSubjects: number;
  totalContents: number;
  dueToday: number;
  overdue: number;
  completed: number;
  dailyGoal: number;
}

export interface SubjectWithStats {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalCards: number;
  dueCards: number;
  isDone: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private subjectService = inject(SubjectService);
  private contentService = inject(ContentService);

  private statsSignal = signal<DashboardStats>({
    totalSubjects: 0,
    totalContents: 0,
    dueToday: 0,
    overdue: 0,
    completed: 0,
    dailyGoal: 50
  });

  private subjectsWithStatsSignal = signal<SubjectWithStats[]>([]);

  stats = this.statsSignal.asReadonly();
  subjectsWithStats = this.subjectsWithStatsSignal.asReadonly();

  // Subject icons and colors mapping
  private readonly subjectIcons: Record<string, { icon: string; color: string }> = {
    default: { icon: 'folder', color: 'text-primary bg-primary/10' },
    biology: { icon: 'biotech', color: 'text-primary bg-primary/10' },
    chemistry: { icon: 'science', color: 'text-purple-600 bg-purple-100' },
    history: { icon: 'public', color: 'text-orange-600 bg-orange-100' },
    language: { icon: 'translate', color: 'text-green-600 bg-green-100' },
    math: { icon: 'calculate', color: 'text-blue-600 bg-blue-100' },
    physics: { icon: 'psychology', color: 'text-indigo-600 bg-indigo-100' }
  };

  async loadDashboardData(): Promise<void> {
    await this.subjectService.loadAll();
    await this.contentService.loadAll();

    const subjects = this.subjectService.subjects();
    const allContents = await this.contentService.getDueToday();
    const overdueContents = await this.contentService.getOverdue();

    // Calculate stats
    const totalSubjects = subjects.length;
    const totalContents = this.contentService.contents().length;
    const dueToday = allContents.length;
    const overdue = overdueContents.length;
    const completed = totalContents - dueToday;

    this.statsSignal.set({
      totalSubjects,
      totalContents,
      dueToday,
      overdue,
      completed,
      dailyGoal: 50
    });

    // Map subjects with their stats
    const subjectsWithStats: SubjectWithStats[] = subjects.map(subject => {
      const subjectContents = this.contentService.contents().filter(c => c.subjectId === subject.id);
      const dueCards = allContents.filter(c => c.subjectId === subject.id).length;
      const isDone = dueCards === 0 && subjectContents.length > 0;

      // Determine icon and color based on subject name
      const iconConfig = this.getSubjectIconConfig(subject.name);

      return {
        id: subject.id,
        name: subject.name,
        icon: iconConfig.icon,
        color: iconConfig.color,
        totalCards: subjectContents.length,
        dueCards,
        isDone
      };
    });

    this.subjectsWithStatsSignal.set(subjectsWithStats);
  }

  private getSubjectIconConfig(subjectName: string): { icon: string; color: string } {
    const nameLower = subjectName.toLowerCase();
    
    if (nameLower.includes('biolog')) return this.subjectIcons['biology'];
    if (nameLower.includes('chemist') || nameLower.includes('organic')) return this.subjectIcons['chemistry'];
    if (nameLower.includes('histor')) return this.subjectIcons['history'];
    if (nameLower.includes('italian') || nameLower.includes('spanish') || nameLower.includes('french') || nameLower.includes('language')) return this.subjectIcons['language'];
    if (nameLower.includes('math') || nameLower.includes('algebra') || nameLower.includes('calculus')) return this.subjectIcons['math'];
    if (nameLower.includes('physic')) return this.subjectIcons['physics'];
    
    return this.subjectIcons['default'];
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }
}
