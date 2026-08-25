'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'
import '../styles/settings.css'
export default function SettingsPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('account')
  const [message, setMessage] = useState('')

  const [settings, setSettings] = useState({
    fullName: '',
    email: '',
    defaultCompany: 'Google',
    defaultRole: 'Software Engineer',
    resumeTone: 'Professional',
    analysisDepth: 'Detailed',
    autoSaveReports: true,
    showAiSuggestions: true,
    includeSkillRoadmap: true,
    storeLocalHistory: true,
    emailNotifications: false
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const savedUser = JSON.parse(
      localStorage.getItem('resumemind_user') || '{}'
    )

    const savedSettings = JSON.parse(
      localStorage.getItem('resumemind_settings') || '{}'
    )

    setSettings((prev) => ({
      ...prev,
      fullName:
        savedSettings.fullName ||
        savedUser.displayName ||
        savedUser.name ||
        'ResumeMind User',
      email:
        savedSettings.email ||
        savedUser.email ||
        '',
      defaultCompany:
        savedSettings.defaultCompany ||
        'Google',
      defaultRole:
        savedSettings.defaultRole ||
        'Software Engineer',
      resumeTone:
        savedSettings.resumeTone ||
        'Professional',
      analysisDepth:
        savedSettings.analysisDepth ||
        'Detailed',
      autoSaveReports:
        savedSettings.autoSaveReports ?? true,
      showAiSuggestions:
        savedSettings.showAiSuggestions ?? true,
      includeSkillRoadmap:
        savedSettings.includeSkillRoadmap ?? true,
      storeLocalHistory:
        savedSettings.storeLocalHistory ?? true,
      emailNotifications:
        savedSettings.emailNotifications ?? false
    }))
  }

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const showMessage = (text) => {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 3500)
  }

  const handleSaveSettings = () => {
    localStorage.setItem(
      'resumemind_settings',
      JSON.stringify(settings)
    )

    const existingUser = JSON.parse(
      localStorage.getItem('resumemind_user') || '{}'
    )

    localStorage.setItem(
      'resumemind_user',
      JSON.stringify({
        ...existingUser,
        displayName: settings.fullName,
        email: settings.email
      })
    )

    showMessage('Settings saved successfully.')
  }

  const clearAnalysisHistory = () => {
    const confirmClear = window.confirm(
      'Clear all analysis history? This cannot be undone.'
    )

    if (!confirmClear) return

    localStorage.removeItem('resumemind_latest_analysis')
    localStorage.removeItem('resumemind_latest_meta')
    localStorage.removeItem('resumemind_saved_reports')

    showMessage('Analysis history cleared.')
  }

  const clearCreatedResumes = () => {
    const confirmClear = window.confirm(
      'Delete all created resumes? This cannot be undone.'
    )

    if (!confirmClear) return

    localStorage.removeItem('resumemind_created_resumes')

    showMessage('Created resumes deleted.')
  }

  const resetWorkspace = () => {
    const confirmReset = window.confirm(
      'Reset complete workspace data? This will remove reports, resumes, analysis history, and settings.'
    )

    if (!confirmReset) return

    localStorage.removeItem('resumemind_settings')
    localStorage.removeItem('resumemind_latest_analysis')
    localStorage.removeItem('resumemind_latest_meta')
    localStorage.removeItem('resumemind_saved_reports')
    localStorage.removeItem('resumemind_created_resumes')

    loadSettings()
    showMessage('Workspace reset successfully.')
  }

  return (
    <AuthGuard>
      <main className="page">
        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">
          <Navbar />

          <section className="settings-page-shell">
            <div className="settings-hero">
              <div>
                <p className="eyebrow">Workspace Settings</p>
                <h1>Settings</h1>
                <p>
                  Manage your account preferences, resume defaults, privacy data,
                  and AI analysis behavior.
                </p>
              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>

            {
              message ? (
                <div className="settings-alert">
                  {message}
                </div>
              ) : null
            }

            <div className="settings-layout">
              <aside className="settings-sidebar">
                <button
                  type="button"
                  className={activeTab === 'account' ? 'active' : ''}
                  onClick={() => setActiveTab('account')}
                >
                  👤 Account
                </button>

                <button
                  type="button"
                  className={activeTab === 'resume' ? 'active' : ''}
                  onClick={() => setActiveTab('resume')}
                >
                  📄 Resume Preferences
                </button>

                <button
                  type="button"
                  className={activeTab === 'ai' ? 'active' : ''}
                  onClick={() => setActiveTab('ai')}
                >
                  🤖 AI Preferences
                </button>

                <button
                  type="button"
                  className={activeTab === 'privacy' ? 'active' : ''}
                  onClick={() => setActiveTab('privacy')}
                >
                  🔐 Privacy & Data
                </button>
              </aside>

              <section className="settings-content">
                {
                  activeTab === 'account' ? (
                    <div>
                      <div className="settings-section-header">
                        <div>
                          <p className="eyebrow">Account</p>
                          <h2>Account Preferences</h2>
                        </div>
                        <span>Update your basic workspace details</span>
                      </div>

                      <div className="settings-form-grid">
                        <label>
                          Full Name
                          <input
                            type="text"
                            value={settings.fullName}
                            onChange={(event) =>
                              updateSetting('fullName', event.target.value)
                            }
                          />
                        </label>

                        <label>
                          Email Address
                          <input
                            type="email"
                            value={settings.email}
                            onChange={(event) =>
                              updateSetting('email', event.target.value)
                            }
                          />
                        </label>

                        <label className="settings-toggle-row">
                          <div>
                            <strong>Email Notifications</strong>
                            <span>Receive workspace updates and resume reminders.</span>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(event) =>
                              updateSetting('emailNotifications', event.target.checked)
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ) : null
                }

                {
                  activeTab === 'resume' ? (
                    <div>
                      <div className="settings-section-header">
                        <div>
                          <p className="eyebrow">Resume</p>
                          <h2>Resume Defaults</h2>
                        </div>
                        <span>Used while analyzing resumes</span>
                      </div>

                      <div className="settings-form-grid two">
                        <label>
                          Default Target Company
                          <select
                            value={settings.defaultCompany}
                            onChange={(event) =>
                              updateSetting('defaultCompany', event.target.value)
                            }
                          >
                            <option>Google</option>
                            <option>Microsoft</option>
                            <option>Amazon</option>
                            <option>Meta</option>
                            <option>Netflix</option>
                            <option>Infosys</option>
                            <option>TCS</option>
                            <option>Wipro</option>
                            <option>Accenture</option>
                          </select>
                        </label>

                        <label>
                          Default Target Role
                          <select
                            value={settings.defaultRole}
                            onChange={(event) =>
                              updateSetting('defaultRole', event.target.value)
                            }
                          >
                            <option>Software Engineer</option>
                            <option>AI/ML Engineer</option>
                            <option>Data Scientist</option>
                            <option>Frontend Developer</option>
                            <option>Backend Developer</option>
                            <option>Full Stack Developer</option>
                            <option>Cloud Engineer</option>
                            <option>DevOps Engineer</option>
                          </select>
                        </label>

                        <label>
                          Resume Tone
                          <select
                            value={settings.resumeTone}
                            onChange={(event) =>
                              updateSetting('resumeTone', event.target.value)
                            }
                          >
                            <option>Professional</option>
                            <option>Concise</option>
                            <option>Technical</option>
                            <option>Leadership</option>
                            <option>Student Friendly</option>
                          </select>
                        </label>

                        <label>
                          Analysis Depth
                          <select
                            value={settings.analysisDepth}
                            onChange={(event) =>
                              updateSetting('analysisDepth', event.target.value)
                            }
                          >
                            <option>Quick</option>
                            <option>Detailed</option>
                            <option>Expert</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  ) : null
                }

                {
                  activeTab === 'ai' ? (
                    <div>
                      <div className="settings-section-header">
                        <div>
                          <p className="eyebrow">AI</p>
                          <h2>AI Analysis Preferences</h2>
                        </div>
                        <span>Control what AI features appear in reports</span>
                      </div>

                      <div className="settings-toggle-list">
                        <label className="settings-toggle-row">
                          <div>
                            <strong>Auto-save Reports</strong>
                            <span>Automatically save generated resume reports locally.</span>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.autoSaveReports}
                            onChange={(event) =>
                              updateSetting('autoSaveReports', event.target.checked)
                            }
                          />
                        </label>

                        <label className="settings-toggle-row">
                          <div>
                            <strong>Show AI Suggestions</strong>
                            <span>Display AI improvement suggestions after analysis.</span>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.showAiSuggestions}
                            onChange={(event) =>
                              updateSetting('showAiSuggestions', event.target.checked)
                            }
                          />
                        </label>

                        <label className="settings-toggle-row">
                          <div>
                            <strong>Include Skill Roadmap</strong>
                            <span>Show missing skills and learning roadmap in reports.</span>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.includeSkillRoadmap}
                            onChange={(event) =>
                              updateSetting('includeSkillRoadmap', event.target.checked)
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ) : null
                }

                {
                  activeTab === 'privacy' ? (
                    <div>
                      <div className="settings-section-header">
                        <div>
                          <p className="eyebrow">Privacy</p>
                          <h2>Privacy & Local Data</h2>
                        </div>
                        <span>Manage data stored in your browser</span>
                      </div>

                      <div className="settings-toggle-list">
                        <label className="settings-toggle-row">
                          <div>
                            <strong>Store Local History</strong>
                            <span>Keep resume reports and analysis history in browser storage.</span>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.storeLocalHistory}
                            onChange={(event) =>
                              updateSetting('storeLocalHistory', event.target.checked)
                            }
                          />
                        </label>
                      </div>

                      <div className="settings-danger-grid">
                        <div className="settings-danger-card">
                          <h3>Clear Analysis History</h3>
                          <p>Remove latest analysis data and saved reports.</p>
                          <button
                            type="button"
                            className="danger-outline-btn"
                            onClick={clearAnalysisHistory}
                          >
                            Clear History
                          </button>
                        </div>

                        <div className="settings-danger-card">
                          <h3>Delete Created Resumes</h3>
                          <p>Remove all resumes created using ResumeMind AI.</p>
                          <button
                            type="button"
                            className="danger-outline-btn"
                            onClick={clearCreatedResumes}
                          >
                            Delete Resumes
                          </button>
                        </div>

                        <div className="settings-danger-card">
                          <h3>Reset Workspace</h3>
                          <p>Remove all local workspace data and reset settings.</p>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={resetWorkspace}
                          >
                            Reset Workspace
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null
                }

                <div className="settings-footer-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={loadSettings}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  )
}