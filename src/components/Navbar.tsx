import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/faq', label: 'FAQ' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="navbar-top-inner">
          <a href="mailto:gauteng@nspinnaclerecruit.com" className="navbar-email">
            <span className="icon">✉</span> gauteng@nspinnaclerecruit.com
          </a>
          <div className="navbar-socials">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/nicky-goncalves" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="navbar-main">
        <div className="navbar-main-inner">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <img src="/images/ns-logo.png" alt="NS Pinnacle Recruitment" width="58" height="58" style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div className="logo-text">
              <span className="logo-name">NS Pinnacle</span>
              <span className="logo-sub">Recruitment</span>
            </div>
          </Link>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
            <ul>
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={location.pathname === link.to ? 'active' : ''}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    to="/profile"
                    className={location.pathname === '/profile' ? 'active' : ''}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                </li>
              )}
            </ul>

            {user ? (
              <button className="btn-get-started btn-signout-nav" onClick={handleSignOut}>
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-get-started btn-login-nav" onClick={() => setMenuOpen(false)}>
                  Candidate Login
                </Link>
                <Link to="/candidate-registration" className="btn-get-started btn-register-nav" onClick={() => setMenuOpen(false)}>
                  Candidate Registration
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
