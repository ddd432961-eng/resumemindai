"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2>ResumeMind AI</h2>

          <p>
            AI-powered resume intelligence platform helping students and
            professionals build ATS-friendly resumes.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Product</h4>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/company-match">Company Match</Link>
            <Link href="/report">Reports</Link>
          </div>

          <div>
            <h4>Resources</h4>
            <Link href="/history">History</Link>
            <Link href="/skills">Skill Roadmap</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/settings">Settings</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ResumeMind AI. All rights reserved.</p>

        <div className="footer-social">
          <a href="#">GitHub</a>
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
        </div>
      </div>
    </footer>
  );
}