import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  return (
    <main className="about">

      {/* Page Hero */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>About Us</h1>
          <p>More than recruiters — we are your guides to international agricultural opportunities.</p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="about-section section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-label">Who We Are</span>
              <h2>Making your dreams come true</h2>
              <p>
                NS Pinnacle Recruitment is a South African recruitment agency specialising in
                placing local candidates in Agricultural Positions in the United States of America
                through the H-2A Visa programme — a temporary agricultural visa that allows
                foreigners to perform seasonal agricultural labour.
              </p>
              <p>
                We are <strong>more than recruiters</strong>. We position ourselves as guides
                who help workers access international career experiences and advancement on
                American farms. We understand that this process can feel overwhelming, and
                that is why every applicant is assigned their own personal designated agent.
              </p>
              <p>
                Your agent will provide you with regular updates throughout the entire process,
                from the initial application right through to your pre-departure information pack.
                We believe in <strong>personalised service</strong>, ensuring peace of mind every
                step of the way.
              </p>
            </div>
            <div className="about-image">
              <img
                src="/images/combine-harvester.jpg"
                alt="Combine harvester operator"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section section bg-light">
        <div className="container">
          <div className="team-header">
            <span className="section-label">Our Team</span>
            <h2 className="section-title">Meet our team</h2>
            <p className="section-sub">Teamwork makes the dream work</p>
          </div>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">NG</div>
              <h3>Nicky Goncalves</h3>
              <p className="team-role">Director</p>
              <p className="team-bio">
                Nicky leads NS Pinnacle Recruitment with a passion for connecting South
                African agricultural workers with life-changing opportunities in the USA.
              </p>
              <a
                href="https://www.linkedin.com/in/nicky-goncalves"
                target="_blank"
                rel="noopener noreferrer"
                className="team-linkedin"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn Profile
              </a>
            </div>
            <div className="team-card">
              <div className="team-avatar">MD</div>
              <h3>Marcelle de Kock</h3>
              <p className="team-role">General Manager</p>
              <p className="team-bio">
                Marcelle manages the day-to-day operations, ensuring every candidate
                receives dedicated, personalised support throughout their application journey.
              </p>
              <a href="mailto:manager@nspinnaclerecruit.com" className="team-linkedin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Contact Marcelle
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to apply?</h2>
          <p>Start your application today and let us handle the rest.</p>
          <Link to="/candidate-registration" className="btn-primary btn-large">
            Register as a Candidate
          </Link>
        </div>
      </section>

    </main>
  );
}
