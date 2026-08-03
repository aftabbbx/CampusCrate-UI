import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Handshake, CheckCheck, Trash2 } from 'lucide-react';
import API from '../api/axios';
import UserLayout from '../components/UserLayout';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const CS = {
  primary: '#215E61', primaryPale: '#E6EEEE',
  bg: '#F4F2F2', card: '#FFFFFF', border: 'rgba(29,33,40,0.09)',
  text: '#1D2128', textSub: 'rgba(29,33,40,0.72)', textMuted: 'rgba(29,33,40,0.68)',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clearNotificationCount } = useSocket();

  useEffect(() => {
    fetchNotifications();
    // Mark all as read on backend immediately when page opens
    API.put('/notification/read-all').catch(() => {});
    // Clear badge immediately
    clearNotificationCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notification/all');
      if (res.data.success) setNotifications(res.data.notifications.map(n => ({ ...n, is_read: true })));
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notification/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notification/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      clearNotificationCount();
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const getStyle = (type) => ({
    message: { bg: CS.primaryPale, color: CS.primary, Icon: MessageCircle },
    request: { bg: '#FEF3C7', color: '#D97706', Icon: Handshake },
    deal:    { bg: '#D1FAE5', color: '#059669', Icon: CheckCheck },
  }[type] || { bg: '#F1F5F9', color: CS.textSub, Icon: Bell });

  const timeAgo = (date) => {
    const d = (Date.now() - new Date(date).getTime()) / 1000;
    if (d < 60) return 'Just now';
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <UserLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: CS.text, letterSpacing: '-0.02em' }}>Notifications</h1>
            <p style={{ fontSize: 14, color: CS.textSub, marginTop: 6 }}>
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up! 🎉'}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: `1px solid ${CS.border}`, borderRadius: 12, background: CS.card, fontSize: 13, fontWeight: 600, color: CS.textSub, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = CS.primaryPale; e.currentTarget.style.color = CS.primary; e.currentTarget.style.borderColor = CS.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = CS.card; e.currentTarget.style.color = CS.textSub; e.currentTarget.style.borderColor = CS.border; }}>
              <CheckCheck style={{ width: 14, height: 14 }} /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ background: CS.card, borderRadius: 24, border: `1px solid ${CS.border}`, boxShadow: '0 4px 20px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: `3px solid #E2DFFF`, borderTopColor: CS.primary, borderRadius: '50%', animation: 'nfSpin 0.7s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: CS.textMuted, fontSize: 13 }}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: CS.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Bell style={{ width: 28, height: 28, color: CS.primary }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, color: CS.text, marginBottom: 6 }}>No notifications yet</p>
              <p style={{ fontSize: 13, color: CS.textMuted }}>When someone interacts with your resources, you'll see it here</p>
            </div>
          ) : notifications.map((n, idx) => {
            const { bg, color, Icon } = getStyle(n.type);
            return (
              <div key={n._id}
                onClick={() => !n.is_read && markAsRead(n._id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '1rem 1.5rem', borderBottom: idx < notifications.length - 1 ? `1px solid ${CS.border}` : 'none', background: n.is_read ? 'transparent' : '#F8F7FF', cursor: n.is_read ? 'default' : 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (n.is_read) e.currentTarget.style.background = CS.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.is_read ? 'transparent' : '#F8F7FF'; }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 18, height: 18, color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: CS.text }}>{n.title}</span>
                    {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: CS.primary, flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: CS.textSub, marginTop: 3, lineHeight: 1.5 }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: CS.textMuted, marginTop: 5, display: 'inline-block' }}>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes nfSpin{to{transform:rotate(360deg);}}`}</style>
    </UserLayout>
  );
};

export default Notifications;
