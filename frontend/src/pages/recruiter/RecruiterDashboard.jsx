import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jobs')
      .then(res => {
        const myJobs = res.data.filter(j => j.recruiterId === user?.id)
        setJobs(myJobs)
      })
      .finally(() => setLoading(false))
  }, [user])

  const parseSkills = s => Array.isArray(s) ? s : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-7 mb-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-purple-200 text-sm font-medium mb-1">👋 Welcome back,</p>
              <h2 className="text-2xl font-bold">{user?.name || 'Recruiter'}</h2>
              <p className="text-purple-200 text-sm mt-1">{user?.email}</p>
            </div>
            <Link to="/recruiter/post-job"
              className="bg-white text-purple-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition shadow-sm">
              + Post a Job
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6">
            {[
              { label: 'Jobs Posted',    value: jobs.length },
              { label: 'Active Roles',   value: jobs.length },
              { label: 'Total Skills',   value: jobs.reduce((acc, j) => acc + parseSkills(j.requiredSkills).length, 0) },
            ].map(k => (
              <div key={k.label}>
                <p className="text-3xl font-bold">{k.value}</p>
                <p className="text-purple-200 text-xs mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs list */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">My Job Postings</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
            Loading your jobs…
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-14 text-center">
            <div className="text-5xl mb-4">💼</div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">No jobs posted yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-5">Post your first job and let AI match you with the best candidates</p>
            <Link to="/recruiter/post-job"
              className="bg-purple-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-purple-700 transition font-medium">
              Post your first job →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => {
              const skills = parseSkills(job.requiredSkills)
              return (
                <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl flex-shrink-0">
                        💼
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-800 dark:text-gray-100">{job.title}</h3>
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        {job.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{job.description}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Posted {job.postedAt?.slice(0, 10)}</p>
                      </div>
                    </div>
                    <Link to={`/recruiter/jobs/${job.id}/applicants`}
                      className="shrink-0 bg-purple-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-purple-700 transition font-medium">
                      View Applicants
                    </Link>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">REQUIRED SKILLS ({skills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 10).map(s => (
                          <span key={s} className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-1 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                        {skills.length > 10 && (
                          <span className="text-xs text-gray-400 px-2 py-1">+{skills.length - 10} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tips */}
        {jobs.length > 0 && (
          <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">💡 How applicant ranking works</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              When students run "Find Matches", our AI compares their resume skills against your required skills using TF-IDF cosine similarity. Click <strong>View Applicants</strong> to see ranked candidates with match scores.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
