import { useState } from 'react';
import { MOCK_NOTIFICATIONS, NOTIF_ICONS, formatRelative } from '../utils/mockData';

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && <p className="page-subtitle">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">All caught up!</div>
            <div className="empty-desc">No notifications yet.</div>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif._id}
              className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => markRead(notif._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notif-icon">{NOTIF_ICONS[notif.type] || '📢'}</div>
              <div className="notif-content">
                <div className="notif-title">{notif.title}</div>
                <div className="notif-body">{notif.body}</div>
                <div className="notif-time">{formatRelative(notif.createdAt)}</div>
              </div>
              {!notif.isRead && <div className="notif-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
