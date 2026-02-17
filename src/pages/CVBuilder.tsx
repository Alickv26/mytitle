import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { useCVStore } from '@/store/cv'
import { Plus, FileText, Clock, Star, Check, Trash2 } from 'lucide-react'

export default function CVBuilderPage() {
  const { user, initialized, updateUserProfile } = useAuthStore()
  const navigate = useNavigate()
  const { cvs, loadUserCVs, loading, deleteCV } = useCVStore()
  const [featureLoading, setFeatureLoading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login')
    }
  }, [user, initialized, navigate])

  useEffect(() => {
    if (user) {
      loadUserCVs(user.uid)
    }
  }, [user, loadUserCVs])

  if (!user) return null

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return 'Never'
    
    // Handle Firestore Timestamp (has toDate method)
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      const date = (dateValue as { toDate: () => Date }).toDate()
      return formatRelativeTime(date)
    }
    
    // Handle string date
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return formatRelativeTime(date)
  }

  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHours = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleFeatureCV = async (cvId: string) => {
    if (!user) return
    setFeatureLoading(cvId)
    try {
      const newFeaturedId = user.featuredCvId === cvId ? null : cvId
      await updateUserProfile({ featuredCvId: newFeaturedId || undefined })
    } catch (error) {
      console.error('Failed to feature CV:', error)
    } finally {
      setFeatureLoading(null)
    }
  }

  const isFeatured = (cvId: string) => user?.featuredCvId === cvId

  const handleDeleteCV = async (cvId: string) => {
    if (!user) return
    if (!confirm('Are you sure you want to delete this CV? This action cannot be undone.')) return
    
    setDeleting(cvId)
    try {
      await deleteCV(user.uid, cvId)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CV Builder</h1>
        <p className="text-gray-500 mt-1">Create and manage your CVs</p>
      </div>

      {cvs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Saved CVs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv) => {
              const featured = isFeatured(cv.cvId)
              return (
                <Card key={cv.cvId} className={`hover:shadow-md transition-shadow cursor-pointer ${featured ? 'ring-2 ring-blue-500' : ''}`}>
                  {featured && (
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured on Profile
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{cv.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last edited: {formatDate(cv.lastUpdated)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => navigate(`/cv-editor/${cv.cvId}`)}
                      >
                        Continue
                      </Button>
                      <Button 
                        variant={featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeatureCV(cv.cvId)}
                        disabled={featureLoading === cv.cvId}
                        title={featured ? "Remove from profile" : "Feature on profile"}
                      >
                        {featureLoading === cv.cvId ? (
                          <Clock className="h-4 w-4" />
                        ) : featured ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCV(cv.cvId)}
                        disabled={deleting === cv.cvId}
                        title="Delete CV"
                      >
                        {deleting === cv.cvId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create New CV */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-200">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[200px]">
            <Plus className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Start a new CV</p>
            <Button onClick={() => navigate('/cv-editor/new')}>
              Create New CV
            </Button>
          </CardContent>
        </Card>

        {/* Template Gallery */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Browse Templates
            </CardTitle>
            <CardDescription>Choose from professional designs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/cv-editor/new')}>
              View Gallery
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* CV Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered CV Building</CardTitle>
          <CardDescription>
            Our AI assistant will guide you through creating your CV section by section. 
            Just describe your experience in natural language and let AI help you craft professional content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">1. Start a New CV</h3>
              <p className="text-sm text-gray-500">Click "Create New CV" to begin</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">2. AI Guided Input</h3>
              <p className="text-sm text-gray-500">Chat with AI about your experience</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">3. Customize & Export</h3>
              <p className="text-sm text-gray-500">Choose templates and download PDF</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
