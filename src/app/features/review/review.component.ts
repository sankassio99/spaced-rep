import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ContentService } from '../contents/content.service';
import { SubjectService } from '../subjects/subject.service';
import { FirebaseService } from '../../infra/firebase.service';
import { Content } from '../../shared/models/content.model';

@Component({
  selector: 'app-review',
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Review</h1>
      <p class="text-gray-600">Manage your study schedule and review content</p>
    </div>

    <mat-tab-group>
      <mat-tab label="Today">
        <div class="p-4">
          @if (loading()) {
            <div class="flex justify-center items-center h-32">
              <p>Loading...</p>
            </div>
          } @else if (dueToday().length === 0) {
            <div class="text-center p-8">
              <mat-icon class="text-6xl text-green-400 mb-4">check_circle</mat-icon>
              <p class="text-xl text-gray-600">All caught up!</p>
              <p class="text-gray-500">No content due for review today</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (content of dueToday(); track content.id) {
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
                      <p><strong>Subject:</strong> {{ getSubjectName(content.subjectId) }}</p>
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
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="registerStudy(content)" 
                            [disabled]="studyingContent() === content.id">
                      <mat-icon>check_circle</mat-icon>
                      {{ studyingContent() === content.id ? 'Studying...' : 'Studied Today' }}
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab label="Overdue">
        <div class="p-4">
          @if (loading()) {
            <div class="flex justify-center items-center h-32">
              <p>Loading...</p>
            </div>
          } @else if (overdue().length === 0) {
            <div class="text-center p-8">
              <mat-icon class="text-6xl text-green-400 mb-4">event_available</mat-icon>
              <p class="text-xl text-gray-600">No overdue content</p>
              <p class="text-gray-500">You're staying on track!</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (content of overdue(); track content.id) {
                <mat-card class="border-l-4 border-red-500">
                  <mat-card-header>
                    <mat-card-title>{{ content.title }}</mat-card-title>
                    <mat-chip class="ml-auto bg-red-100 text-red-800">
                      Overdue: {{ getOverdueDays(content) }} days
                    </mat-chip>
                  </mat-card-header>
                  <mat-card-content>
                    @if (content.description) {
                      <p class="text-gray-600 mb-4">{{ content.description }}</p>
                    }
                    <div class="text-sm text-gray-500 space-y-1">
                      <p><strong>Subject:</strong> {{ getSubjectName(content.subjectId) }}</p>
                      <p><strong>Review Level:</strong> {{ content.reviewLevel }}</p>
                      <p><strong>Total Reviews:</strong> {{ content.totalReviews }}</p>
                      <p><strong>Next Review:</strong> {{ formatDate(content.nextReviewDate) }}</p>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="warn" (click)="registerStudy(content)" 
                            [disabled]="studyingContent() === content.id">
                      <mat-icon>check_circle</mat-icon>
                      {{ studyingContent() === content.id ? 'Studying...' : 'Studied Today' }}
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab label="All">
        <div class="p-4">
          @if (loading()) {
            <div class="flex justify-center items-center h-32">
              <p>Loading...</p>
            </div>
          } @else if (allContents().length === 0) {
            <div class="text-center p-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">description</mat-icon>
              <p class="text-xl text-gray-600">No content yet</p>
              <p class="text-gray-500">Create subjects and content to start learning</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (content of allContents(); track content.id) {
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
                      <p><strong>Subject:</strong> {{ getSubjectName(content.subjectId) }}</p>
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
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="registerStudy(content)" 
                            [disabled]="studyingContent() === content.id">
                      <mat-icon>check_circle</mat-icon>
                      {{ studyingContent() === content.id ? 'Studying...' : 'Studied Today' }}
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class ReviewComponent implements OnInit {
  private contentService = inject(ContentService);
  private subjectService = inject(SubjectService);
  private firebaseService = inject(FirebaseService);

  loading = signal(true);
  dueToday = signal<Content[]>([]);
  overdue = signal<Content[]>([]);
  allContents = signal<Content[]>([]);
  studyingContent = signal<string | null>(null);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    
    await this.subjectService.loadAll();
    
    const [today, overdueList, all] = await Promise.all([
      this.contentService.getDueToday(),
      this.contentService.getOverdue(),
      this.loadAllContents()
    ]);
    
    this.dueToday.set(today);
    this.overdue.set(overdueList);
    this.allContents.set(all);
    
    this.loading.set(false);
  }

  async loadAllContents(): Promise<Content[]> {
    await this.contentService.loadAll();
    return this.contentService.contents();
  }

  async registerStudy(content: Content) {
    this.studyingContent.set(content.id);
    try {
      await this.contentService.registerStudy(content.id);
      await this.loadData();
    } finally {
      this.studyingContent.set(null);
    }
  }

  getSubjectName(subjectId: string): string {
    const subject = this.subjectService.subjects().find(s => s.id === subjectId);
    return subject?.name || 'Unknown';
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
