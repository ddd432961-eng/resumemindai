"use client";

import {
  HiSparkles,
  HiCheckCircle,
  HiBriefcase,
} from "react-icons/hi2";

export default function WhyResumeMind() {
  return (
    <section className="why-section">
      <div className="section-header">
        <span className="section-badge">
          Why Choose ResumeMind AI
        </span>

        <h2>
          Built For Modern Hiring
        </h2>

        <p>
          ResumeMind AI helps you build ATS-friendly resumes,
          improve your profile with AI, and maximize your
          chances of getting interview calls.
        </p>
      </div>

      <div className="why-grid">

        <div className="why-card">
          <div className="why-number">01</div>

          <div className="feature-icon">
            <HiSparkles />
          </div>

          <h3>AI Powered Analysis</h3>

          <p>
            Our AI reviews every section of your resume and
            provides personalized suggestions for improvement.
          </p>
        </div>

        <div className="why-card">
          <div className="why-number">02</div>

          <div className="feature-icon">
            <HiCheckCircle />
          </div>

          <h3>ATS Optimized</h3>

          <p>
            Improve formatting, keywords, readability and ATS
            compatibility before applying for jobs.
          </p>
        </div>

        <div className="why-card">
          <div className="why-number">03</div>

          <div className="feature-icon">
            <HiBriefcase />
          </div>

          <h3>Company Ready</h3>

          <p>
            Compare your resume against leading companies like
            Google, Microsoft and Amazon to identify missing skills.
          </p>
        </div>

      </div>
    </section>
  );
}