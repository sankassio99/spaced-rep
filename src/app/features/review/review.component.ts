import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../contents/content.service';
import { SubjectService } from '../subjects/subject.service';
import { FirebaseService } from '../../infra/firebase.service';
import { Content } from '../../shared/models/content.model';

@Component({
  selector: 'app-review',
  imports: [RouterLink],
  templateUrl: './review.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f6f7f8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contentService = inject(ContentService);
  private subjectService = inject(SubjectService);
  private firebaseService = inject(FirebaseService);

  loading = signal(true);
  dueContents = signal<Content[]>([]);
  currentIndex = signal(0);
  studyingContent = signal<string | null>(null);
  subjectId = signal<string | null>(null);

  currentContent = computed(() => {
    const contents = this.dueContents();
    const index = this.currentIndex();
    return index < contents.length ? contents[index] : null;
  });

  progressPercentage = computed(() => {
    const total = this.dueContents().length;
    const current = this.currentIndex();
    return total > 0 ? Math.round((current / total) * 100) : 0;
  });

  remainingCards = computed(() => {
    return Math.max(0, this.dueContents().length - this.currentIndex());
  });

  async ngOnInit() {
    // Get subjectId from query params if provided
    this.route.queryParams.subscribe(params => {
      this.subjectId.set(params['subjectId'] || null);
    });

    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    
    await this.subjectService.loadAll();
    
    const subjectId = this.subjectId();
    let dueList: Content[];
    
    if (subjectId) {
      // Load content for specific subject
      await this.contentService.loadBySubject(subjectId);
      dueList = this.contentService.contents().filter(c => {
        const status = this.contentService.getContentStatus(c);
        return status === 'overdue' || status === 'due-today';
      });
    } else {
      // Load all due content
      const [today, overdue] = await Promise.all([
        this.contentService.getDueToday(),
        this.contentService.getOverdue()
      ]);
      dueList = [...overdue, ...today];
    }
    
    this.dueContents.set(dueList);
    this.loading.set(false);
  }

  goBack() {
    const subjectId = this.subjectId();
    if (subjectId) {
      this.router.navigate(['/subjects', subjectId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  async registerStudyAndNext() {
    const content = this.currentContent();
    if (!content) return;

    this.studyingContent.set(content.id);
    try {
      await this.contentService.registerStudy(content.id);
      
      // Move to next card
      const nextIndex = this.currentIndex() + 1;
      if (nextIndex < this.dueContents().length) {
        this.currentIndex.set(nextIndex);
      } else {
        // Session complete
        this.goBack();
      }
    } finally {
      this.studyingContent.set(null);
    }
  }

  getSubjectName(subjectId: string): string {
    const subject = this.subjectService.subjects().find(s => s.id === subjectId);
    return subject?.name || 'Unknown';
  }

  formatNextReview(content: Content): string {
    const date = this.firebaseService.timestampToDate(content.nextReviewDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getCardIcon(): string {
    // You can customize icons based on content type or subject
    return 'science';
  }
}
