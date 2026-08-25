"use client";

const testimonials = [
  {
    name: "Akshith Reddy",
    role: "Computer Science Student",
    avatar: "AR",
    review:
      "ResumeMind AI increased my ATS score from 64% to 93%. I started getting interview calls within two weeks.",
  },
  {
    name: "Sai Prasad",
    role: "Software Engineer",
    avatar: "SP",
    review:
      "The Company Match feature helped me tailor my resume for Microsoft. The AI suggestions were surprisingly accurate.",
  },
  {
    name: "Nikhil Kumar",
    role: "Data Analyst",
    avatar: "NK",
    review:
      "Beautiful UI, fast analysis and excellent ATS insights. One of the best resume tools I've used.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonial-section">
      <div className="section-header">
        <span className="section-badge">
          Success Stories
        </span>

        <h2>
          Loved By Students & Professionals
        </h2>

        <p>
          Thousands of users have improved their ATS scores and landed
          interviews using ResumeMind AI.
        </p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="testimonial-card"
          >
            <div className="stars">
              ★★★★★
            </div>

            <p>"{item.review}"</p>

            <div className="testimonial-user">
              <div className="avatar">
                {item.avatar}
              </div>

              <div>
                <h4>{item.name}</h4>
                <span>{item.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}