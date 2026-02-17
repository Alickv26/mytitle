import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyAZa1tD9mDnwsMRacattEs5rcghDIcCm3w",
  authDomain: "my-title-771.firebaseapp.com",
  projectId: "my-title-771",
  storageBucket: "my-title-771.firebasestorage.app",
  messagingSenderId: "657171856993",
  appId: "1:657171856993:web:a434d65471c5a68c0eb420"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
