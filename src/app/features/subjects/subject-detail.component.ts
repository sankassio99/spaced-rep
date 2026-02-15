import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { SubjectService } from './subject.service';
import { ContentService } from '../contents/content.service';
import { FirebaseService } from '../../infra/firebase.service';
import { Subject } from '../../shared/models/subject.model';
import { Content } from '../../shared/models/content.model';
import { ContentFormDialogComponent } from '../contents/content-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-subject-detail',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    } @else if (subject()) {
      <div class="mb-6">
        <button mat-button routerLink="/subjects" class="mb-4">
          <mat-icon>arrow_back</mat-icon>
          Back to Subjects
        </button>
        
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold flex items-center gap-2">
              <mat-icon>folder</mat-icon>
              {{ subject()!.name }}
            </h1>
            @if (subject()!.description) {
              <p class="text-gray-600 mt-2">{{ subject()!.description }}</p>
            }
          </div>
          <button mat-raised-button color="primary" (click)="openCreateContentDialog()">
            <mat-icon>add</mat-icon>
            New Content
          </button>
        </div>
      </div>

      @if (contentService.contents().length === 0) {
        <div class="text-center p-8">
          <mat-icon class="text-6xl text-gray-400 mb-4">description</mat-icon>
          <p class="text-xl text-gray-600">No content yet</p>
          <p class="text-gray-500 mb-4">Create your first content to start learning</p>
          <button mat-raised-button color="primary" (click)="openCreateContentDialog()">
            <mat-icon>add</mat-icon>
            Create Content
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (content of contentService.contents(); track content.id) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ content.title }}</mat-card-title>
                <mat-chip [class]="getStatusClass(content)">
                  {{ getStatusLabel(content) }}
                </mat-chip>
              </mat-card-header>
              <mat-card-content>
                @if (content.description) {
                  <p class="text-gray-600 mb-4">{{ content.description }}</p>
                }
                <div class="text-sm text-gray-500 space-y-1">
                  <p><strong>Review Level:</strong> {{ content.reviewLevel }}</p>
                  <p><strong>Total Reviews:</strong> {{ content.totalReviews }}</p>
                  <p><strong>Next Review:</strong> {{ formatDate(content.nextReviewDate) }}</p>
                  @if (getOverdueDays(content) > 0) {
                    <p class="text-red-600">
                      <strong>Overdue:</strong> {{ getOverdueDays(content) }} days
                    </p>
                  }
                </div>
              </mat-card-content>
              <mat-card-actions class="flex gap-2">
                <button mat-raised-button color="primary" (click)="registerStudy(content)" 
                        [disabled]="studyingContent() === content.id">
                  <mat-icon>check_circle</mat-icon>
                  {{ studyingContent() === content.id ? 'Studying...' : 'Studied Today' }}
                </button>
                <button mat-button (click)="openEditContentDialog(content)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-button color="warn" (click)="confirmDeleteContent(content)">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    } @else {
      <div class="text-center p-8">
        <p class="text-xl text-red-600">Subject not found</p>
        <button mat-button routerLink="/subjects" class="mt-4">
          Go back to Subjects
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
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

  async registerStudy(content: Content) {
    this.studyingContent.set(content.id);
    try {
      await this.contentService.registerStudy(content.id);
      await this.loadData(this.subject()!.id);
    } finally {
      this.studyingContent.set(null);
    }
  }

  getStatusClass(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    const baseClasses = 'ml-auto';
    
    switch (status) {
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'due-today':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-green-100 text-green-800`;
    }
  }

  getStatusLabel(content: Content): string {
    const status = this.contentService.getContentStatus(content);
    
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due-today':
        return 'Due Today';
      case 'completed':
        return 'Completed';
      default:
        return 'On Track';
    }
  }

  getOverdueDays(content: Content): number {
    return this.contentService.getOverdueDays(content);
  }

  formatDate(timestamp: any): string {
    const date = this.firebaseService.timestampToDate(timestamp);
    return date.toLocaleDateString();
  }
}
