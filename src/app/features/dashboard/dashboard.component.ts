import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { SubjectFormDialogComponent } from '../subjects/subject-form-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styles: [`
    :host {
      display: block;
    }
    
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    
    .material-fill {
      font-variation-settings: 'FILL' 1;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  loading = signal(true);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    await this.dashboardService.loadDashboardData();
    this.loading.set(false);
  }

  getUserName(): string {
    // TODO: Get from user service/auth
    return 'Alex';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }

  getStreak(): number {
    // TODO: Calculate from study history
    return 14;
  }

  startReviewSession() {
    this.router.navigate(['/review']);
  }

  navigateToSubject(subjectId: string) {
    this.router.navigate(['/subjects', subjectId]);
  }

  viewAllSubjects() {
    this.router.navigate(['/subjects']);
  }

  openCreateSubjectDialog() {
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
}
