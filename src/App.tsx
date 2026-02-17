import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/auth'

import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import OnboardingPage from '@/pages/Onboarding'
import Layout from '@/pages/Layout'
import DashboardPage from '@/pages/Dashboard'
import CVBuilderPage from '@/pages/CVBuilder'
import CVEditorPage from '@/pages/CVEditor'
import ProfilePage from '@/pages/Profile'
import SettingsPage from '@/pages/Settings'
import AdminPage from '@/pages/Admin'

import PublicProfilePage from '@/pages/PublicProfile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (user.title || user.industry) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  const { setUser, fetchUserProfile, setInitialized } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid)
        setUser(profile)
      } else {
        setUser(null)
      }
      setInitialized()
    })

    return () => unsubscribe()
  }, [setUser, fetchUserProfile, setInitialized])

  const { initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route path="/u/:slug" element={<PublicProfilePage />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/cv-builder" element={
            <ProtectedRoute><CVBuilderPage /></ProtectedRoute>
          } />
          <Route path="/cv-editor/:cvId" element={
            <ProtectedRoute><CVEditorPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute><AdminPage /></ProtectedRoute>
          } />
        </Route>
        
        <Route path="/onboarding" element={
          <OnboardingRoute><OnboardingPage /></OnboardingRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
