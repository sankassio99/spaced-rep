import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SubjectService } from './subject.service';
import { Subject } from '../../shared/models/subject.model';

interface DialogData {
  mode: 'create' | 'edit';
  subject?: Subject;
}

@Component({
  selector: 'app-subject-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Subject' : 'Edit Subject' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" required>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="flex justify-end gap-2">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!form.valid || submitting">
        {{ submitting ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `
})
export class SubjectFormDialogComponent {
  private fb = inject(FormBuilder);
  private subjectService = inject(SubjectService);
  dialogRef = inject(MatDialogRef<SubjectFormDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup;
  submitting = false;

  constructor() {
    this.form = this.fb.group({
      name: [this.data.subject?.name || '', Validators.required],
      description: [this.data.subject?.description || '']
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    if (!this.form.valid) return;

    this.submitting = true;
    try {
      const value = this.form.value;
      
      if (this.data.mode === 'create') {
        await this.subjectService.create(value);
      } else if (this.data.subject) {
        await this.subjectService.update(this.data.subject.id, value);
      }
      
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error saving subject:', error);
      this.submitting = false;
    }
  }
}
