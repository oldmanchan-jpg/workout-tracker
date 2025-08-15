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
  console.log('Firestore deleteWorkout called with:', { uid, id })
  
  if (!uid || !id) {
    console.error('Invalid parameters for deleteWorkout:', { uid, id })
    throw new Error('Invalid user ID or workout ID')
  }
  
  try {
    // Check if this is a Firestore ID (20 chars) or old UUID (36 chars with hyphens)
    const isFirestoreId = id.length === 20 && !id.includes('-')
    const isUUID = id.length === 36 && id.includes('-')
    
    console.log('ID analysis:', { id, length: id.length, isFirestoreId, isUUID })
    
    if (isFirestoreId) {
      // Standard Firestore deletion
      const ref = doc(db, 'users', uid, 'workouts', id)
      console.log('Document reference created:', ref.path)
      await deleteDoc(ref)
      console.log('Document successfully deleted')
    } else if (isUUID) {
      // This is an old workout with UUID - we need to find it by querying
      console.log('Attempting to delete old UUID-based workout')
      const workoutsRef = collection(db, 'users', uid, 'workouts')
      const q = query(workoutsRef)
      const snapshot = await getDocs(q)
      
      let found = false
      for (const doc of snapshot.docs) {
        const data = doc.data()
        // Check if this document has the UUID as a field (old system)
        if (data.id === id || doc.id === id) {
          console.log('Found old workout document:', doc.id)
          await deleteDoc(doc.ref)
          console.log('Old workout document deleted')
          found = true
          break
        }
      }
      
      if (!found) {
        throw new Error('Workout with UUID not found in database')
      }
    } else {
      throw new Error('Invalid workout ID format')
    }
  } catch (error) {
    console.error('Error in deleteWorkout:', error)
    throw error
  }
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
