import { create } from 'zustand'
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CV, CVSection, CVSectionType, CVEntry, AIChatMessage } from '@/types'
import { DEFAULT_CV_CUSTOMIZATION } from '@/types'

interface CVState {
  currentCV: CV | null
  cvs: CV[]
  loading: boolean
  error: string | null
  isAIChatOpen: boolean
  
  setCurrentCV: (cv: CV | null) => void
  createNewCV: (userId: string, title: string) => Promise<string>
  loadCV: (userId: string, cvId: string) => Promise<void>
  loadUserCVs: (userId: string) => Promise<void>
  saveCV: () => Promise<void>
  deleteCV: (userId: string, cvId: string) => Promise<void>
  
  updateCVTitle: (title: string) => void
  updateCVTemplate: (templateId: string) => void
  updateCVCustomization: (customization: Partial<CV['customization']>) => void
  
  addSection: (type: CVSectionType) => void
  updateSection: (sectionId: string, updates: Partial<CVSection>) => void
  deleteSection: (sectionId: string) => void
  reorderSections: (sections: CVSection[]) => void
  
  addEntry: (sectionId: string, entry: CVEntry) => void
  updateEntry: (sectionId: string, entryId: string, updates: Partial<CVEntry>) => void
  deleteEntry: (sectionId: string, entryId: string) => void
  
  addAIChatMessage: (message: Omit<AIChatMessage, 'id' | 'timestamp'>) => void
  toggleAIChat: (isOpen?: boolean) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const convertTimestampsToStrings = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  
  // Check if it's a Firestore Timestamp (has toDate method)
  if (typeof obj === 'object' && obj !== null && 'toDate' in obj && typeof (obj as { toDate: unknown }).toDate === 'function') {
    return (obj as { toDate: () => Date }).toDate().toISOString()
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestampsToStrings(item))
  }
  
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    result[key] = convertTimestampsToStrings((obj as Record<string, unknown>)[key])
  }
  return result
}

const createEmptySections = (): CVSection[] => [
  { id: generateId(), type: 'personalInfo', title: 'Personal Information', entries: [], order: 0 },
  { id: generateId(), type: 'summary', title: 'Professional Summary', entries: [], order: 1 },
  { id: generateId(), type: 'experience', title: 'Work Experience', entries: [], order: 2 },
  { id: generateId(), type: 'education', title: 'Education', entries: [], order: 3 },
  { id: generateId(), type: 'skills', title: 'Skills', entries: [], order: 4 },
]

