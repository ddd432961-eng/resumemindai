'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'

export default function ReportsPage() {
  const router = useRouter()

  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('All')
  const [filterRole, setFilterRole] = useState('All')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const safeArray = (value) => {
    return Array.isArray(value) ? value : []
  }

  const safeList = (items) => {
    return Array.isArray(items) ? items : []
  }

  const safeParse = (value, fallback = []) => {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }

  const loadReports = () => {
    try {
      const analysisHistory = safeParse(
        localStorage.getItem('resumemind_analysis_history') || '[]',
        []
      )

      const savedReports = safeParse(
        localStorage.getItem('resumemind_saved_reports') || '[]',
        []
      )

      const combinedReports = [
        ...safeArray(savedReports),
        ...safeArray(analysisHistory)
      ]

      const uniqueReports = combinedReports.filter((report, index, array) => {
        return index === array.findIndex((item) => String(item.id) === String(report.id))
      })

      const sortedReports = uniqueReports.sort((a, b) => {
        const dateA = new Date(a.savedAt || a.createdAt || a?.meta?.createdAt || 0).getTime()
        const dateB = new Date(b.savedAt || b.createdAt || b?.meta?.createdAt || 0).getTime()

        return dateB - dateA
      })

      setReports(sortedReports)
    } catch (error) {
      console.error('Failed to load reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 2500)
  }

  const getResult = (report) => {
    return report?.result || report || {}
  }

  const getMeta = (report) => {
    return report?.meta || {}
  }

  const getCompany = (report) => {
    const result = getResult(report)
    const meta = getMeta(report)

    return (
      meta.company ||
      result.selectedCompany ||
      result.company ||
      'Target Company'
    )
  }

  const getRole = (report) => {
    const result = getResult(report)
    const meta = getMeta(report)

    return (
      meta.role ||
      result.selectedRole ||
      result.role ||
      'Target Role'
    )
  }

  const getFileName = (report) => {
    const result = getResult(report)
    const meta = getMeta(report)

    return (
      meta.fileName ||
      result.fileName ||
      result.resumeName ||
      'Resume Report'
    )
  }

  const getReportDate = (report) => {
    return report?.savedAt || report?.createdAt || report?.meta?.createdAt || null
  }

  const clampScore = (score) => {
    const value = Number(score || 0)

    if (value < 0) return 0
    if (value > 100) return 100

    return Math.round(value)
  }

  const getReadinessScore = (report) => {
    const result = getResult(report)

    const ats = Number(result.atsScore || 0)
    const company = Number(result.companyMatch || 0)
    const project = Number(result.projectStrength || 0)

    return clampScore((ats + company + project) / 3)
  }

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Needs Work'
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown date'

    return new Date(dateValue).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const companies = useMemo(() => {
    const uniqueCompanies = Array.from(
      new Set(
        reports
          .map((report) => getCompany(report))
          .filter(Boolean)
      )
    )

    return ['All', ...uniqueCompanies]
  }, [reports])

  const roles = useMemo(() => {
    const uniqueRoles = Array.from(
      new Set(
        reports
          .map((report) => getRole(report))
          .filter(Boolean)
      )
    )

    return ['All', ...uniqueRoles]
  }, [reports])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const result = getResult(report)

      const searchText = `
        ${getFileName(report)}
        ${getCompany(report)}
        ${getRole(report)}
        ${result.atsScore || ''}
        ${result.companyMatch || ''}
        ${result.projectStrength || ''}
      `.toLowerCase()

      const matchesSearch = searchText.includes(search.toLowerCase())
      const matchesCompany =
        filterCompany === 'All' || getCompany(report) === filterCompany
      const matchesRole =
        filterRole === 'All' || getRole(report) === filterRole

      return matchesSearch && matchesCompany && matchesRole
    })
  }, [reports, search, filterCompany, filterRole])

  const reportStats = useMemo(() => {
    const totalReports = reports.length

    const bestATS = reports.length
      ? Math.max(
          ...reports.map((report) => Number(getResult(report).atsScore || 0))
        )
      : 0

    const averageReadiness = reports.length
      ? clampScore(
          reports.reduce((total, report) => {
            return total + getReadinessScore(report)
          }, 0) / reports.length
        )
      : 0

    const totalMissingSkills = Array.from(
      new Set(
        reports.flatMap((report) => safeList(getResult(report).missingSkills))
      )
    ).length

    return {
      totalReports,
      bestATS,
      averageReadiness,
      totalMissingSkills
    }
  }, [reports])

  const openReportOnDashboard = (report) => {
    localStorage.setItem(
      'resumemind_latest_analysis',
      JSON.stringify(report)
    )

    localStorage.setItem(
      'resumemind_latest_meta',
      JSON.stringify({
        ...getMeta(report),
        company: getCompany(report),
        role: getRole(report),
        fileName: getFileName(report),
        savedAt: getReportDate(report) || new Date().toISOString()
      })
    )

    router.push('/dashboard')
  }

  const saveReportCopy = (report) => {
    const savedReports = safeParse(
      localStorage.getItem('resumemind_saved_reports') || '[]',
      []
    )

    const copy = {
      ...report,
      id: `report_${Date.now()}`,
      savedAt: new Date().toISOString()
    }

    const updatedSavedReports = [
      copy,
      ...safeArray(savedReports)
    ]

    localStorage.setItem(
      'resumemind_saved_reports',
      JSON.stringify(updatedSavedReports)
    )

    const updatedCombinedReports = [
      ...updatedSavedReports,
      ...reports
    ].filter((item, index, array) => {
      return index === array.findIndex((entry) => String(entry.id) === String(item.id))
    })

    const sortedReports = updatedCombinedReports.sort((a, b) => {
      const dateA = new Date(a.savedAt || a.createdAt || a?.meta?.createdAt || 0).getTime()
      const dateB = new Date(b.savedAt || b.createdAt || b?.meta?.createdAt || 0).getTime()

      return dateB - dateA
    })

    setReports(sortedReports)

    showToast('Report copy saved successfully')
  }

  const deleteReport = (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this report?'
    )

    if (!confirmDelete) return

    const savedReports = safeParse(
      localStorage.getItem('resumemind_saved_reports') || '[]',
      []
    )

    const analysisHistory = safeParse(
      localStorage.getItem('resumemind_analysis_history') || '[]',
      []
    )

    const updatedSavedReports = safeArray(savedReports).filter((report) => {
      return String(report.id) !== String(id)
    })

    const updatedAnalysisHistory = safeArray(analysisHistory).filter((report) => {
      return String(report.id) !== String(id)
    })

    localStorage.setItem(
      'resumemind_saved_reports',
      JSON.stringify(updatedSavedReports)
    )

    localStorage.setItem(
      'resumemind_analysis_history',
      JSON.stringify(updatedAnalysisHistory)
    )

    const updatedCombinedReports = [
      ...updatedSavedReports,
      ...updatedAnalysisHistory
    ].filter((item, index, array) => {
      return index === array.findIndex((entry) => String(entry.id) === String(item.id))
    })

    const sortedReports = updatedCombinedReports.sort((a, b) => {
      const dateA = new Date(a.savedAt || a.createdAt || a?.meta?.createdAt || 0).getTime()
      const dateB = new Date(b.savedAt || b.createdAt || b?.meta?.createdAt || 0).getTime()

      return dateB - dateA
    })

    setReports(sortedReports)

    const latestAnalysis = safeParse(
      localStorage.getItem('resumemind_latest_analysis') || 'null',
      null
    )

    if (String(latestAnalysis?.id) === String(id)) {
      localStorage.removeItem('resumemind_latest_analysis')
      localStorage.removeItem('resumemind_latest_meta')
    }

    showToast('Report deleted successfully')
  }

  const downloadReport = (report) => {
    const result = getResult(report)

    const content = `
ResumeMind AI Report

File: ${getFileName(report)}
Company: ${getCompany(report)}
Role: ${getRole(report)}
Generated: ${formatDate(getReportDate(report))}

ATS Score: ${result.atsScore || 0}%
Company Match: ${result.companyMatch || 0}%
Project Strength: ${result.projectStrength || 0}%
Readiness Score: ${getReadinessScore(report)}%
Hiring Probability: ${result.hiringProbability || 'Not available'}

AI Summary:
${result.summary || result.aiSummary || 'No AI summary available.'}

Score Explanation:
${result.scoreExplanation || 'No score explanation available.'}

Missing Skills:
${safeList(result.missingSkills).join('\n') || 'No missing skills detected.'}

Missing Keywords:
${safeList(result.missingKeywords).join('\n') || 'No missing keywords detected.'}

Matched Skills:
${safeList(result.matchedSkills).join('\n') || 'No matched skills available.'}

Strengths:
${safeList(result.strengths).join('\n') || 'No strengths available.'}

Weaknesses:
${safeList(result.weaknesses).join('\n') || 'No weaknesses available.'}

AI Suggestions:
${safeList(result.suggestions || result.aiSuggestions).join('\n') || 'No suggestions available.'}
`

    const blob = new Blob([content.trim()], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${getFileName(report).replace(/[^a-z0-9]/gi, '-')}-report.txt`
    link.click()

    URL.revokeObjectURL(url)

    showToast('Report downloaded successfully')
  }

  const clearAllReports = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear all reports? This cannot be undone.'
    )

    if (!confirmClear) return

    localStorage.removeItem('resumemind_saved_reports')
    localStorage.removeItem('resumemind_analysis_history')
    localStorage.removeItem('resumemind_latest_analysis')
    localStorage.removeItem('resumemind_latest_meta')

    setReports([])
    showToast('All reports cleared successfully')
  }

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
                Report Workspace
              </span>

              <h1>
                Resume Reports
              </h1>

              <p>
                Manage all resume analysis reports, compare readiness scores, reopen reports,
                and download professional summaries.
              </p>
            </div>

            <div className="hero-actions">
              <Link href="/dashboard" className="button">
                Analyze Resume
              </Link>

              {reports.length > 0 ? (
                <button
                  type="button"
                  className="button secondary-btn"
                  onClick={clearAllReports}
                >
                  Clear All
                </button>
              ) : null}
            </div>
          </section>

          {loading ? (
            <section className="dashboard-skeleton-grid">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </section>
          ) : (
            <>
              <section className="workspace-stats-grid">
                <div className="card workspace-stat-card">
                  <span>📊</span>
                  <p>Total Reports</p>
                  <h3>{reportStats.totalReports}</h3>
                </div>

                <div className="card workspace-stat-card">
                  <span>🏆</span>
                  <p>Best ATS Score</p>
                  <h3>{reportStats.bestATS}%</h3>
                </div>

                <div className="card workspace-stat-card">
                  <span>🎯</span>
                  <p>Avg Readiness</p>
                  <h3>{reportStats.averageReadiness}%</h3>
                </div>

                <div className="card workspace-stat-card">
                  <span>🧩</span>
                  <p>Unique Missing Skills</p>
                  <h3>{reportStats.totalMissingSkills}</h3>
                </div>
              </section>

              <section className="workspace-toolbar card report-toolbar">
                <div className="toolbar-search">
                  <label>
                    Search reports
                  </label>

                  <input
                    type="text"
                    placeholder="Search by file, company, role, or score..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="toolbar-filter">
                  <label>
                    Company
                  </label>

                  <select
                    value={filterCompany}
                    onChange={(event) => setFilterCompany(event.target.value)}
                  >
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="toolbar-filter">
                  <label>
                    Role
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

              {filteredReports.length > 0 ? (
                <section className="report-manager-grid">
                  {filteredReports.map((report) => {
                    const result = getResult(report)
                    const readiness = getReadinessScore(report)

                    return (
                      <article className="card report-manager-card" key={report.id}>
                        <div className="report-card-top">
                          <div>
                            <span className="template-tag">
                              {getScoreLabel(readiness)}
                            </span>

                            <h2>
                              {getFileName(report)}
                            </h2>

                            <p>
                              {getCompany(report)} • {getRole(report)}
                            </p>
                          </div>

                          <div className="mini-score-circle">
                            {readiness}%
                          </div>
                        </div>

                        <div className="report-score-row">
                          <div>
                            <span>ATS</span>
                            <strong>{result.atsScore || 0}%</strong>
                          </div>

                          <div>
                            <span>Company</span>
                            <strong>{result.companyMatch || 0}%</strong>
                          </div>

                          <div>
                            <span>Project</span>
                            <strong>{result.projectStrength || 0}%</strong>
                          </div>
                        </div>

                        <p className="workspace-preview">
                          {result.summary ||
                            result.aiSummary ||
                            result.scoreExplanation ||
                            'No summary available for this report.'}
                        </p>

                        <div className="workspace-meta">
                          <span>
                            Generated: {formatDate(getReportDate(report))}
                          </span>
                        </div>

                        <div className="workspace-tags">
                          {safeList(result.missingSkills)
                            .slice(0, 6)
                            .map((skill, index) => (
                              <span key={`${typeof skill === 'string' ? skill : skill?.name}-${index}`}>
                                {typeof skill === 'string' ? skill : skill?.name}
                              </span>
                            ))}
                        </div>

                        <div className="workspace-actions">
                          <Link href={`/report/${report.id}`}>
                            View Report
                          </Link>

                          <button
                            type="button"
                            onClick={() => openReportOnDashboard(report)}
                          >
                            Open Dashboard
                          </button>

                          <button
                            type="button"
                            onClick={() => saveReportCopy(report)}
                          >
                            Save Copy
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadReport(report)}
                          >
                            Download TXT
                          </button>

                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => deleteReport(report.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </section>
              ) : (
                <section className="premium-empty-state card">
                  <span>📊</span>

                  <h2>
                    No reports found
                  </h2>

                  <p>
                    Analyze a resume from your dashboard. Your ATS score, company match,
                    skill gaps, and AI suggestions will appear here as professional reports.
                  </p>

                  <div className="empty-state-actions">
                    <Link href="/dashboard" className="button">
                      Analyze Resume
                    </Link>

                    <Link href="/history" className="button secondary-btn">
                      View History
                    </Link>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}