import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function StudentDashboard() {
  const [resumes, setResumes] = useState([])
  const [matching, setMatching] = useState({})
  const [reprocessing, setReprocessing] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchResumes = () => api.get('/resume/my').then(res => setResumes(res.data)).finally(() => setLoading(false))

  useEffect(() => { fetchResumes() }, [])

  const handleReprocess = async (resumeId) => {
    setReprocessing(prev => ({ ...prev, [resumeId]: true }))
    try {
      await api.post(`/resume/${resumeId}/reprocess`)
      // Poll until PROCESSED
      let tries = 0
      const poll = setInterval(async () => {
        tries++
        const res = await api.get('/resume/my')
        const updated = res.data.find(r => r.id === resumeId)
        if (updated?.status === 'PROCESSED' || tries > 20) {
          clearInterval(poll)
          setResumes(res.data)
          setReprocessing(prev => ({ ...prev, [resumeId]: false }))
        }
      }, 2000)
    } catch (err) {
      alert('Reprocess failed. Make sure the AI service is running.')
      setReprocessing(prev => ({ ...prev, [resumeId]: false }))
    }
  }

  const handleFindMatches = async (resumeId) => {
    setMatching(prev => ({ ...prev, [resumeId]: true }))
    try {
      await api.post(`/match/run?resumeId=${resumeId}`)
      navigate(`/student/matches/${resumeId}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Matching failed. Ensure resume is processed.')
    } finally {
      setMatching(prev => ({ ...prev, [resumeId]: false }))
    }
  }

  const processedCount = resumes.filter(r => r.status === 'PROCESSED').length
  const pendingCount = resumes.filter(r => r.status !== 'PROCESSED').length

  const parseSkills = (s) => {
    try {
      const parsed = JSON.parse(s || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋</h2>
          <p className="text-blue-100 text-sm mt-1">Find jobs that match your skills and experience</p>
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-2xl font-bold">{resumes.length}</p>
              <p className="text-blue-200 text-xs">Total Resumes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{processedCount}</p>
              <p className="text-blue-200 text-xs">Processed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-blue-200 text-xs">Pending</p>
            </div>
          </div>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">My Resumes</h3>
          <Link
            to="/student/upload"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            + Upload Resume
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Loading your resumes…
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">No resumes yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Upload your first resume to start finding jobs</p>
            <Link to="/student/upload"
              className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">
              Upload your first resume →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map(resume => {
              const skills = parseSkills(resume.extractedSkills)
              return (
                <div key={resume.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-lg flex-shrink-0">
                        📄
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {resume.filePath?.split(/[\\/]/).pop()?.replace(/^\d+_/, '') || 'Resume'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Uploaded {resume.uploadedAt?.slice(0, 10)}</p>
                        <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          resume.status === 'PROCESSED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700 animate-pulse'
                        }`}>
                          {resume.status === 'PROCESSED' ? '✓ Processed' : '⏳ Processing…'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      {resume.status === 'PROCESSED' && skills.length === 0 && (
                        <button
                          onClick={() => handleReprocess(resume.id)}
                          disabled={reprocessing[resume.id]}
                          title="Re-run AI skill extraction"
                          className="text-sm bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium"
                        >
                          {reprocessing[resume.id] ? '⏳ Re-analysing…' : '🔄 Re-analyse'}
                        </button>
                      )}
                      {resume.status === 'PROCESSED' && skills.length > 0 && (
                        <>
                          <button
                            onClick={() => handleFindMatches(resume.id)}
                            disabled={matching[resume.id]}
                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                          >
                            {matching[resume.id] ? '⏳ Matching…' : '🔍 Find Matches'}
                          </button>
                          <Link
                            to={`/student/analysis/${resume.id}`}
                            className="text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            View Analysis
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Skills preview */}
                  {resume.status === 'PROCESSED' && skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">🧠 Extracted Skills ({skills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 12).map(skill => (
                          <span key={skill} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {skills.length > 12 && (
                          <span className="text-xs text-gray-400 px-2 py-1">+{skills.length - 12} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Quick tips */}
        {resumes.length > 0 && processedCount > 0 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 How matching works</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Click <strong>Find Matches</strong> on any processed resume. Our AI compares your skills against all posted jobs using TF-IDF cosine similarity and ranks them by match percentage.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
