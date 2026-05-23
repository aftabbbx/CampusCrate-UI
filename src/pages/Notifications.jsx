import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Handshake, CheckCheck, Check, Trash2 } from 'lucide-react';
import API from '../api/axios';
import UserLayout from '../components/UserLayout';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clearNotificationCount } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notification/all');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notification/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notification/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      clearNotificationCount();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotifStyle = (type) => {
    switch (type) {
      case 'message': return { bg: '#eef2ff', color: '#4f46e5', Icon: MessageCircle };
      case 'request': return { bg: '#fef3c7', color: '#d97706', Icon: Handshake };
      case 'deal': return { bg: '#d1fae5', color: '#059669', Icon: CheckCheck };
      default: return { bg: '#f1f5f9', color: '#64748b', Icon: Bell };
    }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <UserLayout>
      <div style={{ padding: '2rem 1.5rem', maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div className="anim-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Notifications
            </h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-ghost" style={{ fontSize: '0.8125rem', gap: '0.375rem' }}>
              <CheckCheck style={{ width: '15px', height: '15px' }} /> Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="card anim-up" style={{ animationDelay: '0.08s', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Bell style={{ width: '28px', height: '28px', color: 'var(--color-brand)' }} />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem' }}>No notifications yet</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>When someone interacts with your resources, you'll see it here</p>
            </div>
          ) : (
            notifications.map((n) => {
              const { bg, color, Icon } = getNotifStyle(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => !n.is_read && markAsRead(n._id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--color-border-light)',
                    background: n.is_read ? 'transparent' : 'var(--color-brand-pale)',
                    cursor: n.is_read ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (n.is_read) e.currentTarget.style.background = 'var(--color-bg)'; }}
                  onMouseLeave={(e) => { if (n.is_read) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="notif-icon" style={{ background: bg }}>
                    <Icon style={{ width: '16px', height: '16px', color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{n.title}</span>
                      {!n.is_read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-brand)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)', marginTop: '0.125rem', lineHeight: 1.4 }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.375rem', display: 'inline-block' }}>{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Notifications;
