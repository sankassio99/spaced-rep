import { Injectable, signal, computed, inject } from '@angular/core';
import { FirebaseService } from '../../infra/firebase.service';
import { Subject, CreateSubject, UpdateSubject } from '../../shared/models/subject.model';
import { orderBy, QueryConstraint } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private firebaseService = inject(FirebaseService);
  private readonly COLLECTION = 'subjects';

  private subjectsSignal = signal<Subject[]>([]);
  subjects = this.subjectsSignal.asReadonly();

  async loadAll(): Promise<void> {
    console.log('Loading all subjects...');
    const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
    const subjects = await this.firebaseService.getAll<Subject>(this.COLLECTION, ...constraints);
    console.log('Subjects loaded:', subjects.length);
    this.subjectsSignal.set(subjects);
  }

  async getById(id: string): Promise<Subject | null> {
    return this.firebaseService.getById<Subject>(this.COLLECTION, id);
  }

  async create(data: CreateSubject): Promise<string> {
    console.log('Creating subject:', data);
    const id = await this.firebaseService.create<CreateSubject>(this.COLLECTION, data);
    console.log('Subject created with ID:', id);
    await this.loadAll();
    return id;
  }

  async update(id: string, data: UpdateSubject): Promise<void> {
    await this.firebaseService.update<UpdateSubject>(this.COLLECTION, id, data);
    await this.loadAll();
  }

  async delete(id: string): Promise<void> {
    await this.firebaseService.delete(this.COLLECTION, id);
    await this.loadAll();
  }
}
