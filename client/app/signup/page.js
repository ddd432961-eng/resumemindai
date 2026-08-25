'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicRoute from '../../components/PublicRoute'
import Navbar from '../../components/Navbar'
import Signup from "../styles/signup.css";
import {
  auth,
  googleProvider,
  microsoftProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendEmailVerification
} from '../../lib/firebase'

import { validateSignupDetails } from '../../lib/validation'

export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
        formData.name ||
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
    if (code === 'auth/email-already-in-use') {
      return 'This email is already registered. Please login instead.'
    }

    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.'
    }

    if (code === 'auth/weak-password') {
      return 'Please create a stronger password.'
    }

    if (code === 'auth/popup-closed-by-user') {
      return 'Signup was cancelled. Please try again.'
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
      return 'Firebase temporarily blocked verification emails due to too many attempts. Please wait a few minutes and try again.'
    }

    if (code === 'auth/network-request-failed') {
      return 'Network error. Please check your internet and try again.'
    }

    return 'Signup failed. Please try again.'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateSignupDetails({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const cleanEmail = formData.email.trim().toLowerCase()
      const cleanName = formData.name.trim()

      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail)

      if (methods.length > 0) {
        setError('This email is already registered. Please login instead.')
        setLoading(false)
        return
      }

      const response = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        formData.password
      )

      await updateProfile(response.user, {
        displayName: cleanName
      })

      await sendEmailVerification(response.user)

      const updatedUser = {
        ...response.user,
        displayName: cleanName,
        emailVerified: false
      }

      saveSession(updatedUser, 'email', false)

      setSuccess(
        `Verification email sent to ${response.user.email}. Please check your inbox.`
      )

      router.push('/verify-email')
    } catch (error) {
      console.error('Signup error:', error)

      setError(getFirebaseErrorMessage(error.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
  if (loading) return

  setError('')
  setSuccess('')
  setLoading(true)

  try {
    const response = await signInWithPopup(
      auth,
      googleProvider
    )

    saveSession(response.user, 'google', true)
    router.push('/dashboard')
  } catch (error) {

    if (error.code === 'auth/cancelled-popup-request') {
      return
    }

    console.error('Google signup error:', error)
    setError(getFirebaseErrorMessage(error.code))
  } finally {
    setLoading(false)
  }
}

  const handleMicrosoftSignup = async () => {
  if (loading) return

  setError('')
  setSuccess('')
  setLoading(true)

  try {
    const response = await signInWithPopup(
      auth,
      microsoftProvider
    )

    saveSession(response.user, 'microsoft', true)
    router.push('/dashboard')
  } catch (error) {

    if (error.code === 'auth/cancelled-popup-request') {
      return
    }

    console.error('Microsoft signup error:', error)
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
                Start Your Journey
              </span>

              <h1>
                Create your ResumeMind AI account
              </h1>

              <p>
                Sign up to analyze resumes, track ATS scores, compare company
                matches, save reports, and build improved resumes.
              </p>

              <div className="auth-feature-list">
                <span>🚀 AI Resume Analyzer</span>
                <span>🎯 ATS Score Tracking</span>
                <span>🏢 Company Match Reports</span>
                <span>📄 Resume Builder</span>
              </div>
            </div>

            <div className="auth-card">
              <span className="auth-icon">
                ✨
              </span>

              <h2>
                Signup
              </h2>

              <p>
                Create your account using Google, Outlook, or a verified trusted email.
              </p>

              {error ? (
                <div className="auth-error">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="auth-success">
                  {success}
                </div>
              ) : null}

              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleSignup}
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
                onClick={handleMicrosoftSignup}
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
                  or signup with trusted email
                </p>

                <span></span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                    placeholder="Create strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="button auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{' '}
                <Link href="/login">
                  Login
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </PublicRoute>
  )
}