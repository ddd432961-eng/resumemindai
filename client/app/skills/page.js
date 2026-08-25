'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'

const fallbackSkillPlan = [
  {
    title: 'Strengthen core technical skills',
    description: 'Improve the most important skills required for your selected role.',
    priority: 'High'
  },
  {
    title: 'Add missing ATS keywords',
    description: 'Include role-specific keywords naturally inside summary, skills, and projects.',
    priority: 'High'
  },
  {
    title: 'Improve project impact',
    description: 'Rewrite project bullets with tools, metrics, and measurable outcomes.',
    priority: 'Medium'
  },
  {
    title: 'Align resume with target company',
    description: 'Customize your resume for the company and job role before applying.',
    priority: 'Medium'
  }
]

export default function SkillIntelligencePage() {
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedReportId, setSelectedReportId] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadSkillData()
  }, [])

  const safeParse = (value, fallback = null) => {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }

  const safeArray = (value) => {
    return Array.isArray(value) ? value : []
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 2600)
  }

  const normalizeList = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') return item
          return item?.name || item?.skill || item?.keyword || ''
        })
        .filter(Boolean)
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return []
  }

  const normalizeScore = (value) => {
    const numberValue = Number(value)

    if (Number.isNaN(numberValue)) {
      return 0
    }

    return Math.max(0, Math.min(100, numberValue))
  }

  const loadSkillData = () => {
    if (typeof window === 'undefined') return

    const latestAnalysis = safeParse(
      localStorage.getItem('resumemind_latest_analysis'),
      null
    )

    const latestMeta = safeParse(
      localStorage.getItem('resumemind_latest_meta'),
      null
    )

    const analysisHistory = safeParse(
      localStorage.getItem('resumemind_analysis_history') || '[]',
      []
    )

    const savedReports = safeParse(
      localStorage.getItem('resumemind_saved_reports') || '[]',
      []
    )

    const combinedHistory = [
      ...safeArray(analysisHistory),
      ...safeArray(savedReports)
    ].filter((item, index, array) => {
      return index === array.findIndex((entry) => entry.id === item.id)
    })

    setHistory(combinedHistory)

    if (latestAnalysis) {
      setAnalysis({
        id: latestAnalysis.id || 'latest',
        result: latestAnalysis.result || latestAnalysis,
        meta: latestMeta || latestAnalysis.meta || {}
      })

      setSelectedReportId(latestAnalysis.id || 'latest')
      return
    }

    if (combinedHistory.length > 0) {
      const firstReport = combinedHistory[0]

      setAnalysis({
        id: firstReport.id,
        result: firstReport.result || firstReport,
        meta: firstReport.meta || {}
      })

      setSelectedReportId(firstReport.id)
    }
  }

  const handleReportChange = (event) => {
    const value = event.target.value
    setSelectedReportId(value)

    if (value === 'latest') {
      const latestAnalysis = safeParse(
        localStorage.getItem('resumemind_latest_analysis'),
        null
      )

      const latestMeta = safeParse(
        localStorage.getItem('resumemind_latest_meta'),
        null
      )

      if (latestAnalysis) {
        setAnalysis({
          id: latestAnalysis.id || 'latest',
          result: latestAnalysis.result || latestAnalysis,
          meta: latestMeta || latestAnalysis.meta || {}
        })
      }

      return
    }

    const selected = history.find((item) => String(item.id) === String(value))

    if (selected) {
      setAnalysis({
        id: selected.id,
        result: selected.result || selected,
        meta: selected.meta || {}
      })
    }
  }

  const skillData = useMemo(() => {
    const result = analysis?.result || {}

    const matchedSkills = normalizeList(
      result.matchedSkills ||
      result.skills ||
      result.detectedSkills ||
      result.presentSkills
    )

    const missingSkills = normalizeList(
      result.missingSkills ||
      result.skillGaps ||
      result.requiredMissingSkills
    )

    const missingKeywords = normalizeList(
      result.missingKeywords ||
      result.keywordGaps ||
      result.requiredKeywords
    )

    const suggestions = normalizeList(
      result.suggestions ||
      result.aiSuggestions ||
      result.improvementSuggestions ||
      result.recommendations
    )

    const atsScore = normalizeScore(
      result.atsScore ||
      result.resumeHealthScore ||
      result.score
    )

    const jdMatchScore = normalizeScore(
      result.jdMatchScore ||
      result.jobMatchScore ||
      result.roleMatchScore
    )

    const companyMatch = normalizeScore(
      result.companyMatch ||
      result.companyMatchScore
    )

    const readinessScore = Math.round(
      (
        atsScore +
        jdMatchScore +
        companyMatch +
        Math.max(0, 100 - missingSkills.length * 8) +
        Math.max(0, 100 - missingKeywords.length * 5)
      ) / 5
    )

    const priorityPlan = [
      ...missingSkills.slice(0, 5).map((skill) => ({
        title: `Learn or improve ${skill}`,
        description: `Add ${skill} through projects, certifications, or practical implementation.`,
        priority: 'High'
      })),
      ...missingKeywords.slice(0, 5).map((keyword) => ({
        title: `Add keyword: ${keyword}`,
        description: `Use ${keyword} naturally in your summary, skills, experience, or projects.`,
        priority: 'Medium'
      })),
      ...suggestions.slice(0, 4).map((suggestion) => ({
        title: suggestion,
        description: 'Apply this recommendation to improve resume strength and role alignment.',
        priority: 'Medium'
      }))
    ]

    return {
      matchedSkills,
      missingSkills,
      missingKeywords,
      suggestions,
      atsScore,
      jdMatchScore,
      companyMatch,
      readinessScore,
      priorityPlan: priorityPlan.length > 0 ? priorityPlan : fallbackSkillPlan
    }
  }, [analysis])

  const exportSkillPlan = () => {
    const meta = analysis?.meta || {}

    const content = `
ResumeMind AI - Skill Intelligence Plan

Target Company: ${meta.company || 'Not selected'}
Target Role: ${meta.role || 'Not selected'}

ROLE READINESS SCORE
${skillData.readinessScore}%

MATCHED SKILLS
${skillData.matchedSkills.join(', ') || 'No matched skills found.'}

MISSING SKILLS
${skillData.missingSkills.join(', ') || 'No missing skills found.'}

MISSING KEYWORDS
${skillData.missingKeywords.join(', ') || 'No missing keywords found.'}

PRIORITY PLAN
${skillData.priorityPlan
  .map((item, index) => {
    return `${index + 1}. [${item.priority}] ${item.title}
   ${item.description}`
  })
  .join('\n\n')}
`

    const blob = new Blob([content.trim()], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `skill-intelligence-plan-${Date.now()}.txt`
    link.click()

    URL.revokeObjectURL(url)

    showToast('Skill plan exported successfully')
  }

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Strong'
    if (score >= 50) return 'Improving'
    return 'Needs Work'
  }

  const meta = analysis?.meta || {}

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

          <section className="skills-hero">
            <div>
              <span className="eyebrow">
                Skill Intelligence
              </span>

              <h1>
                Understand your skill gaps
              </h1>

              <p>
                Track missing skills, matched skills, ATS keywords, and learning priorities for your target role.
              </p>
            </div>

            <div className="hero-actions">
              <Link href="/dashboard" className="button secondary-btn">
                Dashboard
              </Link>

              <Link href="/editor" className="button secondary-btn">
                Resume Editor
              </Link>

              <button
                type="button"
                className="button"
                onClick={exportSkillPlan}
                disabled={!analysis}
              >
                Export Plan
              </button>
            </div>
          </section>

          {!analysis ? (
            <section className="templates-section">
              <div className="card empty-state-card">
                <span>
                  🧠
                </span>

                <h2>
                  No skill data available
                </h2>

                <p>
                  Analyze a resume first to generate skill intelligence, missing keywords, and role readiness insights.
                </p>

                <Link href="/dashboard" className="button">
                  Analyze Resume
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section className="skills-toolbar card">
                <div>
                  <span className="eyebrow">
                    Current Analysis
                  </span>

                  <h2>
                    {meta.company || 'Target Company'} • {meta.role || 'Target Role'}
                  </h2>
                </div>

                <div className="form-group">
                  <label>
                    Select report
                  </label>

                  <select
                    value={selectedReportId}
                    onChange={handleReportChange}
                  >
                    <option value="latest">
                      Latest Analysis
                    </option>

                    {history.map((item) => (
                      <option key={item.id} value={item.id}>
                        {(item.meta?.company || 'Company')} - {(item.meta?.role || 'Role')}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="skills-score-grid">
                <div className="card skills-score-card main">
                  <span>
                    Role Readiness
                  </span>

                  <h3>
                    {skillData.readinessScore}%
                  </h3>

                  <p>
                    {getScoreLabel(skillData.readinessScore)}
                  </p>
                </div>

                <div className="card skills-score-card">
                  <span>
                    ATS Score
                  </span>

                  <h3>
                    {skillData.atsScore}%
                  </h3>

                  <p>
                    {getScoreLabel(skillData.atsScore)}
                  </p>
                </div>

                <div className="card skills-score-card">
                  <span>
                    JD Match
                  </span>

                  <h3>
                    {skillData.jdMatchScore}%
                  </h3>

                  <p>
                    {getScoreLabel(skillData.jdMatchScore)}
                  </p>
                </div>

                <div className="card skills-score-card">
                  <span>
                    Company Match
                  </span>

                  <h3>
                    {skillData.companyMatch}%
                  </h3>

                  <p>
                    {getScoreLabel(skillData.companyMatch)}
                  </p>
                </div>
              </section>

              <section className="skills-grid">
                <div className="card skill-card">
                  <div className="skill-card-header">
                    <h2>
                      Matched Skills
                    </h2>

                    <span>
                      {skillData.matchedSkills.length}
                    </span>
                  </div>

                  <div className="workspace-tags">
                    {skillData.matchedSkills.length > 0 ? (
                      skillData.matchedSkills.map((skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span>
                        No matched skills found
                      </span>
                    )}
                  </div>
                </div>

                <div className="card skill-card warning">
                  <div className="skill-card-header">
                    <h2>
                      Missing Skills
                    </h2>

                    <span>
                      {skillData.missingSkills.length}
                    </span>
                  </div>

                  <div className="workspace-tags">
                    {skillData.missingSkills.length > 0 ? (
                      skillData.missingSkills.map((skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span>
                        No missing skills found
                      </span>
                    )}
                  </div>
                </div>

                <div className="card skill-card">
                  <div className="skill-card-header">
                    <h2>
                      Missing Keywords
                    </h2>

                    <span>
                      {skillData.missingKeywords.length}
                    </span>
                  </div>

                  <div className="workspace-tags">
                    {skillData.missingKeywords.length > 0 ? (
                      skillData.missingKeywords.map((keyword, index) => (
                        <span key={`${keyword}-${index}`}>
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span>
                        No missing keywords found
                      </span>
                    )}
                  </div>
                </div>

                <div className="card skill-card">
                  <div className="skill-card-header">
                    <h2>
                      AI Suggestions
                    </h2>

                    <span>
                      {skillData.suggestions.length}
                    </span>
                  </div>

                  {skillData.suggestions.length > 0 ? (
                    <ul className="skill-suggestion-list">
                      {skillData.suggestions.map((suggestion, index) => (
                        <li key={`${suggestion}-${index}`}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      No suggestions available for this analysis.
                    </p>
                  )}
                </div>
              </section>

              <section className="card learning-roadmap">
                <div className="section-heading left">
                  <span className="eyebrow">
                    Priority Roadmap
                  </span>

                  <h2>
                    What to improve next
                  </h2>

                  <p>
                    A practical learning and resume improvement plan based on your latest analysis.
                  </p>
                </div>

                <div className="roadmap-list">
                  {skillData.priorityPlan.map((item, index) => (
                    <div className="roadmap-item" key={`${item.title}-${index}`}>
                      <div className="roadmap-number">
                        {index + 1}
                      </div>

                      <div>
                        <span className={`priority-pill ${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </span>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}