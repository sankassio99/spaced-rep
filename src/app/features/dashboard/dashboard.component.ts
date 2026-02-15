import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { SubjectFormDialogComponent } from '../subjects/subject-form-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-background-light pb-20">
      <!-- Header Section -->
      <header class="flex items-center bg-white p-4 sticky top-0 z-10 border-b border-primary/10">
        <div class="flex size-10 shrink-0 items-center mr-3">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20 bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
            {{ getUserInitials() }}
          </div>
        </div>
        <div class="flex-1">
          <h1 class="text-[#111418] text-lg font-bold leading-tight tracking-tight">
            {{ dashboardService.getGreeting() }}, {{ getUserName() }}!
          </h1>
          <p class="text-primary text-sm font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-base material-fill">local_fire_department</span>
            {{ getStreak() }} Day Streak
          </p>
        </div>
        <button class="text-[#637588] hover:bg-primary/5 p-2 rounded-full transition-colors">
          <span class="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <!-- Hero Review Card -->
      <div class="p-4">
        <div class="relative overflow-hidden flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-primary text-white p-6">
          <!-- Decorative background elements -->
          <div class="absolute top-0 right-0 -mr-8 -mt-8 size-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute bottom-0 left-0 -ml-4 -mb-4 size-24 bg-black/10 rounded-full blur-xl"></div>
          
          <div class="relative z-10">
            <h2 class="text-white text-xl font-bold leading-tight mb-2">Ready to Review</h2>
            <p class="text-white/90 text-base font-normal mb-6">
              You have <span class="font-bold underline decoration-white/50 underline-offset-4">{{ dashboardService.stats().dueToday }} cards</span> waiting for you today.
            </p>
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-white/70 text-xs uppercase tracking-wider font-bold">Daily Goal</span>
                <span class="text-white text-sm font-medium">{{ dashboardService.stats().dueToday }} / {{ dashboardService.stats().dailyGoal }} cards</span>
              </div>
              <button 
                (click)="startReviewSession()"
                class="flex min-w-30 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-white text-primary text-sm font-bold shadow-sm active:scale-95 transition-all">
                Start Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subjects Section -->
      <div class="px-4 py-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[#111418] text-xl font-bold leading-tight">My Subjects</h2>
          <button 
            (click)="viewAllSubjects()"
            class="text-primary text-sm font-bold hover:underline">
            View All
          </button>
        </div>
        
        @if (loading()) {
          <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        } @else if (dashboardService.subjectsWithStats().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <span class="material-symbols-outlined text-6xl text-[#637588] mb-4">folder_open</span>
            <p class="text-[#637588] text-base mb-2">No subjects yet</p>
            <p class="text-[#637588] text-sm mb-4">Create your first subject to get started</p>
            <button 
              (click)="openCreateSubjectDialog()"
              class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
              Create Subject
            </button>
          </div>
        } @else {
          <div class="flex flex-col gap-3">
            @for (subject of dashboardService.subjectsWithStats(); track subject.id) {
              <button
                (click)="navigateToSubject(subject.id)"
                class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 transition-all hover:border-primary/30 w-full text-left">
                <div class="{{ subject.color }} flex items-center justify-center rounded-lg shrink-0 size-12">
                  <span class="material-symbols-outlined">{{ subject.icon }}</span>
                </div>
                <div class="flex flex-col justify-center flex-1">
                  <p class="text-[#111418] text-base font-bold leading-normal">{{ subject.name }}</p>
                  <p class="text-[#637588] text-xs font-normal">{{ subject.totalCards }} cards total</p>
                </div>
                <div class="flex items-center gap-2">
                  @if (subject.isDone) {
                    <div class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                      DONE
                    </div>
                  } @else {
                    <div class="px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold">
                      {{ subject.dueCards }} DUE
                    </div>
                  }
                  <span class="material-symbols-outlined text-[#637588] text-lg">chevron_right</span>
                </div>
              </button>
            }
          </div>
        }
      </div>

      <!-- Quick Action FAB -->
      <button 
        (click)="openCreateSubjectDialog()"
        class="fixed bottom-24 right-6 size-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-transform z-20">
        <span class="material-symbols-outlined text-3xl">add</span>
      </button>

      <!-- Bottom Navigation Bar -->
      <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pb-6 pt-3 flex justify-between items-center z-30">
        <a class="flex flex-1 flex-col items-center gap-1 text-primary" [routerLink]="['/']">
          <span class="material-symbols-outlined material-fill">home</span>
          <span class="text-[10px] font-bold">Home</span>
        </a>
        <a class="flex flex-1 flex-col items-center gap-1 text-[#637588] hover:text-primary transition-colors" [routerLink]="['/review']">
          <span class="material-symbols-outlined">bar_chart</span>
          <span class="text-[10px] font-medium">Review</span>
        </a>
        <a class="flex flex-1 flex-col items-center gap-1 text-[#637588] hover:text-primary transition-colors" [routerLink]="['/subjects']">
          <span class="material-symbols-outlined">library_books</span>
          <span class="text-[10px] font-medium">Subjects</span>
        </a>
        <button class="flex flex-1 flex-col items-center gap-1 text-[#637588] hover:text-primary transition-colors">
          <span class="material-symbols-outlined">settings</span>
          <span class="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
    </div>
  `,
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
