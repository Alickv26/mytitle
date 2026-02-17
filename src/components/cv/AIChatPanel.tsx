import { useState, useRef, useEffect } from 'react'
import { Send, X, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useCVStore } from '@/store/cv'
import { SECTION_PROMPTS, type CVSectionType } from '@/types'

interface AIChatPanelProps {
  currentSection: CVSectionType
  onSkipToEditor: () => void
}

export default function AIChatPanel({ currentSection, onSkipToEditor }: AIChatPanelProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<CVSectionType>(currentSection)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    currentCV, 
    addAIChatMessage, 
    toggleAIChat, 
    isAIChatOpen,
    addEntry,
    updateSection
  } = useCVStore()

  const chatHistory = currentCV?.aiChatHistory || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  useEffect(() => {
    if (currentSection) {
      setCurrentPrompt(currentSection)
      if (chatHistory.length === 0) {
        const introMessage: typeof addAIChatMessage = (msg) => {
          const { addAIChatMessage } = useCVStore.getState()
          addAIChatMessage(msg)
        }
        const welcomeMsg: typeof chatHistory[0] = {
          role: 'assistant',
          content: `Hi! I'm here to help you build your CV. We'll go section by section, and you can just tell me about yourself in your own words. Let's start with your ${SECTION_PROMPTS[currentSection].toLowerCase()}`,
          sectionType: currentSection,
          id: 'welcome',
          timestamp: new Date().toISOString()
        }
      }
    }
  }, [currentSection])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    addAIChatMessage({
      role: 'user',
      content: userMessage,
      sectionType: currentPrompt
    })

    try {
      // Call the AI via Cloud Function
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const { functions } = await import('@/lib/firebase')
      
      const processAIChat = httpsCallable(functions, 'processAIChat')
      const result = await processAIChat({
        userId: currentCV?.userId,
        cvId: currentCV?.cvId,
        message: userMessage,
        sectionType: currentPrompt,
        chatHistory: chatHistory.slice(-10)
      })

      const data = result.data as { success: boolean; response?: string; parsedData?: unknown }
      
      if (data.success && data.response) {
        addAIChatMessage({
          role: 'assistant',
          content: data.response,
          sectionType: currentPrompt
        })

        // If AI returned parsed data, add it to the section
        if (data.parsedData) {
          const section = currentCV?.sections.find(s => s.type === currentPrompt)
          if (section) {
            addEntry(section.id, data.parsedData as never)
          }
        }
      } else {
        // Fallback response for demo
        const demoResponse = getDemoResponse(userMessage, currentPrompt)
        addAIChatMessage({
          role: 'assistant',
          content: demoResponse,
          sectionType: currentPrompt
        })
      }
    } catch (err) {
      console.error('AI Chat error:', err)
      // Fallback demo response
      const demoResponse = getDemoResponse(userMessage, currentPrompt)
      addAIChatMessage({
        role: 'assistant',
        content: demoResponse,
        sectionType: currentPrompt
      })
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getDemoResponse = (userInput: string, section: CVSectionType): string => {
    const responses: Record<CVSectionType, string> = {
      personalInfo: "Great! I've noted your details. Let's move on to your professional summary.",
      summary: "That's a solid summary! It highlights your experience well. Ready to add your work experience?",
      experience: "Thanks for sharing your experience! That's valuable content. Would you like to add another role or move to education?",
      education: "Good to know! Your educational background is now saved. Shall we add your skills?",
      skills: "Excellent skills list! These will look great on your CV. Any certifications or awards to add?",
      certifications: "Nice credential! That adds credibility to your profile. Want to add any notable projects?",
      projects: "That's an impressive project! It shows practical experience. Any languages you'd like to add?",
      languages: "Being multilingual is a great asset! Would you like to add any references?",
      references: "Perfect! Your CV is looking comprehensive. You can now edit any section directly or download your PDF."
    }
    return responses[section] || "Thanks for sharing that! Let me know when you'd like to move to the next section."
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform z-50 ${isAIChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">AI CV Assistant</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => toggleAIChat(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Current Section Indicator */}
        <div className="px-4 py-2 bg-blue-50 border-b">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Current Section:</span>{' '}
            {currentSection === 'personalInfo' && 'Personal Information'}
            {currentSection === 'summary' && 'Professional Summary'}
            {currentSection === 'experience' && 'Work Experience'}
            {currentSection === 'education' && 'Education'}
            {currentSection === 'skills' && 'Skills'}
            {currentSection === 'certifications' && 'Certifications'}
            {currentSection === 'projects' && 'Projects'}
            {currentSection === 'languages' && 'Languages'}
            {currentSection === 'references' && 'References'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <p className="text-gray-600">
                {SECTION_PROMPTS[currentSection]}
              </p>
            </div>
          )}
          
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Skip Button */}
        <div className="px-4 py-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onSkipToEditor}
          >
            Skip AI - Edit Directly
          </Button>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your experience..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
