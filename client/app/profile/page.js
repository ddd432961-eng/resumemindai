'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  deleteUser
} from 'firebase/auth'

import '../styles/profile.css'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'
import { auth } from '../../lib/firebase'

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [resumes, setResumes] = useState([])
  const [reports, setReports] = useState([])

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const unsubscribe =
      auth.onAuthStateChanged((currentUser) => {
  
        if (currentUser) {
  
          const savedUser = JSON.parse(
            localStorage.getItem('resumemind_user') || '{}'
          )
  
          const mergedUser = {
  
            ...currentUser,
  
            photoURL:
  
              currentUser.photoURL ||
  
              currentUser.providerData?.[0]?.photoURL ||
  
              savedUser.photoURL ||
  
              `https://ui-avatars.com/api/?name=${
                encodeURIComponent(
                  currentUser.displayName ||
                  currentUser.email ||
                  'User'
                )
              }&background=0D8ABC&color=fff`
          }
  
          setUser(mergedUser)
  
          setDisplayName(
            currentUser.displayName ||
            'ResumeMind User'
          )
  
          setEmail(
            currentUser.email || ''
          )
        }
      })
  
    loadLocalData()
  
    return () => unsubscribe()
  
  }, [])

  const loadLocalData = () => {
    const savedResumes = JSON.parse(
      localStorage.getItem('resumemind_created_resumes') || '[]'
    )

    const savedReports = JSON.parse(
      localStorage.getItem('resumemind_saved_reports') || '[]'
    )

    const latestAnalysis = localStorage.getItem('resumemind_latest_analysis')

    let finalReports = savedReports

    if (latestAnalysis && savedReports.length === 0) {
      finalReports = [
        {
          id: Date.now(),
          title: 'Latest Resume Analysis',
          company: 'Google',
          role: 'Software Engineer',
          score: 92,
          createdAt: new Date().toLocaleDateString()
        }
      ]
    }

    setResumes(savedResumes)
    setReports(finalReports)
  }

  const saveLocalUser = (updatedName) => {
    const cleanUser = {
      uid: user?.uid || '',
      displayName: updatedName,
      email: user?.email || '',
      photoURL: user?.photoURL || ''
    }

    localStorage.setItem('resumemind_user', JSON.stringify(cleanUser))
  }

  const showSuccess = (text) => {
    setError('')
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 3500)
  }

  const showError = (text) => {
    setMessage('')
    setError(text)

    setTimeout(() => {
      setError('')
    }, 4500)
  }

  const handleUpdateName = async (event) => {
    event.preventDefault()

    if (!displayName.trim()) {
      showError('Please enter a valid name.')
      return
    }

    if (!user) {
      showError('User not found. Please login again.')
      return
    }

    setLoading(true)

    try {
      await updateProfile(user, {
        displayName: displayName.trim()
      })

      saveLocalUser(displayName.trim())

      showSuccess('Profile name updated successfully.')
    } catch (err) {
      showError('Unable to update profile name. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill all password fields.')
      return
    }

    if (newPassword.length < 6) {
      showError('New password should be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match.')
      return
    }

    if (!user?.email) {
      showError('Password change is available only for email/password accounts.')
      return
    }

    setLoading(true)

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      )

      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      showSuccess('Password changed successfully.')
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        showError('Current password is incorrect.')
      } else if (err.code === 'auth/requires-recent-login') {
        showError('Please logout and login again before changing password.')
      } else if (err.code === 'auth/invalid-credential') {
        showError('Invalid current password.')
      } else {
        showError('Unable to change password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResume = (resumeId) => {
    const updated = resumes.filter((resume) => resume.id !== resumeId)

    setResumes(updated)
    localStorage.setItem('resumemind_created_resumes', JSON.stringify(updated))

    showSuccess('Resume deleted successfully.')
  }

  const handleEditResume = (resumeId) => {
    localStorage.setItem('resumemind_edit_resume_id', String(resumeId))
    router.push('/templates')
  }

  const handleDeleteReport = (reportId) => {
    const updated = reports.filter((report) => report.id !== reportId)

    setReports(updated)
    localStorage.setItem('resumemind_saved_reports', JSON.stringify(updated))

    showSuccess('Report deleted successfully.')
  }

  const handleViewReport = (reportId) => {
    localStorage.setItem('resumemind_view_report_id', String(reportId))
    router.push('/dashboard')
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )

    if (!confirmDelete) {
      return
    }

    if (!user) {
      showError('User not found. Please login again.')
      return
    }

    setLoading(true)

    try {
      await deleteUser(user)

      localStorage.removeItem('resumemind_user')
      localStorage.removeItem('resumemind_session')
      localStorage.removeItem('resumemind_latest_analysis')
      localStorage.removeItem('resumemind_latest_meta')
      localStorage.removeItem('resumemind_created_resumes')
      localStorage.removeItem('resumemind_saved_reports')

      router.push('/signup')
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        showError('Please logout and login again before deleting your account.')
      } else {
        showError('Unable to delete account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getInitial = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase()
    }

    if (email) {
      return email.charAt(0).toUpperCase()
    }

    return 'U'
  }

  return (
    <AuthGuard>
      <main className="page">
        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">
          <Navbar />

          <section className="profile-page-shell">
            <div className="profile-hero-card">
              <div className="profile-hero-left">
              <div className="profile-large-avatar">

  {
    user?.photoURL ? (

      <img
        src={user.photoURL}
        alt="Profile"
        referrerPolicy="no-referrer"
      />

    ) : (

      <span>
        {
          (displayName || email || 'U')
            .charAt(0)
            .toUpperCase()
        }
      </span>

    )
  }

</div>

                <div>
                  <p className="eyebrow">Account Center</p>
                  <h1>{displayName || 'ResumeMind User'}</h1>
                  <p>{email || 'Manage your ResumeMind AI profile'}</p>
                </div>
              </div>

              <div className="profile-hero-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </button>

                <button
                  type="button"
                  className="danger-outline-btn"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  Delete Account
                </button>
              </div>
            </div>

            {
              message ? (
                <div className="profile-alert success">
                  {message}
                </div>
              ) : null
            }

            {
              error ? (
                <div className="profile-alert error">
                  {error}
                </div>
              ) : null
            }

            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <span>📄</span>
                <h3>{resumes.length}</h3>
                <p>Created Resumes</p>
              </div>

              <div className="profile-stat-card">
                <span>📊</span>
                <h3>{reports.length}</h3>
                <p>Saved Reports</p>
              </div>

              <div className="profile-stat-card">
                <span>🎯</span>
                <h3>92%</h3>
                <p>Best ATS Score</p>
              </div>

              <div className="profile-stat-card">
                <span>🚀</span>
                <h3>Pro</h3>
                <p>Workspace Status</p>
              </div>
            </div>

            <div className="profile-layout-grid">
              <aside className="profile-sidebar-card">
                <button
                  type="button"
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Profile Details
                </button>

                <button
                  type="button"
                  className={activeTab === 'security' ? 'active' : ''}
                  onClick={() => setActiveTab('security')}
                >
                  🔐 Security
                </button>

                <button
                  type="button"
                  className={activeTab === 'resumes' ? 'active' : ''}
                  onClick={() => setActiveTab('resumes')}
                >
                  📄 My Resumes
                </button>

                <button
                  type="button"
                  className={activeTab === 'reports' ? 'active' : ''}
                  onClick={() => setActiveTab('reports')}
                >
                  📊 Saved Reports
                </button>

                <button
                  type="button"
                  className={activeTab === 'danger' ? 'active danger' : ''}
                  onClick={() => setActiveTab('danger')}
                >
                  ⚠️ Danger Zone
                </button>
              </aside>

              <section className="profile-content-card">
                {
                  activeTab === 'profile' ? (
                    <div>
                      <div className="profile-section-header">
                        <div>
                          <p className="eyebrow">Profile</p>
                          <h2>Edit Profile Details</h2>
                        </div>
                        <span>Keep your account information updated</span>
                      </div>

                      <form onSubmit={handleUpdateName} className="profile-form">
                        <label>
                          Full Name
                          <input
                            type="text"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            placeholder="Enter your name"
                          />
                        </label>

                        <label>
                          Email Address
                          <input
                            type="email"
                            value={email}
                            disabled
                          />
                        </label>

                        <button
                          type="submit"
                          className="primary-btn"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>
                  ) : null
                }

                {
                  activeTab === 'security' ? (
                    <div>
                      <div className="profile-section-header">
                        <div>
                          <p className="eyebrow">Security</p>
                          <h2>Change Password</h2>
                        </div>
                        <span>Email/password accounts only</span>
                      </div>

                      <form onSubmit={handleChangePassword} className="profile-form">
                        <label>
                          Current Password
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            placeholder="Enter current password"
                          />
                        </label>

                        <label>
                          New Password
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Enter new password"
                          />
                        </label>

                        <label>
                          Confirm New Password
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm new password"
                          />
                        </label>

                        <button
                          type="submit"
                          className="primary-btn"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  ) : null
                }

                {
                  activeTab === 'resumes' ? (
                    <div>
                      <div className="profile-section-header">
                        <div>
                          <p className="eyebrow">Resumes</p>
                          <h2>Manage Created Resumes</h2>
                        </div>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => router.push('/templates')}
                        >
                          Create New Resume
                        </button>
                      </div>

                      {
                        resumes.length > 0 ? (
                          <div className="profile-item-list">
                            {
                              resumes.map((resume, index) => (
                                <div className="profile-item-card" key={resume.id || index}>
                                  <div>
                                    <h3>{resume.title || `Resume ${index + 1}`}</h3>
                                    <p>
                                      {resume.role || 'ATS Friendly Resume'} · {
                                        resume.createdAt || 'Recently created'
                                      }
                                    </p>
                                  </div>

                                  <div className="profile-item-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleEditResume(resume.id)}
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      className="danger-text-btn"
                                      onClick={() => handleDeleteResume(resume.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="empty-profile-state">
                            <h3>No resumes created yet</h3>
                            <p>Create your first ATS-friendly resume from templates.</p>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => router.push('/templates')}
                            >
                              Browse Templates
                            </button>
                          </div>
                        )
                      }
                    </div>
                  ) : null
                }

                {
                  activeTab === 'reports' ? (
                    <div>
                      <div className="profile-section-header">
                        <div>
                          <p className="eyebrow">Reports</p>
                          <h2>Saved Resume Reports</h2>
                        </div>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => router.push('/dashboard')}
                        >
                          Analyze Resume
                        </button>
                      </div>

                      {
                        reports.length > 0 ? (
                          <div className="profile-item-list">
                            {
                              reports.map((report, index) => (
                                <div className="profile-item-card" key={report.id || index}>
                                  <div>
                                    <h3>{report.title || `Analysis Report ${index + 1}`}</h3>
                                    <p>
                                      {report.company || 'Target Company'} · {
                                        report.role || 'Target Role'
                                      } · Score {report.score || 0}%
                                    </p>
                                  </div>

                                  <div className="profile-item-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleViewReport(report.id)}
                                    >
                                      View
                                    </button>

                                    <button
                                      type="button"
                                      className="danger-text-btn"
                                      onClick={() => handleDeleteReport(report.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="empty-profile-state">
                            <h3>No saved reports yet</h3>
                            <p>Analyze your resume and save reports for future tracking.</p>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => router.push('/dashboard')}
                            >
                              Start Analysis
                            </button>
                          </div>
                        )
                      }
                    </div>
                  ) : null
                }

                {
                  activeTab === 'danger' ? (
                    <div>
                      <div className="profile-section-header">
                        <div>
                          <p className="eyebrow danger-text">Danger Zone</p>
                          <h2>Delete Account</h2>
                        </div>
                        <span>This action cannot be undone</span>
                      </div>

                      <div className="danger-zone-box">
                        <h3>Delete your ResumeMind AI account</h3>
                        <p>
                          This will remove your account session, saved reports,
                          created resumes, and local workspace data.
                        </p>

                        <button
                          type="button"
                          className="danger-btn"
                          onClick={handleDeleteAccount}
                          disabled={loading}
                        >
                          {loading ? 'Deleting...' : 'Delete My Account'}
                        </button>
                      </div>
                    </div>
                  ) : null
                }
              </section>
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  )
}