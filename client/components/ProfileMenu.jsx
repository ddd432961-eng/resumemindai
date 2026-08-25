'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { auth, signOut } from '../lib/firebase'

export default function ProfileMenu() {

  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  const [user, setUser] = useState(null)

  const [stats, setStats] = useState({
    analyses: 0,
    reports: 0,
    resumes: 0
  })

  useEffect(() => {

    const safeParse = (value, fallback = null) => {

      try {
        return JSON.parse(value)
      } catch {
        return fallback
      }
    }

    const loadUserFromStorage = () => {

      if (typeof window === 'undefined') return

      const session =
        localStorage.getItem('resumemind_session')

      const savedUser =
        localStorage.getItem('resumemind_user')

      if (!session && !savedUser) {

        setUser(null)
        setReady(true)

        return
      }

      const parsedUser = savedUser
        ? safeParse(savedUser)
        : safeParse(session)

      setUser(parsedUser)
      setReady(true)
    }

    const loadStats = () => {

      if (typeof window === 'undefined') return

      const history = safeParse(
        localStorage.getItem(
          'resumemind_analysis_history'
        ) || '[]',
        []
      )

      const reports = safeParse(
        localStorage.getItem(
          'resumemind_saved_reports'
        ) || '[]',
        []
      )

      const resumes =
        safeParse(
          localStorage.getItem(
            'resumemind_saved_resumes'
          ) || '[]',
          []
        ) ||
        safeParse(
          localStorage.getItem(
            'resumemind_created_resumes'
          ) || '[]',
          []
        )

      setStats({
        analyses:
          Array.isArray(history)
            ? history.length
            : 0,

        reports:
          Array.isArray(reports)
            ? reports.length
            : 0,

        resumes:
          Array.isArray(resumes)
            ? resumes.length
            : 0
      })
    }

    const syncLocalUser = (firebaseUser) => {

      const providerId =
        firebaseUser.providerData?.[0]?.providerId ||
        'firebase'

      const isTrustedProvider =
        providerId === 'google.com' ||
        providerId === 'microsoft.com'

      const cleanUser = {

        uid: firebaseUser.uid,

        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'ResumeMind User',

        displayName:
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'ResumeMind User',

        email:
          firebaseUser.email || '',

        photoURL:

          firebaseUser.photoURL ||

          firebaseUser.providerData?.[0]?.photoURL ||

          `https://ui-avatars.com/api/?name=${
            encodeURIComponent(
              firebaseUser.displayName ||
              firebaseUser.email ||
              'User'
            )
          }&background=0D8ABC&color=fff`,

        provider: providerId,

        providerId,

        emailVerified:
          isTrustedProvider ||
          Boolean(firebaseUser.emailVerified),

        loggedInAt:
          new Date().toISOString()
      }

      setUser(cleanUser)

      localStorage.setItem(
        'resumemind_user',
        JSON.stringify(cleanUser)
      )

      localStorage.setItem(
        'resumemind_user_profile',
        JSON.stringify(cleanUser)
      )

      localStorage.setItem(
        'resumemind_session',
        JSON.stringify(cleanUser)
      )
    }

    loadUserFromStorage()
    loadStats()

    let unsubscribe = null

    try {

      unsubscribe =
        auth.onAuthStateChanged((firebaseUser) => {

          if (firebaseUser) {

            syncLocalUser(firebaseUser)

          } else {

            loadUserFromStorage()
          }

          loadStats()
          setReady(true)
        })

    } catch {

      loadUserFromStorage()
      loadStats()
      setReady(true)
    }

    window.addEventListener(
      'storage',
      loadUserFromStorage
    )

    window.addEventListener(
      'focus',
      loadStats
    )

    return () => {

      if (unsubscribe) {
        unsubscribe()
      }

      window.removeEventListener(
        'storage',
        loadUserFromStorage
      )

      window.removeEventListener(
        'focus',
        loadStats
      )
    }

  }, [pathname])

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }

  }, [])

if (!ready) {
  return null
}

if (!user) {
  return (
    <button className="profile-floating-button">
      U
    </button>
  )
}

  const displayName =
    user?.displayName ||
    user?.name ||
    'ResumeMind User'

  const email =
    user?.email ||
    'No email found'

  const photoURL =
    user?.photoURL ||
    user?.providerData?.[0]?.photoURL ||
    user?.photo ||
    ''

  const initial =
    displayName?.charAt(0)?.toUpperCase() ||
    email?.charAt(0)?.toUpperCase() ||
    'U'

  const goTo = (path) => {

    setOpen(false)
    router.push(path)
  }

  const handleLogout = async () => {

    try {

      await signOut(auth)

    } catch {

      // Ignore logout issue
    } finally {

      localStorage.removeItem(
        'resumemind_user'
      )

      localStorage.removeItem(
        'resumemind_user_profile'
      )

      localStorage.removeItem(
        'resumemind_session'
      )

      localStorage.removeItem(
        'resumemind_latest_analysis'
      )

      localStorage.removeItem(
        'resumemind_latest_meta'
      )

      setOpen(false)
      setUser(null)

      router.push('/login')
    }
  }

  return (

    <div
      className="profile-floating-wrapper"
      ref={menuRef}
    >

      <button
        type="button"
        className="profile-floating-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
      >

        {
          photoURL ? (

            <img
              src={photoURL}
              alt="Profile"
              className="profile-floating-image"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />

          ) : (

            <span>
              {initial}
            </span>
          )
        }

      </button>

      {
        open ? (

          <div className="profile-floating-dropdown">

            <div className="profile-dropdown-header">

              <div className="profile-dropdown-avatar">

                {
                  photoURL ? (

                    <img
                      src={photoURL}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />

                  ) : (

                    <span>
                      {initial}
                    </span>
                  )
                }

              </div>

              <div>
                <h3>{displayName}</h3>
                <p>{email}</p>
              </div>

            </div>

            <div className="profile-dropdown-stats">

              <div>
                <strong>{stats.analyses}</strong>
                <span>Analyses</span>
              </div>

              <div>
                <strong>{stats.reports}</strong>
                <span>Reports</span>
              </div>

              <div>
                <strong>{stats.resumes}</strong>
                <span>Resumes</span>
              </div>

            </div>
            <div className="dropdown-profile-completion">

  <div className="dropdown-profile-completion-header">
    <span>Profile Completion</span>
    <strong>88%</strong>
  </div>

  <div className="dropdown-profile-bar">
    <div
      className="dropdown-profile-fill"
      style={{ width: '88%' }}
    />
  </div>

</div>

            <div className="profile-dropdown-actions">

              <button
                type="button"
                onClick={() => goTo('/history')}
              >
                📁 Analysis History
              </button>
              <button
                type="button"
                onClick={() => goTo('/company-match')}
              >
                🎯 Company Match
              </button>
              <button
                type="button"
                onClick={() => goTo('/profile')}
              >
                👤 Your Profile
              </button>

              <button
                type="button"
                onClick={() => goTo('/settings')}
              >
                ⚙️ Settings
              </button>

              <button
                type="button"
                className="logout-profile-btn"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>

            </div>

          </div>

        ) : null
      }

    </div>
  )
}