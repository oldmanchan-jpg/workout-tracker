// src/lib/firestore.ts
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { Template, Workout } from '@/types'

export const userCol = (uid: string, name: string) => collection(db, 'users', uid, name)

// --- Templates
export async function createTemplate(uid: string, t: Omit<Template, 'id' | 'userId'>) {
  const docRef = await addDoc(userCol(uid, 'templates'), {
    ...t,
    userId: uid,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function listTemplates(uid: string) {
  const snap = await getDocs(query(userCol(uid, 'templates'), orderBy('name')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Template[]
}

export async function updateTemplate(uid: string, id: string, patch: Partial<Template>) {
  const ref = doc(db, 'users', uid, 'templates', id)
  await updateDoc(ref, patch as any)
}

export async function deleteTemplate(uid: string, id: string) {
  const ref = doc(db, 'users', uid, 'templates', id)
  await deleteDoc(ref)
}

// --- Workouts
export async function saveWorkout(uid: string, w: Omit<Workout, 'id' | 'userId'>) {
  const docRef = await addDoc(userCol(uid, 'workouts'), {
    ...w,
    userId: uid,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function listWorkouts(uid: string) {
  const snap = await getDocs(query(userCol(uid, 'workouts'), orderBy('date', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Workout[]
}

export async function updateWorkout(uid: string, id: string, patch: Partial<Workout>) {
  const ref = doc(db, 'users', uid, 'workouts', id)
  await updateDoc(ref, patch as any)
}

export async function deleteWorkout(uid: string, id: string) {
  const ref = doc(db, 'users', uid, 'workouts', id)
  await deleteDoc(ref)
}

export async function seedDefaultTemplate(uid: string) {
  const defaults: Omit<Template, 'id' | 'userId'> = {
    name: 'Full Body A',
    exercises: [
      { name: 'Squat', sets: 3, reps: 5 },
      { name: 'Bench Press', sets: 3, reps: 5 },
      { name: 'Row', sets: 3, reps: 8 },
    ],
  }
  const id = await createTemplate(uid, defaults)
  return id
}