export const useCVStore = create<CVState>((set, get) => ({
  currentCV: null,
  cvs: [],
  loading: false,
  error: null,
  isAIChatOpen: false,

  setCurrentCV: (cv) => set({ currentCV: cv }),

  createNewCV: async (userId: string, title: string) => {
    set({ loading: true, error: null })
    try {
      const cvId = generateId()
      const newCV: CV = {
        cvId,
        title,
        templateId: 'classic',
        customization: { ...DEFAULT_CV_CUSTOMIZATION },
        sections: createEmptySections(),
        aiChatHistory: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId
      }

      await setDoc(doc(db, `users/${userId}/cvs`, cvId), {
        ...newCV,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      })

      set({ currentCV: newCV, loading: false })
      return cvId
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
      throw err
    }
  },

  loadCV: async (userId: string, cvId: string) => {
    set({ loading: true, error: null })
    try {
      const docRef = doc(db, `users/${userId}/cvs`, cvId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const cvData = docSnap.data()
        // Convert Firestore Timestamps to ISO strings
        const processedCV = convertTimestampsToStrings(cvData) as CV
        set({ currentCV: processedCV, loading: false })
      } else {
        set({ error: 'CV not found', loading: false })
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  loadUserCVs: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const q = query(collection(db, `users/${userId}/cvs`))
      const snapshot = await getDocs(q)
      const cvs: CV[] = []
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const processed = convertTimestampsToStrings(data) as CV
        processed.cvId = doc.id
        cvs.push(processed)
      })
      set({ cvs, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  saveCV: async () => {
    const { currentCV } = get()
    if (!currentCV) return

    set({ loading: true })
    try {
      await setDoc(doc(db, `users/${currentCV.userId}/cvs`, currentCV.cvId), {
        ...currentCV,
        lastUpdated: serverTimestamp()
      }, { merge: true })
      set({ loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  deleteCV: async (userId: string, cvId: string) => {
    set({ loading: true })
    try {
      await deleteDoc(doc(db, `users/${userId}/cvs`, cvId))
      // Update local state to remove the deleted CV
      const { cvs } = get()
      const updatedCVs = cvs.filter(cv => cv.cvId !== cvId)
      set({ cvs: updatedCVs, currentCV: null, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  updateCVTitle: (title: string) => {
    const { currentCV } = get()
    if (!currentCV) return
    set({ currentCV: { ...currentCV, title } })
  },

  updateCVTemplate: (templateId: string) => {
    const { currentCV } = get()
    if (!currentCV) return
    set({ currentCV: { ...currentCV, templateId } })
  },

  updateCVCustomization: (customization) => {
    const { currentCV } = get()
    if (!currentCV) return
    set({ 
      currentCV: { 
        ...currentCV, 
        customization: { ...currentCV.customization, ...customization } 
      } 
    })
  },

  addSection: (type: CVSectionType) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const titles: Record<CVSectionType, string> = {
      personalInfo: 'Personal Information',
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      certifications: 'Certifications & Awards',
      projects: 'Projects',
      languages: 'Languages',
      references: 'References'
    }
    
    const newSection: CVSection = {
      id: generateId(),
      type,
      title: titles[type],
      entries: [],
      order: currentCV.sections.length
    }
    
    set({ 
      currentCV: { 
        ...currentCV, 
        sections: [...currentCV.sections, newSection] 
      } 
    })
  },

  updateSection: (sectionId: string, updates: Partial<CVSection>) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const sections = currentCV.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    )
    set({ currentCV: { ...currentCV, sections } })
  },

  deleteSection: (sectionId: string) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const sections = currentCV.sections.filter(s => s.id !== sectionId)
    set({ currentCV: { ...currentCV, sections } })
  },

  reorderSections: (sections: CVSection[]) => {
    const { currentCV } = get()
    if (!currentCV) return
    set({ currentCV: { ...currentCV, sections } })
  },

  addEntry: (sectionId: string, entry: CVEntry) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const sections = currentCV.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, entries: [...s.entries, { ...entry, id: generateId() }] }
      }
      return s
    })
    set({ currentCV: { ...currentCV, sections } })
  },

  updateEntry: (sectionId: string, entryId: string, updates: Partial<CVEntry>) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const sections = currentCV.sections.map(s => {
      if (s.id === sectionId) {
        const entries = s.entries.map(e => 
          e.id === entryId ? { ...e, ...updates } : e
        )
        return { ...s, entries }
      }
      return s
    })
    set({ currentCV: { ...currentCV, sections } })
  },

  deleteEntry: (sectionId: string, entryId: string) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const sections = currentCV.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, entries: s.entries.filter(e => e.id !== entryId) }
      }
      return s
    })
    set({ currentCV: { ...currentCV, sections } })
  },

  addAIChatMessage: (message) => {
    const { currentCV } = get()
    if (!currentCV) return
    
    const newMessage: AIChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString()
    }
    
    set({ 
      currentCV: { 
        ...currentCV, 
        aiChatHistory: [...currentCV.aiChatHistory, newMessage] 
      } 
    })
  },

  toggleAIChat: (isOpen?: boolean) => {
    const { isAIChatOpen } = get()
    set({ isAIChatOpen: isOpen ?? !isAIChatOpen })
  }
}))
