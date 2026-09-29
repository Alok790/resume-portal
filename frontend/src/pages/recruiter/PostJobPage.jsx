import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import SkillTagInput from '../../components/SkillTagInput'
import api from '../../api/axios'

const QUICK_SKILLS = {
  'Frontend':   ['React','Vue','Angular','TypeScript','Tailwind CSS','Next.js'],
  'Backend':    ['Node.js','Spring Boot','Django','FastAPI','GraphQL','REST API'],
  'Database':   ['MySQL','PostgreSQL','MongoDB','Redis','Firebase'],
  'Cloud':      ['AWS','Azure','GCP','Docker','Kubernetes','CI/CD'],
  'AI / ML':    ['Python','Machine Learning','TensorFlow','PyTorch','NLP'],
  'Mobile':     ['React Native','Flutter','Swift','Kotlin','Android'],
}

const JOB_TYPES   = ['Full-time','Part-time','Contract','Internship','Remote','Hybrid']
const EXP_LEVELS  = ['Fresher (0–1 yr)','Junior (1–3 yrs)','Mid (3–5 yrs)','Senior (5+ yrs)','Lead / Principal']
const SALARY_RANGES = ['Not disclosed','₹0–3 LPA','₹3–6 LPA','₹6–10 LPA','₹10–20 LPA','₹20–40 LPA','₹40 LPA+','$40k–$70k','$70k–$120k','$120k+']

export default function PostJobPage() {
  const [form, setForm] = useState({
    title: '', description: '', requiredSkills: [],
    jobType: 'Full-time', expLevel: 'Mid (3–5 yrs)',
    salary: 'Not disclosed', location: ''
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [activeQuick, setActiveQuick] = useState('Frontend')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.requiredSkills.length === 0) { setError('Add at least one required skill.'); return }
    setError(''); setLoading(true)
    try {
      const { jobType, expLevel, salary, location, ...base } = form
      const description = [
        form.description,
        `\nType: ${jobType} | Experience: ${expLevel} | Salary: ${salary}${location ? ` | Location: ${location}` : ''}`
      ].join('\n').trim()
      await api.post('/jobs', { ...base, description })
      navigate('/recruiter/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.')
    } finally {
      setLoading(false)
    }
  }

  const addQuickSkill = (skill) => {
    if (!form.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()))
      setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, skill] }))
  }

  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-7">
          <Link to="/recruiter/dashboard" className="text-purple-500 text-xs hover:underline">← Dashboard</Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Post a New Job</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Fill in the details — our AI will instantly match candidates.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex gap-2">
              ⚠️ {error}
            </div>
          )}

          {/* Job title */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">📋 Basic Info</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Senior Full Stack Developer"
                className={inputCls} value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Description</label>
              <textarea rows={4} placeholder="Describe the role, responsibilities, team, and what excites you about this position…"
                className={inputCls + ' resize-none'} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">🏷️ Job Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Type</label>
                <select className={inputCls} value={form.jobType}
                  onChange={e => setForm({ ...form, jobType: e.target.value })}>
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience Level</label>
                <select className={inputCls} value={form.expLevel}
                  onChange={e => setForm({ ...form, expLevel: e.target.value })}>
                  {EXP_LEVELS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Salary / CTC</label>
                <select className={inputCls} value={form.salary}
                  onChange={e => setForm({ ...form, salary: e.target.value })}>
                  {SALARY_RANGES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                <input type="text" placeholder="e.g. Bangalore / Remote" className={inputCls}
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">🧠 Required Skills <span className="text-red-500">*</span></h3>

            {/* Quick-add categories */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick-add by category:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.keys(QUICK_SKILLS).map(cat => (
                  <button key={cat} type="button"
                    onClick={() => setActiveQuick(cat)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition ${
                      activeQuick === cat
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SKILLS[activeQuick].map(skill => {
                  const added = form.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
                  return (
                    <button key={skill} type="button"
                      onClick={() => addQuickSkill(skill)}
                      disabled={added}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                        added
                          ? 'bg-purple-100 text-purple-600 border-purple-200 cursor-default'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                      }`}>
                      {added ? '✓ ' : '+ '}{skill}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Or type custom skills:</p>
              <SkillTagInput
                skills={form.requiredSkills}
                onChange={skills => setForm({ ...form, requiredSkills: skills })}
              />
            </div>

            {form.requiredSkills.length > 0 && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                <p className="text-xs text-purple-700 font-semibold">
                  ✅ {form.requiredSkills.length} skill{form.requiredSkills.length !== 1 ? 's' : ''} added — candidates will be scored against these
                </p>
              </div>
            )}
          </div>

          {/* Preview strip */}
          {form.title && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mb-2">👁 Preview</p>
              <p className="font-bold text-gray-800 dark:text-gray-100">{form.title}</p>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>📍 {form.location || 'Location TBD'}</span>
                <span>⏱ {form.jobType}</span>
                <span>🎓 {form.expLevel}</span>
                <span>💰 {form.salary}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl py-3.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-200">
            {loading ? '⏳ Posting…' : '🚀 Post Job & Start Matching'}
          </button>
        </form>
      </div>
    </div>
  )
}
