const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "OpenAI",
  "Adobe",
];

export default function TrustedCompanies() {
  return (
    <section className="trusted-section">
      <p>Trusted for resumes targeting</p>

      <div className="company-row">
        {companies.map((company) => (
          <span key={company}>{company}</span>
        ))}
      </div>
    </section>
  );
}