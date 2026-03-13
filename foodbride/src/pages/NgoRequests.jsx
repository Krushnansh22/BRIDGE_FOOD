import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_REQUESTS, FOOD_EMOJIS, formatRelative } from '../utils/mockData';

export default function NgoRequests() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [actionMsg, setActionMsg] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const handleCollect = async (reqId) => {
    setRequests(prev => prev.map(r => r._id === reqId ? { ...r, status: 'collected', pickedUpAt: new Date().toISOString() } : r));
    setActionMsg('🎉 Marked as collected! Thank you for helping reduce food waste.');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleCancel = async (reqId) => {
    setRequests(prev => prev.map(r => r._id === reqId ? { ...r, status: 'cancelled' } : r));
    setActionMsg('Request cancelled.');
    setTimeout(() => setActionMsg(''), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track your pickup requests</p>
        </div>
      </div>

      {actionMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{actionMsg}</div>}

      <div className="filter-tabs">
        {['all', 'pending', 'approved', 'collected', 'rejected', 'cancelled'].map(s => (
          <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No requests</div>
            <div className="empty-desc">Browse nearby food donations and request a pickup.</div>
            <Link to="/ngo/feed" className="btn btn-primary" style={{ marginTop: 8 }}>Browse listings</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const listing = req.listing;
            return (
              <div key={req._id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                  <div style={{ width: 72, background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                    {FOOD_EMOJIS[listing.category]}
                  </div>
                  <div style={{ flex: 1, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <Link to={`/ngo/listing/${listing._id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>{listing.title}</div>
                        </Link>
                        <div className="text-muted text-sm" style={{ marginTop: 2 }}>from {req.donor?.name || listing.donor?.name}</div>
                        {req.message && <div className="text-muted text-sm" style={{ marginTop: 4, fontStyle: 'italic' }}>"{req.message}"</div>}
                      </div>
                      <span className={`badge badge-${req.status}`} style={{ flexShrink: 0 }}>{req.status}</span>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span className="text-muted text-sm">📅 {formatRelative(req.createdAt)}</span>
                      {req.pickedUpAt && <span className="text-muted text-sm">✅ Collected {formatRelative(req.pickedUpAt)}</span>}

                      {req.status === 'approved' && (
                        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleCollect(req._id)}>
                          ✓ Mark as Collected
                        </button>
                      )}
                      {req.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleCancel(req._id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
