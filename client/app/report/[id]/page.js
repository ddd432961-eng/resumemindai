'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import Navbar from '../../../components/Navbar'
import AuthGuard from '../../../components/AuthGuard'

export default function ReportDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const reportRef = useRef(null)

  const [report, setReport] = useState(null)
  const [allReports, setAllReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    loadReport()
  }, [params?.id])

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

  const clampScore = (score) => {
    const value = Number(score || 0)

    if (value < 0) return 0
    if (value > 100) return 100

    return Math.round(value)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 2600)
  }

  const loadReport = () => {
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

      const uniqueReports = combinedReports.filter((item, index, array) => {
        return index === array.findIndex((entry) => String(entry.id) === String(item.id))
      })

      const selectedReport = uniqueReports.find((item) => {
        return String(item.id) === String(params?.id)
      })

      setAllReports(uniqueReports)
      setReport(selectedReport || null)
    } catch (error) {
      console.error('Failed to load report:', error)
      setReport(null)
      setAllReports([])
    } finally {
      setLoading(false)
    }
  }

  const getResult = (item = report) => {
    return item?.result || item || {}
  }

  const getMeta = (item = report) => {
    return item?.meta || {}
  }

  const getCompany = (item = report) => {
    const result = getResult(item)
    const meta = getMeta(item)

    return (
      meta.company ||
      result.selectedCompany ||
      result.company ||
      'Target Company'
    )
  }

  const getRole = (item = report) => {
    const result = getResult(item)
    const meta = getMeta(item)

    return (
      meta.role ||
      result.selectedRole ||
      result.role ||
      'Target Role'
    )
  }

  const getFileName = (item = report) => {
    const result = getResult(item)
    const meta = getMeta(item)

    return (
      meta.fileName ||
      result.fileName ||
      result.resumeName ||
      'Resume Report'
    )
  }

  const getReportDate = (item = report) => {
    return item?.savedAt || item?.createdAt || item?.meta?.createdAt || null
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

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Needs Work'
  }

  const getScoreTone = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  const readinessScore = useMemo(() => {
    if (!report) return 0

    const result = getResult(report)

    const ats = Number(result.atsScore || 0)
    const company = Number(result.companyMatch || 0)
    const project = Number(result.projectStrength || 0)

    return clampScore((ats + company + project) / 3)
  }, [report])

  const keywordInsights = useMemo(() => {
    const result = getResult(report)

    const missingKeywords = safeList(result.missingKeywords)
    const missingSkills = safeList(result.missingSkills)
    const matchedSkills = safeList(result.matchedSkills || result.detectedSkills)
    const skills = safeList(result.skills).map((skill) => {
      return typeof skill === 'string' ? skill : skill?.name
    })

    return {
      missingKeywords,
      missingSkills,
      matchedSkills: [...matchedSkills, ...skills].filter(Boolean)
    }
  }, [report])

  const scoreCards = useMemo(() => {
    const result = getResult(report)

    return [
      {
        label: 'ATS Score',
        value: clampScore(result.atsScore),
        suffix: '%',
        description: 'Resume compatibility with ATS screening systems.'
      },
      {
        label: 'Company Match',
        value: clampScore(result.companyMatch),
        suffix: '%',
        description: 'How closely your resume aligns with the target company.'
      },
      {
        label: 'Project Strength',
        value: clampScore(result.projectStrength),
        suffix: '%',
        description: 'Strength and relevance of projects for this role.'
      },
      {
        label: 'JD Match',
        value: clampScore(result.jdMatchScore || result.jobDescriptionMatch),
        suffix: '%',
        description: 'Match between resume content and job description.'
      }
    ]
  }, [report])

  const recommendations = useMemo(() => {
    const result = getResult(report)

    const suggestions = safeList(result.suggestions || result.aiSuggestions)
    const weaknesses = safeList(result.weaknesses)
    const missingSkills = safeList(result.missingSkills).map((skill) => {
      return `Add stronger evidence for ${typeof skill === 'string' ? skill : skill?.name}.`
    })

    return [
      ...suggestions,
      ...weaknesses,
      ...missingSkills
    ].filter(Boolean)
  }, [report])

  const openReportOnDashboard = () => {
    if (!report) return

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

  const saveReportCopy = () => {
    if (!report) return

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
      ...allReports
    ].filter((item, index, array) => {
      return index === array.findIndex((entry) => String(entry.id) === String(item.id))
    })

    setAllReports(updatedCombinedReports)

    showToast('Report copy saved successfully')
  }

  const deleteReport = () => {
    if (!report) return

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

    const updatedSavedReports = safeArray(savedReports).filter((item) => {
      return String(item.id) !== String(report.id)
    })

    const updatedAnalysisHistory = safeArray(analysisHistory).filter((item) => {
      return String(item.id) !== String(report.id)
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

    setAllReports(updatedCombinedReports)

    const latestAnalysis = safeParse(
      localStorage.getItem('resumemind_latest_analysis') || 'null',
      null
    )

    if (String(latestAnalysis?.id) === String(report.id)) {
      localStorage.removeItem('resumemind_latest_analysis')
      localStorage.removeItem('resumemind_latest_meta')
    }

    showToast('Report deleted successfully')
    router.push('/report')
  }

  const downloadTXT = () => {
    if (!report) return

    const result = getResult(report)

    const content = `
ResumeMind AI Report

File: ${getFileName(report)}
Company: ${getCompany(report)}
Role: ${getRole(report)}
Generated: ${formatDate(getReportDate(report))}

Readiness Score: ${readinessScore}%
ATS Score: ${result.atsScore || 0}%
Company Match: ${result.companyMatch || 0}%
Project Strength: ${result.projectStrength || 0}%
JD Match Score: ${result.jdMatchScore || result.jobDescriptionMatch || 0}%
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
${keywordInsights.matchedSkills.join('\n') || 'No matched skills available.'}

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

    showToast('TXT report downloaded successfully')
  }

  const downloadPDF = async () => {
    if (!reportRef.current || !report) return

    try {
      setPdfLoading(true)

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617'
      })

      const imageData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imageWidth = pdfWidth
      const imageHeight = (canvas.height * imageWidth) / canvas.width

      let heightLeft = imageHeight
      let position = 0

      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imageHeight
        pdf.addPage()
        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`${getFileName(report).replace(/[^a-z0-9]/gi, '-')}-report.pdf`)

      showToast('PDF report downloaded successfully')
    } catch (error) {
      console.error('PDF download failed:', error)
      showToast('PDF download failed. Try TXT download.', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  const renderList = (items, emptyText) => {
    const list = safeList(items)

    if (list.length === 0) {
      return (
        <p className="muted-text">
          {emptyText}
        </p>
      )
    }

    return (
      <ul className="clean-list">
        {list.map((item, index) => (
          <li key={index}>
            {typeof item === 'string' ? item : item?.name || JSON.stringify(item)}
          </li>
        ))}
      </ul>
    )
  }

  if (loading) {
    return (
      <AuthGuard>
        <main className="page">
          <div className="container">
            <Navbar />

            <section className="dashboard-skeleton-grid">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </section>
          </div>
        </main>
      </AuthGuard>
    )
  }

  if (!report) {
    return (
      <AuthGuard>
        <main className="page">
          <div className="glow one"></div>
          <div className="glow two"></div>

          <div className="container">
            <Navbar />

            <section className="premium-empty-state card">
              <span>📊</span>

              <h2>
                Report not found
              </h2>

              <p>
                This report may have been deleted or is not available in your local workspace.
              </p>

              <div className="empty-state-actions">
                <Link href="/report" className="button">
                  Back to Reports
                </Link>

                <Link href="/dashboard" className="button secondary-btn">
                  Analyze Resume
                </Link>
              </div>
            </section>
          </div>
        </main>
      </AuthGuard>
    )
  }

  const result = getResult(report)

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

          <section className="report-detail-hero">
            <div>
              <span className="eyebrow">
                Report Details
              </span>

              <h1>
                {getFileName(report)}
              </h1>

              <p>
                {getCompany(report)} • {getRole(report)} • {formatDate(getReportDate(report))}
              </p>
            </div>

            <div className="hero-actions">
              <Link href="/report" className="button secondary-btn">
                Back
              </Link>

              <button
                type="button"
                className="button secondary-btn"
                onClick={downloadTXT}
              >
                Download TXT
              </button>

              <button
                type="button"
                className="button"
                onClick={downloadPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </section>

          <section className="report-detail-layout" ref={reportRef}>
            <div className="card report-summary-panel">
              <div className={`report-readiness-circle ${getScoreTone(readinessScore)}`}>
                <span>{readinessScore}%</span>
              </div>

              <h2>
                {getScoreLabel(readinessScore)} Readiness
              </h2>

              <p>
                Overall readiness based on ATS score, company match, project strength,
                and job-description alignment.
              </p>

              <div className="report-meta-list">
                <div>
                  <span>Company</span>
                  <strong>{getCompany(report)}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>{getRole(report)}</strong>
                </div>

                <div>
                  <span>Generated</span>
                  <strong>{formatDate(getReportDate(report))}</strong>
                </div>

                <div>
                  <span>Hiring Probability</span>
                  <strong>{result.hiringProbability || 'Not available'}</strong>
                </div>
              </div>
            </div>

            <div className="report-detail-content">
              <div className="report-score-grid">
                {scoreCards.map((card) => (
                  <div className="card report-score-card" key={card.label}>
                    <span>{card.label}</span>
                    <h3>{card.value}{card.suffix}</h3>
                    <p>{card.description}</p>
                  </div>
                ))}
              </div>

              <div className="card report-section-card">
                <h2>
                  AI Summary
                </h2>

                <p>
                  {result.summary ||
                    result.aiSummary ||
                    result.scoreExplanation ||
                    'No AI summary available for this report.'}
                </p>
              </div>

              <div className="report-two-column">
                <div className="card report-section-card">
                  <h2>
                    Missing Skills
                  </h2>

                  {renderList(keywordInsights.missingSkills, 'No missing skills detected.')}
                </div>

                <div className="card report-section-card">
                  <h2>
                    Missing Keywords
                  </h2>

                  <div className="workspace-tags">
                    {keywordInsights.missingKeywords.length > 0 ? (
                      keywordInsights.missingKeywords.map((keyword, index) => (
                        <span key={`${keyword}-${index}`}>
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <p className="muted-text">
                        No missing keywords detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="report-two-column">
                <div className="card report-section-card">
                  <h2>
                    Matched Skills
                  </h2>

                  <div className="workspace-tags success-tags">
                    {keywordInsights.matchedSkills.length > 0 ? (
                      keywordInsights.matchedSkills.slice(0, 20).map((skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {typeof skill === 'string' ? skill : skill?.name}
                        </span>
                      ))
                    ) : (
                      <p className="muted-text">
                        No matched skills available.
                      </p>
                    )}
                  </div>
                </div>

                <div className="card report-section-card">
                  <h2>
                    Strengths
                  </h2>

                  {renderList(result.strengths, 'No strengths available.')}
                </div>
              </div>

              <div className="card report-section-card">
                <h2>
                  AI Improvement Suggestions
                </h2>

                {renderList(recommendations, 'No suggestions available.')}
              </div>

              <div className="card report-section-card">
                <h2>
                  Resume Text Preview
                </h2>

                <pre className="report-resume-preview">
                  {result.resumeText || 'Resume text preview is not available.'}
                </pre>
              </div>
            </div>
          </section>

          <section className="report-bottom-actions card">
            <div>
              <h2>
                Continue improving this resume
              </h2>

              <p>
                Reopen this report in dashboard, save a copy, or delete it from your workspace.
              </p>
            </div>

            <div className="workspace-actions">
              <button
                type="button"
                onClick={openReportOnDashboard}
              >
                Open Dashboard
              </button>

              <button
                type="button"
                onClick={saveReportCopy}
              >
                Save Copy
              </button>

              <button
                type="button"
                onClick={downloadTXT}
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
              </button>

              <button
                type="button"
                className="danger-btn"
                onClick={deleteReport}
              >
                Delete Report
              </button>
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  )
}