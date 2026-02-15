import { Timestamp } from 'firebase/firestore';

export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateSubject {
  name: string;
  description?: string;
}

export interface UpdateSubject {
  name?: string;
  description?: string;
}
