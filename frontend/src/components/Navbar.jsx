import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

// ── Dark mode: persisted in localStorage ─────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, () => setDark(d => !d)]
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [picUrl, setPicUrl]       = useState(null)
  const [dark, toggleDark]        = useDarkMode()
  const menuRef = useRef()

  const fetchPic = () => {
    if (!user) { setPicUrl(null); return }
    api.get('/profile')
      .then(res => {
        if (res.data.profilePictureUrl) {
          setPicUrl(`http://localhost:8080${res.data.profilePictureUrl}?t=${Date.now()}`)
        } else {
          setPicUrl(null)
        }
      })
      .catch(() => setPicUrl(null))
  }

  // Fetch on login / user change
  useEffect(() => { fetchPic() }, [user?.id])

  // Re-fetch when Profile page fires 'profile-updated'
  useEffect(() => {
    window.addEventListener('profile-updated', fetchPic)
    return () => window.removeEventListener('profile-updated', fetchPic)
  }, [user?.id])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const dashboardPath = user?.role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard'

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const roleColor = user?.role === 'STUDENT'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-purple-100 text-purple-700'

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-0 h-14 flex items-center justify-between shadow-sm transition-colors">

      {/* Brand — SkillMatch AI logo */}
      <Link to={dashboardPath} className="flex items-center gap-2.5 select-none">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
          {/* Circuit/AI icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
          </svg>
        </div>
        <div className="leading-tight">
          <span className="text-gray-900 dark:text-white font-bold text-sm tracking-tight block">SkillMatch</span>
          <span className="text-blue-500 text-xs font-semibold tracking-widest uppercase block" style={{letterSpacing:'0.15em'}}>AI Portal</span>
        </div>
      </Link>

      {user && (
        <div className="flex items-center gap-2" ref={menuRef}>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {/* Role badge — clean, compact */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:inline-block ${roleColor}`}>
            {user.role === 'STUDENT' ? '🎓 Student' : '💼 Recruiter'}
          </span>

          {/* Avatar button */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            title={user.name}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
          >
            {picUrl ? (
              <img
                src={picUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={() => setPicUrl(null)}
              />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-4 top-14 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">

              {/* User info header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  {picUrl ? (
                    <img src={picUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-base">👤</span>
                  <span>My Profile</span>
                </Link>
                <Link to={dashboardPath} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-base">🏠</span>
                  <span>Dashboard</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-600">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <span className="text-base">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
