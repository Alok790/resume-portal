import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import MatchCard from '../../components/MatchCard'
import api from '../../api/axios'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export default function MatchResultsPage() {
  const { resumeId } = useParams()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [demoApplications, setDemoApplications] = useState(() => {
    if (!DEMO_MODE) return []
    try {
      const saved = JSON.parse(localStorage.getItem('demo_job_applications') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const handleDemoApply = (match) => {
    const application = {
      jobId: match.jobId,
      jobTitle: match.jobTitle,
      company: match.company,
      appliedAt: new Date().toISOString(),
    }
    const nextApplications = [
      ...demoApplications.filter((item) => item.jobId !== match.jobId),
      application,
    ]
    localStorage.setItem('demo_job_applications', JSON.stringify(nextApplications))
    setDemoApplications(nextApplications)
  }

  useEffect(() => {
    const endpoint = DEMO_MODE ? '/demo/match/my' : '/match/my'
    api.get(`${endpoint}?resumeId=${resumeId}`)
      .then(res => setMatches(res.data))
      .catch(() => setError('Could not load matches.'))
      .finally(() => setLoading(false))
  }, [resumeId])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/student/dashboard" className="text-blue-600 text-sm hover:underline">← Dashboard</Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Job Match Results</h2>
        </div>

        {DEMO_MODE && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Demo job postings are sample data. Apply buttons simulate the application flow locally; no application is sent to an employer.
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading matches…</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : matches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No matches yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Go back to your dashboard and click "Find Matches".</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {matches.length} {DEMO_MODE ? 'sample job matches' : 'jobs found'} — sorted by match %
            </p>
            {matches.map(match => (
              <MatchCard
                key={match.matchId}
                jobTitle={match.jobTitle}
                jobDescription={match.jobDescription}
                matchPercentage={match.matchPercentage}
                missingSkills={match.missingSkills}
                requiredSkills={match.requiredSkills}
                matchedSkills={match.matchedSkills}
                similarSkills={match.similarSkills}
                company={match.company}
                location={match.location}
                salary={match.salary}
                experienceLevel={match.experienceLevel}
                learningRecommended={match.learningRecommended}
                learningRecommendations={match.learningRecommendations}
                demoMode={DEMO_MODE}
                demoApplied={demoApplications.some((application) => application.jobId === match.jobId)}
                onDemoApply={() => handleDemoApply(match)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
