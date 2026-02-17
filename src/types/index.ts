export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  title?: string
  industry?: string
  tier: 'free' | 'premium'
  role: 'user' | 'admin'
  createdAt: string
  publicSlug?: string
  isPublic?: boolean
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
    website?: string
    dribbble?: string
    behance?: string
  }
  featuredCvId?: string
  showContactForm?: boolean
  showSocialLinks?: boolean
  portfolioPublished?: boolean
}

export type CVSectionType = 
  | 'personalInfo'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'languages'
  | 'references'

export interface PersonalInfoEntry {
  id?: string
  fullName: string
  email: string
  phone?: string
  location?: string
  website?: string
  linkedin?: string
}

export interface SummaryEntry {
  id?: string
  content: string
}

export interface ExperienceEntry {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate: string
  current: boolean
  description?: string
}

export interface SkillsEntry {
  id: string
  category: string
  skills: string[]
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  date: string
  expiryDate?: string
  credentialId?: string
  url?: string
}

export interface ProjectEntry {
  id: string
  name: string
  description: string
  technologies?: string[]
  url?: string
  startDate?: string
  endDate?: string
}

export interface LanguageEntry {
  id: string
  language: string
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic'
}

export interface ReferenceEntry {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone?: string
  relationship: string
}

export type CVEntry = 
  | PersonalInfoEntry
  | SummaryEntry
  | ExperienceEntry
  | EducationEntry
  | SkillsEntry
  | CertificationEntry
  | ProjectEntry
  | LanguageEntry
  | ReferenceEntry

export interface CVSection {
  id: string
  type: CVSectionType
  title: string
  entries: CVEntry[]
  order: number
}

export interface CV {
  cvId: string
  title: string
  templateId: string
  customization: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    headingFont: string
    bodyFont: string
  }
  sections: CVSection[]
  aiChatHistory: AIChatMessage[]
  lastUpdated: string
  createdAt: string
  userId: string
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sectionType?: CVSectionType
}

export interface CVTemplate {
  id: string
  name: string
  thumbnail: string
  isFree: boolean
  category: string
  component: string
}

export interface ContactMessage {
  id: string
  fromName: string
  fromEmail: string
  message: string
  timestamp: string
}

export const DEFAULT_CV_CUSTOMIZATION = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1e293b',
  accentColor: '#f59e0b',
  headingFont: 'Inter',
  bodyFont: 'Inter'
}

export const AVAILABLE_FONTS = [
  { name: 'Inter', label: 'Inter' },
  { name: 'Roboto', label: 'Roboto' },
  { name: 'Open Sans', label: 'Open Sans' },
  { name: 'Lato', label: 'Lato' },
  { name: 'Montserrat', label: 'Montserrat' },
  { name: 'Poppins', label: 'Poppins' },
  { name: 'Playfair Display', label: 'Playfair Display' },
  { name: 'Merriweather', label: 'Merriweather' },
  { name: 'Source Sans Pro', label: 'Source Sans Pro' },
  { name: 'Raleway', label: 'Raleway' },
  { name: 'Nunito', label: 'Nunito' },
  { name: 'PT Sans', label: 'PT Sans' },
  { name: 'Oswald', label: 'Oswald' },
  { name: 'Work Sans', label: 'Work Sans' },
  { name: 'Crimson Text', label: 'Crimson Text' },
]

export const SECTION_PROMPTS: Record<CVSectionType, string> = {
  personalInfo: "Let's start with your personal information. What's your full name, email address, and phone number? Feel free to add your location, LinkedIn profile, or personal website if you'd like.",
  summary: "Now let's add a professional summary. This is a brief 2-3 sentence overview of who you are and what you bring to the table. Tell me about your professional background and key strengths.",
  experience: "Tell me about your work experience. Start with your most recent or current role — what company did you work for, what was your position, and when did you work there? You can describe your responsibilities and achievements.",
  education: "Let's add your education history. What degrees have you earned, from which institutions, and when? You can include any relevant coursework or achievements.",
  skills: "What skills would you like to highlight? You can list technical skills, tools, programming languages, soft skills, or any other relevant abilities. Group them however makes sense to you.",
  certifications: "Do you have any certifications or awards? These could be professional certifications, industry awards, or other recognitions.",
  projects: "Tell me about any notable projects you've worked on. What was the project, what technologies or methods did you use, and what was the outcome?",
  languages: "What languages do you speak and at what proficiency level?",
  references: "Do you have professional references you'd like to include? (Name, title, company, contact info)",
}
