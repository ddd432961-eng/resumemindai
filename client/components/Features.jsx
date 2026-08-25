"use client";

import {
  HiChartBar,
  HiCheckCircle,
  HiSparkles,
  HiBriefcase,
  HiCpuChip,
  HiDocumentText,
} from "react-icons/hi2";

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-header">
        <span className="features-badge">
          Platform Features
        </span>

        <h2>
          Everything You Need To Build
          <span> The Perfect Resume</span>
        </h2>

        <p>
          ResumeMind AI combines ATS optimization, AI-powered writing,
          company matching, resume analytics and career guidance into one
          intelligent platform.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card feature-large">
          <div className="feature-icon">
            <HiChartBar />
          </div>

          <h3>ATS Resume Analysis</h3>

          <p>
            Analyze formatting, readability, keywords, section hierarchy
            and recruiter compatibility with an enterprise-grade ATS
            engine.
          </p>

          <ul>
            <li>
              <HiCheckCircle />
              ATS Score
            </li>

            <li>
              <HiCheckCircle />
              Keyword Match
            </li>

            <li>
              <HiCheckCircle />
              Resume Formatting
            </li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <HiSparkles />
          </div>

          <h3>AI Resume Writer</h3>

          <p>
            Generate professional summaries, achievements and project
            descriptions using AI.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <HiBriefcase />
          </div>

          <h3>Company Match</h3>

          <p>
            Compare your resume with job descriptions from Google,
            Microsoft, Amazon and more.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <HiCpuChip />
          </div>

          <h3>Skill Gap Analysis</h3>

          <p>
            Discover missing technologies, certifications and tools needed
            for your dream role.
          </p>
        </div>

        <div className="feature-card feature-wide">
          <div className="feature-icon">
            <HiDocumentText />
          </div>

          <h3>Resume Builder</h3>

          <p>
            Create beautiful ATS-friendly resumes using professionally
            designed templates and AI-powered content suggestions.
          </p>
        </div>
      </div>
    </section>
  );
}