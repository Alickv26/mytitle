import { create } from 'zustand'
import type { UserProfile } from '../types'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '../lib/firebase'

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
  initialized: boolean
  setUser: (user: UserProfile | null) => void
  setInitialized: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  uploadProfilePhoto: (file: File) => Promise<string>
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>
  completeOnboarding: (data: { displayName: string; title: string; industry: string; photoFile?: File }) => Promise<void>
  makeAdmin: () => Promise<void>
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30) + '-' + Date.now().toString(36)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  setUser: (user) => set({ user }),
  setInitialized: () => set({ initialized: true }),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      const uid = auth.currentUser?.uid
      if (uid) {
        const profile = await get().fetchUserProfile(uid)
        set({ user: profile, loading: false })
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null })
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      
      // Send email verification
      await sendEmailVerification(cred.user)
      
      const publicSlug = generateSlug(name)
      const userProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        photoURL: null,
        tier: 'free',
        role: 'user',
        createdAt: new Date().toISOString(),
        publicSlug,
        isPublic: false,
        showContactForm: true,
        showSocialLinks: true,
        portfolioPublished: false
      }
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp()
      })
      
      set({ user: userProfile, loading: false })
    } catch (err: unknown) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      
      let profile = await get().fetchUserProfile(cred.user.uid)
      
      if (!profile) {
        const name = cred.user.displayName || 'User'
        const publicSlug = generateSlug(name)
        profile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: cred.user.photoURL,
          tier: 'free',
          role: 'user',
          createdAt: new Date().toISOString(),
          publicSlug,
          isPublic: false,
          showContactForm: true,
          showSocialLinks: true,
          portfolioPublished: false
        }
        await setDoc(doc(db, 'users', cred.user.uid), {
          ...profile,
          createdAt: serverTimestamp()
        })
      }
      
      set({ user: profile, loading: false })
    } catch (err: unknown) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  logout: async () => {
    await signOut(auth)
    set({ user: null })
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email)
  },

  fetchUserProfile: async (uid) => {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    }
    return null
  },

  updateUserProfile: async (data) => {
    const { user } = get()
    if (!user) return
    
    await setDoc(doc(db, 'users', user.uid), data, { merge: true })
    set({ user: { ...user, ...data } })
  },

  uploadProfilePhoto: async (file) => {
    const { user } = get()
    if (!user) throw new Error('Not authenticated')
    
    const storageRef = ref(storage, `profile-photos/${user.uid}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    
    await get().updateUserProfile({ photoURL: url })
    return url
  },

  completeOnboarding: async (data) => {
    const { user } = get()
    if (!user) return

    let photoURL = user.photoURL
    if (data.photoFile) {
      photoURL = await get().uploadProfilePhoto(data.photoFile)
    }

    await get().updateUserProfile({
      displayName: data.displayName,
      title: data.title,
      industry: data.industry,
      photoURL
    })
  },

  makeAdmin: async () => {
    const { user } = get()
    if (!user) return
    
    await setDoc(doc(db, 'users', user.uid), { role: 'admin' }, { merge: true })
    set({ user: { ...user, role: 'admin' } })
  }
}))
