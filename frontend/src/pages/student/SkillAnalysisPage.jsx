import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

/* ── Helpers ────────────────────────────────────────── */
const CATEGORIES = {
  'Languages':     ['python','java','javascript','typescript','c++','c#','go','rust','kotlin','swift','ruby','php','scala','r','matlab'],
  'Frontend':      ['react','vue','angular','html','css','tailwind','bootstrap','nextjs','svelte','sass','redux'],
  'Backend':       ['spring','nodejs','django','flask','fastapi','express','laravel','rails','graphql','rest','grpc'],
  'Databases':     ['mysql','postgresql','mongodb','redis','sqlite','cassandra','firebase','dynamodb','oracle','elasticsearch'],
  'Cloud & DevOps':['aws','azure','gcp','docker','kubernetes','terraform','jenkins','github actions','ci/cd','linux','nginx'],
  'AI / ML':       ['machine learning','deep learning','tensorflow','pytorch','scikit-learn','nlp','pandas','numpy','opencv','huggingface'],
  'Tools':         ['git','jira','figma','postman','vs code','intellij','eclipse','webpack','vite','maven','gradle'],
}

function categorise(skills) {
  const result = {}
  const used = new Set()
  for (const [cat, vocab] of Object.entries(CATEGORIES)) {
    const found = skills.filter(s => vocab.includes(s.toLowerCase()) && !used.has(s.toLowerCase()))
    if (found.length) {
      result[cat] = found
      found.forEach(s => used.add(s.toLowerCase()))
    }
  }
  const other = skills.filter(s => !used.has(s.toLowerCase()))
  if (other.length) result['Other'] = other
  return result
}

const SUGGESTIONS = {
  'Languages':      { learn: ['Go','Rust','TypeScript'],   courses: [['Go by Google','https://go.dev/tour'],['TypeScript Deep Dive','https://basarat.gitbook.io/typescript']] },
  'Frontend':       { learn: ['Next.js','Svelte','React Native'], courses: [['Next.js Docs','https://nextjs.org/learn'],['Svelte Tutorial','https://learn.svelte.dev']] },
  'Backend':        { learn: ['GraphQL','FastAPI','gRPC'],  courses: [['FastAPI Docs','https://fastapi.tiangolo.com'],['GraphQL Learn','https://graphql.org/learn']] },
  'Databases':      { learn: ['Redis','PostgreSQL','MongoDB'], courses: [['Postgres Tutorial','https://www.postgresqltutorial.com'],['MongoDB University','https://learn.mongodb.com']] },
  'Cloud & DevOps': { learn: ['Kubernetes','Terraform','GitHub Actions'], courses: [['K8s Docs','https://kubernetes.io/docs/tutorials'],['Terraform Get Started','https://developer.hashicorp.com/terraform']] },
  'AI / ML':        { learn: ['PyTorch','HuggingFace','LangChain'], courses: [['HuggingFace Course','https://huggingface.co/learn'],['Fast.ai','https://course.fast.ai']] },
  'Tools':          { learn: ['Docker','Figma','Terraform'], courses: [['Docker 101','https://www.docker.com/101-tutorial'],['Figma for Devs','https://help.figma.com']] },
}

const JOB_BOARDS = [
  { name: 'LinkedIn Jobs',  url: s => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(s)}`, icon: '💼' },
  { name: 'Indeed',         url: s => `https://www.indeed.com/jobs?q=${encodeURIComponent(s)}`,                  icon: '🔎' },
  { name: 'Glassdoor',      url: s => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(s)}`, icon: '🏢' },
  { name: 'Naukri',         url: s => `https://www.naukri.com/${encodeURIComponent(s)}-jobs`,                     icon: '📋' },
  { name: 'AngelList',      url: s => `https://wellfound.com/jobs?q=${encodeURIComponent(s)}`,                    icon: '🚀' },
]

const CAT_COLORS = {
  'Languages':'blue','Frontend':'purple','Backend':'green','Databases':'orange',
  'Cloud & DevOps':'cyan','AI / ML':'pink','Tools':'gray','Other':'slate'
}
const C = (cat) => ({
  blue:   { bg:'bg-blue-100',   text:'text-blue-700',   bar:'#3b82f6', border:'border-blue-200' },
  purple: { bg:'bg-purple-100', text:'text-purple-700', bar:'#8b5cf6', border:'border-purple-200' },
  green:  { bg:'bg-green-100',  text:'text-green-700',  bar:'#10b981', border:'border-green-200' },
  orange: { bg:'bg-orange-100', text:'text-orange-700', bar:'#f97316', border:'border-orange-200' },
  cyan:   { bg:'bg-cyan-100',   text:'text-cyan-700',   bar:'#06b6d4', border:'border-cyan-200' },
  pink:   { bg:'bg-pink-100',   text:'text-pink-700',   bar:'#ec4899', border:'border-pink-200' },
  gray:   { bg:'bg-gray-100',   text:'text-gray-700',   bar:'#6b7280', border:'border-gray-200' },
  slate:  { bg:'bg-slate-100',  text:'text-slate-700',  bar:'#64748b', border:'border-slate-200' },
}[CAT_COLORS[cat] || 'gray'])

