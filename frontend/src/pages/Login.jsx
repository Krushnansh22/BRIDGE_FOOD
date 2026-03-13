import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_USERS = {
  'donor@demo.com': { _id: 'u1', name: 'Hotel Taj Residency', email: 'donor@demo.com', role: 'donor', phone: '+91 98765 43210' },
  'ngo@demo.com':   { _id: 'ngo1', name: 'Feeding India Foundation', email: 'ngo@demo.com', role: 'ngo', phone: '+91 98765 00001', ngoDetails: { registrationNumber: 'NGO/2019/FIF', address: '5 NGO Lane, Bangalore', description: 'We serve 200 families daily.' }, isApproved: true },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = DEMO_USERS[email.toLowerCase()];
    if (user && password.length >= 6) {
      login(user, 'mock-token-123');
      navigate(user.role === 'donor' ? '/donor' : '/ngo/feed');
    } else {
      setError('Invalid credentials. Use demo@demo.com or ngo@demo.com with any 6+ char password.');
    }
    setLoading(false);
  };

  const quickLogin = (role) => {
    setEmail(role === 'donor' ? 'donor@demo.com' : 'ngo@demo.com');
    setPassword('password123');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌱 FoodBridge</div>
        <p className="auth-tagline">Connecting surplus food with communities in need.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => quickLogin('donor')}>
            🏪 Demo as Donor
          </button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => quickLogin('ngo')}>
            🤝 Demo as NGO
          </button>
        </div>

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          New here? <Link to="/register" className="auth-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
