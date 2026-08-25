'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicRoute from '../../components/PublicRoute'
import Navbar from '../../components/Navbar'

import {
  auth,
  googleProvider,
  microsoftProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from '../../lib/firebase'

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const saveSession = (firebaseUser, provider = 'email', forceVerified = false) => {
    const sessionUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name:
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'User',
      photoURL: firebaseUser.photoURL || '',
      provider,
      emailVerified:
        forceVerified ||
        provider === 'google' ||
        provider === 'microsoft' ||
        Boolean(firebaseUser.emailVerified),
      loggedInAt: new Date().toISOString()
    }

    localStorage.setItem('resumemind_session', JSON.stringify(sessionUser))
    localStorage.setItem('resumemind_user_profile', JSON.stringify(sessionUser))
    localStorage.setItem('resumemind_user', JSON.stringify(sessionUser))
  }

  const getFirebaseErrorMessage = (code) => {
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.'
    }

    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    ) {
      return 'Invalid email or password.'
    }

    if (code === 'auth/popup-closed-by-user') {
      return 'Login was cancelled. Please try again.'
    }

    if (code === 'auth/cancelled-popup-request') {
      return 'Another popup was already opened. Please try again.'
    }

    if (code === 'auth/popup-blocked') {
      return 'Popup was blocked. Please allow popups and try again.'
    }

    if (code === 'auth/account-exists-with-different-credential') {
      return 'This email is already registered with another login method. Please use the original login method.'
    }

    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a few minutes and try again.'
    }

    if (code === 'auth/network-request-failed') {
      return 'Network error. Please check your internet and try again.'
    }

    return 'Login failed. Please try again.'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const cleanEmail = formData.email.trim().toLowerCase()

    if (!cleanEmail || !formData.password) {
      setError('Please enter email and password.')
      return
    }

    setLoading(true)

    try {
      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail)

      if (methods.length > 0 && !methods.includes('password')) {
        setError(
          'This email was registered using Google or Outlook. Please use the correct login method.'
        )
        setLoading(false)
        return
      }

      const response = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        formData.password
      )

      await response.user.reload()

      saveSession(response.user, 'email', false)

      if (!response.user.emailVerified) {
        router.push('/verify-email')
        return
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError(getFirebaseErrorMessage(error.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await signInWithPopup(auth, googleProvider)

      saveSession(response.user, 'google', true)
      router.push('/dashboard')
    } catch (error) {
      console.error('Google login error:', error)
      setError(getFirebaseErrorMessage(error.code))
    } finally {
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await signInWithPopup(auth, microsoftProvider)

      saveSession(response.user, 'microsoft', true)
      router.push('/dashboard')
    } catch (error) {
      console.error('Microsoft login error:', error)
      setError(getFirebaseErrorMessage(error.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicRoute>
      <main className="page">
        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">
          <Navbar />

          <section className="auth-layout">
            <div className="auth-copy">
              <span className="eyebrow">
                Welcome Back
              </span>

              <h1>
                Login to ResumeMind AI
              </h1>

              <p>
                Access your resume dashboard, saved reports, company matches,
                ATS scores, and improved resume workspace.
              </p>

              <div className="auth-feature-list">
                <span>📊 Resume Analytics</span>
                <span>🎯 ATS Score Insights</span>
                <span>📁 Saved Reports</span>
                <span>🧠 Skill Intelligence</span>
              </div>
            </div>

            <div className="auth-card">
              <span className="auth-icon">
                🔐
              </span>

              <h2>
                Login
              </h2>

              <p>
                Continue using Google, Outlook, or your verified email account.
              </p>

              {error ? (
                <div className="auth-error">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="google-icon">
                  G
                </span>

                {loading ? 'Please wait...' : 'Continue with Google'}
              </button>

              <button
                type="button"
                className="google-login-btn"
                onClick={handleMicrosoftLogin}
                disabled={loading}
                style={{ marginTop: '12px' }}
              >
                <span className="google-icon">
                  M
                </span>

                {loading ? 'Please wait...' : 'Continue with Outlook'}
              </button>

              <div className="auth-divider">
                <span></span>

                <p>
                  or login with email
                </p>

                <span></span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="button auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="auth-switch">
                Don&apos;t have an account?{' '}
                <Link href="/signup">
                  Create account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </PublicRoute>
  )
}