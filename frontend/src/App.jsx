import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import UploadResumePage from './pages/student/UploadResumePage'
import MatchResultsPage from './pages/student/MatchResultsPage'
import SkillAnalysisPage from './pages/student/SkillAnalysisPage'

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import PostJobPage from './pages/recruiter/PostJobPage'
import ApplicantsPage from './pages/recruiter/ApplicantsPage'

// Profile
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute requiredRole="STUDENT"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/upload" element={
            <ProtectedRoute requiredRole="STUDENT"><UploadResumePage /></ProtectedRoute>
          } />
          <Route path="/student/matches/:resumeId" element={
            <ProtectedRoute requiredRole="STUDENT"><MatchResultsPage /></ProtectedRoute>
          } />
          <Route path="/student/analysis/:resumeId" element={
            <ProtectedRoute requiredRole="STUDENT"><SkillAnalysisPage /></ProtectedRoute>
          } />

          {/* Recruiter */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute requiredRole="RECRUITER"><RecruiterDashboard /></ProtectedRoute>
          } />
          <Route path="/recruiter/post-job" element={
            <ProtectedRoute requiredRole="RECRUITER"><PostJobPage /></ProtectedRoute>
          } />
          <Route path="/recruiter/jobs/:jobId/applicants" element={
            <ProtectedRoute requiredRole="RECRUITER"><ApplicantsPage /></ProtectedRoute>
          } />

          {/* Profile — accessible to both roles */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
