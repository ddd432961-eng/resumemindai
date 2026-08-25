'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'
import { companyRoles } from '../../data/companyRoles'

export default function CompanyMatch() {

  const [analysisData, setAnalysisData] = useState(null)

  const [searchTerm, setSearchTerm] =
    useState('')

  const [roleSearchTerm, setRoleSearchTerm] =
    useState('')

  const [selectedType, setSelectedType] =
    useState('All')

  const [
    selectedRoleCategory,
    setSelectedRoleCategory
  ] = useState('All')

  const [selectedCompany, setSelectedCompany] =
    useState(null)

  useEffect(() => {

    const saved =
      localStorage.getItem(
        'resumemind_latest_analysis'
      )

    if (saved) {

      try {

        setAnalysisData(
          JSON.parse(saved)
        )

      } catch (error) {

        console.error(
          'Failed to parse saved analysis:',
          error
        )

        setAnalysisData(null)
      }
    }

  }, [])

  const normalize = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()

  const companyTypes = useMemo(() => {

    const types =
      companyRoles
        .map((item) => item.type)
        .filter(Boolean)

    return [
      'All',
      ...Array.from(new Set(types))
    ]

  }, [])

  return (

    <AuthGuard>

      <div className="page">

        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">

          <Navbar />

          <section className="company-hero">

            <div>

              <span className="eyebrow">
                Company + Role Explorer
              </span>

              <h1>
                Search companies and explore available roles
              </h1>

              <p>
                Browse product companies,
                AI labs, service MNCs,
                consulting firms,
                fintech companies,
                SaaS companies,
                and startups.
              </p>

              <div className="hero-actions">

                <Link
                  href="/dashboard#analyzer"
                  className="button"
                >
                  Analyze Resume
                </Link>

                <Link
                  href="/templates"
                  className="button secondary-btn"
                >
                  Browse Templates
                </Link>

              </div>

            </div>

          </section>

        </div>

      </div>

    </AuthGuard>
  )
}