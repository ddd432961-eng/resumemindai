'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { FiUploadCloud } from 'react-icons/fi'
import { companyRoles } from '../data/companyRoles'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://resumemind-ai.onrender.com'

export default function UploadBox({
  setResult,
  setAnalysisMeta
}) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('')

  const [company, setCompany] = useState(companyRoles[0]?.company || '')
  const [role, setRole] = useState(companyRoles[0]?.roles?.[0] || '')

  const [openCompanyDropdown, setOpenCompanyDropdown] = useState(false)
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false)

  const [companySearch, setCompanySearch] = useState('')
  const [roleSearch, setRoleSearch] = useState('')

  useEffect(() => {
    const savedTarget = localStorage.getItem('resumemind_target_selection')

    if (savedTarget) {
      try {
        const parsedTarget = JSON.parse(savedTarget)

        const targetCompany = parsedTarget.company
        const targetRole = parsedTarget.role

        const selectedData = companyRoles.find(
          (item) => item.company === targetCompany
        )

        if (selectedData) {
          setCompany(selectedData.company)

          if (selectedData.roles.includes(targetRole)) {
            setRole(targetRole)
          } else {
            setRole(selectedData.roles[0] || '')
          }
        }
      } catch (error) {
        console.error('Failed to load selected target:', error)
      }
    }
  }, [])

  const selectedCompanyData = useMemo(() => {
    return companyRoles.find((item) => item.company === company)
  }, [company])

  const availableRoles = selectedCompanyData?.roles || []

  const filteredCompanies = useMemo(() => {
    const query = companySearch.toLowerCase().trim()

    if (!query) return companyRoles

    return companyRoles.filter((item) => {
      const searchableText = [
        item.company,
        item.type,
        item.category,
        item.location,
        ...(item.roles || [])
      ].join(' ').toLowerCase()

      return searchableText.includes(query)
    })
  }, [companySearch])

  const filteredRoles = useMemo(() => {
    const query = roleSearch.toLowerCase().trim()

    if (!query) return availableRoles

    return availableRoles.filter((item) =>
      item.toLowerCase().includes(query)
    )
  }, [roleSearch, availableRoles])

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
      }
    }
  })

  const safeParseArray = (value) => {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const saveAnalysisToHistory = (analysisPayload, currentMeta) => {
    const existingHistory = safeParseArray(
      localStorage.getItem('resumemind_analysis_history') || '[]'
    )

    const report = {
      id: `report_${Date.now()}`,
      result: analysisPayload,
      meta: {
        fileName: file?.name || 'Resume Report',
        company,
        role,
        jobDescription,
        createdAt: new Date().toISOString(),
        ...currentMeta
      },
      createdAt: new Date().toISOString(),
      savedAt: new Date().toISOString()
    }

    const updatedHistory = [
      report,
      ...existingHistory
    ]

    localStorage.setItem(
      'resumemind_analysis_history',
      JSON.stringify(updatedHistory)
    )

    localStorage.setItem(
      'resumemind_saved_reports',
      JSON.stringify(updatedHistory)
    )

    localStorage.setItem(
      'resumemind_latest_analysis',
      JSON.stringify(report)
    )

    localStorage.setItem(
      'resumemind_latest_meta',
      JSON.stringify(report.meta)
    )

    return report
  }

  const handleCompanyChange = (selectedCompany) => {
    const selectedData = companyRoles.find(
      (item) => item.company === selectedCompany
    )

    setCompany(selectedCompany)
    setRole(selectedData?.roles?.[0] || '')
    setCompanySearch('')
    setRoleSearch('')
    setOpenCompanyDropdown(false)
  }

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole)
    setRoleSearch('')
    setOpenRoleDropdown(false)
  }

  const getErrorMessage = (error) => {
    if (error?.code === 'ECONNABORTED') {
      return 'Backend is taking too long. Render may be waking up. Please try again in a few seconds.'
    }

    if (error?.response?.data?.message) {
      return error.response.data.message
    }

    if (error?.response?.data?.error) {
      return error.response.data.error
    }

    if (typeof error?.response?.data === 'string') {
      return error.response.data
    }

    if (error?.message) {
      return error.message
    }

    return 'Analysis Failed. Please try again.'
  }

  const normalizeBackendAnalysis = (data) => {
    if (data?.analysis) {
      return data.analysis
    }

    if (data?.result) {
      return data.result
    }

    if (data?.data?.analysis) {
      return data.data.analysis
    }

    if (data?.data?.result) {
      return data.data.result
    }

    return data
  }

  const hasValidAnalysis = (analysis) => {
    if (!analysis || typeof analysis !== 'object') {
      return false
    }

    return Boolean(
      analysis.atsScore ||
      analysis.score ||
      analysis.overallScore ||
      analysis.summary ||
      analysis.aiSummary ||
      analysis.suggestions ||
      analysis.missingSkills ||
      analysis.matchedSkills
    )
  }

  const handleAnalyze = async () => {
    if (!file) {
      alert('Upload Resume First')
      return
    }

    try {
      setLoading(true)

      const currentMeta = {
        fileName: file?.name || 'Resume Report',
        company,
        role,
        jobDescription,
        createdAt: new Date().toISOString()
      }

      if (setAnalysisMeta) {
        setAnalysisMeta(currentMeta)
      }

      localStorage.setItem(
        'resumemind_target_selection',
        JSON.stringify({
          company,
          role,
          selectedAt: new Date().toISOString()
        })
      )

      const formData = new FormData()

      formData.append('resume', file)
      formData.append('company', company)
      formData.append('role', role)
      formData.append('jobDescription', jobDescription)

      const response = await axios.post(
        `${API_BASE_URL}/api/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000
        }
      )

      const analysisFromBackend = normalizeBackendAnalysis(response.data)

      if (!hasValidAnalysis(analysisFromBackend)) {
        console.error('Unexpected backend response:', response.data)
        alert('Analysis completed but backend returned an unexpected format.')
        return
      }

      const analysisPayload = {
        ...analysisFromBackend,
        atsScore:
          analysisFromBackend.atsScore ||
          analysisFromBackend.score ||
          analysisFromBackend.overallScore ||
          0,
        selectedCompany: company,
        selectedRole: role,
        company,
        role,
        jobDescription,
        fileName: file?.name || 'Resume Report'
      }

      setResult(analysisPayload)

      saveAnalysisToHistory(analysisPayload, currentMeta)

      alert('Analysis completed successfully.')
    } catch (error) {
      console.error('Analysis failed:', error)
      console.error('Backend response:', error?.response?.data)

      alert(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-wrapper">
      <div className="upload-header">
        <div className="uploadbox-header">
          <span className="eyebrow">
            Upload & Analyze
          </span>

          <p>
            Add your resume details below to generate ATS, skill gap, and company-role insights.
          </p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className="modern-upload"
      >
        <input {...getInputProps()} />

        <div className="upload-icon">
          <FiUploadCloud />
        </div>

        <h2>
          {file ? file.name : 'Drop Resume Here'}
        </h2>

        <p>
          PDF only • ATS Optimized • AI Ready
        </p>

        <button
          type="button"
          className="upload-btn"
        >
          Upload Resume
        </button>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>
            Target Company
          </label>

          <div className="custom-dropdown searchable-dropdown">
            <button
              type="button"
              className="dropdown-btn"
              onClick={() => {
                setOpenCompanyDropdown(!openCompanyDropdown)
                setOpenRoleDropdown(false)
              }}
            >
              <span>{company || 'Select Company'}</span>
              <span>⌄</span>
            </button>

            {openCompanyDropdown ? (
              <div className="dropdown-menu searchable-menu">
                <input
                  type="text"
                  className="dropdown-search"
                  placeholder="Search company, type, role..."
                  value={companySearch}
                  onChange={(event) => setCompanySearch(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                />

                <div className="dropdown-scroll">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((item) => (
                      <button
                        key={item.company}
                        type="button"
                        className={`dropdown-item ${
                          company === item.company ? 'active' : ''
                        }`}
                        onClick={() => handleCompanyChange(item.company)}
                      >
                        <span>{item.company}</span>

                        <small>
                          {item.type || 'Company'}
                          {item.category ? ` • ${item.category}` : ''}
                        </small>
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-empty">
                      No company found
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="form-group">
          <label>
            Target Role
          </label>

          <div className="custom-dropdown searchable-dropdown">
            <button
              type="button"
              className="dropdown-btn"
              onClick={() => {
                setOpenRoleDropdown(!openRoleDropdown)
                setOpenCompanyDropdown(false)
              }}
            >
              <span>{role || 'Select Role'}</span>
              <span>⌄</span>
            </button>

            {openRoleDropdown ? (
              <div className="dropdown-menu searchable-menu">
                <input
                  type="text"
                  className="dropdown-search"
                  placeholder="Search role..."
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                />

                <div className="dropdown-scroll">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`dropdown-item ${
                          role === item ? 'active' : ''
                        }`}
                        onClick={() => handleRoleChange(item)}
                      >
                        <span>{item}</span>
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-empty">
                      No role found for this company
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="form-group full">
        <label>
          Job Description
        </label>

        <textarea
          placeholder="Paste job description here to get accurate role-based skill matching..."
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          rows={8}
        />
      </div>

      <button
        className="button analyze-btn"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
      </button>
    </div>
  )
}