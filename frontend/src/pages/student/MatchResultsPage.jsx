import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import MatchCard from '../../components/MatchCard'
import api from '../../api/axios'

export default function MatchResultsPage() {
  const { resumeId } = useParams()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/match/my?resumeId=${resumeId}`)
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
            <p className="text-sm text-gray-500 dark:text-gray-400">{matches.length} jobs found — sorted by match %</p>
            {matches.map(match => (
              <MatchCard
                key={match.matchId}
                jobTitle={match.jobTitle}
                jobDescription={match.jobDescription}
                matchPercentage={match.matchPercentage}
                missingSkills={match.missingSkills}
                requiredSkills={match.requiredSkills}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
