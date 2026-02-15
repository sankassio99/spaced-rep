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
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SubjectFormDialogComponent } from './subject-form-dialog.component';

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
  templateUrl: './subjects.component.html',
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
