import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { SubjectService } from '../subjects/subject.service';
import { ContentService } from '../contents/content.service';
import { FirebaseService } from '../../infra/firebase.service';
import { Subject } from '../../shared/models/subject.model';
import { Content } from '../../shared/models/content.model';
import { ContentFormDialogComponent } from '../contents/content-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-subject-detail',
  imports: [RouterLink, MatDialogModule, MatMenuModule],
  templateUrl: './subject-detail.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f6f7f8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subjectService = inject(SubjectService);
  contentService = inject(ContentService);
  private firebaseService = inject(FirebaseService);
  private dialog = inject(MatDialog);

  subject = signal<Subject | null>(null);
  loading = signal(true);
  studyingContent = signal<string | null>(null);

  // Computed stats
  totalCards = computed(() => this.contentService.contents().length);
  overdueCards = computed(() => 
    this.contentService.contents().filter(c => this.contentService.getContentStatus(c) === 'overdue').length
  );
  averageMastery = computed(() => {
    const contents = this.contentService.contents();
    if (contents.length === 0) return 0;
    const totalLevel = contents.reduce((sum, c) => sum + c.reviewLevel, 0);
    const maxLevel = 10; // Assuming max level is 10
    return Math.round((totalLevel / (contents.length * maxLevel)) * 100);
  });

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    await this.loadData(id);
  }

  async loadData(id: string) {
    this.loading.set(true);
    const subject = await this.subjectService.getById(id);
    this.subject.set(subject);
    
    if (subject) {
      await this.contentService.loadBySubject(id);
    }
    
    this.loading.set(false);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openCreateContentDialog() {
    const dialogRef = this.dialog.open(ContentFormDialogComponent, {
      width: '500px',
      data: { mode: 'create', subjectId: this.subject()!.id }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadData(this.subject()!.id);
      }
    });
  }

  openEditContentDialog(content: Content) {
    const dialogRef = this.dialog.open(ContentFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', content, subjectId: this.subject()!.id }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadData(this.subject()!.id);
      }
    });
  }

  confirmDeleteContent(content: Content) {
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
        await this.loadData(this.subject()!.id);
      }
    });
  }

  async startStudySession() {
    const dueContents = this.contentService.contents().filter(c => {
      const status = this.contentService.getContentStatus(c);
      return status === 'overdue' || status === 'due-today';
    });

    if (dueContents.length > 0) {
      // TODO: Navigate to review session
      this.router.navigate(['/review'], { 
        queryParams: { subjectId: this.subject()!.id }
      });
    }
  }

  getContentStatus(content: Content): string {
    return this.contentService.getContentStatus(content);
  }

  getStatusClass(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    
    switch (status) {
      case 'overdue':
        return 'border-red-200 dark:border-red-900';
      case 'due-today':
        return 'border-yellow-200 dark:border-yellow-900';
      default:
        return 'border-primary/10';
    }
  }

  getIconBackground(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    
    switch (status) {
      case 'overdue':
        return 'bg-red-100 dark:bg-red-950';
      default:
        return 'bg-primary/10';
    }
  }

  getIcon(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    return status === 'overdue' ? 'warning' : 'folder';
  }

  getIconColor(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    return status === 'overdue' ? 'text-red-500' : 'text-primary';
  }

  getLevelBadgeClass(content: Content): string {
    const level = content.reviewLevel;
    if (level >= 7) {
      return 'bg-primary text-white';
    } else if (level >= 4) {
      return 'bg-primary/30 text-primary';
    } else {
      return 'bg-primary/20 text-primary';
    }
  }

  formatNextReview(content: Content): string {
    const date = this.firebaseService.timestampToDate(content.nextReviewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewDate = new Date(date);
    reviewDate.setHours(0, 0, 0, 0);
    
    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Due Now';
    } else if (diffDays === 0) {
      return 'Due Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  getNextReviewClass(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    return status === 'overdue' ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400';
  }

  getNextReviewIcon(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    return status === 'overdue' ? 'schedule' : 'calendar_today';
  }

  navigateToContent(content: Content) {
    // TODO: Navigate to content detail or edit
    this.openEditContentDialog(content);
  }
}
