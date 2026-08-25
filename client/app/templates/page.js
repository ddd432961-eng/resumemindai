'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import Navbar from '../../components/Navbar'
import AuthGuard from '../../components/AuthGuard'

const resumeTemplates = [
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    category: 'ATS Friendly',
    level: 'Fresher',
    bestFor: 'Freshers, internships, campus placements',
    score: 96,
    accent: 'Blue'
  },
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    category: 'AI / ML',
    level: 'Intermediate',
    bestFor: 'AI/ML roles, data science roles',
    score: 94,
    accent: 'Purple'
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Software',
    level: 'Intermediate',
    bestFor: 'SDE, backend, frontend roles',
    score: 93,
    accent: 'Cyan'
  }
]

export default function TemplatesPage() {

  const [searchTerm, setSearchTerm] =
    useState('')

  const [selectedCategory, setSelectedCategory] =
    useState('All')

  const [selectedLevel, setSelectedLevel] =
    useState('All')

  const [selectedTemplate, setSelectedTemplate] =
    useState(resumeTemplates[0])

  const normalize = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()

  const categories = useMemo(() => {

    return [
      'All',
      ...Array.from(
        new Set(
          resumeTemplates.map(
            (template) => template.category
          )
        )
      )
    ]

  }, [])

  const levels = [
    'All',
    'Fresher',
    'Intermediate',
    'Advanced'
  ]

  const filteredTemplates = useMemo(() => {

    const query =
      normalize(searchTerm)

    return resumeTemplates.filter((template) => {

      const matchesCategory =
        selectedCategory === 'All' ||
        template.category === selectedCategory

      const matchesLevel =
        selectedLevel === 'All' ||
        template.level === selectedLevel

      const searchableText = [
        template.name,
        template.category,
        template.level,
        template.bestFor
      ].join(' ')

      const matchesSearch =
        normalize(searchableText)
          .includes(query)

      return (
        matchesCategory &&
        matchesLevel &&
        matchesSearch
      )
    })

  }, [
    searchTerm,
    selectedCategory,
    selectedLevel
  ])

  const handleUseTemplate = (template) => {

    setSelectedTemplate(template)

    localStorage.setItem(
      'resumemind_selected_template',
      JSON.stringify({
        id: template.id,
        name: template.name,
        category: template.category,
        level: template.level,
        selectedAt: new Date().toISOString()
      })
    )
  }

  return (

    <AuthGuard>

      <div className="page">

        <div className="glow one"></div>
        <div className="glow two"></div>
        <div className="glow three"></div>

        <div className="container">

          <Navbar />

          <section className="templates-hero">

            <div>

              <span className="eyebrow">
                Resume Templates
              </span>

              <h1>
                Choose an ATS-ready resume template
              </h1>

              <p>
                Pick a professional template
                based on your career path.
              </p>

              <div className="hero-actions">

                <Link
                  href="/dashboard#analyzer"
                  className="button"
                >
                  Analyze Resume
                </Link>

                <Link
                  href="/company-match"
                  className="button secondary-btn"
                >
                  Explore Companies
                </Link>

              </div>

            </div>

          </section>

          <section className="template-search-section">

            <div className="template-search-card">

              <div className="template-search-box">

                <label>
                  Search templates
                </label>

                <input
                  type="text"
                  placeholder="Search AI, SDE, Data..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />

              </div>

            </div>

          </section>

          <section className="templates-layout">

            <div className="templates-grid">

              {
                filteredTemplates.map((template) => (

                  <article
                    className="template-card"
                    key={template.id}
                  >

                    <div className="template-card-top">

                      <div>

                        <span className="template-tag">
                          {template.category}
                        </span>

                        <h2>
                          {template.name}
                        </h2>

                        <p>
                          {template.bestFor}
                        </p>

                      </div>

                      <div className="template-score">

                        <strong>
                          {template.score}%
                        </strong>

                        <span>
                          ATS
                        </span>

                      </div>

                    </div>

                    <div className="template-card-actions">

                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          handleUseTemplate(template)
                        }
                      >
                        Use Template
                      </button>

                    </div>

                  </article>

                ))
              }

            </div>

          </section>

        </div>

      </div>

    </AuthGuard>
  )
}