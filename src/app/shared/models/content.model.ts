import { Timestamp } from 'firebase/firestore';

export interface StudyHistoryEntry {
  date: Timestamp;
}

export interface Content {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  reviewLevel: number;
  nextReviewDate: Timestamp;
  studyHistory: StudyHistoryEntry[];
  totalReviews: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateContent {
  subjectId: string;
  title: string;
  description?: string;
}

export interface UpdateContent {
  subjectId?: string;
  title?: string;
  description?: string;
}

export type ContentStatus = 'on-track' | 'due-today' | 'overdue' | 'completed';
