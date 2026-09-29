import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const PHONE_RE = /^[+]?[0-9]{7,15}$/
const NAME_RE  = /^[a-zA-Z\s.'-]{2,100}$/

function validate(form) {
  if (!NAME_RE.test(form.name.trim())) return 'Name must be 2–100 characters (letters only).'
  if (form.phone && !PHONE_RE.test(form.phone.replace(/[\s\-()]/g, '')))
    return 'Phone must be 7–15 digits.'
  return null
}

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm]       = useState({ name: '', phone: '', institution: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    api.get('/profile')
      .then(res => {
        setProfile(res.data)
        setForm({
          name:        res.data.name        || '',
          phone:       res.data.phone       || '',
          institution: res.data.institution || '',
          bio:         res.data.bio         || '',
        })
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const err = validate(form)
    if (err) { setError(err); return }
    setSaving(true)
    try {
      const res = await api.put('/profile', form)
      setProfile(res.data)
      setSuccess('Profile updated successfully!')
      // Refresh auth context so navbar shows updated name
      login({ ...res.data, token: localStorage.getItem('auth_token'), userId: res.data.userId })
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handlePicture = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return }
    setError(''); setSuccess(''); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(res.data)
      setSuccess('Profile picture updated!')
      // Tell Navbar to refresh its avatar
      window.dispatchEvent(new Event('profile-updated'))
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = profile?.profilePictureUrl
    ? `http://localhost:8080${profile.profilePictureUrl}?t=${Date.now()}`
    : null

  const initials = (profile?.name || user?.name || '?')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const dashPath = user?.role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard'

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to={dashPath} className="hover:text-blue-600">← Dashboard</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">My Profile</span>
        </div>

        {/* Header card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-blue-600">{initials}</span>
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow text-sm disabled:opacity-50 transition-colors"
              title="Change photo"
            >
              {uploading ? '⏳' : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                profile?.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {profile?.role === 'STUDENT' ? '🎓 Student' : '💼 Recruiter'}
              </span>
              {profile?.googleLinked && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  ✓ Google Verified
                </span>
              )}
              {!profile?.googleLinked && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                  Email sign-in
                </span>
              )}
              {profile?.institution && (
                <span className="text-xs text-gray-500">🏫 {profile.institution}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Member since {profile?.createdAt?.slice(0, 10) || '—'}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm flex gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm flex gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* Edit form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3">
            Edit Profile Details
          </h3>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input type="text" required
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Phone + Institution */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" placeholder="+91 9876543210"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {profile?.role === 'STUDENT' ? 'College / University' : 'Company'}
              </label>
              <input type="text"
                placeholder={profile?.role === 'STUDENT' ? 'e.g. IIT Delhi' : 'e.g. Google'}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="flex items-center gap-2">
              <input type="email" disabled value={profile?.email || ''}
                className="flex-1 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed" />
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">cannot be changed</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea rows={3} maxLength={500}
              placeholder={profile?.role === 'STUDENT'
                ? 'Tell recruiters about yourself, your skills and career goals…'
                : 'Describe your company and what you are looking for in candidates…'}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none placeholder-gray-400 dark:placeholder-gray-500"
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-0.5">{form.bio.length}/500</p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
            {saving ? '⏳ Saving…' : '💾 Save Profile'}
          </button>
        </form>

        {/* Profile completeness */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">📊 Profile Completeness</p>
          <div className="space-y-2">
            {[
              ['Name',        !!profile?.name],
              ['Phone',       !!profile?.phone],
              ['Institution', !!profile?.institution],
              ['Bio',         !!profile?.bio],
              ['Profile Photo', !!profile?.profilePictureUrl],
              ['Verified Email (Google)', profile?.googleLinked],
            ].map(([label, done]) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className={done ? 'text-green-500' : 'text-gray-300'}>
                  {done ? '✓' : '○'}
                </span>
                <span className={done ? 'text-green-700' : 'text-gray-500'}>{label}</span>
              </div>
            ))}
          </div>
          {(() => {
            const filled = [profile?.name, profile?.phone, profile?.institution, profile?.bio, profile?.profilePictureUrl, profile?.googleLinked].filter(Boolean).length
            const pct = Math.round((filled / 6) * 100)
            return (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>Progress</span><span>{pct}%</span></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })()}
        </div>

      </div>
    </div>
  )
}
