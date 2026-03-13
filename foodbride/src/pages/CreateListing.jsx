import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['cooked', 'raw', 'packaged', 'bakery', 'other'];
const STORAGE = ['room_temp', 'refrigerated', 'frozen'];
const UNITS = ['servings', 'kg'];

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'cooked', quantity: '', quantityUnit: 'servings',
    preparedAt: '', storageType: 'room_temp', pickupAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/donor'), 1500);
  };

  if (success) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--green-900)', marginBottom: 8 }}>Listing created!</h2>
          <p className="text-muted">Nearby NGOs will be notified. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">New Listing</h1>
          <p className="page-subtitle">List surplus food for pickup in under 2 minutes.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Food Details</div>

          <div className="form-group">
            <label className="form-label">Food Title *</label>
            <input className="form-input" placeholder="e.g. Leftover Biryani" value={form.title} onChange={set('title')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Any extra details — quantity, allergies, packaging…" value={form.description} onChange={set('description')} maxLength={500} />
            <span className="form-hint">{form.description.length}/500</span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Type *</label>
              <select className="form-select" value={form.storageType} onChange={set('storageType')}>
                <option value="room_temp">Room Temperature</option>
                <option value="refrigerated">Refrigerated</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input type="number" className="form-input" placeholder="e.g. 30" min="1" value={form.quantity} onChange={set('quantity')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select className="form-select" value={form.quantityUnit} onChange={set('quantityUnit')}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Shelf Life & Pickup</div>

          <div className="form-group">
            <label className="form-label">Prepared / Packed At *</label>
            <input type="datetime-local" className="form-input" value={form.preparedAt} onChange={set('preparedAt')} required />
            <span className="form-hint">Used to automatically compute urgency and expiry.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Address *</label>
            <input className="form-input" placeholder="Full address for NGO pickup" value={form.pickupAddress} onChange={set('pickupAddress')} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)} style={{ flex: '0 0 auto' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Publishing…' : '🌱 Publish listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
