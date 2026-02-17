import { X, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

interface Template {
  id: string
  name: string
  category: string
  isFree: boolean
}

const TEMPLATES: Template[] = [
  { id: 'classic', name: 'Classic', category: 'Professional', isFree: true },
  { id: 'modern', name: 'Modern', category: 'Creative', isFree: true },
  { id: 'minimal', name: 'Minimal', category: 'Clean', isFree: true },
  { id: 'executive', name: 'Executive', category: 'Professional', isFree: false },
  { id: 'creative', name: 'Creative', category: 'Creative', isFree: false },
  { id: 'tech', name: 'Tech', category: 'Technical', isFree: true },
  { id: 'academic', name: 'Academic', category: 'Professional', isFree: true },
  { id: 'minimalist', name: 'Minimalist', category: 'Clean', isFree: false },
]

interface TemplateGalleryProps {
  currentTemplateId: string
  onSelect: (templateId: string) => void
  onClose: () => void
}

export default function TemplateGallery({ currentTemplateId, onSelect, onClose }: TemplateGalleryProps) {
  const { user } = useAuthStore()
  const isPremium = user?.tier === 'premium' || user?.role === 'admin'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Choose a Template</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => {
              const isLocked = !template.isFree && !isPremium
              const isSelected = template.id === currentTemplateId
              
              return (
                <div
                  key={template.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  } ${isLocked ? 'opacity-60' : ''}`}
                  onClick={() => !isLocked && onSelect(template.id)}
                >
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl font-bold">{template.name[0]}</span>
                  </div>
                  <div className="p-2 bg-white">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2">
                        <Lock className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                  )}
                  
                  {!template.isFree && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Premium
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {!isPremium && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg text-center">
              <p className="text-amber-800 mb-2">Upgrade to Premium to unlock all templates</p>
              <Button size="sm">Upgrade Now</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
