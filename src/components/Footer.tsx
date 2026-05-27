import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/images/ns-logo.png" alt="NS Pinnacle Recruitment" width="64" height="64" style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div>
                <span className="footer-logo-name">NS Pinnacle Recruitment</span>
                <span className="footer-tagline">Work on a Farm in the USA</span>
              </div>
            </div>
            <p className="footer-desc">
              A South African recruitment agency specialising in placing local candidates in
              Agricultural Positions in the USA.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/candidate-registration">Candidate Registration</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <span className="footer-icon">✉</span>
                <a href="mailto:gauteng@nspinnaclerecruit.com">gauteng@nspinnaclerecruit.com</a>
              </li>
              <li>
                <span className="footer-icon">💬</span>
                <a href="https://wa.me/27615312915">WhatsApp: 061 531 2915</a>
              </li>
            </ul>
            <div className="footer-socials">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/nicky-goncalves" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NS Pinnacle Recruitment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
