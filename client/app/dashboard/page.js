'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Navbar from '../../components/Navbar'
import ATSCard from '../../components/ATSCard'
import UploadBox from '../../components/UploadBox'
import SkillChart from '../../components/SkillChart'
import AuthGuard from '../../components/AuthGuard'
import ResumeBuilderWizard from '../../components/ResumeBuilderWizard'

export default function Dashboard() {
  const [result, setResult] = useState(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [recentReports, setRecentReports] = useState([])
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [summaryGenerated, setSummaryGenerated] = useState(false)

  const [analysisMeta, setAnalysisMeta] = useState({
    company: 'Google',
    role: 'AI/ML Engineer',
    jobDescription: ''
  })

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem('resumemind_analysis_history') || '[]'
    )

    const latestAnalysis = localStorage.getItem('resumemind_latest_analysis')
    const latestMeta = localStorage.getItem('resumemind_latest_meta')

    setRecentReports(savedHistory.slice(0, 3))

    if (latestAnalysis) {
      try {
        const parsed = JSON.parse(latestAnalysis)

        if (parsed?.result) {
          setResult(parsed.result)
        }

        if (parsed?.meta) {
          setAnalysisMeta(parsed.meta)
        }
      } catch (error) {
        console.error('Failed to load latest analysis:', error)
      }
    }

    if (latestMeta && !latestAnalysis) {
      try {
        setAnalysisMeta(JSON.parse(latestMeta))
      } catch (error) {
        console.error('Failed to load latest meta:', error)
      }
    }
  }, [])

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem('resumemind_analysis_history') || '[]'
    )

    setRecentReports(savedHistory.slice(0, 3))
  }, [result])

  const handleSetAnalysisMeta = (meta) => {
    const updatedMeta = {
      company: meta?.company || analysisMeta.company,
      role: meta?.role || analysisMeta.role,
      jobDescription: meta?.jobDescription || analysisMeta.jobDescription
    }

    setAnalysisMeta(updatedMeta)

    localStorage.setItem(
      'resumemind_latest_meta',
      JSON.stringify({
        ...updatedMeta,
        savedAt: new Date().toISOString()
      })
    )
  }

  const handleSetResult = (data) => {
    setResult(data)
    setShowBuilder(false)
    setGeneratedSummary('')
    setSummaryGenerated(false)

    const currentMeta = {
      company: data?.selectedCompany || analysisMeta.company,
      role: data?.selectedRole || analysisMeta.role,
      jobDescription: data?.jobDescription || analysisMeta.jobDescription
    }

    setAnalysisMeta(currentMeta)

    const analysisId = `analysis_${Date.now()}`

    const savedAnalysis = {
      id: analysisId,
      result: data,
      meta: currentMeta,
      savedAt: new Date().toISOString()
    }

    localStorage.setItem(
      'resumemind_latest_analysis',
      JSON.stringify(savedAnalysis)
    )

    localStorage.setItem(
      'resumemind_latest_meta',
      JSON.stringify({
        ...currentMeta,
        savedAt: new Date().toISOString()
      })
    )

    const oldHistory = JSON.parse(
      localStorage.getItem('resumemind_analysis_history') || '[]'
    )

    const updatedHistory = [
      savedAnalysis,
      ...oldHistory
    ].slice(0, 20)

    localStorage.setItem(
      'resumemind_analysis_history',
      JSON.stringify(updatedHistory)
    )

    setRecentReports(updatedHistory.slice(0, 3))
  }

  const safeList = (items) => {
    if (!Array.isArray(items)) return []
    return items
  }

  const normalize = (value) => {
    return String(value || '').toLowerCase().trim()
  }

  const hasValue = (value) => {
    if (!value) return false
    if (Array.isArray(value)) return value.length > 0
    return String(value).trim().length > 0
  }

  const clampScore = (score) => {
    const value = Number(score || 0)

    if (value < 0) return 0
    if (value > 100) return 100

    return Math.round(value)
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

  const getReadinessScore = () => {
    if (!result) return 0

    const ats = Number(result.atsScore || 0)
    const company = Number(result.companyMatch || 0)
    const project = Number(result.projectStrength || 0)

    return clampScore((ats + company + project) / 3)
  }

  const getResumeText = () => {
    return String(result?.resumeText || '')
  }

  const getDetectedSkillNames = () => {
    const skillsFromObjects = safeList(result?.skills).map((skill) => {
      return typeof skill === 'string' ? skill : skill.name
    })

    return [
      ...safeList(result?.detectedSkills),
      ...safeList(result?.matchedSkills),
      ...skillsFromObjects
    ]
      .filter(Boolean)
      .map((item) => String(item).trim())
  }

  const getRoleKeywords = () => {
    const role = normalize(analysisMeta.role)

    if (
      role.includes('ai') ||
      role.includes('ml') ||
      role.includes('machine learning') ||
      role.includes('data scientist')
    ) {
      return [
        'Python',
        'Machine Learning',
        'Deep Learning',
        'NLP',
        'LLM',
        'TensorFlow',
        'PyTorch',
        'Model Deployment',
        'MLOps',
        'Data Preprocessing',
        'Feature Engineering',
        'Model Evaluation'
      ]
    }

    if (
      role.includes('frontend') ||
      role.includes('react') ||
      role.includes('ui')
    ) {
      return [
        'HTML',
        'CSS',
        'JavaScript',
        'React',
        'Next.js',
        'TypeScript',
        'Responsive Design',
        'Performance Optimization',
        'UI/UX',
        'API Integration'
      ]
    }

    if (
      role.includes('backend') ||
      role.includes('software') ||
      role.includes('sde') ||
      role.includes('developer')
    ) {
      return [
        'DSA',
        'Java',
        'Python',
        'Node.js',
        'REST APIs',
        'Databases',
        'System Design',
        'Authentication',
        'Testing',
        'Deployment'
      ]
    }

    if (
      role.includes('cloud') ||
      role.includes('devops') ||
      role.includes('sre')
    ) {
      return [
        'AWS',
        'Azure',
        'Docker',
        'Kubernetes',
        'CI/CD',
        'Linux',
        'Monitoring',
        'Networking',
        'Terraform',
        'Automation'
      ]
    }

    if (
      role.includes('data analyst') ||
      role.includes('analyst') ||
      role.includes('business intelligence')
    ) {
      return [
        'SQL',
        'Excel',
        'Power BI',
        'Python',
        'Data Visualization',
        'Statistics',
        'Dashboarding',
        'Business Metrics',
        'Analytics'
      ]
    }

    return [
      'Problem Solving',
      'Communication',
      'Projects',
      'Programming',
      'SQL',
      'GitHub',
      'Teamwork',
      'Documentation'
    ]
  }

  const keywordInsights = useMemo(() => {
    if (!result) {
      return {
        importantKeywords: getRoleKeywords(),
        matchedKeywords: [],
        missingKeywords: []
      }
    }

    const resumeText = normalize(getResumeText())
    const detectedSkills = getDetectedSkillNames().map(normalize)
    const importantKeywords = getRoleKeywords()

    const matchedKeywords = importantKeywords.filter((keyword) => {
      const normalizedKeyword = normalize(keyword)

      return (
        resumeText.includes(normalizedKeyword) ||
        detectedSkills.includes(normalizedKeyword)
      )
    })

    const missingKeywords = importantKeywords.filter((keyword) => {
      const normalizedKeyword = normalize(keyword)

      return (
        !resumeText.includes(normalizedKeyword) &&
        !detectedSkills.includes(normalizedKeyword)
      )
    })

    return {
      importantKeywords,
      matchedKeywords,
      missingKeywords
    }
  }, [result, analysisMeta.role])

  const jdInsights = useMemo(() => {
    const jd = String(analysisMeta.jobDescription || result?.jobDescription || '')

    const jdWords = jd
      .replace(/[^\w\s+#./-]/g, ' ')
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 2)

    const uniqueWords = Array.from(new Set(jdWords))
    const resumeText = normalize(getResumeText())

    const stopWords = [
      'and',
      'the',
      'for',
      'with',
      'you',
      'are',
      'our',
      'will',
      'this',
      'that',
      'from',
      'have',
      'has',
      'job',
      'role',
      'work',
      'team',
      'your',
      'candidate',
      'experience',
      'skills'
    ]

    const importantTerms = uniqueWords
      .filter((word) => !stopWords.includes(normalize(word)))
      .slice(0, 24)

    const matchedRequirements = importantTerms.filter((term) => {
      return resumeText.includes(normalize(term))
    })

    const missingRequirements = importantTerms.filter((term) => {
      return !resumeText.includes(normalize(term))
    })

    const jdMatchScore = importantTerms.length
      ? clampScore((matchedRequirements.length / importantTerms.length) * 100)
      : clampScore(result?.jdMatchScore || result?.jobDescriptionMatch || 0)

    const recommendedChanges = missingRequirements
      .slice(0, 8)
      .map((term) => `Add stronger evidence for "${term}" in skills, projects, or experience.`)

    return {
      jdMatchScore,
      matchedRequirements,
      missingRequirements,
      recommendedChanges
    }
  }, [analysisMeta.jobDescription, result])

  const resumeHealth = useMemo(() => {
    if (!result) {
      return {
        overall: 0,
        atsScore: 0,
        keywordMatch: 0,
        formattingScore: 0,
        projectStrength: 0,
        skillMatch: 0,
        readabilityScore: 0
      }
    }

    const atsScore = clampScore(result.atsScore)
    const projectStrength = clampScore(result.projectStrength)

    const skillMatch = keywordInsights.importantKeywords.length
      ? clampScore(
          (keywordInsights.matchedKeywords.length /
            keywordInsights.importantKeywords.length) *
            100
        )
      : clampScore(result.companyMatch)

    const keywordMatch = keywordInsights.importantKeywords.length
      ? clampScore(
          (keywordInsights.matchedKeywords.length /
            keywordInsights.importantKeywords.length) *
            100
        )
      : clampScore(result.keywordMatch || result.companyMatch)

    const resumeText = getResumeText()

    const formattingScore = clampScore(
      result.formattingScore ||
        (
          65 +
          (resumeText.includes('@') ? 8 : 0) +
          (normalize(resumeText).includes('project') ? 8 : 0) +
          (normalize(resumeText).includes('skills') ? 7 : 0) +
          (normalize(resumeText).includes('education') ? 6 : 0)
        )
    )

    const readabilityScore = clampScore(
      result.readabilityScore ||
        (
          resumeText.length > 600
            ? 84
            : resumeText.length > 300
              ? 72
              : 58
        )
    )

    const overall = clampScore(
      atsScore * 0.25 +
        keywordMatch * 0.20 +
        formattingScore * 0.15 +
        projectStrength * 0.15 +
        skillMatch * 0.15 +
        readabilityScore * 0.10
    )

    return {
      overall,
      atsScore,
      keywordMatch,
      formattingScore,
      projectStrength,
      skillMatch,
      readabilityScore
    }
  }, [result, keywordInsights])

  const improvementChecklist = useMemo(() => {
    if (!result) {
      return [
        {
          label: 'Upload resume',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'Contact information found',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'Skills section found',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'Projects section found',
          status: 'Pending',
          type: 'neutral'
        }
      ]
    }

    const resumeText = getResumeText()
    const lowerText = normalize(resumeText)

    const hasContact =
      resumeText.includes('@') || /(\+?\d[\d\s-]{8,})/.test(resumeText)

    const hasSkills =
      lowerText.includes('skills') ||
      hasValue(result.detectedSkills) ||
      hasValue(result.skills)

    const hasProjects =
      lowerText.includes('project') ||
      hasValue(result.projects) ||
      Number(result.projectStrength || 0) > 0

    const hasImpact =
      /\d+%|\d+\+|reduced|increased|improved|optimized|automated|built|deployed/.test(
        lowerText
      )

    const hasPortfolio =
      lowerText.includes('github') ||
      lowerText.includes('linkedin') ||
      lowerText.includes('portfolio')

    const hasCertifications =
      lowerText.includes('certification') ||
      lowerText.includes('certified') ||
      lowerText.includes('certificate')

    return [
      {
        label: 'Contact information found',
        status: hasContact ? 'Success' : 'Missing',
        type: hasContact ? 'success' : 'danger'
      },
      {
        label: 'Skills section found',
        status: hasSkills ? 'Success' : 'Missing',
        type: hasSkills ? 'success' : 'danger'
      },
      {
        label: 'Projects section found',
        status: hasProjects ? 'Success' : 'Missing',
        type: hasProjects ? 'success' : 'danger'
      },
      {
        label: 'Add measurable project impact',
        status: hasImpact ? 'Good' : 'Improve',
        type: hasImpact ? 'success' : 'warning'
      },
      {
        label: 'Add GitHub / Portfolio link',
        status: hasPortfolio ? 'Good' : 'Recommended',
        type: hasPortfolio ? 'success' : 'warning'
      },
      {
        label: 'Missing role-specific keywords',
        status:
          keywordInsights.missingKeywords.length > 0
            ? `${keywordInsights.missingKeywords.length} missing`
            : 'Good',
        type:
          keywordInsights.missingKeywords.length > 0
            ? 'warning'
            : 'success'
      },
      {
        label: 'Certifications found',
        status: hasCertifications ? 'Success' : 'Not Found',
        type: hasCertifications ? 'success' : 'warning'
      }
    ]
  }, [result, keywordInsights])

  const roadmap = useMemo(() => {
    const role = normalize(analysisMeta.role)

    if (
      role.includes('ai') ||
      role.includes('ml') ||
      role.includes('machine learning')
    ) {
      return [
        'Python Advanced',
        'Machine Learning',
        'Deep Learning',
        'NLP / LLMs',
        'MLOps',
        'System Design',
        'Interview Preparation'
      ]
    }

    if (
      role.includes('frontend') ||
      role.includes('react') ||
      role.includes('ui')
    ) {
      return [
        'HTML / CSS Mastery',
        'JavaScript Advanced',
        'React + Next.js',
        'TypeScript',
        'API Integration',
        'Performance Optimization',
        'Frontend Interview Preparation'
      ]
    }

    if (
      role.includes('backend') ||
      role.includes('software') ||
      role.includes('sde') ||
      role.includes('developer')
    ) {
      return [
        'DSA',
        'Backend Language Mastery',
        'REST APIs',
        'Databases',
        'Authentication',
        'System Design',
        'Deployment + Testing'
      ]
    }

    if (
      role.includes('cloud') ||
      role.includes('devops') ||
      role.includes('sre')
    ) {
      return [
        'Linux Fundamentals',
        'Cloud Basics',
        'Docker',
        'Kubernetes',
        'CI/CD',
        'Monitoring',
        'Infrastructure Projects'
      ]
    }

    if (role.includes('data')) {
      return [
        'SQL',
        'Python for Data',
        'Statistics',
        'Data Visualization',
        'Machine Learning Basics',
        'Dashboard Projects',
        'Case Study Practice'
      ]
    }

    return [
      'Programming Fundamentals',
      'DSA',
      'Projects',
      'SQL',
      'GitHub Portfolio',
      'Resume Optimization',
      'Interview Preparation'
    ]
  }, [analysisMeta.role])

  const topSkills = [...safeList(result?.skills)]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 12)

  const getProfileCompletion = () => {
    if (!result) {
      return {
        score: 0,
        completed: [],
        missing: [
          'Upload resume',
          'Contact information',
          'Skills',
          'Projects',
          'Education'
        ]
      }
    }

    const resumeText = normalize(getResumeText())

    const checks = [
      {
        label: 'Resume uploaded',
        passed: Boolean(result)
      },
      {
        label: 'Skills detected',
        passed:
          hasValue(result.detectedSkills) ||
          hasValue(result.skills) ||
          hasValue(result.matchedSkills)
      },
      {
        label: 'Projects detected',
        passed:
          hasValue(result.projects) ||
          Number(result.projectStrength || 0) > 0 ||
          resumeText.includes('project')
      },
      {
        label: 'Education detected',
        passed:
          hasValue(result.education) ||
          resumeText.includes('education') ||
          resumeText.includes('b.tech') ||
          resumeText.includes('degree')
      },
      {
        label: 'Contact details detected',
        passed:
          getResumeText().includes('@') ||
          /(\+?\d[\d\s-]{8,})/.test(getResumeText())
      },
      {
        label: 'Role selected',
        passed: hasValue(analysisMeta.role)
      },
      {
        label: 'Company selected',
        passed: hasValue(analysisMeta.company)
      }
    ]

    const completed = checks
      .filter((item) => item.passed)
      .map((item) => item.label)

    const missing = checks
      .filter((item) => !item.passed)
      .map((item) => item.label)

    const score = Math.round((completed.length / checks.length) * 100)

    return {
      score,
      completed,
      missing
    }
  }

  const getQualityChecks = () => {
    if (!result) {
      return [
        {
          label: 'ATS-friendly PDF upload',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'Skills section detected',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'Projects detected',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'Role keywords matched',
          status: 'Pending',
          type: 'neutral'
        },
        {
          label: 'AI suggestions generated',
          status: 'Pending',
          type: 'neutral'
        }
      ]
    }

    return [
      {
        label: 'ATS score above 70%',
        status: Number(result.atsScore || 0) >= 70 ? 'Passed' : 'Needs Work',
        type: Number(result.atsScore || 0) >= 70 ? 'success' : 'warning'
      },
      {
        label: 'Company match above 70%',
        status: Number(result.companyMatch || 0) >= 70 ? 'Passed' : 'Needs Work',
        type: Number(result.companyMatch || 0) >= 70 ? 'success' : 'warning'
      },
      {
        label: 'Projects are relevant',
        status: Number(result.projectStrength || 0) >= 65 ? 'Passed' : 'Improve',
        type: Number(result.projectStrength || 0) >= 65 ? 'success' : 'warning'
      },
      {
        label: 'Missing skills detected',
        status: safeList(result.missingSkills).length > 0 ? 'Review' : 'Good',
        type: safeList(result.missingSkills).length > 0 ? 'warning' : 'success'
      },
      {
        label: 'AI suggestions available',
        status:
          safeList(result.suggestions || result.aiSuggestions).length > 0
            ? 'Ready'
            : 'Pending',
        type:
          safeList(result.suggestions || result.aiSuggestions).length > 0
            ? 'success'
            : 'neutral'
      }
    ]
  }

  const getReportScore = (item) => {
    const reportResult = item?.result || {}

    const ats = Number(reportResult.atsScore || 0)
    const company = Number(reportResult.companyMatch || 0)
    const project = Number(reportResult.projectStrength || 0)

    return Math.round((ats + company + project) / 3)
  }

  const formatReportDate = (dateValue) => {
    if (!dateValue) return 'Unknown date'

    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    })
  }

  const openReportOnDashboard = (item) => {
    if (!item) return

    localStorage.setItem(
      'resumemind_latest_analysis',
      JSON.stringify(item)
    )

    localStorage.setItem(
      'resumemind_latest_meta',
      JSON.stringify({
        ...(item.meta || {}),
        savedAt: item.savedAt || new Date().toISOString()
      })
    )

    if (item.result) {
      setResult(item.result)
    }

    if (item.meta) {
      setAnalysisMeta((previous) => ({
        ...previous,
        ...item.meta
      }))
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const generateProfileSummary = () => {
    if (!result) return

    const skills = getDetectedSkillNames().slice(0, 6)
    const skillText = skills.length ? skills.join(', ') : 'technical skills'
    const company = analysisMeta.company || 'target company'
    const role = analysisMeta.role || 'target role'

    const summary = `Aspiring ${role} with hands-on experience in ${skillText}. Strong foundation in building practical projects, improving ATS readiness, and aligning resume content with ${company} role expectations. Focused on strengthening role-specific keywords, measurable project impact, and interview-ready skills to improve hiring chances.`

    setGeneratedSummary(summary)
    setSummaryGenerated(true)

    localStorage.setItem(
      'resumemind_generated_profile_summary',
      JSON.stringify({
        summary,
        company,
        role,
        savedAt: new Date().toISOString()
      })
    )
  }

  const downloadAnalysisReport = () => {
    if (!result) return

    const reportLines = [
      'ResumeMind AI - Resume Analysis Report',
      '======================================',
      '',
      `Company: ${analysisMeta.company}`,
      `Role: ${analysisMeta.role}`,
      `Generated At: ${new Date().toLocaleString('en-IN')}`,
      '',
      'Resume Health Score',
      '-------------------',
      `Overall Resume Health Score: ${resumeHealth.overall}%`,
      `ATS Score: ${resumeHealth.atsScore}%`,
      `Keyword Match: ${resumeHealth.keywordMatch}%`,
      `Formatting Score: ${resumeHealth.formattingScore}%`,
      `Project Strength: ${resumeHealth.projectStrength}%`,
      `Skill Match: ${resumeHealth.skillMatch}%`,
      `Readability Score: ${resumeHealth.readabilityScore}%`,
      '',
      'Core Scores',
      '-----------',
      `Company Match: ${result.companyMatch ?? 0}%`,
      `Combined Score: ${result.combinedScore ?? 0}%`,
      `Hiring Probability: ${result.hiringProbability || 'Low'}`,
      `Overall Level: ${result.overallLevel || 'Beginner'}`,
      '',
      'Job Description Match',
      '---------------------',
      `JD Match Score: ${jdInsights.jdMatchScore}%`,
      `Matched Requirements: ${jdInsights.matchedRequirements.length}`,
      `Missing Requirements: ${jdInsights.missingRequirements.length}`,
      `Recommended Changes: ${jdInsights.recommendedChanges.length}`,
      '',
      'Matched Keywords',
      '----------------',
      keywordInsights.matchedKeywords.join(', ') || 'No matched keywords found.',
      '',
      'Missing Keywords',
      '----------------',
      keywordInsights.missingKeywords.join(', ') || 'No missing keywords found.',
      '',
      'Missing Skills',
      '--------------',
      safeList(result.missingSkills).join(', ') || 'No missing skills found.',
      '',
      'Suggestions',
      '-----------',
      safeList(result.suggestions || result.aiSuggestions)
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n') || 'No suggestions available.',
      '',
      'Recommended Roadmap',
      '-------------------',
      roadmap.map((item, index) => `${index + 1}. ${item}`).join('\n')
    ]

    const blob = new Blob([reportLines.join('\n')], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `ResumeMind-Analysis-Report-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const renderSkillPills = (
    items,
    className,
    emptyText,
    limit = 18
  ) => {
    const list = safeList(items)
    const visible = list.slice(0, limit)
    const remaining = Math.max(list.length - limit, 0)

    if (visible.length === 0) {
      return (
        <p className="muted-text">
          {emptyText}
        </p>
      )
    }

    return (
      <div className="skill-pill-wrapper">
        {
          visible.map((skill, index) => (
            <span
              className={`skill-pill ${className}`}
              key={index}
            >
              {typeof skill === 'string' ? skill : skill.name}
            </span>
          ))
        }

        {
          remaining > 0 ? (
            <span className="skill-pill more">
              +{remaining} more
            </span>
          ) : null
        }
      </div>
    )
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
        {
          list.map((item, index) => (
            <li key={index}>
              {item}
            </li>
          ))
        }
      </ul>
    )
  }

  const renderImprovementPriority = (items) => {
    const list = safeList(items)

    if (list.length === 0) {
      return (
        <p className="muted-text">
          No improvement priority available.
        </p>
      )
    }

    return (
      <div className="priority-list">
        {
          list.map((item, index) => (
            <div
              className="priority-item"
              key={index}
            >
              <div className="priority-top">
                <h3>
                  {item.area || 'Improvement Area'}
                </h3>

                <span className="priority-badge">
                  {item.priority || 'Medium'}
                </span>
              </div>

              <p>
                {item.action || 'Improve this section based on the job description.'}
              </p>
            </div>
          ))
        }
      </div>
    )
  }

  const readinessScore = getReadinessScore()
  const profileCompletion = getProfileCompletion()
  const qualityChecks = getQualityChecks()

  return (
    <AuthGuard>
      <div className="page">
        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">
          <Navbar />
          <section className="pro-dashboard-hero">

  <div className="hero-content">

    <span className="hero-tag">
      <div className="hero-badge">
  AI RESUME PLATFORM
</div>
    </span>

    <h1 className="hero-title">
  Build a resume
  <br />

  that beats

  <span> ATS </span>

  <br />

  and matches your

  <br />

  <span>dream role</span>
</h1>

    <p className="hero-description">

Analyze ATS score, company match,
hiring probability, missing skills,
resume quality and generate an
ATS-friendly resume using AI.

</p>



    <div className="hero-actions">

      <button
        className="primary-btn"
        onClick={() => {

          document
            .getElementById("analyzer")
            ?.scrollIntoView({
              behavior: "smooth",
            });

        }}
      >
        Analyze Resume
      </button>

      <Link
        href="/templates"
        className="secondary-btn"
      >
        Browse Templates
      </Link>

    </div>

  </div>

  <div className="hero-score-card">

    <div className="score-ring">

      <span>

        {result
          ? `${resumeHealth.overall}%`
          : "92%"}

      </span>

    </div>

    <h2>

      Resume Health Score

    </h2>

    <p>

      {
        result
          ? "Calculated from ATS, keywords, projects and readability."
          : "Upload your resume to calculate your ATS score."
      }

    </p>

    <div className="score-stats">

      <div className="score-stat">

        <span>
          ATS Formatting
        </span>

        <strong>

          {
            result
              ? `${resumeHealth.formattingScore}%`
              : "90%"
          }

        </strong>

      </div>

      <div className="score-stat">

        <span>
          Keyword Match
        </span>

        <strong>

          {
            result
              ? `${resumeHealth.keywordMatch}%`
              : "88%"
          }

        </strong>

      </div>

      <div className="score-stat">

        <span>
          Content Quality
        </span>

        <strong>

          {
            result
              ? `${resumeHealth.readabilityScore}%`
              : "91%"
          }

        </strong>

      </div>

      <div className="score-stat">

        <span>
          Project Strength
        </span>

        <strong>

          {
            result
              ? `${resumeHealth.projectStrength}%`
              : "89%"
          }

        </strong>

      </div>

    </div>

  </div>

</section>

          <section className="dashboard-feature-grid">
            <div className="mini-feature-card">
              <span>🎯</span>
              <h3>ATS Scoring</h3>
              <p>Check keyword match, formatting, and recruiter readability.</p>
            </div>

            <div className="mini-feature-card">
              <span>🏢</span>
              <h3>Company Match</h3>
              <p>Compare your resume with company and role expectations.</p>
            </div>

            <div className="mini-feature-card">
              <span>🧠</span>
              <h3>Skill Gap AI</h3>
              <p>Find matched, missing, detected, and extra skills instantly.</p>
            </div>

            <div className="mini-feature-card">
              <span>📄</span>
              <h3>Resume Builder</h3>
              <p>Create a one-page ATS-friendly resume after analysis.</p>
            </div>
          </section>

          <section className="quick-action-section">
            <div className="section-heading left">
              <h2>
                Quick Actions
              </h2>

              <p>
                Start resume analysis, explore templates, compare company fit, or revisit previous reports.
              </p>
            </div>

            <div className="quick-action-grid">
              <a href="#analyzer" className="quick-action-card">
                <span>⬆️</span>
                <h3>Upload Resume</h3>
                <p>Analyze PDF resume with AI scoring.</p>
              </a>

              <Link href="/company-match" className="quick-action-card">
                <span>🏢</span>
                <h3>Company Match</h3>
                <p>Check role fit for top companies.</p>
              </Link>

              <Link href="/templates" className="quick-action-card">
                <span>🧾</span>
                <h3>Templates</h3>
                <p>Browse ATS-friendly resume templates.</p>
              </Link>

              <Link href="/history" className="quick-action-card">
                <span>📁</span>
                <h3>Analysis History</h3>
                <p>View previous reports and track progress.</p>
              </Link>

              <button
                type="button"
                className="quick-action-card button-reset"
                onClick={() => {
                  if (!result) {
                    document.getElementById('analyzer')?.scrollIntoView({
                      behavior: 'smooth'
                    })

                    return
                  }

                  setShowBuilder(true)
                }}
              >
                <span>✨</span>

                <h3>
                  Improve Resume
                </h3>

                <p>
                  Generate optimized resume after analysis.
                </p>
              </button>
            </div>
          </section>

          <section className="professional-insights-section">
            <div className="section-heading left">
              <h2>
                Professional Insights
              </h2>

              <p>
                Track profile readiness, resume quality, and recent analysis activity in one place.
              </p>
            </div>

            <div className="professional-insights-grid">
              <div className="card insight-panel profile-completion-card">
                <div className="insight-panel-top">
                  <div>
                    <span className="template-tag">
                      Profile Readiness
                    </span>

                    <h2>
                      Profile Completion
                    </h2>
                  </div>

                  <div className="mini-score-ring">
                    <span>
                      {profileCompletion.score}%
                    </span>
                  </div>
                </div>

                <div className="completion-progress">
                  <div
                    className="completion-fill"
                    style={{ width: `${profileCompletion.score}%` }}
                  ></div>
                </div>

                <div className="completion-columns">
                  <div>
                    <h3>
                      Completed
                    </h3>

                    {
                      profileCompletion.completed.length > 0 ? (
                        <ul>
                          {
                            profileCompletion.completed.slice(0, 4).map((item, index) => (
                              <li key={index}>
                                <span>✓</span>
                                {item}
                              </li>
                            ))
                          }
                        </ul>
                      ) : (
                        <p className="muted-text">
                          No completed items yet.
                        </p>
                      )
                    }
                  </div>

                  <div>
                    <h3>
                      Missing
                    </h3>

                    {
                      profileCompletion.missing.length > 0 ? (
                        <ul>
                          {
                            profileCompletion.missing.slice(0, 4).map((item, index) => (
                              <li key={index}>
                                <span>•</span>
                                {item}
                              </li>
                            ))
                          }
                        </ul>
                      ) : (
                        <p className="muted-text">
                          Everything looks good.
                        </p>
                      )
                    }
                  </div>
                </div>
              </div>

              <div className="card insight-panel quality-check-card">
                <div className="insight-panel-top">
                  <div>
                    <span className="template-tag">
                      Resume Quality
                    </span>

                    <h2>
                      Quality Checklist
                    </h2>
                  </div>

                  <span className="panel-icon">
                    ✅
                  </span>
                </div>

                <div className="quality-check-list">
                  {
                    qualityChecks.map((item, index) => (
                      <div
                        className="quality-check-item"
                        key={index}
                      >
                        <div>
                          <span className={`status-dot ${item.type}`}></span>

                          <p>
                            {item.label}
                          </p>
                        </div>

                        <strong className={`status-badge ${item.type}`}>
                          {item.status}
                        </strong>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="card insight-panel recent-reports-card">
                <div className="insight-panel-top">
                  <div>
                    <span className="template-tag">
                      Saved Reports
                    </span>

                    <h2>
                      Recent Reports
                    </h2>
                  </div>

                  <span className="panel-icon">
                    📁
                  </span>
                </div>

                {
                  recentReports.length > 0 ? (
                    <div className="recent-report-list">
                      {
                        recentReports.map((item) => (
                          <button
                            type="button"
                            className="recent-report-item recent-report-button"
                            key={item.id}
                            onClick={() => openReportOnDashboard(item)}
                          >
                            <div>
                              <h3>
                                {item?.meta?.company || 'Company'}
                              </h3>

                              <p>
                                {item?.meta?.role || 'Target Role'} • {formatReportDate(item?.savedAt)}
                              </p>
                            </div>

                            <strong>
                              {getReportScore(item)}%
                            </strong>
                          </button>
                        ))
                      }

                      <Link
                        href="/history"
                        className="button secondary-btn reports-link"
                      >
                        View All History
                      </Link>
                    </div>
                  ) : (
                    <div className="empty-mini-state">
                      <span>
                        📌
                      </span>

                      <h3>
                        No reports yet
                      </h3>

                      <p>
                        Analyze your first resume to save reports and track progress.
                      </p>

                      <a href="#analyzer" className="button secondary-btn">
                        Start Analysis
                      </a>
                    </div>
                  )
                }
              </div>
            </div>
          </section>

          <section
            id="analyzer"
            className="upload-section analyzer-clean-section"
          >
            <UploadBox
              setResult={handleSetResult}
              analysisMeta={analysisMeta}
              setAnalysisMeta={handleSetAnalysisMeta}
            />
          </section>

          {
            result ? (
              <>
                <section className="dashboard-overview-section">
                  <div className="section-heading left">
                    <h2>
                      Resume Performance Overview
                    </h2>

                    <p>
                      Scores are calculated using ATS readiness, role relevance,
                      project strength, JD match, and AI resume quality checks.
                    </p>
                  </div>

                  <div className="grid dashboard-metrics">
                    <ATSCard
                      title="ATS Score"
                      value={`${result.atsScore ?? 0}%`}
                      subtitle="ATS keyword and formatting compatibility"
                    />

                    <ATSCard
                      title="Company Match"
                      value={`${result.companyMatch ?? 0}%`}
                      subtitle="Fit for selected company and role"
                    />

                    <ATSCard
                      title="Resume Health"
                      value={`${resumeHealth.overall}%`}
                      subtitle="Overall resume quality and readiness"
                    />

                    <ATSCard
                      title="JD Match Score"
                      value={`${jdInsights.jdMatchScore}%`}
                      subtitle="Match with pasted job description"
                    />

                    <ATSCard
                      title="Project Strength"
                      value={`${result.projectStrength ?? 0}%`}
                      subtitle="Project relevance and implementation depth"
                    />

                    <ATSCard
                      title="Hiring Probability"
                      value={result.hiringProbability || 'Low'}
                      subtitle="Estimated selection possibility"
                    />
                  </div>
                </section>
                <section className="dashboard-section">
  <div className="section-heading left">
    <span className="eyebrow">
      Workspace Shortcuts
    </span>

    <h2>
      Continue your resume workflow
    </h2>

    <p>
      Access saved resumes, reports, editor tools, and skill intelligence from one place.
    </p>
  </div>

  <div className="quick-actions-grid">
    <Link href="/resumes" className="quick-action-card">
      <span className="quick-action-icon">
        📄
      </span>

      <strong>
        Saved Resumes
      </strong>

      <p>
        View, manage, and continue improved resumes generated from your analysis.
      </p>
    </Link>

    <Link href="/reports" className="quick-action-card">
      <span className="quick-action-icon">
        📑
      </span>

      <strong>
        Reports
      </strong>

      <p>
        Open saved ATS reports, company match results, and resume insights.
      </p>
    </Link>

    <Link href="/editor" className="quick-action-card">
      <span className="quick-action-icon">
        ✍️
      </span>

      <strong>
        Resume Editor
      </strong>

      <p>
        Improve resume sections, rewrite content, and prepare export-ready resumes.
      </p>
    </Link>

    <Link href="/skills" className="quick-action-card">
      <span className="quick-action-icon">
        🧠
      </span>

      <strong>
        Skill Intelligence
      </strong>

      <p>
        Track missing skills, keywords, role readiness, and improvement priorities.
      </p>
    </Link>
    <Link href="/history" className="quick-action-card">

  <span className="quick-action-icon">
    📂
  </span>

  <strong>
    Analysis History
  </strong>

  <p>
    Revisit previous ATS analyses, reports, and resume optimization sessions.
  </p>

</Link>
  </div>
</section>

                <section className="resume-health-section">
                  <div className="section-heading left">
                    <h2>
                      Resume Health Score Dashboard
                    </h2>

                    <p>
                      A deeper score breakdown beyond ATS, including keywords, formatting, skills, projects, and readability.
                    </p>
                  </div>

                  <div className="health-grid">
                    <div className="card health-main-card">
                      <span className="template-tag">
                        Overall Health
                      </span>

                      <div className={`health-score ${getScoreTone(resumeHealth.overall)}`}>
                        {resumeHealth.overall}%
                      </div>

                      <h3>
                        {getScoreLabel(resumeHealth.overall)} Resume Health
                      </h3>

                      <p>
                        Your resume is evaluated for ATS readiness, keyword alignment,
                        formatting, skill match, project strength, and readability.
                      </p>

                      <div className="health-actions">
                        <button
                          type="button"
                          className="button"
                          onClick={downloadAnalysisReport}
                        >
                          Download Analysis Report
                        </button>

                        <button
                          type="button"
                          className="button secondary-btn"
                          onClick={() => setShowBuilder(true)}
                        >
                          Create Improved Resume
                        </button>
                      </div>
                    </div>

                    <div className="health-breakdown-grid">
                      {
                        [
                          ['ATS Score', resumeHealth.atsScore],
                          ['Keyword Match', resumeHealth.keywordMatch],
                          ['Formatting Score', resumeHealth.formattingScore],
                          ['Project Strength', resumeHealth.projectStrength],
                          ['Skill Match', resumeHealth.skillMatch],
                          ['Readability Score', resumeHealth.readabilityScore]
                        ].map(([label, score]) => (
                          <div className="card health-mini-card" key={label}>
                            <div className="health-mini-top">
                              <h3>{label}</h3>
                              <strong className={getScoreTone(score)}>
                                {score}%
                              </strong>
                            </div>

                            <div className="progress-track">
                              <div
                                className={`progress-fill ${getScoreTone(score)}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </section>

                <section className="career-progress-grid">
                  <div className="card progress-card">
                    <h2>Career Readiness</h2>

                    <div className="large-score">
                      {readinessScore}%
                    </div>

                    <p className="muted-text">
                      {getScoreLabel(readinessScore)} overall resume readiness.
                    </p>

                    <div className="progress-bars">
                      <div>
                        <span>ATS</span>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${result.atsScore || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <span>Company Match</span>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${result.companyMatch || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <span>Projects</span>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${result.projectStrength || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card activity-card">
                    <h2>Recent Activity</h2>

                    <div className="activity-list">
                      <div className="activity-item">
                        <span>✅</span>
                        <p>Resume analysis completed for {analysisMeta.role}.</p>
                      </div>

                      <div className="activity-item">
                        <span>🎯</span>
                        <p>ATS score calculated successfully.</p>
                      </div>

                      <div className="activity-item">
                        <span>🧠</span>
                        <p>Skill gap report generated.</p>
                      </div>

                      <div className="activity-item">
                        <span>📁</span>
                        <p>Analysis saved to history.</p>
                      </div>

                      <div className="activity-item">
                        <span>📄</span>
                        <p>Resume builder is ready to create improved version.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="advanced-ai-section">
                  <div className="section-heading left">
                    <h2>
                      AI Resume Intelligence
                    </h2>

                    <p>
                      Generate summary, detect missing keywords, review checklist, calculate JD match, and follow a role-based roadmap.
                    </p>
                  </div>

                  <div className="advanced-ai-grid">
                    <div className="card result-card ai-summary-generator-card">
                      <div className="card-title-row">
                        <div>
                          <span className="template-tag">
                            AI Summary
                          </span>

                          <h2>
                            AI Resume Summary Generator
                          </h2>
                        </div>

                        <button
                          type="button"
                          className="button compact-btn"
                          onClick={generateProfileSummary}
                        >
                          Generate Profile Summary
                        </button>
                      </div>

                      <p className="muted-text">
                        {
                          summaryGenerated
                            ? generatedSummary
                            : result.summary || result.aiSummary || 'Click the button to generate a professional profile summary.'
                        }
                      </p>
                    </div>

                    <div className="card result-card">
                      <span className="template-tag">
                        Keywords
                      </span>

                      <h2>
                        Missing Keywords Detector
                      </h2>

                      <h3 className="mini-section-title">
                        Matched Keywords
                      </h3>

                      {renderSkillPills(
                        keywordInsights.matchedKeywords,
                        'success',
                        'No matched keywords found.',
                        12
                      )}

                      <h3 className="mini-section-title">
                        Missing Keywords
                      </h3>

                      {renderSkillPills(
                        keywordInsights.missingKeywords,
                        'warning',
                        'No missing keywords found.',
                        12
                      )}

                      <h3 className="mini-section-title">
                        Important Role Keywords
                      </h3>

                      {renderSkillPills(
                        keywordInsights.importantKeywords,
                        'neutral',
                        'No role keywords available.',
                        14
                      )}
                    </div>

                    <div className="card result-card">
                      <span className="template-tag">
                        Checklist
                      </span>

                      <h2>
                        Resume Improvement Checklist
                      </h2>

                      <div className="resume-checklist">
                        {
                          improvementChecklist.map((item, index) => (
                            <div
                              className={`resume-check-item ${item.type}`}
                              key={index}
                            >
                              <span>
                                {
                                  item.type === 'success'
                                    ? '✓'
                                    : item.type === 'danger'
                                      ? '!'
                                      : '•'
                                }
                              </span>

                              <p>
                                {item.label}
                              </p>

                              <strong>
                                {item.status}
                              </strong>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    <div className="card result-card">
                      <span className="template-tag">
                        JD Match
                      </span>

                      <h2>
                        Job Description Match Score
                      </h2>

                      <div className="jd-score-box">
                        <strong>
                          {jdInsights.jdMatchScore}%
                        </strong>

                        <p>
                          JD Match Score
                        </p>
                      </div>

                      <div className="jd-stat-grid">
                        <div>
                          <span>{jdInsights.matchedRequirements.length}</span>
                          <p>Matched Requirements</p>
                        </div>

                        <div>
                          <span>{jdInsights.missingRequirements.length}</span>
                          <p>Missing Requirements</p>
                        </div>

                        <div>
                          <span>{jdInsights.recommendedChanges.length}</span>
                          <p>Recommended Changes</p>
                        </div>
                      </div>

                      <h3 className="mini-section-title">
                        Recommended Changes
                      </h3>

                      {renderList(
                        jdInsights.recommendedChanges,
                        'Paste a job description in the analyzer to get recommended changes.'
                      )}
                    </div>

                  </div>
                </section>

                <section className="roadmap-section">
                  <div className="section-heading left">
                    <span className="eyebrow">
                      Roadmap
                    </span>

                    <h2>
                      Role-Based Learning Roadmap
                    </h2>

                    <p>
                      Follow these role-based learning steps to strengthen your technical skills, resume, and interview readiness.
                    </p>
                  </div>

                  <div className="roadmap-grid">
                    {
                      roadmap.map((item, index) => (
                        <div className="roadmap-item" key={index}>
                          <span className="roadmap-number">
                            {index + 1}
                          </span>

                          <div className="roadmap-copy">
                            <p>
                              {item}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </section>

                <div className="results-wrapper">
                  <div className="card summary-card">
                    <h2>
                      AI Summary
                    </h2>

                    <p>
                      {result.summary || result.aiSummary || generatedSummary || 'No summary available.'}
                    </p>
                  </div>

                  <div className="card result-card">
                    <h2>
                      AI Score Explanation
                    </h2>

                    <p className="muted-text">
                      {
                        result.scoreExplanation ||
                        'No score explanation available.'
                      }
                    </p>
                  </div>

                  <div className="grid reason-grid">
                    <div className="card result-card">
                      <h2>
                        ATS Reason
                      </h2>

                      <p className="muted-text">
                        {
                          result.atsReason ||
                          'No ATS reason available.'
                        }
                      </p>
                    </div>

                    <div className="card result-card">
                      <h2>
                        Company Match Reason
                      </h2>

                      <p className="muted-text">
                        {
                          result.companyMatchReason ||
                          'No company match reason available.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="chart-section">
                    <SkillChart
                      title="Top Detected Skill Scores"
                      skills={topSkills}
                      xKey="name"
                    />
                  </div>

                  <div className="chart-section">
                    <SkillChart
                      title="Skill Category Strength"
                      skills={safeList(result.skillCategories)}
                      xKey="category"
                    />
                  </div>

                  <div className="grid">
                    <div className="card result-card">
                      <h2>
                        Matched Skills
                      </h2>

                      {renderSkillPills(
                        result.matchedSkills,
                        'success',
                        'No matched skills available.'
                      )}
                    </div>

                    <div className="card result-card">
                      <h2>
                        Missing Skills
                      </h2>

                      {renderSkillPills(
                        result.missingSkills,
                        'warning',
                        'No missing skills available.'
                      )}
                    </div>

                    <div className="card result-card">
                      <h2>
                        Detected Skills
                      </h2>

                      {renderSkillPills(
                        result.detectedSkills,
                        'neutral',
                        'No detected skills available.'
                      )}
                    </div>

                    <div className="card result-card">
                      <h2>
                        Extra Skills
                      </h2>

                      {renderSkillPills(
                        result.extraSkills,
                        'neutral',
                        'No extra skills available.'
                      )}
                    </div>
                  </div>

                  <div className="grid insight-grid">
                    <div className="card result-card">
                      <h2>
                        Strengths
                      </h2>

                      {renderList(
                        result.strengths,
                        'No strengths available.'
                      )}
                    </div>

                    <div className="card result-card">
                      <h2>
                        Weaknesses
                      </h2>

                      {renderList(
                        result.weaknesses,
                        'No weaknesses available.'
                      )}
                    </div>

                    <div className="card result-card">
                      <h2>
                        Improvement Priority
                      </h2>

                      {renderImprovementPriority(result.improvementPriority)}
                    </div>
                  </div>

                  <div className="card result-card">
                    <h2>
                      AI Suggestions
                    </h2>

                    {renderList(
                      result.suggestions || result.aiSuggestions,
                      'No AI suggestions available.'
                    )}
                  </div>

                  <div className="card result-card builder-action-card">
                    <div>
                      <span className="template-tag">
                        Resume Builder
                      </span>

                      <h2>
                        Create an Improved Resume
                      </h2>

                      <p className="muted-text">
                        Use your analysis results to create a cleaner ATS-friendly resume version for {analysisMeta.company} - {analysisMeta.role}.
                      </p>
                    </div>

                    <div className="builder-action-buttons">
                      <button
                        type="button"
                        className="button"
                        onClick={() => setShowBuilder(true)}
                      >
                        Create Improved Resume
                      </button>

                      {
                        showBuilder ? (
                          <button
                            type="button"
                            className="button secondary-btn"
                            onClick={() => setShowBuilder(false)}
                          >
                            Hide Resume Builder
                          </button>
                        ) : null
                      }
                    </div>
                  </div>

                  {
                    showBuilder ? (
                      <ResumeBuilderWizard
                        analysis={result}
                        oldResumeText={result?.resumeText || ''}
                        targetRole={analysisMeta.role || ''}
                        targetCompany={analysisMeta.company || ''}
                        jobDescription={analysisMeta.jobDescription || ''}
                      />
                    ) : null
                  }
                </div>
              </>
            ) : (
              <section className="empty-dashboard-section">
                <div className="card empty-state-card compact-empty-state">
                  <span className="empty-state-icon">
                    📌
                  </span>

                  <h2>
                    Your resume insights will appear here
                  </h2>

                  <p>
                    Upload a PDF resume to unlock ATS score, company match,
                    skill analytics, AI suggestions, JD match, health score,
                    roadmap, and resume builder options.
                  </p>

                  <ul className="compact-empty-list">
                    <li>ATS score</li>
                    <li>Resume health score</li>
                    <li>Missing keywords</li>
                    <li>JD match score</li>
                    <li>AI summary</li>
                    <li>Resume builder</li>
                  </ul>
                </div>
              </section>
            )
          }
        </div>
      </div>
    </AuthGuard>
  )
}