'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'

import '../styles/resumes.css'

export default function Resumes() {
  const [resumes, setResumes] = useState([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadResumes()
  }, [])

  const safeArray = (value) => {
    return Array.isArray(value) ? value : []
  }

  const loadResumes = () => {
    try {
      const createdResumes = JSON.parse(
        localStorage.getItem('resumemind_created_resumes') || '[]'
      )

      const savedResumes = JSON.parse(
        localStorage.getItem('resumemind_saved_resumes') || '[]'
      )

      const combined = [
        ...safeArray(createdResumes),
        ...safeArray(savedResumes)
      ]

      const unique = combined.filter((resume, index, array) => {
        return index === array.findIndex((item) => item.id === resume.id)
      })

      const sorted = unique.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()

        return dateB - dateA
      })

      setResumes(sorted)
    } catch (error) {
      console.error('Failed to load resumes:', error)
      setResumes([])
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 2500)
  }

  const saveToStorage = (updatedResumes) => {
    localStorage.setItem(
      'resumemind_saved_resumes',
      JSON.stringify(updatedResumes)
    )

    localStorage.setItem(
      'resumemind_created_resumes',
      JSON.stringify(updatedResumes)
    )

    setResumes(updatedResumes)
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown date'

    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getResumeTitle = (resume) => {
    return (
      resume.title ||
      resume.resumeTitle ||
      resume.name ||
      'Improved Resume'
    )
  }

  const getResumeRole = (resume) => {
    return (
      resume.role ||
      resume.targetRole ||
      resume.selectedRole ||
      'Target Role'
    )
  }

  const getResumeCompany = (resume) => {
    return (
      resume.company ||
      resume.targetCompany ||
      resume.selectedCompany ||
      'Target Company'
    )
  }

  const getResumeSummary = (resume) => {
    return (
      resume.summary ||
      resume.profileSummary ||
      resume.resumeText?.slice(0, 180) ||
      'No summary available yet.'
    )
  }

  const getResumeSkills = (resume) => {
    if (Array.isArray(resume.skills)) {
      return resume.skills
    }

    if (Array.isArray(resume.detectedSkills)) {
      return resume.detectedSkills
    }

    if (typeof resume.skills === 'string') {
      return resume.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    }

    return []
  }

  const openInEditor = (resume) => {
    localStorage.setItem(
      'resumemind_editor_resume',
      JSON.stringify(resume)
    )

    window.location.href = '/editor'
  }

  const viewResume = (resume) => {
    localStorage.setItem(
      'resumemind_selected_resume',
      JSON.stringify(resume)
    )

    openInEditor(resume)
  }

  const duplicateResume = (resume) => {
    const duplicatedResume = {
      ...resume,
      id: `resume_${Date.now()}`,
      title: `${getResumeTitle(resume)} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedResumes = [duplicatedResume, ...resumes]

    saveToStorage(updatedResumes)
    showToast('Resume duplicated successfully')
  }

  const deleteResume = (id) => {
    const updatedResumes = resumes.filter((resume) => resume.id !== id)

    saveToStorage(updatedResumes)
    showToast('Resume deleted successfully')
  }

  const downloadResume = (resume) => {
    const skills = getResumeSkills(resume)

    const content = `
${getResumeTitle(resume)}

Target Role: ${getResumeRole(resume)}
Target Company: ${getResumeCompany(resume)}
Created: ${formatDate(resume.createdAt)}
Updated: ${formatDate(resume.updatedAt)}

SUMMARY
${getResumeSummary(resume)}

SKILLS
${skills.length > 0 ? skills.join(', ') : 'No skills added.'}

EXPERIENCE
${resume.experience || resume.workExperience || 'No experience added.'}

PROJECTS
${resume.projects || resume.projectDetails || 'No projects added.'}

RESUME TEXT
${resume.resumeText || resume.fullResume || 'No resume text available.'}
`

    const blob = new Blob([content.trim()], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${getResumeTitle(resume).replace(/[^a-z0-9]/gi, '-')}.txt`
    link.click()

    URL.revokeObjectURL(url)

    showToast('Resume downloaded successfully')
  }

  const roles = useMemo(() => {
    const uniqueRoles = Array.from(
      new Set(
        resumes
          .map((resume) => getResumeRole(resume))
          .filter(Boolean)
      )
    )

    return ['All', ...uniqueRoles]
  }, [resumes])

  const filteredResumes = useMemo(() => {
    return resumes.filter((resume) => {
      const title = getResumeTitle(resume)
      const role = getResumeRole(resume)
      const company = getResumeCompany(resume)

      const searchText = `${title} ${role} ${company}`.toLowerCase()

      const matchesSearch = searchText.includes(search.toLowerCase())
      const matchesRole = filterRole === 'All' || role === filterRole

      return matchesSearch && matchesRole
    })
  }, [resumes, search, filterRole])

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

          <section className="workspace-hero">
            <div>
              <span className="eyebrow">
                Resume Workspace
              </span>

              <h1>
                Created Resumes
              </h1>

              <p>
                View, edit, duplicate, download, and manage improved resumes generated from your resume analysis.
              </p>
            </div>

            <div className="hero-actions">
              <Link href="/dashboard" className="button secondary-btn">
                Analyze Resume
              </Link>

              <Link href="/editor" className="button">
                Create Resume
              </Link>
            </div>
          </section>

          <section className="workspace-toolbar card">
            <div className="toolbar-search">
              <label>
                Search resumes
              </label>

              <input
                type="text"
                placeholder="Search by title, company, or role..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="workspace-overview">

  <div className="overview-card">
    <span>Total Resumes</span>
    <strong>{resumes.length}</strong>
  </div>

  <div className="overview-card">
    <span>ATS Optimized</span>
    <strong>92%</strong>
  </div>

  <div className="overview-card">
    <span>Roles Targeted</span>
    <strong>{roles.length - 1}</strong>
  </div>

</div>
            <div className="toolbar-filter">
              <label>
                Filter by role
              </label>

              <select
                value={filterRole}
                onChange={(event) => setFilterRole(event.target.value)}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="workspace-stats-grid">
            <div className="card workspace-stat-card">
              <span>📄</span>
              <p>Total Resumes</p>
              <h3>{resumes.length}</h3>
            </div>

            <div className="card workspace-stat-card">
              <span>🎯</span>
              <p>Roles Covered</p>
              <h3>{roles.length - 1}</h3>
            </div>

            <div className="card workspace-stat-card">
              <span>🧠</span>
              <p>Editable Drafts</p>
              <h3>{resumes.length}</h3>
            </div>
          </section>

          {filteredResumes.length > 0 ? (
            <section className="workspace-grid">
              {filteredResumes.map((resume) => (
                <article className="card workspace-card" key={resume.id}>
                  <div className="workspace-card-top">
                    <span className="workspace-icon">
                      📄
                    </span>

                    <div>
                      <h3>
                        {getResumeTitle(resume)}
                      </h3>

                      <p>
                        {getResumeCompany(resume)} • {getResumeRole(resume)}
                      </p>
                    </div>
                  </div>

                  <div className="workspace-meta">
                    <span>
                      Created: {formatDate(resume.createdAt)}
                    </span>

                    <span>
                      Updated: {formatDate(resume.updatedAt)}
                    </span>
                  </div>

                  <p className="workspace-preview">
                    {getResumeSummary(resume)}
                  </p>

                  <div className="workspace-tags">
                    {getResumeSkills(resume)
                      .slice(0, 6)
                      .map((skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {skill}
                        </span>
                      ))}
                  </div>

                  <div className="workspace-actions">
                    <button
                      type="button"
                      onClick={() => viewResume(resume)}
                    >
                      View Resume
                    </button>

                    <button
                      type="button"
                      onClick={() => openInEditor(resume)}
                    >
                      Open Editor
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicateResume(resume)}
                    >
                      Duplicate
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadResume(resume)}
                    >
                      Download
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => deleteResume(resume.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="premium-empty-state card">
              <span>📄</span>

              <h2>
                No created resumes yet
              </h2>

              <p>
                Analyze your resume and use the Resume Builder to create improved resumes.
                Your saved resume versions will appear here.
              </p>

              <div className="empty-state-actions">
                <Link href="/dashboard" className="button">
                  Analyze Resume
                </Link>

                <Link href="/editor" className="button secondary-btn">
                  Create Resume
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}