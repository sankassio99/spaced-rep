import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/subjects',
    pathMatch: 'full'
  },
  {
    path: 'subjects',
    loadComponent: () => import('./features/subjects/subjects.component').then(m => m.SubjectsComponent)
  },
  {
    path: 'subjects/:id',
    loadComponent: () => import('./features/subjects/subject-detail.component').then(m => m.SubjectDetailComponent)
  },
  {
    path: 'review',
    loadComponent: () => import('./features/review/review.component').then(m => m.ReviewComponent)
  }
];
