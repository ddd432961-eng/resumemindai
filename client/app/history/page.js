'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/history.css'
import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'

export default function HistoryPage() {

  const router = useRouter()

  const [reports, setReports] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = () => {

    const savedReports = JSON.parse(
      localStorage.getItem(
        'resumemind_analysis_history'
      ) || '[]'
    )

    setReports(
      Array.isArray(savedReports)
        ? savedReports
        : []
    )
  }

  const showMessage = (text) => {

    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  const getCompany = (report) => {

    return (
      report?.meta?.company ||
      report?.company ||
      'Target Company'
    )
  }

  const getRole = (report) => {

    return (
      report?.meta?.role ||
      report?.role ||
      'Target Role'
    )
  }

  const getTitle = (report, index) => {

    return (
      report?.title ||
      report?.meta?.title ||
      `${getCompany(report)} ${getRole(report)} Report ${index + 1}`
    )
  }

  const getAtsScore = (report) => {

    return Number(
      report?.result?.atsScore ||
      report?.result?.score ||
      report?.result?.overallScore ||
      report?.score ||
      0
    )
  }

  const getHealthScore = (report) => {

    const result = report?.result || {}

    if (report?.healthScore) {
      return Number(report.healthScore)
    }

    if (
      result.healthScore ||
      result.resumeHealthScore
    ) {

      return Number(
        result.healthScore ||
        result.resumeHealthScore
      )
    }

    const ats = Number(
      result.atsScore ||
      result.score ||
      0
    )

    const company = Number(
      result.companyMatch || 0
    )

    const project = Number(
      result.projectStrength || 0
    )

    if (!ats && !company && !project) {
      return 0
    }

    return Math.round(
      (ats + company + project) / 3
    )
  }

  const getJdScore = (report) => {

    const result = report?.result || {}

    return Number(
      result.jdMatchScore ||
      result.jobDescriptionMatch ||
      result.jobDescriptionScore ||
      report?.jdScore ||
      0
    )
  }

  const getMissingSkillsCount = (report) => {

    const result = report?.result || {}

    const missingSkills =
      result.missingSkills ||
      result.missingKeywords ||
      report?.missingSkills ||
      report?.missingKeywords ||
      []

    return Array.isArray(missingSkills)
      ? missingSkills.length
      : 0
  }

  const getSavedDate = (report) => {

    return (
      report?.savedAt ||
      report?.createdAt ||
      report?.meta?.createdAt ||
      report?.meta?.date ||
      ''
    )
  }

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return 'Recently created'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return String(dateValue)
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    )
  }

  const companies = useMemo(() => {

    const values = reports
      .map((report) => getCompany(report))
      .filter(Boolean)

    return [
      'All',
      ...Array.from(new Set(values))
    ]

  }, [reports])

  const roles = useMemo(() => {

    const values = reports
      .map((report) => getRole(report))
      .filter(Boolean)

    return [
      'All',
      ...Array.from(new Set(values))
    ]

  }, [reports])

  const filteredReports = useMemo(() => {

    return reports.filter((report, index) => {

      const title =
        getTitle(report, index)

      const company =
        getCompany(report)

      const role =
        getRole(report)

      const savedDate =
        getSavedDate(report)

      const text =
        `${title} ${company} ${role} ${savedDate}`
          .toLowerCase()

      const matchesSearch =
        text.includes(
          searchTerm.toLowerCase()
        )

      const matchesCompany =
        companyFilter === 'All' ||
        company === companyFilter

      const matchesRole =
        roleFilter === 'All' ||
        role === roleFilter

      return (
        matchesSearch &&
        matchesCompany &&
        matchesRole
      )
    })

  }, [
    reports,
    searchTerm,
    companyFilter,
    roleFilter
  ])

  const bestScore = useMemo(() => {

    if (!reports.length) return 0

    return Math.max(
      ...reports.map((report) =>
        getAtsScore(report)
      )
    )

  }, [reports])

  const averageScore = useMemo(() => {

    if (!reports.length) return 0

    const total = reports.reduce(
      (sum, report) =>
        sum + getAtsScore(report),
      0
    )

    return Math.round(
      total / reports.length
    )

  }, [reports])

  const handleOpenReport = (report) => {

    localStorage.setItem(
      'resumemind_latest_analysis',
      JSON.stringify(report)
    )

    localStorage.setItem(
      'resumemind_latest_meta',
      JSON.stringify({
        id: report.id,
        title: getTitle(report, 0),
        company: getCompany(report),
        role: getRole(report),
        createdAt: getSavedDate(report),
        savedAt: getSavedDate(report)
      })
    )

    router.push('/dashboard')
  }

  const handleDeleteReport = (reportId) => {

    const confirmDelete =
      window.confirm(
        'Delete this analysis report?'
      )

    if (!confirmDelete) return

    const updatedReports =
      reports.filter(
        (report) =>
          String(report.id) !==
          String(reportId)
      )

    setReports(updatedReports)

    localStorage.setItem(
      'resumemind_analysis_history',
      JSON.stringify(updatedReports)
    )

    showMessage(
      'Report deleted successfully.'
    )
  }

  return (

    <AuthGuard>

      <main className="page">

        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">

          <Navbar />

          <section className="history-page-shell">

            <div className="history-hero">

              <div>

                <p className="eyebrow">
                  Analysis History
                </p>

                <h1>
                  Resume Reports
                </h1>

                <p>
                  Track your resume analysis reports,
                  compare ATS performance,
                  and reopen previous insights.
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

    </AuthGuard>
  )
}