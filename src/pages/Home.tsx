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
                src="/images/tractor-planter.jpeg"
                alt="Tractor with planter in the field"
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
      <section className="focus-areas section">
        <div className="container">
          <span className="section-label">What We Cover</span>
          <h2 className="section-title">Agricultural Focus Areas</h2>
        </div>
        <div className="focus-split">
          <div className="focus-panel focus-panel-crops" style={{ backgroundImage: "url('/images/crop-seedlings.jpeg')" }}>
            <div className="focus-panel-overlay" />
            <div className="focus-panel-content focus-content-low">
              <h3>Crops</h3>
              <p>Seasonal and permanent crop farming positions across a wide range of US farm types.</p>
            </div>
          </div>
          <div className="focus-panel focus-panel-equipment" style={{ backgroundImage: "url('/images/combine-lineup.jpeg')" }}>
            <div className="focus-panel-overlay" />
            <div className="focus-panel-content focus-content-mid">
              <h3>Farming<br />Equipment</h3>
              <p>Operate tractors, combines, harvesters and other modern agricultural machinery.</p>
            </div>
          </div>
          <div className="focus-panel focus-panel-livestock" style={{ backgroundImage: "url('/images/calf.jpeg')" }}>
            <div className="focus-panel-overlay" />
            <div className="focus-panel-content focus-content-high">
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
        </div>
          <div className="why-grid">
            <div className="why-card why-card-visa">
              <div className="why-image">
                <img src="/why/visa.webp" alt="Visa application" />
              </div>
              <div className="why-body">
                <h3>Visa Application</h3>
                <p>
                  We assist you through the full H-2A visa application process, ensuring all
                  paperwork is correctly completed and submitted on time.
                </p>
                <div className="why-agent">
                  <p className="why-agent-name">Dynamic Visa Experts</p>
                  <p>Deona Joubert — 062 116 0664 | deona@dynamicvisa.co.za</p>
                  <p>Adelle Van Greunen — 062 398 3250 | adelle@dynamicvisa.co.za</p>
                </div>
              </div>
            </div>
            <div className="why-card why-card-tickets">
              <div className="why-image">
                <img src="/why/tickets.webp" alt="Air travel tickets" />
              </div>
              <div className="why-body">
                <h3>Air Travel Tickets</h3>
                <p>
                  We coordinate your flight bookings through our trusted travel partner, so
                  you arrive ready to work.
                </p>
                <div className="why-agent">
                  <p className="why-agent-name">GlobalExplore</p>
                  <p>Leoni Visser — +27 72 041 2171 | leoni@globalexplore.co.za</p>
                </div>
              </div>
            </div>
            <div className="why-card why-card-insure">
              <div className="why-image">
                <img src="/why/insure.jpg" alt="Travel insurance" />
              </div>
              <div className="why-body">
                <h3>Travel Insurance</h3>
                <p>
                  We help you obtain the necessary travel and medical insurance cover for
                  your stay in the United States.
                </p>
                <div className="why-agent">
                  <p className="why-agent-name">MRA White River Insurance Brokers</p>
                  <p>Tania Strydom — Bryte Travel Insurance</p>
                  <p><a href="tel:0637336054">063 733 6054</a></p>
                </div>
              </div>
            </div>
            <div className="why-card why-card-paid">
              <div className="why-image">
                <img src="/why/paid.jpg" alt="Getting paid" />
              </div>
              <div className="why-body">
                <h3>Getting You Paid</h3>
                <p>
                  We assist with payment processing and ensure you understand your wage
                  entitlements under the H-2A program.
                </p>
              </div>
            </div>
          </div>
      </section>

      {/* Gallery */}
      <section className="gallery section">
        <div className="container">
          <span className="section-label">Life on the Farm</span>
          <h2 className="section-title">A Glimpse of What Awaits You</h2>
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[
              ['/images/trucks-sunset.jpeg', 'Grain trucks at sunset'],
              ['/images/tractor-lineup.jpeg', 'Row of tractors'],
              ['/images/tomato-seedling.jpeg', 'Tomato seedling'],
              ['/images/tractor-cab-view.jpeg', 'View from a tractor cab'],
              ['/images/grain-cart-aerial.jpeg', 'Tractor with grain cart, aerial view'],
              ['/images/cattle-herd.jpeg', 'Cattle herd on the range'],
              ['/images/trucks-sunset.jpeg', 'Grain trucks at sunset'],
              ['/images/tractor-lineup.jpeg', 'Row of tractors'],
              ['/images/tomato-seedling.jpeg', 'Tomato seedling'],
              ['/images/tractor-cab-view.jpeg', 'View from a tractor cab'],
              ['/images/grain-cart-aerial.jpeg', 'Tractor with grain cart, aerial view'],
              ['/images/cattle-herd.jpeg', 'Cattle herd on the range'],
            ].map(([src, alt], i) => (
              <div className="marquee-item" key={i}>
                <img src={src} alt={alt} />
              </div>
            ))}
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
