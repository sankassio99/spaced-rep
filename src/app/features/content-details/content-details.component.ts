import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContentService } from '../contents/content.service';
import { SubjectService } from '../subjects/subject.service';
import { FirebaseService } from '../../infra/firebase.service';
import { Content } from '../../shared/models/content.model';
import { ContentFormDialogComponent } from '../contents/content-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-content-details',
  imports: [MatDialogModule],
  templateUrl: './content-details.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f6f7f8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contentService = inject(ContentService);
  private subjectService = inject(SubjectService);
  private firebaseService = inject(FirebaseService);
  private dialog = inject(MatDialog);

  loading = signal(true);
  content = signal<Content | null>(null);
  studyingContent = signal<string | null>(null);

  // Computed values for display
  progressPercentage = computed(() => {
    const contentItem = this.content();
    if (!contentItem) return 0;
    const maxLevel = 10; // Assuming max level is 10
    return Math.round((contentItem.reviewLevel / maxLevel) * 100);
  });

  remainingReviews = computed(() => {
    const contentItem = this.content();
    if (!contentItem) return 0;
    const maxLevel = 10;
    return Math.max(0, maxLevel - contentItem.reviewLevel);
  });

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    await this.loadData(id);
  }

  async loadData(id: string) {
    this.loading.set(true);
    
    await this.subjectService.loadAll();
    const content = await this.contentService.getById(id);
    
    this.content.set(content);
    this.loading.set(false);
  }

  goBack() {
    const content = this.content();
    if (content) {
      this.router.navigate(['/subjects', content.subjectId]);
    } else {
      this.router.navigate(['/subjects']);
    }
  }

  async registerStudy() {
    const content = this.content();
    if (!content) return;

    this.studyingContent.set(content.id);
    try {
      await this.contentService.registerStudy(content.id);
      // Reload the content to get updated data
      await this.loadData(content.id);
    } finally {
      this.studyingContent.set(null);
    }
  }

  openEditDialog() {
    const content = this.content();
    if (!content) return;

    const dialogRef = this.dialog.open(ContentFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', content, subjectId: content.subjectId }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadData(content.id);
      }
    });
  }

  confirmDelete() {
    const content = this.content();
    if (!content) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Content',
        message: `Are you sure you want to delete "${content.title}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.contentService.delete(content.id);
        this.goBack();
      }
    });
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

  getContentStatus(): string {
    const content = this.content();
    if (!content) return 'on-track';
    return this.contentService.getContentStatus(content);
  }

  isOverdue(): boolean {
    return this.getContentStatus() === 'overdue';
  }

  isDueToday(): boolean {
    return this.getContentStatus() === 'due-today';
  }
}
