import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_LISTINGS, MOCK_REQUESTS, FOOD_EMOJIS, formatTimeLeft, formatRelative } from '../utils/mockData';

const DISTANCES = { lst1: '1.2 km', lst2: '2.1 km', lst3: '3.4 km', lst4: '0.8 km', lst5: '5.1 km' };

export default function NgoListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = MOCK_LISTINGS.find(l => l._id === id);
  const existingReq = MOCK_REQUESTS.find(r => r.listing._id === id && r.ngo._id === 'ngo1');

  const [requestStatus, setRequestStatus] = useState(existingReq?.status || null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!listing) return (
    <div className="card"><div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-title">Listing not found</div></div></div>
  );

  const timeLeft = formatTimeLeft(listing.expiresAt);
  const emoji = FOOD_EMOJIS[listing.category];
  const canRequest = listing.status === 'available' && !requestStatus;

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setRequestStatus('pending');
    setSubmitted(true);
    setShowForm(false);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back to feed</button>
      </div>

      {submitted && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          ✅ Pickup request sent! The donor will be notified and respond soon.
        </div>
      )}

      {/* Hero */}
      <div className="detail-food-icon">{emoji}</div>

      <div className="card card-body" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div className="detail-title">{listing.title}</div>
            <div className="text-muted text-sm" style={{ marginTop: 4 }}>by {listing.donor?.name}</div>
            {listing.description && <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 10 }}>{listing.description}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <span className={`badge badge-${listing.urgency}`}>
              {listing.urgency === 'high' ? '🔴' : listing.urgency === 'medium' ? '🟡' : '🟢'} {listing.urgency} urgency
            </span>
            <span className={`badge badge-${listing.status}`}>{listing.status}</span>
          </div>
        </div>

        <span className={`countdown ${timeLeft.cls}`} style={{ marginTop: 12, display: 'inline-flex' }}>⏱ {timeLeft.label}</span>

        <div className="detail-section">
          <div className="detail-section-title">Food Details</div>
          <div className="detail-row"><span className="detail-row-label">Category</span><span className="detail-row-value">{listing.category}</span></div>
          <div className="detail-row"><span className="detail-row-label">Quantity</span><span className="detail-row-value">{listing.quantity} {listing.quantityUnit}</span></div>
          <div className="detail-row"><span className="detail-row-label">Storage</span><span className="detail-row-value">{listing.storageType.replace('_', ' ')}</span></div>
          <div className="detail-row"><span className="detail-row-label">Distance</span><span className="detail-row-value">{DISTANCES[listing._id] || '—'}</span></div>
          <div className="detail-row"><span className="detail-row-label">Pickup address</span><span className="detail-row-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{listing.pickupAddress}</span></div>
          <div className="detail-row"><span className="detail-row-label">Posted</span><span className="detail-row-value">{formatRelative(listing.createdAt)}</span></div>
        </div>
      </div>

      {/* Request Section */}
      <div className="card card-body" style={{ marginBottom: 80 }}>
        {!requestStatus && !showForm && canRequest && (
          <div style={{ textAlign: 'center' }}>
            <p className="text-muted text-sm" style={{ marginBottom: 14 }}>Ready to pick up this donation?</p>
            <button className="btn btn-primary btn-lg btn-full" onClick={() => setShowForm(true)}>
              🤝 Request Pickup
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Message to donor (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. We can arrive within 30 minutes. We serve 200 families daily."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ minHeight: 80 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        )}

        {requestStatus && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>
              {requestStatus === 'pending' ? '⏳' : requestStatus === 'approved' ? '✅' : requestStatus === 'collected' ? '🎉' : '❌'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              {requestStatus === 'pending' ? 'Request pending' : `Request ${requestStatus}`}
            </div>
            <p className="text-muted text-sm">
              {requestStatus === 'pending' && 'Waiting for the donor to approve your request.'}
              {requestStatus === 'approved' && 'Head to the pickup address to collect the food!'}
              {requestStatus === 'collected' && 'Great work! This donation has been collected.'}
              {requestStatus === 'rejected' && 'The donor rejected this request.'}
            </p>
          </div>
        )}

        {listing.status === 'requested' && !requestStatus && (
          <div style={{ textAlign: 'center' }}>
            <p className="text-muted text-sm">Another NGO has already requested this listing. Check back if they cancel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
