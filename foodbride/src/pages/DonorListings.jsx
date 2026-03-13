import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_LISTINGS, FOOD_EMOJIS, formatTimeLeft, formatRelative } from '../utils/mockData';

export default function DonorListings() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const myListings = MOCK_LISTINGS.filter(l =>
    filter === 'all' ? true : l.status === filter
  );

  const statusCounts = MOCK_LISTINGS.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Listings</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
        <Link to="/donor/create" className="btn btn-primary">
          + New Listing
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Active', count: statusCounts.available || 0, cls: 'available' },
          { label: 'Requested', count: statusCounts.requested || 0, cls: 'requested' },
          { label: 'Collected', count: statusCounts.collected || 0, cls: 'collected' },
        ].map(s => (
          <div key={s.label} className="card card-body" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--green-900)' }}>{s.count}</div>
            <div className="text-muted text-sm" style={{ marginTop: 2 }}><span className={`badge badge-${s.cls}`}>{s.label}</span></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {['all', 'available', 'requested', 'collected', 'expired'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Listing cards */}
      {myListings.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <div className="empty-title">No listings yet</div>
            <div className="empty-desc">Create your first food donation listing and help reduce waste.</div>
            <Link to="/donor/create" className="btn btn-primary" style={{ marginTop: 8 }}>+ Create listing</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myListings.map(listing => {
            const timeLeft = formatTimeLeft(listing.expiresAt);
            return (
              <Link to={`/donor/listing/${listing._id}`} key={listing._id} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
                  <div style={{ width: 88, height: 88, background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
                    {FOOD_EMOJIS[listing.category]}
                  </div>
                  <div style={{ flex: 1, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        <div className="listing-card-title">{listing.title}</div>
                        <div className="listing-card-info" style={{ marginTop: 4 }}>
                          {listing.quantity} {listing.quantityUnit} · {listing.pickupAddress}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <span className={`badge badge-${listing.urgency}`}>
                          {listing.urgency === 'high' ? '🔴' : listing.urgency === 'medium' ? '🟡' : '🟢'} {listing.urgency}
                        </span>
                        <span className={`badge badge-${listing.status}`}>{listing.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <span className={`countdown ${timeLeft.cls}`}>⏱ {timeLeft.label}</span>
                      <span className="text-muted text-sm">Posted {formatRelative(listing.createdAt)}</span>
                      {listing.status === 'requested' && (
                        <span className="badge badge-pending" style={{ marginLeft: 'auto' }}>1 pending request →</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link to="/donor/create" className="fab" title="New listing">+</Link>
    </div>
  );
}
