import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Save, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  Palette, 
  Eye,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCVStore } from '@/store/cv'
import { useAuthStore } from '@/store/auth'
import AIChatPanel from '@/components/cv/AIChatPanel'
import CVPreview from '@/components/cv/CVPreview'
import CVSectionEditor from '@/components/cv/CVSectionEditor'
import TemplateGallery from '@/components/cv/TemplateGallery'
import CustomizationPanel from '@/components/cv/CustomizationPanel'
import type { CVSectionType } from '@/types'

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  
  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function CVEditorPage() {
  const { cvId } = useParams<{ cvId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentCV,
    loading,
    error,
    createNewCV,
    loadCV,
    saveCV,
    updateCVTitle,
    toggleAIChat,
    isAIChatOpen,
    updateCVCustomization
  } = useCVStore()

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [currentEditingSection, setCurrentEditingSection] = useState<CVSectionType>('personalInfo')
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) return

    if (cvId === 'new') {
      createNewCV(user.uid, 'My CV')
    } else if (cvId) {
      loadCV(user.uid, cvId)
    }
  }, [user, cvId])

  // Auto-save when CV changes
  useEffect(() => {
    if (!currentCV) return
    
    setSaveStatus('unsaved')
    const timer = setTimeout(async () => {
      setSaveStatus('saving')
      await saveCV()
      if (!useCVStore.getState().error) {
        setSaveStatus('saved')
        setLastSaved(new Date())
      } else {
        setSaveStatus('unsaved')
      }
    }, 2000) // Save after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [currentCV])

  const handleSave = async () => {
    setSaveStatus('saving')
    await saveCV()
    if (!useCVStore.getState().error) {
      setSaveStatus('saved')
      setLastSaved(new Date())
    } else {
      setSaveStatus('unsaved')
    }
  }

  const handleDownloadPDF = async () => {
    if (!currentCV || !user) return
    
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const { functions } = await import('@/lib/firebase')
      
      const generatePDF = httpsCallable(functions, 'generatePDF')
      const result = await generatePDF({
        userId: user.uid,
        cvId: currentCV.cvId
      })

      const data = result.data as { success: boolean; url?: string }
      if (data.success && data.url) {
        window.open(data.url, '_blank')
      } else {
        alert('PDF generation is not yet fully configured. For now, use browser print (Ctrl/Cmd+P) to save as PDF.')
      }
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('PDF generation requires server-side setup. Use browser print (Ctrl/Cmd+P) to save as PDF.')
    }
  }

  const handleSkipToEditor = () => {
    setActiveTab('editor')
    toggleAIChat(false)
  }

  if (loading && !currentCV) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cv-builder')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <Input
                value={currentCV?.title || ''}
                onChange={(e) => updateCVTitle(e.target.value)}
                className="font-semibold text-lg border-none focus:ring-0 px-0 h-auto w-32 md:w-auto"
                placeholder="CV Title"
              />
              <span className="text-xs text-gray-500 hidden md:inline">
                {saveStatus === 'saved' && lastSaved ? `✓ Saved ${formatRelativeTime(lastSaved)}` : null}
                {saveStatus === 'saved' && !lastSaved && '✓ Saved'}
                {saveStatus === 'saving' && '⏳ Saving...'}
                {saveStatus === 'unsaved' && '● Unsaved'}
              </span>
              {error && (
                <span className="text-xs text-red-500 block">⚠️ Save failed - will retry</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleAIChat(true)}
              className="hidden md:flex"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleAIChat(true)}
              className="md:hidden"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTemplateGallery(true)}
              className="hidden md:flex"
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTemplateGallery(true)}
              className="md:hidden"
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCustomization(true)}
              className="hidden md:flex"
            >
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCustomization(true)}
              className="md:hidden"
            >
              <Palette className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSave} className="hidden md:flex">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} className="md:hidden">
              <Save className="h-4 w-4" />
            </Button>
            
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'editor' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Edit Sections
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'preview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Editor Panel */}
        <div className={`flex-1 p-4 md:p-6 ${isAIChatOpen ? 'lg:pr-[400px]' : ''}`}>
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* Section Navigation */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">CV Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentCV?.sections.map((section) => (
                      <Button
                        key={section.id}
                        variant={currentEditingSection === section.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentEditingSection(section.type)}
                      >
                        {section.title}
                        {section.entries.length > 0 && (
                          <span className="ml-1 text-xs opacity-70">({section.entries.length})</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Section Editor */}
              {currentCV && (
                <CVSectionEditor 
                  section={currentCV.sections.find(s => s.type === currentEditingSection)!}
                  sectionType={currentEditingSection}
                />
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div>
              {currentCV && (
                <CVPreview 
                  cv={currentCV} 
                  user={user}
                />
              )}
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        <AIChatPanel 
          currentSection={currentEditingSection}
          onSkipToEditor={handleSkipToEditor}
        />
      </div>

      {/* Template Gallery Modal */}
      {showTemplateGallery && currentCV && (
        <TemplateGallery
          currentTemplateId={currentCV.templateId}
          onSelect={(templateId) => {
            useCVStore.getState().updateCVTemplate(templateId)
            setShowTemplateGallery(false)
          }}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Customization Panel */}
      {showCustomization && currentCV && (
        <CustomizationPanel
          customization={currentCV.customization}
          onChange={(customization) => {
            updateCVCustomization(customization)
          }}
          onClose={() => setShowCustomization(false)}
        />
      )}
    </div>
  )
}
