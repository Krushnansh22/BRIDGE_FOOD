import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_LISTINGS, MOCK_REQUESTS, FOOD_EMOJIS, formatTimeLeft, formatRelative } from '../utils/mockData';

export default function DonorListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(MOCK_LISTINGS.find(l => l._id === id));
  const [requests, setRequests] = useState(MOCK_REQUESTS.filter(r => r.listing._id === id));
  const [actionMsg, setActionMsg] = useState('');

  if (!listing) return (
    <div className="card"><div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-title">Listing not found</div></div></div>
  );

  const timeLeft = formatTimeLeft(listing.expiresAt);
  const emoji = FOOD_EMOJIS[listing.category];

  const handleRequest = async (reqId, action) => {
    setRequests(prev => prev.map(r => r._id === reqId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));
    if (action === 'approve') {
      setListing(l => ({ ...l, status: 'requested', activeRequest: reqId }));
    }
    setActionMsg(action === 'approve' ? '✅ Request approved! NGO has been notified.' : '❌ Request rejected.');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const otherRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        <span className={`badge badge-${listing.status}`}>{listing.status}</span>
      </div>

      {actionMsg && <div className={`alert ${actionMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{actionMsg}</div>}

      {/* Food icon header */}
      <div className="detail-food-icon">{emoji}</div>

      <div className="card card-body" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="detail-title">{listing.title}</div>
            {listing.description && <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 8 }}>{listing.description}</p>}
          </div>
          <span className={`badge badge-${listing.urgency}`}>
            {listing.urgency === 'high' ? '🔴' : listing.urgency === 'medium' ? '🟡' : '🟢'} {listing.urgency} urgency
          </span>
        </div>

        <span className={`countdown ${timeLeft.cls}`} style={{ marginTop: 12, display: 'inline-flex' }}>⏱ {timeLeft.label}</span>

        <div className="detail-section">
          <div className="detail-section-title">Details</div>
          <div className="detail-row"><span className="detail-row-label">Category</span><span className="detail-row-value">{listing.category}</span></div>
          <div className="detail-row"><span className="detail-row-label">Quantity</span><span className="detail-row-value">{listing.quantity} {listing.quantityUnit}</span></div>
          <div className="detail-row"><span className="detail-row-label">Storage</span><span className="detail-row-value">{listing.storageType.replace('_', ' ')}</span></div>
          <div className="detail-row"><span className="detail-row-label">Pickup address</span><span className="detail-row-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{listing.pickupAddress}</span></div>
          <div className="detail-row"><span className="detail-row-label">Posted</span><span className="detail-row-value">{formatRelative(listing.createdAt)}</span></div>
        </div>
      </div>

      {/* Requests Panel */}
      <div className="card" style={{ marginBottom: 80 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Pickup Requests</div>
          {pendingRequests.length > 0 && <span className="badge badge-pending">{pendingRequests.length} pending</span>}
        </div>

        {requests.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 24px' }}>
            <div className="empty-icon">📭</div>
            <div className="empty-title" style={{ fontSize: '1rem' }}>No requests yet</div>
            <div className="empty-desc">NGOs near you will see this listing and may request a pickup.</div>
          </div>
        ) : (
          <>
            {pendingRequests.map(req => (
              <div key={req._id} className="request-row">
                <div style={{ flex: 1 }}>
                  <div className="request-org">🤝 {req.ngo.name}</div>
                  {req.message && <div className="request-msg">"{req.message}"</div>}
                  <div className="text-muted text-sm" style={{ marginTop: 4 }}>{formatRelative(req.createdAt)}</div>
                </div>
                {listing.status === 'available' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRequest(req._id, 'reject')}>Reject</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleRequest(req._id, 'approve')}>Approve ✓</button>
                  </div>
                )}
              </div>
            ))}
            {otherRequests.map(req => (
              <div key={req._id} className="request-row" style={{ opacity: 0.7 }}>
                <div style={{ flex: 1 }}>
                  <div className="request-org">🤝 {req.ngo.name}</div>
                  {req.message && <div className="request-msg">"{req.message}"</div>}
                  <div className="text-muted text-sm" style={{ marginTop: 4 }}>{formatRelative(req.createdAt)}</div>
                </div>
                <span className={`badge badge-${req.status}`}>{req.status}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
