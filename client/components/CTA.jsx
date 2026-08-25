"use client";

import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-card">
        <span className="section-badge">
          Get Started Today
        </span>

        <h2>
          Build a Resume That Opens
          More Career Opportunities
        </h2>

        <p>
          Analyze your resume, improve your ATS score, discover missing
          skills and create a professional resume with the power of AI.
        </p>

        <div className="cta-buttons">
          <Link
            href="/signup"
            className="primary-btn"
          >
            Start Free
            <HiArrowRight />
          </Link>

          <Link
            href="/dashboard"
            className="secondary-btn"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}