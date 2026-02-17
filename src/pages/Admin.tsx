import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Settings, Save, Eye, EyeOff, Sparkles, Users, BarChart3 } from 'lucide-react'

const AI_PROVIDERS = [
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'] },
  { id: 'google', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
]

export default function AdminPage() {
  const { user, initialized } = useAuthStore()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<'ai' | 'templates' | 'users' | 'analytics'>('ai')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [aiConfig, setAiConfig] = useState({
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek-chat'
  })
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login')
    } else if (initialized && user && user.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, initialized, navigate])

  useEffect(() => {
    loadAIConfig()
  }, [])

  const loadAIConfig = async () => {
    try {
      const docRef = doc(db, 'appSettings', 'ai')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setAiConfig({
          provider: data.provider || 'deepseek',
          apiKey: data.apiKey || '',
          model: data.model || 'deepseek-chat'
        })
      }
    } catch (err) {
      console.error('Error loading AI config:', err)
    }
  }

  const saveAIConfig = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'appSettings', 'ai'), aiConfig, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Error saving AI config:', err)
    }
    setSaving(false)
  }

  const handleProviderChange = (provider: string) => {
    const providerData = AI_PROVIDERS.find(p => p.id === provider)
    setAiConfig({
      provider,
      apiKey: aiConfig.apiKey,
      model: providerData?.models[0] || ''
    })
  }

  if (!initialized || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage your platform settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'ai' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles size={18} />
          AI Settings
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'templates' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings size={18} />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users size={18} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'analytics' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
      </div>

      {/* AI Settings Tab */}
      {activeTab === 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Configure the AI provider for CV generation. Admins can update these settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="provider">AI Provider</Label>
              <select
                id="provider"
                value={aiConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {AI_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <select
                id="model"
                value={aiConfig.model}
                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {AI_PROVIDERS
                  .find(p => p.id === aiConfig.provider)
                  ?.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  placeholder="Enter API key..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                The API key will be stored in Firestore and used by Cloud Functions.
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={saveAIConfig} disabled={saving}>
                <Save size={18} className="mr-2" />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Template Management
            </CardTitle>
            <CardDescription>
              Manage CV and Portfolio templates. This feature is coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Template management will be available in a future update.</p>
              <p className="text-sm mt-2">TODO: Phase 4 - Implement template CRUD</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage platform users. This feature is coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>User management will be available in a future update.</p>
              <p className="text-sm mt-2">TODO: Phase 4 - Implement user table with CRUD</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Platform Analytics
            </CardTitle>
            <CardDescription>
              View platform metrics and usage statistics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mock Analytics Data */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Premium Users</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total CVs Created</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">CVs This Week</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">PDF Downloads</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">AI Interactions</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Note: Analytics data is currently shown as placeholders. TODO: Connect to real Firestore analytics aggregation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
