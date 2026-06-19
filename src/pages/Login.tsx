import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

type Mode = 'login' | 'forgot';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/profile');
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link sent! Check your email.');
    }
  };

  return (
    <main className="login-page">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Candidate Portal</h1>
          <p>View and manage your application</p>
        </div>
      </section>

      <section className="login-section">
        <div className="login-card">
          {mode === 'login' ? (
            <>
              <h2>Sign In</h2>
              <p className="login-sub">Access your NS Pinnacle candidate profile</p>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="login-links">
                <button className="link-btn" onClick={() => { setMode('forgot'); setError(''); }}>
                  Forgot your password?
                </button>
                <span className="login-divider">|</span>
                <Link to="/candidate-registration">New candidate? Register here</Link>
              </div>
            </>
          ) : (
            <>
              <h2>Reset Password</h2>
              <p className="login-sub">Enter your email and we'll send a reset link</p>

              {error && <div className="login-error">{error}</div>}
              {message && <div className="login-success">{message}</div>}

              {!message && (
                <form onSubmit={handleForgot}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <div className="login-links">
                <button className="link-btn" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
