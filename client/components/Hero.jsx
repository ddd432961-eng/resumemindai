"use client";

import Link from "next/link";
import {
  HiSparkles,
  HiArrowRight,
  HiCheckCircle,
  HiBriefcase,
  HiDocumentText,
  HiCpuChip,
} from "react-icons/hi2";

const stats = [
  {
    label: "Company Match",
    value: "96%",
  },
  {
    label: "Resume Score",
    value: "92%",
  },
  {
    label: "Skills",
    value: "28",
  },
  {
    label: "ATS Rank",
    value: "Top 5%",
  },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <span className="hero-badge">
          <HiSparkles />
          AI Powered Resume Intelligence
        </span>

        <h1>
          Build a Resume
          <span> Recruiters Love.</span>
        </h1>

        <p>
          ResumeMind AI analyzes your resume, improves ATS compatibility,
          identifies missing skills, and matches your profile with top
          companies using Artificial Intelligence.
        </p>

        <div className="hero-buttons">
          <Link href="/signup" className="primary-btn">
            Analyze Resume
            <HiArrowRight />
          </Link>

          <Link href="/templates" className="secondary-btn">
            Browse Templates
          </Link>
        </div>

        <div className="hero-users">
          <div className="avatars">
            <span>A</span>
            <span>K</span>
            <span>R</span>
            <span>+</span>
          </div>

          <p>
            Trusted by <strong>50,000+</strong> students and professionals.
          </p>
        </div>
      </div>

      <div className="hero-right">
        <div className="dashboard">
          <div className="dashboard-top">
            <div>
              <small>Resume Status</small>
              <h3>ResumeMind AI</h3>
            </div>

            <span className="status">
              <HiCheckCircle />
              Ready
            </span>
          </div>

          <div className="score-circle">
            <span>92%</span>
            <small>ATS Score</small>
          </div>

          <div className="dashboard-grid">
            {stats.map((item) => (
              <div
                key={item.label}
                className="dashboard-card"
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="skills-section">
            <h4>Missing Skills</h4>

            <div className="skills">
              <span>
                <HiCpuChip />
                Docker
              </span>

              <span>
                <HiDocumentText />
                Kubernetes
              </span>

              <span>
                <HiBriefcase />
                System Design
              </span>
            </div>
          </div>

          <div className="resume-progress">
            <div className="progress-title">
              <span>Resume Completion</span>
              <strong>94%</strong>
            </div>

            <div className="progress">
              <div
                className="progress-fill"
                style={{ width: "94%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}