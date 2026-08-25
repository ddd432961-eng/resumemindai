'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const safeParse = (value) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const checkAuth = () => {
    if (typeof window === 'undefined') return

    setCheckingAuth(true)
    setAllowed(false)

    const publicRoutes = ['/', '/login', '/signup']
    const verifyRoute = '/verify-email'

    const session = safeParse(
      localStorage.getItem('resumemind_session')
    )

    const isPublicRoute = publicRoutes.includes(pathname)
    const isVerifyRoute = pathname === verifyRoute

    if (!session) {
      if (isPublicRoute) {
        setAllowed(true)
        setCheckingAuth(false)
        return
      }

      router.replace('/login')
      return
    }

    const provider = session.provider || session.providerId || ''

    const isTrustedProvider =
      provider === 'google' ||
      provider === 'google.com' ||
      provider === 'microsoft' ||
      provider === 'microsoft.com'

    const emailVerified = Boolean(session.emailVerified)

    if (session && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/dashboard')
      return
    }

    if (!emailVerified && !isTrustedProvider && !isVerifyRoute) {
      router.replace('/verify-email')
      return
    }

    if ((emailVerified || isTrustedProvider) && isVerifyRoute) {
      router.replace('/dashboard')
      return
    }

    setAllowed(true)
    setCheckingAuth(false)
  }

  if (checkingAuth) {
    return (
      <main className="auth-loading-page">
        <div className="auth-loading-card">
          <div className="auth-loader"></div>

          <h2>
            Checking your session
          </h2>

          <p>
            Securing your ResumeMind AI workspace...
          </p>
        </div>
      </main>
    )
  }

  if (!allowed) {
    return null
  }

  return children
}