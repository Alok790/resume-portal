import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import GoogleLoginButton from '../components/GoogleLoginButton'

// ── Validators ────────────────────────────────────────────────────────────────
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE   = /^[+]?[0-9]{7,15}$/          // 7-15 digits, optional leading +
const NAME_RE    = /^[a-zA-Z\s.'-]{2,100}$/      // letters, spaces, dot, hyphen

function validate(form) {
  if (!NAME_RE.test(form.name.trim()))
    return 'Full name must be 2–100 characters (letters only).'
  if (!EMAIL_RE.test(form.email.trim()))
    return 'Enter a valid email address (e.g. you@example.com).'
  if (form.phone && !PHONE_RE.test(form.phone.replace(/[\s\-()]/g, '')))
    return 'Phone must be 7–15 digits (e.g. 9876543210 or +91 98765 43210).'
  if (form.password.length < 8)
    return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(form.password))
    return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(form.password))
    return 'Password must contain at least one number.'
  if (form.password !== form.confirmPassword)
    return 'Passwords do not match.'
  return null
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  if (!password) return null
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score-1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-600' : 'text-green-600'}`}>
        {labels[score - 1] || 'Too short'}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', institution: '', role: 'STUDENT'
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setFieldErrors(e => ({ ...e, [key]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const err = validate(form)
    if (err) { setError(err); return }
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      const res = await api.post('/auth/register', payload)
      login(res.data)
      navigate(res.data.role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-3 shadow-lg">R</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join thousands finding their dream jobs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">

          {/* Google OAuth */}
          <GoogleLoginButton mode="register" onSuccess={(data) => { login(data); navigate(data.role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard') }} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-600" /></div>
            <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-800 px-3 text-xs text-gray-400">or register with email</span></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am joining as</label>
              <div className="grid grid-cols-2 gap-3">
                {[['STUDENT','🎓','Student / Job Seeker'],['RECRUITER','💼','Recruiter / Employer']].map(([val, icon, label]) => (
                  <button key={val} type="button" onClick={() => set('role', val)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.role === val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="John Doe"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone <span className="text-gray-400 text-xs">(optional)</span></label>
                <input type="tel" placeholder="+91 9876543210"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {form.role === 'STUDENT' ? 'College / University' : 'Company Name'} <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input type="text" placeholder={form.role === 'STUDENT' ? 'e.g. IIT Delhi' : 'e.g. Google Inc.'}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                value={form.institution} onChange={e => set('institution', e.target.value)} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input type="email" required placeholder="you@example.com"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                value={form.email} onChange={e => set('email', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Must be a real email — used to verify your account.</p>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 chars"
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 transition placeholder-gray-400 dark:placeholder-gray-500"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs">{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                <PasswordStrength password={form.password} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" required placeholder="Repeat password"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
            </div>

            {/* Rules hint */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
              <p className={form.password.length >= 8 ? 'text-green-600' : ''}>✓ At least 8 characters</p>
              <p className={/[A-Z]/.test(form.password) ? 'text-green-600' : ''}>✓ One uppercase letter</p>
              <p className={/[0-9]/.test(form.password) ? 'text-green-600' : ''}>✓ One number</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm mt-2">
              {loading ? '⏳ Creating account…' : '🚀 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
