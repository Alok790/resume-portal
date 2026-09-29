import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

/* Circular score ring (pure SVG, no recharts) */
function Ring({ pct, size = 56, stroke = 5, color }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={size*0.22} fontWeight="bold" fill={color}>
        {pct}%
      </text>
    </svg>
  )
}

/* Pure SVG horizontal bar chart */
function SVGBarChart({ data }) {
  const max   = Math.max(...data.map(d => d.pct), 1)
  const W     = 520, barH = 24, gap = 10, labelW = 90, pctW = 36
  const H     = data.length * (barH + gap) + 10
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const y    = i * (barH + gap)
        const barW = ((d.pct / max) * (W - labelW - pctW - 16))
        const col  = d.pct >= 70 ? '#10b981' : d.pct >= 40 ? '#f59e0b' : '#ef4444'
        return (
          <g key={i}>
            <text x={0} y={y + barH * 0.72} fontSize={11} fill="#6b7280" fontWeight="500"
              style={{ fontFamily: 'system-ui' }}>
              {d.name.length > 12 ? d.name.slice(0, 11) + '…' : d.name}
            </text>
            <rect x={labelW} y={y} width={W - labelW - pctW - 8} height={barH}
              rx={6} fill="#f3f4f6" />
            <rect x={labelW} y={y} width={barW || 0} height={barH}
              rx={6} fill={col} style={{ transition: 'width 1s ease' }} />
            <text x={labelW + (W - labelW - pctW - 8) + 6} y={y + barH * 0.72}
              fontSize={11} fill={col} fontWeight="bold" style={{ fontFamily: 'system-ui' }}>
              {d.pct}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* Avatar initials */
function Avatar({ name, rank }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors   = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899']
  const bg       = colors[rank % colors.length]
  return (
    <div style={{ background: bg }}
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

export default function ApplicantsPage() {
  const { jobId }    = useParams()
  const [applicants, setApplicants] = useState([])
  const [jobTitle,   setJobTitle]   = useState('')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [expanded,   setExpanded]   = useState({})
  const [filter,     setFilter]     = useState('all')   // all | strong | weak

  useEffect(() => {
    api.get(`/match/jobs/${jobId}/applicants`)
      .then(res => {
        setApplicants(res.data)
        if (res.data.length > 0) setJobTitle(res.data[0].jobTitle)
      })
      .catch(() => setError('Could not load applicants.'))
      .finally(() => setLoading(false))
  }, [jobId])

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const filtered = applicants.filter(a => {
    const p = Math.round(a.matchPercentage || 0)
    if (filter === 'strong') return p >= 70
    if (filter === 'weak')   return p < 40
    return true
  })

  const chartData = applicants.slice(0, 12).map(a => ({
    name: a.studentName?.split(' ')[0] || 'User',
    pct:  Math.round(a.matchPercentage || 0)
  }))

  const avgScore  = applicants.length
    ? Math.round(applicants.reduce((s, a) => s + (a.matchPercentage || 0), 0) / applicants.length)
    : 0
  const strongCnt = applicants.filter(a => (a.matchPercentage || 0) >= 70).length
  const topCand   = applicants[0]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link to="/recruiter/dashboard" className="text-purple-500 text-xs hover:underline">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Applicants</h1>
          {jobTitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">for <strong>{jobTitle}</strong></p>}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-16 justify-center">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
            Loading applicants…
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-sm">{error}</div>
        ) : applicants.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-14 text-center">
            <div className="text-5xl mb-4">👥</div>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">No applicants yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Students need to upload a resume and click "Find Matches" on their dashboard.</p>
          </div>
        ) : (
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Applicants', value: applicants.length,  icon: '👥', color: 'text-purple-600' },
                { label: 'Strong Matches',   value: strongCnt,          icon: '🔥', color: 'text-green-600' },
                { label: 'Avg Match Score',  value: avgScore + '%',     icon: '📊', color: 'text-blue-600' },
                { label: 'Top Candidate',    value: Math.round(topCand?.matchPercentage || 0) + '%', icon: '🥇', color: 'text-yellow-600' },
              ].map(k => (
                <div key={k.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">{k.icon}</div>
                  <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{k.label}</div>
                </div>
              ))}
            </div>

            {/* SVG bar chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">📊 Match Score Distribution (Top {chartData.length})</h3>
              <SVGBarChart data={chartData} />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {[['all','All','bg-purple-600'],['strong','🔥 Strong (≥70%)','bg-green-600'],['weak','⚠ Weak (<40%)','bg-red-500']].map(([id, label, active]) => (
                <button key={id} onClick={() => setFilter(id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    filter === id ? `${active} text-white shadow-sm` : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-400'
                  }`}>
                  {label} {id !== 'all' && <span className="ml-1 opacity-70">
                    ({applicants.filter(a => id==='strong'?(a.matchPercentage||0)>=70:(a.matchPercentage||0)<40).length})
                  </span>}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''} shown</p>

            {/* Applicant cards */}
            <div className="space-y-3">
              {filtered.map((a, i) => {
                const pct    = Math.round(a.matchPercentage || 0)
                const color  = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'
                const badge  = pct >= 80 ? { label: '🔥 Top Pick', cls: 'bg-green-100 text-green-700' }
                             : pct >= 60 ? { label: '✅ Good Fit', cls: 'bg-blue-100 text-blue-700' }
                             : pct >= 40 ? { label: '⚡ Potential', cls: 'bg-yellow-100 text-yellow-700' }
                             :             { label: '⚠ Low Match', cls: 'bg-red-100 text-red-600' }

                return (
                  <div key={a.matchId || i}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <span className="w-6 text-center text-xs font-bold text-gray-400 flex-shrink-0">#{i + 1}</span>
                      {/* Avatar */}
                      <Avatar name={a.studentName} rank={i} />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{a.studentName}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{a.studentEmail}</p>
                        <div className="flex gap-3 mt-1 text-xs">
                          <span className="text-green-600 font-medium">
                            ✓ {(a.requiredSkills || []).length - (a.missingSkills?.length || 0)} matched
                          </span>
                          <span className="text-red-500 font-medium">
                            ✗ {a.missingSkills?.length || 0} missing
                          </span>
                        </div>
                      </div>
                      {/* Score ring */}
                      <Ring pct={pct} size={56} stroke={5} color={color} />
                      {/* Expand */}
                      <button onClick={() => toggle(a.matchId || i)}
                        className="text-xs text-gray-400 hover:text-purple-600 transition border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 flex-shrink-0">
                        {expanded[a.matchId || i] ? '▲' : '▼'}
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {expanded[a.matchId || i] && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                        {(a.matchedSkills || (a.requiredSkills||[]).filter(s =>
                          !(a.missingSkills||[]).map(m=>m.toLowerCase()).includes(s.toLowerCase())
                        )).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1.5">✅ Matched Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(a.matchedSkills || (a.requiredSkills||[]).filter(s =>
                                !(a.missingSkills||[]).map(m=>m.toLowerCase()).includes(s.toLowerCase())
                              )).map(s => (
                                <span key={s} className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {a.missingSkills?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1.5">❌ Missing Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {a.missingSkills.map(s => (
                                <span key={s} className="bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1 rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Skill gap bar */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Skill Coverage</p>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{pct}% of required skills covered</p>
                        </div>
                        <p className="text-xs text-purple-500 cursor-pointer hover:underline">
                          📧 Contact: {a.studentEmail}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
