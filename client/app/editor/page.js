'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'

const emptyResume = {
  id: '',
  title: '',
  targetRole: '',
  targetCompany: '',
  summary: '',
  skills: '',
  experience: '',
  projects: '',
  education: '',
  certifications: '',
  achievements: '',
  resumeText: '',
  createdAt: '',
  updatedAt: ''
}

export default function ResumeEditorPage() {
  const [resume, setResume] = useState(emptyResume)
  const [savedResumes, setSavedResumes] = useState([])
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    loadEditorResume()
    loadSavedResumes()
  }, [])

  const safeArray = (value) => {
    return Array.isArray(value) ? value : []
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 2600)
  }

  const normalizeResume = (item = {}) => {
    const skillsValue = Array.isArray(item.skills)
      ? item.skills.join(', ')
      : item.skills || item.detectedSkills?.join?.(', ') || ''

    return {
      id: item.id || '',
      title: item.title || item.resumeTitle || item.name || '',
      targetRole:
        item.targetRole ||
        item.role ||
        item.selectedRole ||
        '',
      targetCompany:
        item.targetCompany ||
        item.company ||
        item.selectedCompany ||
        '',
      summary:
        item.summary ||
        item.profileSummary ||
        item.aiSummary ||
        '',
      skills: skillsValue,
      experience:
        item.experience ||
        item.workExperience ||
        '',
      projects:
        item.projects ||
        item.projectDetails ||
        '',
      education:
        item.education ||
        '',
      certifications:
        item.certifications ||
        '',
      achievements:
        item.achievements ||
        '',
      resumeText:
        item.resumeText ||
        item.fullResume ||
        '',
      createdAt:
        item.createdAt ||
        new Date().toISOString(),
      updatedAt:
        item.updatedAt ||
        new Date().toISOString()
    }
  }

  const loadEditorResume = () => {
    try {
      const editorResume = JSON.parse(
        localStorage.getItem('resumemind_editor_resume') || 'null'
      )

      const selectedResume = JSON.parse(
        localStorage.getItem('resumemind_selected_resume') || 'null'
      )

      const latestAnalysis = JSON.parse(
        localStorage.getItem('resumemind_latest_analysis') || 'null'
      )

      const latestMeta = JSON.parse(
        localStorage.getItem('resumemind_latest_meta') || 'null'
      )

      if (editorResume) {
        setResume(normalizeResume(editorResume))
        return
      }

      if (selectedResume) {
        setResume(normalizeResume(selectedResume))
        return
      }

      if (latestAnalysis) {
        const result = latestAnalysis.result || latestAnalysis

        const generatedResume = {
          id: `resume_${Date.now()}`,
          title: `${latestMeta?.role || result.role || 'Improved'} Resume`,
          targetRole: latestMeta?.role || result.role || '',
          targetCompany: latestMeta?.company || result.company || '',
          summary:
            result.improvedSummary ||
            result.summary ||
            result.aiSummary ||
            '',
          skills: [
            ...(Array.isArray(result.matchedSkills) ? result.matchedSkills : []),
            ...(Array.isArray(result.skills) ? result.skills : [])
          ].join(', '),
          experience:
            result.improvedExperience ||
            result.experience ||
            '',
          projects:
            result.improvedProjects ||
            result.projects ||
            '',
          education: result.education || '',
          certifications: result.certifications || '',
          achievements: result.achievements || '',
          resumeText:
            result.improvedResume ||
            result.resumeText ||
            '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        setResume(normalizeResume(generatedResume))
        return
      }

      setResume({
        ...emptyResume,
        id: `resume_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to load editor resume:', error)

      setResume({
        ...emptyResume,
        id: `resume_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }

  const loadSavedResumes = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('resumemind_saved_resumes') || '[]'
      )

      const created = JSON.parse(
        localStorage.getItem('resumemind_created_resumes') || '[]'
      )

      const combined = [
        ...safeArray(saved),
        ...safeArray(created)
      ]

      const unique = combined.filter((item, index, array) => {
        return index === array.findIndex((entry) => entry.id === item.id)
      })

      setSavedResumes(unique)
    } catch (error) {
      console.error('Failed to load saved resumes:', error)
      setSavedResumes([])
    }
  }

  const updateField = (field, value) => {
    setResume((previous) => ({
      ...previous,
      [field]: value,
      updatedAt: new Date().toISOString()
    }))

    setIsDirty(true)
  }

  const getSkillsArray = (value = resume.skills) => {
    if (Array.isArray(value)) return value

    return String(value || '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  }

  const getResumeTitle = () => {
    return resume.title || 'Untitled Resume'
  }

  const saveResumeToStorage = (items) => {
    localStorage.setItem(
      'resumemind_saved_resumes',
      JSON.stringify(items)
    )


    setSavedResumes(items)
  }

  const saveResume = () => {
    const now = new Date().toISOString()

    const resumeToSave = {
      ...resume,
      id: resume.id || `resume_${Date.now()}`,
      title: resume.title || 'Improved Resume',
      skills: getSkillsArray(),
      createdAt: resume.createdAt || now,
      updatedAt: now
    }

    const existing = savedResumes.filter((item) => item.id !== resumeToSave.id)
    const updatedResumes = [resumeToSave, ...existing]

    saveResumeToStorage(updatedResumes)

    localStorage.setItem(
      'resumemind_editor_resume',
      JSON.stringify(resumeToSave)
    )

    setResume(normalizeResume(resumeToSave))
    setIsDirty(false)
    showToast('Resume saved successfully')
  }

  const saveAsNewVersion = () => {
    const now = new Date().toISOString()

    const newVersion = {
      ...resume,
      id: `resume_${Date.now()}`,
      title: `${resume.title || 'Improved Resume'} Version`,
      skills: getSkillsArray(),
      createdAt: now,
      updatedAt: now
    }

    const updatedResumes = [newVersion, ...savedResumes]

    saveResumeToStorage(updatedResumes)

    localStorage.setItem(
      'resumemind_editor_resume',
      JSON.stringify(newVersion)
    )

    setResume(normalizeResume(newVersion))
    setIsDirty(false)
    showToast('New resume version saved')
  }

  const clearEditor = () => {
    const confirmClear = window.confirm(
      'Clear the editor? Unsaved changes will be lost.'
    )

    if (!confirmClear) return

    const freshResume = {
      ...emptyResume,
      id: `resume_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    localStorage.removeItem('resumemind_editor_resume')
    localStorage.removeItem('resumemind_selected_resume')

    setResume(freshResume)
    setIsDirty(false)
    showToast('Editor cleared')
  }

  const downloadResume = () => {
    const content = `
${getResumeTitle()}

Target Role: ${resume.targetRole || 'Not selected'}
Target Company: ${resume.targetCompany || 'Not selected'}

SUMMARY
${resume.summary || 'No summary added.'}

SKILLS
${getSkillsArray().join(', ') || 'No skills added.'}

EXPERIENCE
${resume.experience || 'No experience added.'}

PROJECTS
${resume.projects || 'No projects added.'}

EDUCATION
${resume.education || 'No education added.'}

CERTIFICATIONS
${resume.certifications || 'No certifications added.'}

ACHIEVEMENTS
${resume.achievements || 'No achievements added.'}

FULL RESUME TEXT
${resume.resumeText || 'No resume text added.'}
`

    const blob = new Blob([content.trim()], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${getResumeTitle().replace(/[^a-z0-9]/gi, '-')}.txt`
    link.click()

    URL.revokeObjectURL(url)

    showToast('Resume downloaded successfully')
  }

  const resumeCompleteness = useMemo(() => {
    const fields = [
      resume.title,
      resume.targetRole,
      resume.targetCompany,
      resume.summary,
      resume.skills,
      resume.experience,
      resume.projects,
      resume.education
    ]

    const completed = fields.filter((field) => String(field || '').trim()).length

    return Math.round((completed / fields.length) * 100)
  }, [resume])

  const editorStats = useMemo(() => {
    const skillsCount = getSkillsArray().length

    const wordCount = [
      resume.summary,
      resume.experience,
      resume.projects,
      resume.education,
      resume.certifications,
      resume.achievements,
      resume.resumeText
    ]
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length

    return {
      skillsCount,
      wordCount,
      completeness: resumeCompleteness
    }
  }, [resume, resumeCompleteness])

  const tabs = [
    {
      id: 'summary',
      label: 'Summary'
    },
    {
      id: 'skills',
      label: 'Skills'
    },
    {
      id: 'experience',
      label: 'Experience'
    },
    {
      id: 'projects',
      label: 'Projects'
    },
    {
      id: 'extra',
      label: 'Extra'
    },
    {
      id: 'preview',
      label: 'Preview'
    }
  ]

  return (
    <AuthGuard>
      <main className="page">
        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">
          <Navbar />

          {toast ? (
            <div className={`toast ${toast.type}`}>
              {toast.message}
            </div>
          ) : null}

          <section className="editor-hero">
            <div>
              <span className="eyebrow">
                Resume Editor
              </span>

              <h1>
                Build and improve your resume
              </h1>

              <p>
                Edit your AI-improved resume, save multiple versions, and export a clean resume draft.
              </p>
            </div>

            <div className="hero-actions">
              <Link href="/resumes" className="button secondary-btn">
                Saved Resumes
              </Link>

              <button
                type="button"
                className="button secondary-btn"
                onClick={downloadResume}
              >
                Download TXT
              </button>

              <button
                type="button"
                className="button"
                onClick={saveResume}
              >
                Save Resume
              </button>
            </div>
          </section>

          <section className="editor-stats-grid">
            <div className="card editor-stat-card">
              <span>📄</span>
              <p>Completeness</p>
              <h3>{editorStats.completeness}%</h3>
            </div>

            <div className="card editor-stat-card">
              <span>🧠</span>
              <p>Skills Added</p>
              <h3>{editorStats.skillsCount}</h3>
            </div>

            <div className="card editor-stat-card">
              <span>✍️</span>
              <p>Word Count</p>
              <h3>{editorStats.wordCount}</h3>
            </div>

            <div className="card editor-stat-card">
              <span>💾</span>
              <p>Saved Versions</p>
              <h3>{savedResumes.length}</h3>
            </div>
          </section>

          <section className="editor-layout">
            <aside className="card editor-sidebar">
              <div className="editor-progress">
                <div className="progress-top">
                  <span>Resume completion</span>
                  <strong>{resumeCompleteness}%</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${resumeCompleteness}%` }}
                  ></div>
                </div>
              </div>

              <div className="editor-tabs">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="editor-side-actions">
                <button
                  type="button"
                  onClick={saveResume}
                >
                  Save Current
                </button>

                <button
                  type="button"
                  onClick={saveAsNewVersion}
                >
                  Save New Version
                </button>

                <button
                  type="button"
                  onClick={clearEditor}
                  className="danger-btn"
                >
                  Clear Editor
                </button>
              </div>

              {isDirty ? (
                <p className="editor-unsaved">
                  Unsaved changes detected.
                </p>
              ) : (
                <p className="editor-saved">
                  All changes saved.
                </p>
              )}
            </aside>

            <section className="card editor-panel">
              <div className="editor-basic-grid">
                <div className="form-group">
                  <label>
                    Resume Title
                  </label>

                  <input
                    type="text"
                    placeholder="Example: AI/ML Engineer Resume"
                    value={resume.title}
                    onChange={(event) => updateField('title', event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Target Role
                  </label>

                  <input
                    type="text"
                    placeholder="Example: AIML Engineer"
                    value={resume.targetRole}
                    onChange={(event) => updateField('targetRole', event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Target Company
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Google, Microsoft, Walmart"
                    value={resume.targetCompany}
                    onChange={(event) => updateField('targetCompany', event.target.value)}
                  />
                </div>
              </div>

              {activeTab === 'summary' ? (
                <div className="editor-section">
                  <h2>
                    Professional Summary
                  </h2>

                  <p>
                    Write a short, impact-focused summary for the target role.
                  </p>

                  <textarea
                    rows="10"
                    placeholder="Example: AI/ML Engineer skilled in machine learning, deep learning, NLP, and production-ready model deployment..."
                    value={resume.summary}
                    onChange={(event) => updateField('summary', event.target.value)}
                  />
                </div>
              ) : null}

              {activeTab === 'skills' ? (
                <div className="editor-section">
                  <h2>
                    Skills
                  </h2>

                  <p>
                    Add comma-separated skills. Keep the most role-relevant skills first.
                  </p>

                  <textarea
                    rows="8"
                    placeholder="Python, Machine Learning, Deep Learning, NLP, TensorFlow, PyTorch, SQL..."
                    value={resume.skills}
                    onChange={(event) => updateField('skills', event.target.value)}
                  />

                  <div className="workspace-tags">
                    {getSkillsArray().length > 0 ? (
                      getSkillsArray().map((skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span>
                        No skills added yet
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {activeTab === 'experience' ? (
                <div className="editor-section">
                  <h2>
                    Experience
                  </h2>

                  <p>
                    Add internships, work experience, responsibilities, and measurable impact.
                  </p>

                  <textarea
                    rows="14"
                    placeholder={`Example:
AI/ML Intern — Company Name
- Built a resume analysis model using NLP and scoring logic.
- Improved keyword matching accuracy by 30%.
- Deployed a Next.js dashboard with Firebase authentication.`}
                    value={resume.experience}
                    onChange={(event) => updateField('experience', event.target.value)}
                  />
                </div>
              ) : null}

              {activeTab === 'projects' ? (
                <div className="editor-section">
                  <h2>
                    Projects
                  </h2>

                  <p>
                    Add strong project bullets with tech stack, problem, solution, and result.
                  </p>

                  <textarea
                    rows="14"
                    placeholder={`Example:
ResumeMind AI
- Built an AI-powered resume analyzer with ATS scoring, company matching, and skill gap detection.
- Used Next.js, Firebase Auth, localStorage workflow, and AI-generated suggestions.
- Added report management, resume editor, and downloadable reports.`}
                    value={resume.projects}
                    onChange={(event) => updateField('projects', event.target.value)}
                  />
                </div>
              ) : null}

              {activeTab === 'extra' ? (
                <div className="editor-section">
                  <h2>
                    Education, Certifications & Achievements
                  </h2>

                  <div className="stacked-fields">
                    <div className="form-group">
                      <label>
                        Education
                      </label>

                      <textarea
                        rows="5"
                        placeholder="Degree, college, year, CGPA..."
                        value={resume.education}
                        onChange={(event) => updateField('education', event.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Certifications
                      </label>

                      <textarea
                        rows="5"
                        placeholder="AWS, Google Cloud, Coursera, Udemy, NPTEL..."
                        value={resume.certifications}
                        onChange={(event) => updateField('certifications', event.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Achievements
                      </label>

                      <textarea
                        rows="5"
                        placeholder="Hackathons, awards, publications, leadership..."
                        value={resume.achievements}
                        onChange={(event) => updateField('achievements', event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'preview' ? (
                <div className="editor-section">
                  <h2>
                    Resume Preview
                  </h2>

                  <p>
                    This preview is what gets downloaded as your resume draft.
                  </p>

                  <pre className="editor-preview">
{`${getResumeTitle()}

Target Role: ${resume.targetRole || 'Not selected'}
Target Company: ${resume.targetCompany || 'Not selected'}

SUMMARY
${resume.summary || 'No summary added.'}

SKILLS
${getSkillsArray().join(', ') || 'No skills added.'}

EXPERIENCE
${resume.experience || 'No experience added.'}

PROJECTS
${resume.projects || 'No projects added.'}

EDUCATION
${resume.education || 'No education added.'}

CERTIFICATIONS
${resume.certifications || 'No certifications added.'}

ACHIEVEMENTS
${resume.achievements || 'No achievements added.'}

FULL RESUME TEXT
${resume.resumeText || 'No resume text added.'}`}
                  </pre>
                </div>
              ) : null}
            </section>
          </section>
        </div>
      </main>
    </AuthGuard>
  )
}