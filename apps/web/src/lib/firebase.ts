'use client'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth as getAuthInternal,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let auth: Auth | undefined

function initFirebaseIfNeeded() {
  // Only initialize in browser/runtime where window is available
  if (typeof window === 'undefined') return

  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    // Do not throw on server; just warn. Client-side code will show clearer errors if used.
    console.warn('Firebase config incomplete: set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in .env.local')
    return
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig as any)
  } else {
    app = getApps()[0]
  }

  auth = getAuthInternal(app)
}

initFirebaseIfNeeded()

export function getAuth() {
  if (!auth) throw new Error('Firebase Auth not initialized. Ensure you are in the browser and have set NEXT_PUBLIC_FIREBASE_* env vars.')
  return auth
}

const provider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  if (typeof window === 'undefined') throw new Error('signInWithGoogle must be called in the browser')
  const a = getAuth()
  return signInWithPopup(a, provider)
}

export const signOutFirebase = async () => {
  const a = getAuth()
  return fbSignOut(a)
}

export const onAuthStateChanged = (cb: (u: User | null) => void) => {
  if (typeof window === 'undefined') {
    // server side: noop and return cleanup
    return () => {}
  }
  const a = getAuth()
  return fbOnAuthStateChanged(a, cb)
}

export type { User }

export default null
