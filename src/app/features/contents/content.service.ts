import { Injectable, signal, computed, inject } from '@angular/core';
import { FirebaseService } from '../../infra/firebase.service';
import { Content, CreateContent, UpdateContent, ContentStatus } from '../../shared/models/content.model';
import { orderBy, where, QueryConstraint, Timestamp } from 'firebase/firestore';
import { calculateNextReviewDate, getDaysOverdue, SPACED_REPETITION_INTERVALS } from '../../shared/utils/spaced-repetition.util';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private firebaseService = inject(FirebaseService);
  private readonly COLLECTION = 'contents';

  private contentsSignal = signal<Content[]>([]);
  contents = this.contentsSignal.asReadonly();

  async loadAll(): Promise<void> {
    const constraints: QueryConstraint[] = [orderBy('nextReviewDate', 'asc')];
    const contents = await this.firebaseService.getAll<Content>(this.COLLECTION, ...constraints);
    this.contentsSignal.set(contents);
  }

  async loadBySubject(subjectId: string): Promise<void> {
    const constraints: QueryConstraint[] = [
      where('subjectId', '==', subjectId),
      orderBy('nextReviewDate', 'asc')
    ];
    const contents = await this.firebaseService.getAll<Content>(this.COLLECTION, ...constraints);
    this.contentsSignal.set(contents);
  }

  async getDueToday(): Promise<Content[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayTimestamp = this.firebaseService.createTimestamp(today);

    const constraints: QueryConstraint[] = [
      where('nextReviewDate', '<=', todayTimestamp),
      orderBy('nextReviewDate', 'asc')
    ];
    return this.firebaseService.getAll<Content>(this.COLLECTION, ...constraints);
  }

  async getOverdue(): Promise<Content[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = this.firebaseService.createTimestamp(today);

    const constraints: QueryConstraint[] = [
      where('nextReviewDate', '<', todayTimestamp),
      orderBy('nextReviewDate', 'asc')
    ];
    return this.firebaseService.getAll<Content>(this.COLLECTION, ...constraints);
  }

  async getById(id: string): Promise<Content | null> {
    return this.firebaseService.getById<Content>(this.COLLECTION, id);
  }

  async create(data: CreateContent): Promise<string> {
    console.log('Creating content:', data);
    const nextReviewDate = calculateNextReviewDate(0);
    const contentData = {
      ...data,
      reviewLevel: 0,
      nextReviewDate: this.firebaseService.createTimestamp(nextReviewDate),
      studyHistory: [],
      totalReviews: 0
    };
    console.log('Content data prepared:', contentData);

    const id = await this.firebaseService.create(this.COLLECTION, contentData);
    console.log('Content created with ID:', id);
    await this.loadAll();
    return id;
  }

  async update(id: string, data: UpdateContent): Promise<void> {
    await this.firebaseService.update<UpdateContent>(this.COLLECTION, id, data);
    await this.loadAll();
  }

  async delete(id: string): Promise<void> {
    await this.firebaseService.delete(this.COLLECTION, id);
    await this.loadAll();
  }

  async registerStudy(id: string): Promise<void> {
    console.log('Registering study for content:', id);
    const content = await this.getById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    const newReviewLevel = content.reviewLevel + 1;
    const nextReviewDate = calculateNextReviewDate(newReviewLevel);
    const newHistoryEntry = {
      date: Timestamp.now()
    };

    const updateData = {
      reviewLevel: newReviewLevel,
      nextReviewDate: this.firebaseService.createTimestamp(nextReviewDate),
      studyHistory: [...content.studyHistory, newHistoryEntry],
      totalReviews: content.totalReviews + 1
    };
    console.log('Updating content with data:', updateData);

    await this.firebaseService.update(this.COLLECTION, id, updateData);
    console.log('Study registered successfully');
    await this.loadAll();
  }

  getContentStatus(content: Content): ContentStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = this.firebaseService.timestampToDate(content.nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0);

    const maxReviewLevel = SPACED_REPETITION_INTERVALS.length;
    if (content.reviewLevel >= maxReviewLevel) {
      return 'completed';
    }

    if (reviewDate < today) {
      return 'overdue';
    }

    if (reviewDate.getTime() === today.getTime()) {
      return 'due-today';
    }

    return 'on-track';
  }

  getOverdueDays(content: Content): number {
    const reviewDate = this.firebaseService.timestampToDate(content.nextReviewDate);
    return getDaysOverdue(reviewDate);
  }
}
