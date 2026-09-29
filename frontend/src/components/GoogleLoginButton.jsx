import React, { useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import api from '../api/axios'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

/**
 * props:
 *   mode       – 'login' | 'register'
 *   onSuccess  – called with AuthResponse data on success
 */
export default function GoogleLoginButton({ mode = 'login', onSuccess }) {
  const [error, setError] = useState('')

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed select-none"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#ccc"/>
        </svg>
        Continue with Google
        <span className="ml-1 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Soon</span>
      </button>
    )
  }

  const handleSuccess = async (credentialResponse) => {
    setError('')
    try {
      const res = await api.post('/auth/google', {
        credential: credentialResponse.credential,
        // For register mode, default to STUDENT — user can change on profile page
        role: mode === 'register' ? 'STUDENT' : undefined,
      })
      onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed')
    }
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="w-full">
        {error && (
          <p className="text-xs text-red-500 mb-2 text-center">{error}</p>
        )}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google sign-in was cancelled or failed')}
            text={mode === 'register' ? 'signup_with' : 'signin_with'}
            shape="rectangular"
            width="100%"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
