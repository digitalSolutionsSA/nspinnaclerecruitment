import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const markReady = () => {
      readyRef.current = true;
      setReady(true);
    };

    // Supabase parses the recovery token out of the URL and creates a session
    // automatically, firing a PASSWORD_RECOVERY event once it's ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') markReady();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    // If no recovery session shows up shortly, the link is missing, expired, or
    // already used — stop showing an infinite "verifying" spinner.
    const timeout = setTimeout(() => {
      if (!readyRef.current) setLinkInvalid(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/profile'), 2000);
    }
  };

  return (
    <main className="login-page">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Reset Password</h1>
          <p>Choose a new password for your candidate account</p>
        </div>
      </section>

      <section className="login-section">
        <div className="login-card">
          {done ? (
            <>
              <h2>Password Updated</h2>
              <div className="login-success">
                Your password has been updated. Redirecting you to your profile...
              </div>
            </>
          ) : linkInvalid ? (
            <>
              <h2>Link Expired or Invalid</h2>
              <p className="login-sub">
                This password reset link is no longer valid. Reset links expire after a short time
                and can only be used once.
              </p>
              <div className="login-links">
                <Link to="/login">Request a new reset link</Link>
              </div>
            </>
          ) : !ready ? (
            <>
              <h2>Reset Password</h2>
              <p className="login-sub">Verifying your reset link...</p>
            </>
          ) : (
            <>
              <h2>Set a New Password</h2>
              <p className="login-sub">Enter and confirm your new password below.</p>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Repeat password"
                  />
                </div>

                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
