import { Injectable, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
  Timestamp,
  DocumentData,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private db: Firestore;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app);
  }

  getFirestore(): Firestore {
    return this.db;
  }

  collection(path: string): CollectionReference<DocumentData> {
    return collection(this.db, path);
  }

  doc(path: string): DocumentReference<DocumentData> {
    return doc(this.db, path);
  }

  async getAll<T>(collectionPath: string, ...constraints: QueryConstraint[]): Promise<T[]> {
    const collectionRef = collection(this.db, collectionPath);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async getById<T>(collectionPath: string, id: string): Promise<T | null> {
    const docRef = doc(this.db, collectionPath, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  async create<T>(collectionPath: string, data: Partial<T>): Promise<string> {
    const collectionRef = collection(this.db, collectionPath);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.db, collectionPath, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  async delete(collectionPath: string, id: string): Promise<void> {
    const docRef = doc(this.db, collectionPath, id);
    await deleteDoc(docRef);
  }

  createTimestamp(date?: Date): Timestamp {
    return date ? Timestamp.fromDate(date) : Timestamp.now();
  }

  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }
}
