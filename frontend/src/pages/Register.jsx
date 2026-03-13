import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState('donor');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', regNumber: '', address: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (role === 'ngo' && !form.regNumber) { setError('Registration number is required for NGOs.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const user = {
      _id: 'new-' + Date.now(),
      name: form.name,
      email: form.email,
      role,
      phone: form.phone,
      isApproved: role === 'donor',
      ...(role === 'ngo' && {
        ngoDetails: { registrationNumber: form.regNumber, address: form.address, description: form.description }
      }),
    };
    login(user, 'mock-token-new');
    navigate(role === 'donor' ? '/donor' : '/ngo/feed');
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">🌱 FoodBridge</div>
        <p className="auth-tagline">Create your account to get started.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">I am a…</label>
            <div className="role-toggle">
              <button type="button" className={`role-toggle-btn ${role === 'donor' ? 'active' : ''}`} onClick={() => setRole('donor')}>
                🏪 Food Donor
              </button>
              <button type="button" className={`role-toggle-btn ${role === 'ngo' ? 'active' : ''}`} onClick={() => setRole('ngo')}>
                🤝 NGO / Charity
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{role === 'donor' ? 'Name / Organisation' : 'Organisation Name'}</label>
            <input className="form-input" placeholder="e.g. Hotel Grand or Feeding India" value={form.name} onChange={set('name')} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" placeholder="+91 …" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
          </div>

          {role === 'ngo' && (
            <>
              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input className="form-input" placeholder="e.g. NGO/2019/XXXXX" value={form.regNumber} onChange={set('regNumber')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Organisation Address</label>
                <input className="form-input" placeholder="Full address" value={form.address} onChange={set('address')} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Tell donors about your organisation…" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />
              </div>
              <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
                ℹ️ NGO accounts require admin approval. You'll receive an email once verified.
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
