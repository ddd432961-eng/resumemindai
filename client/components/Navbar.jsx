"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
} from "react-icons/hi2";

import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      if (typeof window === "undefined") return;

      const session = localStorage.getItem("resumemind_session");
      setIsLoggedIn(!!session);
    };

    checkSession();

    window.addEventListener("storage", checkSession);
    window.addEventListener("focus", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("focus", checkSession);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "#pricing" },
  ];

  const dashboardLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Resumes", href: "/resumes" },
    { label: "Reports", href: "/report" },
    { label: "Skills", href: "/skills" },
    { label: "Templates", href: "/templates" },
  ];

  const links = isLoggedIn ? dashboardLinks : publicLinks;

  return (
    <>
      <header className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
        <nav className="navbar">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="navbar-logo"
          >
            <div className="logo-icon">RM</div>

            <div className="logo-text">
              <span>ResumeMind</span>
              <small>AI Resume Intelligence</small>
            </div>
          </Link>

          <div className="navbar-links">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="navbar-right">
            {isLoggedIn ? (
              <>
                <div className="navbar-search">
                  <HiOutlineMagnifyingGlass />

                  <input
                    type="text"
                    placeholder="Search resumes..."
                  />
                </div>

                <button
                  className="icon-button"
                  aria-label="Notifications"
                >
                  <HiOutlineBell />
                </button>

                <ProfileMenu />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="login-btn"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="primary-btn"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              className="mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? (
                <HiOutlineXMark />
              ) : (
                <HiOutlineBars3 />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`mobile-backdrop ${mobileOpen ? "show" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        id="mobile-menu"
        className={`mobile-menu ${mobileOpen ? "open" : ""}`}
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        {!isLoggedIn && (
          <>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="primary-btn"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </>
  );
}