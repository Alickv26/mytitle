import { useState } from 'react'
import { Plus, Trash2, RefreshCw, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCVStore } from '@/store/cv'
import type { 
  CVSection, 
  CVSectionType, 
  CVEntry,
  PersonalInfoEntry, 
  SummaryEntry,
  ExperienceEntry,
  EducationEntry,
  SkillsEntry,
  CertificationEntry,
  ProjectEntry,
  LanguageEntry,
  ReferenceEntry
} from '@/types'

interface CVSectionEditorProps {
  section: CVSection
  sectionType: CVSectionType
}

export default function CVSectionEditor({ section, sectionType }: CVSectionEditorProps) {
  const { addEntry, updateEntry, deleteEntry } = useCVStore()

  const createEmptyEntry = (type: CVSectionType) => {
    switch (type) {
      case 'personalInfo':
        return { fullName: '', email: '' } as PersonalInfoEntry
      case 'summary':
        return { content: '' } as SummaryEntry
      case 'experience':
        return { 
          id: '', company: '', position: '', startDate: '', endDate: '', current: false, description: '' 
        } as ExperienceEntry
      case 'education':
        return { 
          id: '', institution: '', degree: '', startDate: '', endDate: '', current: false 
        } as EducationEntry
      case 'skills':
        return { id: '', category: 'Technical', skills: [] } as SkillsEntry
      case 'certifications':
        return { 
          id: '', name: '', issuer: '', date: '' 
        } as CertificationEntry
      case 'projects':
        return { id: '', name: '', description: '' } as ProjectEntry
      case 'languages':
        return { id: '', language: '', proficiency: 'intermediate' } as LanguageEntry
      case 'references':
        return { id: '', name: '', title: '', company: '', email: '', relationship: '' } as ReferenceEntry
      default:
        return {} as never
    }
  }

  const handleAddEntry = () => {
    const newEntry = createEmptyEntry(sectionType)
    addEntry(section.id, newEntry)
  }

  const canAddEntry = sectionType !== 'personalInfo' || section.entries.length === 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{section.title}</CardTitle>
        {canAddEntry && (
          <Button size="sm" onClick={handleAddEntry}>
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {section.entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No entries yet. Click "Add Entry" to add data to this section.
          </p>
        ) : (
          section.entries.map((entry, index) => (
            <div key={entry.id || index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  <span className="font-medium">Entry {index + 1}</span>
                </div>
                {sectionType !== 'personalInfo' && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteEntry(section.id, (entry as { id: string }).id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              
              {renderEntryFields(section.type, entry, section.id)}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function renderEntryFields(type: CVSectionType, entry: CVEntry, sectionId: string) {
  const { updateEntry } = useCVStore.getState()
  const entryId = (entry as { id?: string }).id || ''

  const handleChange = (field: string, value: unknown) => {
    if (entryId) {
      updateEntry(sectionId, entryId, { [field]: value })
    }
  }

  switch (type) {
    case 'personalInfo':
      const personalInfo = entry as PersonalInfoEntry
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
              value={personalInfo.fullName} 
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={personalInfo.email} 
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input 
              value={personalInfo.phone || ''} 
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input 
              value={personalInfo.location || ''} 
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input 
              value={personalInfo.website || ''} 
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input 
              value={personalInfo.linkedin || ''} 
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
        </div>
      )

    case 'summary':
      const summary = entry as SummaryEntry
      return (
        <div className="space-y-2">
          <Label>Professional Summary</Label>
          <textarea 
            className="w-full min-h-[120px] px-3 py-2 border rounded-md"
            value={summary.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="A brief summary of your professional background and key strengths..."
          />
        </div>
      )

    case 'experience':
      const exp = entry as ExperienceEntry
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input 
                value={exp.company} 
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input 
                value={exp.position} 
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Job Title"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                value={exp.startDate} 
                onChange={(e) => handleChange('startDate', e.target.value)}
                placeholder="Jan 2020"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                value={exp.endDate} 
                onChange={(e) => handleChange('endDate', e.target.value)}
                placeholder="Present"
                disabled={exp.current}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={exp.current} 
              onChange={(e) => handleChange('current', e.target.checked)}
              className="h-4 w-4"
            />
            <Label className="cursor-pointer">I currently work here</Label>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea 
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              value={exp.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      )

    case 'education':
      const edu = entry as EducationEntry
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input 
                value={edu.institution} 
                onChange={(e) => handleChange('institution', e.target.value)}
                placeholder="University Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input 
                value={edu.degree} 
                onChange={(e) => handleChange('degree', e.target.value)}
                placeholder="Bachelor of Science"
              />
            </div>
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <Input 
                value={edu.field || ''} 
                onChange={(e) => handleChange('field', e.target.value)}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                value={edu.startDate} 
                onChange={(e) => handleChange('startDate', e.target.value)}
                placeholder="Sep 2016"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                value={edu.endDate} 
                onChange={(e) => handleChange('endDate', e.target.value)}
                placeholder="Jun 2020"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={edu.current} 
              onChange={(e) => handleChange('current', e.target.checked)}
              className="h-4 w-4"
            />
            <Label className="cursor-pointer">Currently studying here</Label>
          </div>
        </div>
      )

    case 'skills':
      const skills = entry as SkillsEntry
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input 
              value={skills.category} 
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Programming Languages, Tools, Soft Skills"
            />
          </div>
          <div className="space-y-2">
            <Label>Skills (comma-separated)</Label>
            <Input 
              value={skills.skills.join(', ')} 
              onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()))}
              placeholder="JavaScript, React, Node.js, Python"
            />
          </div>
        </div>
      )

    case 'certifications':
      const cert = entry as CertificationEntry
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Certification Name</Label>
            <Input 
              value={cert.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="AWS Solutions Architect"
            />
          </div>
          <div className="space-y-2">
            <Label>Issuing Organization</Label>
            <Input 
              value={cert.issuer} 
              onChange={(e) => handleChange('issuer', e.target.value)}
              placeholder="Amazon Web Services"
            />
          </div>
          <div className="space-y-2">
            <Label>Date Issued</Label>
            <Input 
              value={cert.date} 
              onChange={(e) => handleChange('date', e.target.value)}
              placeholder="Jan 2023"
            />
          </div>
          <div className="space-y-2">
            <Label>Credential ID</Label>
            <Input 
              value={cert.credentialId || ''} 
              onChange={(e) => handleChange('credentialId', e.target.value)}
              placeholder="ABC123XYZ"
            />
          </div>
        </div>
      )

    case 'projects':
      const proj = entry as ProjectEntry
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input 
                value={proj.name} 
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="E-commerce Platform"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input 
                value={proj.url || ''} 
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea 
              className="w-full min-h-[80px] px-3 py-2 border rounded-md"
              value={proj.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what the project does and your role..."
            />
          </div>
          <div className="space-y-2">
            <Label>Technologies (comma-separated)</Label>
            <Input 
              value={proj.technologies?.join(', ') || ''} 
              onChange={(e) => handleChange('technologies', e.target.value.split(',').map(s => s.trim()))}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
        </div>
      )

    case 'languages':
      const lang = entry as LanguageEntry
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Language</Label>
            <Input 
              value={lang.language} 
              onChange={(e) => handleChange('language', e.target.value)}
              placeholder="English"
            />
          </div>
          <div className="space-y-2">
            <Label>Proficiency</Label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={lang.proficiency}
              onChange={(e) => handleChange('proficiency', e.target.value)}
            >
              <option value="native">Native</option>
              <option value="fluent">Fluent</option>
              <option value="advanced">Advanced</option>
              <option value="intermediate">Intermediate</option>
              <option value="basic">Basic</option>
            </select>
          </div>
        </div>
      )

    case 'references':
      const ref = entry as ReferenceEntry
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={ref.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={ref.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Senior Manager"
            />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input 
              value={ref.company} 
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="ABC Corporation"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={ref.email} 
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input 
              value={ref.phone || ''} 
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="space-y-2">
            <Label>Relationship</Label>
            <Input 
              value={ref.relationship} 
              onChange={(e) => handleChange('relationship', e.target.value)}
              placeholder="Former Manager"
            />
          </div>
        </div>
      )

    default:
      return null
  }
}
