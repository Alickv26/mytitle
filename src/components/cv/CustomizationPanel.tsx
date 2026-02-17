import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AVAILABLE_FONTS } from '@/types'

interface Customization {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
}

interface CustomizationPanelProps {
  customization: Customization
  onChange: (customization: Partial<Customization>) => void
  onClose: () => void
}

const COLOR_PRESETS = [
  { primary: '#3b82f6', secondary: '#1e293b', accent: '#f59e0b', name: 'Blue' },
  { primary: '#10b981', secondary: '#064e3b', accent: '#f59e0b', name: 'Green' },
  { primary: '#8b5cf6', secondary: '#1e1b4b', accent: '#ec4899', name: 'Purple' },
  { primary: '#f43f5e', secondary: '#881337', accent: '#fbbf24', name: 'Rose' },
  { primary: '#0ea5e9', secondary: '#0c4a6e', accent: '#22d3ee', name: 'Sky' },
  { primary: '#f97316', secondary: '#7c2d12', accent: '#fef3c7', name: 'Orange' },
  { primary: '#6366f1', secondary: '#312e81', accent: '#a5b4fc', name: 'Indigo' },
  { primary: '#14b8a6', secondary: '#134e4a', accent: '#5eead4', name: 'Teal' },
]

export default function CustomizationPanel({ customization, onChange, onClose }: CustomizationPanelProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Customize Design</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Color Presets */}
        <div>
          <Label className="mb-2 block">Color Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="aspect-square rounded-lg border-2 overflow-hidden relative"
                style={{
                  borderColor: 
                    customization.primaryColor === preset.primary 
                      ? '#3b82f6' 
                      : '#e5e7eb'
                }}
                onClick={() => onChange({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent
                })}
              >
                <div className="absolute inset-0" style={{ backgroundColor: preset.primary }} />
                <div 
                  className="absolute bottom-0 right-0 w-1/3 h-1/3" 
                  style={{ backgroundColor: preset.accent }} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <Label className="mb-2 block">Primary Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={customization.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customization.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <Label className="mb-2 block">Secondary Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={customization.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customization.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <Label className="mb-2 block">Accent Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={customization.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customization.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Heading Font */}
        <div>
          <Label className="mb-2 block">Heading Font</Label>
          <select
            value={customization.headingFont}
            onChange={(e) => onChange({ headingFont: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Body Font */}
        <div>
          <Label className="mb-2 block">Body Font</Label>
          <select
            value={customization.bodyFont}
            onChange={(e) => onChange({ bodyFont: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="p-4 border rounded-lg" style={{ backgroundColor: customization.primaryColor + '10' }}>
          <Label className="mb-2 block">Preview</Label>
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: 'white',
              fontFamily: customization.bodyFont
            }}
          >
            <h4 
              className="font-bold"
              style={{ 
                color: customization.secondaryColor,
                fontFamily: customization.headingFont
              }}
            >
              Your Name
            </h4>
            <p 
              className="text-sm"
              style={{ color: customization.primaryColor }}
            >
              Software Engineer
            </p>
            <div 
              className="mt-2 h-1 w-16 rounded"
              style={{ backgroundColor: customization.accentColor }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
