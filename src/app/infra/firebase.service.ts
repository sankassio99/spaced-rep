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
    try {
      const collectionRef = collection(this.db, collectionPath);
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  async getById<T>(collectionPath: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionPath, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return null;
      }
      return { id: snapshot.id, ...snapshot.data() } as T;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  async create<T>(collectionPath: string, data: Partial<T>): Promise<string> {
    try {
      const collectionRef = collection(this.db, collectionPath);
      const docData = {
        ...data as Record<string, any>,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(collectionRef, docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(this.db, collectionPath, id);
      const updateData = {
        ...data as Record<string, any>,
        updatedAt: Timestamp.now()
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async delete(collectionPath: string, id: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  createTimestamp(date?: Date): Timestamp {
    return date ? Timestamp.fromDate(date) : Timestamp.now();
  }

  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }
}
