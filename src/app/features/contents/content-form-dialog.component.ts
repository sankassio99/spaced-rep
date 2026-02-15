import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from './content.service';
import { Content } from '../../shared/models/content.model';

interface DialogData {
  mode: 'create' | 'edit';
  content?: Content;
  subjectId: string;
}

@Component({
  selector: 'app-content-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Content' : 'Edit Content' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field>
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" required>
          @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
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
export class ContentFormDialogComponent {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);
  dialogRef = inject(MatDialogRef<ContentFormDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup;
  submitting = false;

  constructor() {
    this.form = this.fb.group({
      title: [this.data.content?.title || '', Validators.required],
      description: [this.data.content?.description || '']
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
        await this.contentService.create({
          ...value,
          subjectId: this.data.subjectId
        });
      } else if (this.data.content) {
        await this.contentService.update(this.data.content.id, value);
      }
      
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error saving content:', error);
      this.submitting = false;
    }
  }
}
