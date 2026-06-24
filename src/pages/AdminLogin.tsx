import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const ADMINS = [
  { email: 'gauteng@nspinnaclerecruit.com', password: 'Gauteng@ns81' },
  { email: 'manager@nspinnaclerecruit.com', password: 'ShaFra@310' },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    const valid = ADMINS.some(a => a.email === email && a.password === password);
    if (valid) {
      sessionStorage.setItem('admin_token', 'ns-admin-secret-2024');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password.');
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img src="/images/ns-logo.png" alt="NS Pinnacle Recruit" />
        </div>
        <h1 className="admin-login-title">Management Portal</h1>
        <p className="admin-login-sub">NS Pinnacle Recruit — Staff Access Only</p>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="management@nspinnaclerecruit.com"
              required
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
