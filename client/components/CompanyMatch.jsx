"use client";

export default function CompanyMatch() {
  const companies = [
    {
      name: "Google",
      score: 94,
      skills: ["Python", "TensorFlow", "SQL"],
      missing: "Docker, Kubernetes",
    },
    {
      name: "Microsoft",
      score: 91,
      skills: ["Azure", "C#", "SQL"],
      missing: "Azure DevOps",
    },
    {
      name: "Amazon",
      score: 89,
      skills: ["AWS", "Java", "DSA"],
      missing: "System Design",
    },
  ];

  return (
    <section className="company-section">
      <div className="section-header">
        <span className="section-badge">
          Company Match
        </span>

        <h2>
          Compare Your Resume With
          <span> Top Tech Companies</span>
        </h2>

        <p>
          Instantly compare your resume with hiring requirements from
          leading technology companies and discover the skills you need.
        </p>
      </div>

      <div className="company-grid">
        {companies.map((company) => (
          <div
            key={company.name}
            className="company-card"
          >
            <div className="company-top">
              <h3>{company.name}</h3>
              <span>{company.score}%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${company.score}%` }}
              />
            </div>

            <div className="company-tags">
              {company.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <small>
              Missing: {company.missing}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}