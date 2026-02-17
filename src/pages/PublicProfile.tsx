import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile, CV } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Linkedin, Github, Twitter, Globe as Website, Mail, FileText, Send, Loader2 } from 'lucide-react'
import CVPreview from '@/components/cv/CVPreview'

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [featuredCV, setFeaturedCV] = useState<CV | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) {
        setError('Profile not found')
        setLoading(false)
        return
      }

      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('publicSlug', '==', slug))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) {
          setError('Profile not found')
        } else {
          const userData = snapshot.docs[0].data() as UserProfile
          const userId = snapshot.docs[0].id
          
          if (!userData.isPublic) {
            setError('This profile is private')
          } else {
            setUser({ ...userData, uid: userId })
            
            // Fetch featured CV if exists
            if (userData.featuredCvId) {
              const cvDoc = await getDoc(doc(db, `users/${userId}/cvs/${userData.featuredCvId}`))
              if (cvDoc.exists()) {
                setFeaturedCV({ ...cvDoc.data(), cvId: cvDoc.id } as CV)
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Error loading profile')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [slug])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSendingMessage(true)
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const { functions } = await import('@/lib/firebase')
      
      const submitContact = httpsCallable(functions, 'submitContactMessage')
      await submitContact({
        targetUserId: user.uid,
        fromName: formData.name,
        fromEmail: formData.email,
        message: formData.message
      })
      
      setMessageSent(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md m-4">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-gray-500">{error || 'Profile not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const socialIcons: Record<string, React.ReactNode> = {
    linkedin: <Linkedin size={20} />,
    github: <Github size={20} />,
    twitter: <Twitter size={20} />,
    website: <Website size={20} />,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="mb-8">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        {user.showSocialLinks && user.socialLinks && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connect</CardTitle>
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

        {/* CV Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              CV
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredCV ? (
              <div className="bg-white border rounded-lg overflow-hidden">
                <CVPreview cv={featuredCV} user={null} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No CV available</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        {user.showContactForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messageSent ? (
                <div className="text-center py-6">
                  <div className="text-green-500 mb-2">✓</div>
                  <p className="text-gray-600">Message sent successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Your Email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <textarea
                      placeholder="Message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Portfolio coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
