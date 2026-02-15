import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { SubjectService } from './subject.service';
import { ContentService } from '../contents/content.service';
import { Subject } from '../../shared/models/subject.model';
import { SubjectFormDialogComponent } from './subject-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-subjects',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatBadgeModule
  ],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Subjects</h1>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        New Subject
      </button>
    </div>

    @if (loading()) {
      <div class="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    } @else if (subjectService.subjects().length === 0) {
      <div class="text-center p-8">
        <mat-icon class="text-6xl text-gray-400 mb-4">folder_off</mat-icon>
        <p class="text-xl text-gray-600">No subjects yet</p>
        <p class="text-gray-500 mb-4">Create your first subject to start organizing your study content</p>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Create Subject
        </button>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (subject of subjectService.subjects(); track subject.id) {
          <mat-card class="cursor-pointer hover:shadow-lg transition-shadow">
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon>folder</mat-icon>
                {{ subject.name }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (subject.description) {
                <p class="text-gray-600 mb-4">{{ subject.description }}</p>
              }
              <div class="flex gap-4 text-sm text-gray-500">
                <span>
                  <strong>Total:</strong> {{ getSubjectStats(subject.id).total }}
                </span>
                <span [class.text-red-600]="getSubjectStats(subject.id).overdue > 0">
                  <strong>Overdue:</strong> {{ getSubjectStats(subject.id).overdue }}
                </span>
              </div>
            </mat-card-content>
            <mat-card-actions class="flex gap-2">
              <button mat-button color="primary" [routerLink]="['/subjects', subject.id]">
                <mat-icon>visibility</mat-icon>
                View
              </button>
              <button mat-button (click)="openEditDialog(subject)">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button color="warn" (click)="confirmDelete(subject)">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        }
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
export class SubjectsComponent implements OnInit {
  subjectService = inject(SubjectService);
  private contentService = inject(ContentService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  loading = signal(true);
  subjectStats = signal<Map<string, { total: number; overdue: number }>>(new Map());

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    await this.subjectService.loadAll();
    await this.loadStats();
    this.loading.set(false);
  }

  async loadStats() {
    const allContents = await this.contentService.getDueToday();
    const overdueContents = await this.contentService.getOverdue();
    
    const stats = new Map<string, { total: number; overdue: number }>();
    
    for (const subject of this.subjectService.subjects()) {
      const total = allContents.filter(c => c.subjectId === subject.id).length;
      const overdue = overdueContents.filter(c => c.subjectId === subject.id).length;
      stats.set(subject.id, { total, overdue });
    }
    
    this.subjectStats.set(stats);
  }

  getSubjectStats(subjectId: string) {
    return this.subjectStats().get(subjectId) || { total: 0, overdue: 0 };
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(SubjectFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadData();
      }
    });
  }

  openEditDialog(subject: Subject) {
    const dialogRef = this.dialog.open(SubjectFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', subject }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadData();
      }
    });
  }

  confirmDelete(subject: Subject) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Subject',
        message: `Are you sure you want to delete "${subject.name}"? This will also delete all associated contents.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.deleteSubject(subject.id);
      }
    });
  }

  async deleteSubject(id: string) {
    // Delete all contents first
    await this.contentService.loadBySubject(id);
    const contents = this.contentService.contents();
    for (const content of contents) {
      await this.contentService.delete(content.id);
    }
    
    // Then delete the subject
    await this.subjectService.delete(id);
    await this.loadData();
  }
}
