import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <main className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">South African Agricultural Recruitment</p>
          <h1>Work on a Farm in the USA</h1>
          <p className="hero-tagline">
            We specialize in linking skilled agricultural workers with fulfilling
            opportunities on farms across the United States.
          </p>
          <div className="hero-actions">
            <Link to="/candidate-registration" className="btn-primary">Get Started</Link>
            <Link to="/about" className="btn-outline">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="who-we-are section">
        <div className="container">
          <div className="who-grid">
            <div className="who-text">
              <span className="section-label">Who We Are</span>
              <h2>Making your dreams come true</h2>
              <p>
                We are a South African recruitment agency specialising in placing local
                candidates in Agricultural Positions in the USA.
              </p>
              <p>
                At NS Pinnacle Recruitment you will have your own personal designated Agent
                who will provide you with regular updates throughout the entire process —
                from the initial application, we are with you every step of the way.
              </p>
              <p>
                We believe in <strong>personalised service</strong>, ensuring peace of mind
                every step of the way.
              </p>
              <Link to="/about" className="btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
                About Us
              </Link>
            </div>
            <div className="who-image">
              <img
                src="/images/tractors-in-the-fields.jpg"
                alt="Tractors in the fields"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="badge-committed">
                <span className="badge-pct">100%</span>
                <span className="badge-txt">Committed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="focus-areas section bg-light">
        <div className="container">
          <span className="section-label">What We Cover</span>
          <h2 className="section-title">Agricultural Focus Areas</h2>
          <div className="focus-grid">
            <div className="focus-card">
              <div className="focus-icon">🌾</div>
              <h3>Crops</h3>
              <p>Seasonal and permanent crop farming positions across a wide range of US farm types.</p>
            </div>
            <div className="focus-card">
              <div className="focus-icon">🚜</div>
              <h3>Farming Equipment</h3>
              <p>Operate tractors, combines, harvesters and other modern agricultural machinery.</p>
            </div>
            <div className="focus-card">
              <div className="focus-icon">🐄</div>
              <h3>Livestock</h3>
              <p>Animal husbandry and livestock management roles on American farms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us section">
        <div className="container">
          <span className="section-label">Why Choose Us</span>
          <h2 className="section-title">We Handle Everything For You</h2>
          <p className="section-sub">
            From the initial application, we are with you every step of the way.
          </p>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">📋</div>
              <h3>Visa Application</h3>
              <p>
                We assist you through the full H-2A visa application process, ensuring all
                paperwork is correctly completed and submitted on time.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">✈️</div>
              <h3>Air Travel Tickets</h3>
              <p>
                We coordinate your flight bookings through our trusted travel partner Ritz
                Travel, so you arrive ready to work.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🛡️</div>
              <h3>Travel Insurance</h3>
              <p>
                We help you obtain the necessary travel and medical insurance cover for
                your stay in the United States.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">💰</div>
              <h3>Getting You Paid</h3>
              <p>
                We assist with payment processing and ensure you understand your wage
                entitlements under the H-2A program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <h2>Ready to start your journey to the USA?</h2>
          <p>Complete your online application today and let us do the rest.</p>
          <Link to="/candidate-registration" className="btn-primary btn-large">
            Register Now
          </Link>
        </div>
      </section>

    </main>
  );
}