/* Circular score */
function CircleScore({ pct, size = 80, stroke = 7, color = '#3b82f6' }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={size * 0.22}
        fontWeight="bold" fill={color}>{pct}%</text>
    </svg>
  )
}

export default function SkillAnalysisPage() {
  const { resumeId }  = useParams()
  const navigate      = useNavigate()
  const [resume, setResume]   = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('overview') // overview | jobs | suggest

  useEffect(() => {
    Promise.all([
      api.get('/resume/my'),
      api.get(`/match/my?resumeId=${resumeId}`)
    ]).then(([rRes, mRes]) => {
      const r = rRes.data.find(x => String(x.id) === String(resumeId))
      setResume(r || null)
      setMatches(mRes.data || [])
    }).finally(() => setLoading(false))
  }, [resumeId])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your skill analysis…</p>
      </div>
    </div>
  )

  const parseSkills = (s) => { try { const p = JSON.parse(s||'[]'); return Array.isArray(p)?p:[] } catch { return [] } }
  const skills     = parseSkills(resume?.extractedSkills)
  const cats       = categorise(skills)
  const catEntries = Object.entries(cats)
  const topMatch   = matches[0]
  const avgMatch   = matches.length ? Math.round(matches.reduce((a,m) => a + m.matchPercentage, 0) / matches.length) : 0
  const topSkill   = [...catEntries].sort((a,b)=>b[1].length-a[1].length)[0]?.[0] || 'General'

  /* Build query from top 3 skills for external job boards */
  const jobQuery = skills.slice(0,3).join(' ')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link to="/student/dashboard" className="text-blue-500 text-xs hover:underline">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Skill Analysis & Job Matches</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {resume?.filePath?.split(/[\\/]/).pop()?.replace(/^\d+_/,'') || 'Your resume'}
            </p>
          </div>
          <button onClick={() => navigate(`/student/matches/${resumeId}`)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium">
            View Full Match List →
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:'Skills Found',    value: skills.length, icon:'🧠', color:'text-blue-600' },
            { label:'Skill Categories',value: catEntries.length, icon:'🗂️', color:'text-purple-600' },
            { label:'Jobs Matched',    value: matches.length, icon:'🎯', color:'text-green-600' },
            { label:'Avg Match Score', value: avgMatch+'%', icon:'📊', color:'text-orange-600' },
          ].map(k => (
            <div key={k.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['overview','📊 Overview'],['jobs','🎯 Job Matches'],['suggest','💡 Suggestions']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab===id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ─────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {skills.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">🤷</div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">No skills detected</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Make sure your resume PDF has a clear text-based Skills section.</p>
              </div>
            ) : (
              <>
                {/* Category breakdown bars */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Skills by Category</h3>
                  <div className="space-y-4">
                    {catEntries.map(([cat, skls]) => {
                      const c = C(cat)
                      const pct = Math.round((skls.length / skills.length) * 100)
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                            <span className="text-gray-400 dark:text-gray-500">{skls.length} skills · {pct}%</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width:`${pct}%`, background: c.bar }} />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {skls.map(s => (
                              <span key={s} className={`${c.bg} ${c.text} border ${c.border} text-xs px-2.5 py-1 rounded-full font-medium`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Radar-like polygon using SVG */}
                {catEntries.length >= 3 && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Skill Radar</h3>
                    <SkillRadar cats={catEntries} total={skills.length} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── JOBS TAB ─────────────────────────────── */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              /* No jobs in DB → show live job board links */
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">No internal jobs posted yet</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">No recruiters have posted jobs on this portal yet — but your skills are real! Here are live job boards searching for your exact skills right now:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {JOB_BOARDS.map(board => (
                    <a key={board.name} href={board.url(jobQuery)} target="_blank" rel="noreferrer"
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-md group">
                      <span className="text-3xl">{board.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition">{board.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Search: "{jobQuery || 'your skills'}"</p>
                      </div>
                      <span className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition">→</span>
                    </a>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
                  💡 Share this portal with recruiters so they can post jobs — your resume is already analysed and ready to match!
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">{matches.length} jobs matched — sorted by score</p>
                {matches.map((m, i) => (
                  <RichMatchCard key={m.matchId || i} match={m} rank={i+1} />
                ))}
                {/* Always show job boards at bottom too */}
                <div className="mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">🌐 Also search live job boards</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_BOARDS.map(b => (
                      <a key={b.name} href={b.url(jobQuery)} target="_blank" rel="noreferrer"
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-400 rounded-xl px-3 py-1.5 text-xs flex items-center gap-1.5 transition hover:text-blue-600 text-gray-700 dark:text-gray-300">
                        {b.icon} {b.name}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── SUGGESTIONS TAB ─────────────────────────────── */}
        {tab === 'suggest' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Your Strongest Domain</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Based on your resume, you excel in <strong className="text-blue-600">{topSkill}</strong>. Here are personalised next steps:</p>
            </div>
            {catEntries.map(([cat]) => {
              const sug = SUGGESTIONS[cat]
              if (!sug) return null
              const c = C(cat)
              return (
                <div key={cat} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`${c.bg} ${c.text} text-xs font-bold px-2.5 py-1 rounded-full`}>{cat}</span>
                    <span className="text-gray-400 text-xs">· {cats[cat]?.length || 0} skills detected</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📈 Skills to add next:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sug.learn.map(sk => (
                      <span key={sk} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 border-dashed">
                        + {sk}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Free learning resources:</p>
                  <div className="flex flex-wrap gap-2">
                    {sug.courses.map(([name, url]) => (
                      <a key={name} href={url} target="_blank" rel="noreferrer"
                        className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-xl hover:bg-blue-100 transition flex items-center gap-1">
                        🔗 {name}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Skill gap vs top job */}
            {topMatch && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Gap vs Your Best Match</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">"{topMatch.jobTitle}" — {Math.round(topMatch.matchPercentage)}% match</p>
                {topMatch.missingSkills?.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Add these to reach 100%:</p>
                    <div className="flex flex-wrap gap-2">
                      {topMatch.missingSkills.map(s => (
                        <span key={s} className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1 rounded-full">
                          ✗ {s}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-green-600 text-sm font-semibold">🎉 You have all required skills for this job!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Rich Match Card ──────────────────────────────────── */
function RichMatchCard({ match, rank }) {
  const pct = Math.round(match.matchPercentage || 0)
  const matched = (match.requiredSkills||[]).filter(s => !(match.missingSkills||[]).map(m=>m.toLowerCase()).includes(s.toLowerCase()))
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <CircleScore pct={pct} size={64} stroke={6} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">#{rank}</span>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{match.jobTitle}</h3>
            {pct >= 80 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">🔥 Strong match</span>}
          </div>
          {match.jobDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{match.jobDescription}</p>
          )}
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span className="text-green-600 font-medium">✓ {matched.length} matched</span>
            <span className="text-red-500 font-medium">✗ {match.missingSkills?.length||0} missing</span>
          </div>
        </div>
        <button onClick={() => setOpen(o=>!o)}
          className="text-xs text-gray-400 hover:text-blue-500 transition flex-shrink-0 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1">
          {open ? 'Less ▲' : 'More ▼'}
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {matched.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">✅ Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {matched.map(s => (
                  <span key={s} className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
          {match.missingSkills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">❌ Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {match.missingSkills.map(s => (
                  <span key={s} className="bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
          {/* Search this job on boards */}
          <div className="flex flex-wrap gap-2 pt-1">
            {JOB_BOARDS.slice(0,3).map(b => (
              <a key={b.name} href={b.url(match.jobTitle)} target="_blank" rel="noreferrer"
                className="text-xs text-blue-600 hover:underline">{b.icon} Apply on {b.name}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Skill Radar SVG ──────────────────────────────────── */
function SkillRadar({ cats, total }) {
  const entries = cats.slice(0, 7)
  const n = entries.length
  if (n < 3) return null
  const cx = 160, cy = 160, R = 120
  const angle = (i) => (Math.PI * 2 * i / n) - Math.PI / 2

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const axes = entries.map(([cat, skls], i) => ({
    cat, pct: skls.length / total,
    x: cx + R * Math.cos(angle(i)),
    y: cy + R * Math.sin(angle(i)),
  }))

  const polyPts = axes.map(a => {
    const r = a.pct * R
    const i = axes.indexOf(a)
    return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`
  }).join(' ')

  return (
    <div className="flex justify-center">
      <svg width={320} height={320} viewBox="0 0 320 320">
        {/* Grid */}
        {gridLevels.map(lvl => (
          <polygon key={lvl}
            points={axes.map((_,i)=>`${cx+R*lvl*Math.cos(angle(i))},${cy+R*lvl*Math.sin(angle(i))}`).join(' ')}
            fill="none" stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* Axes */}
        {axes.map((a,i)=>(
          <line key={i} x1={cx} y1={cy} x2={cx+R*Math.cos(angle(i))} y2={cy+R*Math.sin(angle(i))}
            stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* Data polygon */}
        <polygon points={polyPts} fill="#3b82f620" stroke="#3b82f6" strokeWidth="2" />
        {/* Labels */}
        {axes.map((a,i)=>{
          const lx = cx + (R+22)*Math.cos(angle(i))
          const ly = cy + (R+22)*Math.sin(angle(i))
          return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#6b7280" fontWeight="600">{a.cat.split(' ')[0]}</text>
        })}
      </svg>
    </div>
  )
}
