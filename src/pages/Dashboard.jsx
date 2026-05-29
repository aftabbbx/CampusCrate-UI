import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, MessageSquare, TrendingUp, Handshake, ChevronRight, AlertTriangle, CheckCircle, Plus, ArrowRight, Eye } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import toast from 'react-hot-toast';

const CS = {
  primary: '#5B5BD6', primaryHover: '#4338CA', primaryPale: '#EEEEFF',
  bg: '#F8FAFC', card: '#FFFFFF', border: 'rgba(199,196,214,0.35)',
  text: '#0F172A', textSub: '#64748B', textMuted: '#94A3B8',
};

const Badge = ({ children, color, bg }) => (
  <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: bg, color, display: 'inline-flex', alignItems: 'center' }}>
    {children}
  </span>
);

const Dashboard = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCount, setAllCount] = useState(0);

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get('/resource/user/my');
        if (response.data.success) {
          setRecentResources(response.data.resources.slice(0, 6));
          setAllCount(response.data.resources.length);
        }
      } catch (error) {
        if (error.response) toast.error(`Failed to load: ${error.response.data?.message || error.response.status}`);
        else if (error.request) toast.error('Cannot connect to server.');
      } finally { setLoading(false); }
    })();
  }, []);

  const stats = [
    { label: 'My Listings', value: allCount, icon: Package, color: CS.primary, bg: CS.primaryPale, path: '/resources' },
    { label: 'Active', value: recentResources.filter(r => r.status === 'Available').length, icon: TrendingUp, color: '#059669', bg: '#D1FAE5', path: '/resources' },
    { label: 'Exchanges', value: recentResources.filter(r => r.type === 'Exchange').length, icon: Handshake, color: '#D97706', bg: '#FEF3C7', path: '/resources' },
    { label: 'Messages', value: '—', icon: MessageSquare, color: '#3B82F6', bg: '#DBEAFE', path: '/messages' },
  ];

  const typeStyle = (type) => ({
    Paid: { bg: CS.primaryPale, color: CS.primary },
    Free: { bg: '#D1FAE5', color: '#059669' },
    Exchange: { bg: '#FEF3C7', color: '#D97706' },
  }[type] || { bg: '#F1F5F9', color: CS.textSub });

  const statusStyle = (s) => ({
    Available: { bg: '#D1FAE5', color: '#059669' },
    Pending: { bg: '#FEF3C7', color: '#D97706' },
  }[s] || { bg: '#F1F5F9', color: CS.textSub });

  return (
    <UserLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: CS.text, letterSpacing: '-0.02em' }}>
              Good {greeting}, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p style={{ color: CS.textSub, fontSize: 15, marginTop: 6 }}>Here's an overview of your campus activity today.</p>
          </div>
          <button onClick={() => navigate('/add-resource')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: CS.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = CS.primaryHover; e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,91,214,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = CS.primary; e.currentTarget.style.boxShadow = 'none'; }}>
            <Plus style={{ width: 16, height: 16 }} /> Add Resource
          </button>
        </div>

        {/* ═══ PROFILE INCOMPLETE BANNER ═══ */}
        {!isProfileComplete && (
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', borderRadius: 18, background: 'linear-gradient(135deg, rgba(91,91,214,0.06), rgba(193,193,255,0.1))', border: `1px solid rgba(91,91,214,0.15)`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${CS.primary}, #818CF8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(91,91,214,0.25)' }}>
              <AlertTriangle style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: CS.text, marginBottom: 4 }}>Complete Your Profile</p>
              <p style={{ fontSize: 13, color: CS.textSub, lineHeight: 1.5 }}>Add your roll number, course, batch & semester to unlock all features.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {[
                  { field: 'Roll Number', done: !!user?.roll_number },
                  { field: 'Course', done: !!user?.course },
                  { field: 'Batch', done: !!user?.batch },
                  { field: 'Semester', done: !!user?.semester },
                ].map(item => (
                  <span key={item.field} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: item.done ? '#D1FAE5' : '#FFE4E1', color: item.done ? '#059669' : '#DC2626' }}>
                    {item.done ? <CheckCircle style={{ width: 10, height: 10 }} /> : <AlertTriangle style={{ width: 10, height: 10 }} />}
                    {item.field}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/profile" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: CS.primary, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              Complete Profile →
            </Link>
          </div>
        )}

        {/* ═══ STATS GRID ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }} className="db-stats">
          {stats.map((s, i) => (
            <div key={i} onClick={() => navigate(s.path)}
              style={{ background: CS.card, borderRadius: 18, padding: '1.25rem', border: `1px solid ${CS.border}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,91,214,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon style={{ width: 18, height: 18, color: s.color }} />
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: CS.textMuted }} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: CS.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: CS.textSub, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ MY RESOURCES TABLE ═══ */}
        <div style={{ background: CS.card, borderRadius: 20, border: `1px solid ${CS.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${CS.border}` }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: CS.text }}>My Resources</h3>
              <p style={{ fontSize: 13, color: CS.textSub, marginTop: 2 }}>Your recent listings and their status</p>
            </div>
            <button onClick={() => navigate('/resources')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', fontSize: 13, color: CS.primary, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${CS.border}` }}>
                  {['Resource', 'Category', 'Type', 'Price', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: CS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: CS.textMuted }}>
                    <div style={{ width: 32, height: 32, border: `3px solid #E2DFFF`, borderTopColor: CS.primary, borderRadius: '50%', animation: 'dbSpin 0.7s linear infinite', margin: '0 auto 8px' }} />
                    Loading...
                  </td></tr>
                ) : recentResources.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Package style={{ width: 36, height: 36, color: '#C1C1FF', margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ color: CS.textMuted, fontSize: 14 }}>No resources yet.</p>
                    <button onClick={() => navigate('/add-resource')}
                      style={{ marginTop: 12, padding: '8px 18px', background: CS.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Add First Resource
                    </button>
                  </td></tr>
                ) : recentResources.map((r, i) => {
                  const ts = typeStyle(r.type);
                  const ss = statusStyle(r.status);
                  return (
                    <tr key={r._id || i}
                      onClick={() => navigate(`/resource/${r._id}`)}
                      style={{ borderBottom: i < recentResources.length - 1 ? `1px solid ${CS.border}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8F7FF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: CS.text, maxWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: CS.primaryPale, overflow: 'hidden', flexShrink: 0 }}>
                            {r.image_url ? <img src={r.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package style={{ width: 16, height: 16, color: CS.primary, margin: '10px auto', display: 'block' }} />}
                          </div>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: CS.textSub }}>{r.category}</td>
                      <td style={{ padding: '12px 16px' }}><Badge color={ts.color} bg={ts.bg}>{r.type}</Badge></td>
                      <td style={{ padding: '12px 16px', color: CS.text, fontWeight: 600 }}>{r.price > 0 ? `₹${r.price}` : 'Free'}</td>
                      <td style={{ padding: '12px 16px' }}><Badge color={ss.color} bg={ss.bg}>{r.status}</Badge></td>
                      <td style={{ padding: '12px 16px' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, background: CS.primaryPale, color: CS.primary, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Eye style={{ width: 12, height: 12 }} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <style>{`@keyframes dbSpin { to { transform: rotate(360deg); } } @media(max-width:900px){.db-stats{grid-template-columns:repeat(2,1fr)!important;}} @media(max-width:480px){.db-stats{grid-template-columns:1fr!important;}}`}</style>
    </UserLayout>
  );
};

export default Dashboard;
