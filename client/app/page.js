"use client";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustedCompanies from "../components/TrustedCompanies";
import Features from "../components/Features";
import WhyResumeMind from "../components/WhyResumeMind";
import CompanyMatch from "../components/CompanyMatch";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="home-page">
      <div className="bg-grid"></div>

      <div className="blur blur-one"></div>
      <div className="blur blur-two"></div>
      <div className="blur blur-three"></div>

      <Navbar />

      <Hero />

      <TrustedCompanies />

      <Features />

      <WhyResumeMind />

      <CompanyMatch />

      <Testimonials />

      <CTA />

      <Footer />
    </main>
  );
}