import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useCVStore } from '@/store/cv'
import { FileText, Globe, Mail, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Linkedin, Github, Twitter, Globe as Website } from 'lucide-react'

export default function ProfilePage() {
  const { user, initialized } = useAuthStore()
  const { cvs, loadUserCVs } = useCVStore()
  const navigate = useNavigate()

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

  const getFeaturedCVTitle = () => {
    if (!user?.featuredCvId) return null
    const cv = cvs.find(c => c.cvId === user.featuredCvId)
    return cv?.title || null
  }

  const featuredCVTitle = getFeaturedCVTitle()

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  const socialIcons: Record<string, React.ReactNode> = {
    linkedin: <Linkedin size={20} />,
    github: <Github size={20} />,
    twitter: <Twitter size={20} />,
    website: <Website size={20} />,
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500 mt-1">View and manage your public profile</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{user.displayName}</h2>
              {user.title && <p className="text-lg text-gray-600">{user.title}</p>}
              {user.industry && <p className="text-gray-500">{user.industry}</p>}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Globe size={16} />
                {user.isPublic ? (
                  <a href={`/u/${user.publicSlug}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    View Public Profile
                  </a>
                ) : (
                  <span>Private (make public in settings)</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      {user.showSocialLinks && user.socialLinks && (
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(user.socialLinks).map(([platform, url]) => (
                url && (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary"
                  >
                    {socialIcons[platform]}
                    <span className="capitalize">{platform}</span>
                  </a>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured CV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Featured CV
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredCVTitle ? (
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
              <span className="font-medium">{featuredCVTitle}</span>
            </div>
          ) : user?.featuredCvId ? (
            <p className="text-gray-500">CV ID: {user.featuredCvId}</p>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No CV selected as featured</p>
              <Button asChild>
                <a href="/cv-builder">Go to CV Builder</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} />
            Contact Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {user.showContactForm 
              ? 'Visitors can send you messages through your public profile' 
              : 'Contact form is hidden on your public profile'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
