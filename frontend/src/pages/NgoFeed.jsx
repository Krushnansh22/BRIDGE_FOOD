import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_LISTINGS, FOOD_EMOJIS, formatTimeLeft, formatRelative } from '../utils/mockData';

const DISTANCES = { lst1: '1.2 km', lst2: '2.1 km', lst3: '3.4 km', lst4: '0.8 km', lst5: '5.1 km' };

export default function NgoFeed() {
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const available = MOCK_LISTINGS.filter(l => l.status === 'available' || l.status === 'requested');

  const filtered = available.filter(l => {
    if (urgencyFilter !== 'all' && l.urgency !== urgencyFilter) return false;
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.urgencyScore - a.urgencyScore);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Nearby Food</h1>
          <p className="page-subtitle">{sorted.length} listings within 10 km · sorted by urgency</p>
        </div>
      </div>

      {/* Urgency filter */}
      <div className="filter-tabs">
        {[
          { key: 'all', label: 'All listings' },
          { key: 'high', label: '🔴 High urgency' },
          { key: 'medium', label: '🟡 Medium' },
          { key: 'low', label: '🟢 Low' },
        ].map(f => (
          <button key={f.key} className={`filter-tab ${urgencyFilter === f.key ? 'active' : ''}`} onClick={() => setUrgencyFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="filter-tabs" style={{ marginTop: -10 }}>
        {['all', 'cooked', 'raw', 'packaged', 'bakery', 'other'].map(c => (
          <button key={c} className={`filter-tab ${categoryFilter === c ? 'active' : ''}`} onClick={() => setCategoryFilter(c)}>
            {c === 'all' ? 'All types' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🌿</div>
            <div className="empty-title">No listings match</div>
            <div className="empty-desc">Try adjusting the filters or check back soon.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {sorted.map(listing => {
            const timeLeft = formatTimeLeft(listing.expiresAt);
            const isRequested = listing.status === 'requested';
            return (
              <Link to={`/ngo/listing/${listing._id}`} key={listing._id} style={{ textDecoration: 'none' }}>
                <div className={`card card-hover listing-card ${isRequested ? 'opacity-60' : ''}`} style={{ opacity: isRequested ? 0.7 : 1 }}>
                  <div className="listing-card-img">{FOOD_EMOJIS[listing.category]}</div>
                  <div className="listing-card-body">
                    <div className="listing-card-meta">
                      <span className={`badge badge-${listing.urgency}`}>
                        {listing.urgency === 'high' ? '🔴' : listing.urgency === 'medium' ? '🟡' : '🟢'} {listing.urgency}
                      </span>
                      {isRequested && <span className="badge badge-requested">Requested</span>}
                    </div>
                    <div className="listing-card-title">{listing.title}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="listing-card-info">📍 {DISTANCES[listing._id] || '~km'} away · {listing.pickupAddress.split(',')[0]}</div>
                      <div className="listing-card-info">🍽 {listing.quantity} {listing.quantityUnit} · {listing.category}</div>
                    </div>
                  </div>
                  <div className="listing-card-footer">
                    <span className={`countdown ${timeLeft.cls}`}>⏱ {timeLeft.label}</span>
                    <span className="text-muted text-sm">{formatRelative(listing.createdAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
