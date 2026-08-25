'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Navbar from '../../components/Navbar'
import {
  auth,
  sendEmailVerification,
  signOut
} from '../../lib/firebase'

export default function VerifyEmailPage() {
  const router = useRouter()

  const [sessionUser, setSessionUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadSession()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((previous) => previous - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const safeParse = (value) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const loadSession = () => {
    const session = safeParse(localStorage.getItem('resumemind_session'))

    if (!session) {
      router.replace('/login')
      return
    }

    const provider = session.provider || ''

    const isGoogleUser =
      provider === 'google' ||
      provider === 'google.com' ||
      session.providerId === 'google.com'

    const isMicrosoftUser =
  provider === 'microsoft' ||
  provider === 'microsoft.com' ||
  provider === 'outlook' ||
  provider === 'outlook.com' ||
  provider === 'hotmail' ||
  provider === 'hotmail.com' ||
  session.providerId === 'microsoft.com'

    if (session.emailVerified || isGoogleUser || isMicrosoftUser) {
      router.replace('/dashboard')
      return
    }

    setSessionUser(session)
    setChecking(false)
  }

  const updateSessionVerification = (verified) => {
    const currentSession = safeParse(localStorage.getItem('resumemind_session'))

    if (!currentSession) return

    const updatedSession = {
      ...currentSession,
      emailVerified: verified,
      verifiedAt: verified
        ? new Date().toISOString()
        : currentSession.verifiedAt
    }

    localStorage.setItem('resumemind_session', JSON.stringify(updatedSession))
    setSessionUser(updatedSession)
  }

  const handleSendVerification = async () => {
    if (sending || cooldown > 0) return

    setSending(true)

    try {
      const user = auth.currentUser

      if (!user) {
        showToast('Please login again to send verification email.', 'error')
        router.replace('/login')
        return
      }

      await user.reload()

      if (user.emailVerified) {
        updateSessionVerification(true)
        showToast('Email already verified.')
        router.replace('/dashboard')
        return
      }

      await sendEmailVerification(user)

      setCooldown(30)
      showToast('Verification email sent. Please check your inbox.')
    } catch (error) {
      console.error('Verification email error:', error)

      const errorCode = error?.code || ''

      if (errorCode === 'auth/too-many-requests') {
        setCooldown(60)
        showToast(
          'Too many verification requests. Please wait a few minutes before trying again.',
          'error'
        )
      } else if (errorCode === 'auth/requires-recent-login') {
        showToast('Please login again before sending verification email.', 'error')
        router.replace('/login')
      } else if (errorCode === 'auth/network-request-failed') {
        showToast('Network error. Please check your internet connection.', 'error')
      } else {
        showToast('Could not send verification email. Please try again later.', 'error')
      }
    } finally {
      setSending(false)
    }
  }

  const handleRefreshStatus = async () => {
    if (refreshing) return

    setRefreshing(true)

    try {
      const user = auth.currentUser

      if (!user) {
        showToast('Please login again to refresh status.', 'error')
        router.replace('/login')
        return
      }

      await user.reload()

      if (user.emailVerified) {
        updateSessionVerification(true)
        showToast('Email verified successfully.')
        router.replace('/dashboard')
        return
      }

      showToast('Email not verified yet. Please check your inbox.', 'error')
    } catch (error) {
      console.error('Refresh verification error:', error)

      const errorCode = error?.code || ''

      if (errorCode === 'auth/network-request-failed') {
        showToast('Network error. Please check your internet connection.', 'error')
      } else {
        showToast('Could not refresh verification status.', 'error')
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('resumemind_session')
      localStorage.removeItem('resumemind_latest_analysis')
      localStorage.removeItem('resumemind_latest_meta')

      router.push('/login')
    }
  }

  if (checking) {
    return (
      <main className="auth-loading-page">
        <div className="auth-loading-card">
          <div className="auth-loader"></div>

          <h2>Checking verification</h2>

          <p>Preparing your secure ResumeMind AI workspace...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="glow one"></div>
      <div className="glow two"></div>

      <div className="container">
        <Navbar />

        {toast ? (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ) : null}

        <section className="verify-email-wrapper">
          <div className="card verify-email-card">
            <div className="verify-icon">✉️</div>

            <span className="eyebrow">Email Verification Required</span>

            <h1>Verify your email</h1>

            <p>
              To protect resume data and keep your workspace secure, please verify
              your email before using ResumeMind AI.
            </p>

            <div className="verify-email-box">
              <span>Account email</span>
              <strong>{sessionUser?.email || 'Unknown email'}</strong>
            </div>

            <div className="verify-actions">
              <button
                type="button"
                className="button"
                onClick={handleSendVerification}
                disabled={sending || cooldown > 0}
              >
                {sending
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Try again in ${cooldown}s`
                    : 'Send Verification Email'}
              </button>

              <button
                type="button"
                className="button secondary-btn"
                onClick={handleRefreshStatus}
                disabled={refreshing}
              >
                {refreshing ? 'Checking...' : 'I Verified, Refresh'}
              </button>
            </div>

            <div className="verify-help">
              <h3>Didn’t receive the email?</h3>

              <ul>
                <li>Check your spam, promotions, updates, or junk folder.</li>
                <li>Wait a few seconds after clicking send.</li>
                <li>Avoid clicking send many times because Firebase may temporarily block emails.</li>
                <li>Use a real email like Gmail, Google account, or Outlook.</li>
              </ul>
            </div>

            <div className="verify-footer-actions">
              <Link href="/login">Back to Login</Link>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}