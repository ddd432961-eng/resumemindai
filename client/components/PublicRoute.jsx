'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PublicRoute({ children }) {
  const router = useRouter()

  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    checkPublicAccess()
  }, [])

  const safeParse = (value) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const checkPublicAccess = () => {
    if (typeof window === 'undefined') return

    const session = safeParse(
      localStorage.getItem('resumemind_session')
    )

    if (session) {
      router.replace('/dashboard')
      return
    }

    setAllowed(true)
    setChecking(false)
  }

  if (checking) {
    return (
      <main className="auth-loading-page">
        <div className="auth-loading-card">
          <div className="auth-loader"></div>

          <h2>
            Checking access
          </h2>

          <p>
            Preparing your ResumeMind AI experience...
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