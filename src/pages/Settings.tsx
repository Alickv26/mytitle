import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [title, setTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')
  const [website, setWebsite] = useState('')
  const [publicSlug, setPublicSlug] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [showContactForm, setShowContactForm] = useState(true)
  const [showSocialLinks, setShowSocialLinks] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  const { user, updateUserProfile, initialized } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login')
    } else if (user) {
      setDisplayName(user.displayName || '')
      setTitle(user.title || '')
      setIndustry(user.industry || '')
      setLinkedin(user.socialLinks?.linkedin || '')
      setGithub(user.socialLinks?.github || '')
      setTwitter(user.socialLinks?.twitter || '')
      setWebsite(user.socialLinks?.website || '')
      setPublicSlug(user.publicSlug || '')
      setIsPublic(user.isPublic || false)
      setShowContactForm(user.showContactForm ?? true)
      setShowSocialLinks(user.showSocialLinks ?? true)
    }
  }, [user, initialized, navigate])

  const handleSave = async () => {
    setSaving(true)
    await updateUserProfile({
      displayName,
      title,
      industry,
      socialLinks: {
        linkedin,
        github,
        twitter,
        website
      },
      publicSlug,
      isPublic,
      showContactForm,
      showSocialLinks
    })
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (!user?.email) {
      setPasswordError('No email associated with account')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    
    setChangingPassword(true)
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser
      
      if (!currentUser || !currentUser.email) {
        setPasswordError('You must be logged in to change password')
        return
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      
      // Update password
      await updatePassword(currentUser, newPassword)
      
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      console.error('Error changing password:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password'
      setPasswordError(errorMessage)
    } finally {
      setChangingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Add your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                placeholder="https://github.com/..."
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/..."
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>Control your public profile visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Make Profile Public</p>
              <p className="text-sm text-gray-500">Allow others to view your profile</p>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Contact Form</p>
              <p className="text-sm text-gray-500">Allow visitors to send you messages</p>
            </div>
            <input
              type="checkbox"
              checked={showContactForm}
              onChange={(e) => setShowContactForm(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Social Links</p>
              <p className="text-sm text-gray-500">Display social links on your profile</p>
            </div>
            <input
              type="checkbox"
              checked={showSocialLinks}
              onChange={(e) => setShowSocialLinks(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          
          {user.tier === 'premium' || user.role === 'admin' ? (
            <div className="space-y-2">
              <Label htmlFor="publicSlug">Custom URL Slug</Label>
              <Input
                id="publicSlug"
                value={publicSlug}
                onChange={(e) => setPublicSlug(e.target.value)}
                placeholder="your-name"
              />
              <p className="text-sm text-gray-500">Your profile will be at /u/{publicSlug || 'your-slug'}</p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-amber-700">Upgrade to Premium to customize your public URL</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 text-sm">Password changed successfully!</p>
            )}
            
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
