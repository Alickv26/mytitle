import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, FileText, Eye, Download, Crown, Lock, Clock, Trash2, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useCVStore } from '@/store/cv'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { cvs, loadUserCVs, deleteCV, loading } = useCVStore()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activities, setActivities] = useState<Array<{type: string, description: string, date: Date}>>([])

  const isFreeWithCVs = user?.tier === 'free' && user?.role !== 'admin' && cvs.length >= 2

  useEffect(() => {
    if (user) {
      loadUserCVs(user.uid)
    }
  }, [user, loadUserCVs])

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

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return 'Never'
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Unknown'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Manage your CVs and public profile</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/cv-editor/new">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Create New CV</CardTitle>
              <Plus className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Start fresh with AI assistance</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">View Public Profile</CardTitle>
            <Eye className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">See how others see your profile</p>
            {user?.publicSlug ? (
              <Button variant="outline" asChild>
                <a href={`/u/${user.publicSlug}`} target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              </Button>
            ) : (
              <p className="text-sm text-gray-400">Set up your profile to get a public link</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Upgrade to Premium</CardTitle>
            <Crown className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Unlock all templates & features</p>
            {user?.role === 'admin' ? (
              <p className="text-sm text-green-600 font-medium">✓ You have full access</p>
            ) : (
              <Button disabled>Coming Soon</Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CV List */}
      <Card>
        <CardHeader>
          <CardTitle>Your CVs</CardTitle>
          <CardDescription>Manage your existing CVs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading CVs...</p>
            </div>
          ) : isFreeWithCVs ? (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You've reached the free CV limit</p>
              <Button>Upgrade to Premium</Button>
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No CVs yet. Create your first one!</p>
              <Button asChild>
                <Link to="/cv-editor/new">Create CV</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cvs.map((cv) => {
                const isFeatured = user?.featuredCvId === cv.cvId
                return (
                  <div 
                    key={cv.cvId} 
                    className={`flex items-center justify-between p-4 border rounded-lg ${isFeatured ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {isFeatured && (
                        <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                      )}
                      <div>
                        <h3 className="font-medium">{cv.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(cv.lastUpdated)}
                          {isFeatured && <span className="text-blue-600 ml-2">• Featured</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/cv-editor/${cv.cvId}`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCV(cv.cvId)}
                        disabled={deleting === cv.cvId}
                      >
                        {deleting === cv.cvId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Create a CV or update your profile to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{activity.description}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
