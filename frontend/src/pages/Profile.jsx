import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.ngoDetails?.address || '',
    description: user?.ngoDetails?.description || '',
  });
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 600));
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isNgo = user?.role === 'ngo';
  const isDonor = user?.role === 'donor';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Profile</h1>

      {saved && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ Profile updated successfully.</div>}

      {/* Avatar + name header */}
      <div className="card card-body" style={{ marginBottom: 16 }}>
        <div className="profile-header">
          <div className="profile-avatar">
            {isNgo ? '🤝' : '🏪'}
          </div>
          <div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <div style={{ marginTop: 6 }}>
              <span className={`nav-role-badge ${isNgo ? 'ngo' : ''}`}>
                {isDonor ? '🏪 Donor' : '🤝 NGO'}
              </span>
              {isNgo && (
                <span className={`badge ${user?.isApproved ? 'badge-approved' : 'badge-pending'}`} style={{ marginLeft: 8 }}>
                  {user?.isApproved ? '✓ Approved' : '⏳ Pending approval'}
                </span>
              )}
            </div>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="detail-section-title">Account Details</div>
            <div className="detail-row"><span className="detail-row-label">Name</span><span className="detail-row-value">{user?.name}</span></div>
            <div className="detail-row"><span className="detail-row-label">Email</span><span className="detail-row-value">{user?.email}</span></div>
            <div className="detail-row"><span className="detail-row-label">Phone</span><span className="detail-row-value">{user?.phone || '—'}</span></div>
            {isNgo && (
              <>
                <div className="detail-row"><span className="detail-row-label">Reg. Number</span><span className="detail-row-value">{user?.ngoDetails?.registrationNumber || '—'}</span></div>
                <div className="detail-row"><span className="detail-row-label">Address</span><span className="detail-row-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{user?.ngoDetails?.address || '—'}</span></div>
                <div className="detail-row"><span className="detail-row-label">Description</span><span className="detail-row-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{user?.ngoDetails?.description || '—'}</span></div>
              </>
            )}
            <button className="btn btn-secondary btn-full" style={{ marginTop: 16 }} onClick={() => setEditing(true)}>
              ✏️ Edit profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            <div className="form-group">
              <label className="form-label">Name / Organisation</label>
              <input className="form-input" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 …" />
            </div>
            {isNgo && (
              <>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={set('address')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save changes</button>
            </div>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="card card-body" style={{ borderColor: '#f5c6c2' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--red-500)', marginBottom: 12 }}>Account</div>
        <button className="btn btn-danger btn-full" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
