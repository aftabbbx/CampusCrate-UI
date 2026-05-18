import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, MessageSquare, TrendingUp, Handshake, ChevronRight, MoreHorizontal } from 'lucide-react';
import UserLayout from '../components/UserLayout';

const Dashboard = () => {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Total Resources', value: '24', icon: Package, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Active Deals', value: '8', icon: Handshake, color: '#10b981', bg: '#d1fae5' },
    { label: 'Messages', value: '12', icon: MessageSquare, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Views', value: '156', icon: TrendingUp, color: '#3b82f6', bg: '#dbeafe' },
  ];

  const [recentResources, setRecentResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await API.get('/resource/user/my');
        if (response.data.success) {
          setRecentResources(response.data.resources.slice(0, 5)); // Get top 5 of my resources
        }
      } catch (error) {
        console.error('Failed to fetch resources', error);
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  return (
    <UserLayout>
      {/* Page Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        {/* Welcome */}
        <div className="anim-up" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Here's what's happening on your campus today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', animationDelay: '0.08s' }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg }}>
                  <s.icon style={{ width: '18px', height: '18px', color: s.color }} />
                </div>
                <MoreHorizontal style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)', marginTop: '0.125rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Resources Table */}
        <div className="card anim-up" style={{ animationDelay: '0.16s' }}>
          <div style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>My Resources</h3>
            <button onClick={() => window.location.href = '/resources'} style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: 'var(--color-brand)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Title', 'Category', 'Type', 'Price', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingResources ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto 0.5rem' }} />
                      Loading resources...
                    </td>
                  </tr>
                ) : recentResources.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No resources found. Be the first to add one!
                    </td>
                  </tr>
                ) : (
                  recentResources.map((r, i) => (
                    <tr key={i} 
                      onClick={() => window.location.href = `/resource/${r._id}`}
                      style={{ borderBottom: i < recentResources.length - 1 ? '1px solid var(--color-border-light)' : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '0.75rem 1.25rem', fontWeight: 500, color: 'var(--color-text)' }}>{r.title}</td>
                      <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)' }}>{r.category}</td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                          background: r.type === 'Paid' ? '#eef2ff' : r.type === 'Exchange' ? '#fef3c7' : '#d1fae5',
                          color: r.type === 'Paid' ? '#4f46e5' : r.type === 'Exchange' ? '#d97706' : '#059669',
                        }}>{r.type}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-sub)', fontWeight: 500 }}>{r.price > 0 ? `₹${r.price}` : 'Free'}</td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                          background: r.status === 'Available' ? '#d1fae5' : r.status === 'Pending' ? '#fef3c7' : '#e2e8f0',
                          color: r.status === 'Available' ? '#059669' : r.status === 'Pending' ? '#d97706' : '#64748b',
                        }}>{r.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
