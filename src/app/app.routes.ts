import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'subjects',
    loadComponent: () => import('./features/subjects/subjects.component').then(m => m.SubjectsComponent)
  },
  {
    path: 'subjects/:id',
    loadComponent: () => import('./features/subject-detail/subject-detail.component').then(m => m.SubjectDetailComponent)
  },
  {
    path: 'review',
    loadComponent: () => import('./features/review/review.component').then(m => m.ReviewComponent)
  }
];
