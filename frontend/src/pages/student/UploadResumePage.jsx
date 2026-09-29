import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import usePolling from '../../hooks/usePolling'

const AI_STEPS = [
  { icon: '📤', label: 'Uploading PDF to server…',         pct: 15 },
  { icon: '🔍', label: 'Parsing document structure…',       pct: 30 },
  { icon: '🧠', label: 'Running NLP skill extraction…',     pct: 55 },
  { icon: '🗂️', label: 'Categorising skills by domain…',   pct: 75 },
  { icon: '📊', label: 'Building your skill profile…',      pct: 90 },
  { icon: '✅', label: 'Finalising analysis…',              pct: 98 },
]

export default function UploadResumePage() {
  const [file, setFile]                     = useState(null)
  const [uploading, setUploading]           = useState(false)
  const [uploadedResume, setUploadedResume] = useState(null)
  const [error, setError]                   = useState('')
  const [dragOver, setDragOver]             = useState(false)
  const [stepIdx, setStepIdx]               = useState(0)
  const [fakePct, setFakePct]               = useState(0)
  const stepTimer                           = useRef(null)
  const resumeIdRef                         = useRef(null)   // ← stable ref, no stale closure
  const redirected                          = useRef(false)  // ← prevent double-redirect
  const navigate                            = useNavigate()

  /* Advance fake progress steps while PENDING */
  useEffect(() => {
    if (!uploadedResume || uploadedResume.status === 'PROCESSED') return
    stepTimer.current = setInterval(() => {
      setStepIdx(i => {
        const next = Math.min(i + 1, AI_STEPS.length - 1)
        setFakePct(AI_STEPS[next].pct)
        return next
      })
    }, 1800)
    return () => clearInterval(stepTimer.current)
  }, [uploadedResume?.id])

  /* Poll backend every 2 s — uses ref so no stale closure */
  const checkStatus = useCallback(async () => {
    const id = resumeIdRef.current
    if (!id || redirected.current) return
    try {
      const res = await api.get('/resume/my')
      const updated = res.data.find(r => r.id === id)
      if (!updated) return
      setUploadedResume(updated)

      if (updated.status === 'PROCESSED') {
        if (redirected.current) return
        redirected.current = true
        clearInterval(stepTimer.current)
        setFakePct(100)

        // Short pause so user sees 100%, then run matching + redirect
        setTimeout(async () => {
          try {
            await api.post(`/match/run?resumeId=${id}`)
          } catch (_) {
            // Flask may be down — matching returns 0% scores, still redirect
          }
          navigate(`/student/analysis/${id}`)
        }, 1400)
      }
    } catch (_) {
      // network blip — will retry on next poll
    }
  }, [navigate])   // navigate is stable; resumeIdRef.current read inside, no closure issue

  usePolling(checkStatus, 2000, () => redirected.current)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      resumeIdRef.current = res.data.id   // set ref immediately
      redirected.current  = false
      setUploadedResume(res.data)
      setStepIdx(0)
      setFakePct(AI_STEPS[0].pct)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
  }

  /* ── ANALYSING VIEW ─────────────────────────────── */
  if (uploadedResume) {
    const step  = AI_STEPS[stepIdx]
    const isDone = uploadedResume.status === 'PROCESSED'
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <style>{`
          @keyframes orbit { from{transform:rotate(0deg) translateX(60px) rotate(0deg)} to{transform:rotate(360deg) translateX(60px) rotate(-360deg)} }
          @keyframes orbitR{ from{transform:rotate(180deg) translateX(80px) rotate(-180deg)} to{transform:rotate(540deg) translateX(80px) rotate(-540deg)} }
          @keyframes pulse2{ 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
          @keyframes fadeUp{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          .orbit1{animation:orbit 3s linear infinite}
          .orbit2{animation:orbitR 2.2s linear infinite}
          .pulse2{animation:pulse2 2s ease-in-out infinite}
          .fadeup{animation:fadeUp .5s ease forwards}
        `}</style>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          {/* Orbital brain animation */}
          <div className="relative w-40 h-40 mb-10">
            <div className="absolute inset-0 rounded-full border border-blue-500/20" />
            <div className="absolute inset-4 rounded-full border border-purple-500/30" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center pulse2 shadow-2xl shadow-blue-500/40">
              <span className="text-3xl">{isDone ? '✅' : step.icon}</span>
            </div>
            {!isDone && (
              <>
                <div className="orbit1 absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-blue-400" />
                <div className="orbit2 absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 w-3 h-3 rounded-full bg-purple-400" />
              </>
            )}
          </div>

          {/* Status text */}
          <div className="text-center mb-8 fadeup" key={stepIdx}>
            <h2 className="text-2xl font-bold mb-2">
              {isDone ? '🎉 Analysis Complete!' : 'AI Analysing Your Resume'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isDone ? 'Running job matching… redirecting shortly.' : step.label}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Progress</span><span>{fakePct}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fakePct}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }}
              />
            </div>
          </div>

          {/* Step list */}
          <div className="w-full max-w-sm space-y-2">
            {AI_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                i < stepIdx || isDone ? 'text-green-400' : i === stepIdx ? 'text-white' : 'text-gray-600'
              }`}>
                <span className="w-5 text-center">
                  {i < stepIdx || isDone ? '✓' : i === stepIdx ? '›' : '·'}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* File chip */}
          <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300">
            <span>📄</span>
            <span className="truncate max-w-xs">{uploadedResume.filePath?.split(/[\\/]/).pop()}</span>
          </div>
        </div>
      </div>
    )
  }

  /* ── UPLOAD FORM VIEW ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Your Resume</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Our AI extracts your skills, scores them, and instantly matches you to real jobs.
          </p>
        </div>

        <form onSubmit={handleUpload}>
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all mb-4 ${
              dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]' :
              file     ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
                         'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-800'
            }`}
            onClick={() => document.getElementById('resume-file').click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <>
                <div className="text-5xl mb-3">📄</div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB · PDF</p>
                <p className="text-xs text-green-600 mt-2 font-medium">✓ Ready to upload</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">☁️</div>
                <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg">Drag & drop your PDF here</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">or click to browse files</p>
                <p className="text-gray-300 dark:text-gray-600 text-xs mt-3">PDF only · Max 10 MB</p>
              </>
            )}
          </div>

          <input id="resume-file" type="file" accept=".pdf" className="hidden"
            onChange={e => setFile(e.target.files[0])} />

          {file && (
            <button type="button" onClick={() => setFile(null)}
              className="text-xs text-gray-400 hover:text-red-500 mb-3 block transition-colors">
              ✕ Remove file
            </button>
          )}

          <button type="submit" disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3.5 text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-blue-200">
            {uploading ? '⏳ Uploading…' : '🚀 Upload & Analyse with AI'}
          </button>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[['🔍','NLP Extraction','We detect 200+ skills'],['📊','Visual Analysis','Charts & gap analysis'],['🎯','Job Matching','Real-time match scores']].map(([icon,title,sub]) => (
              <div key={title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
}
