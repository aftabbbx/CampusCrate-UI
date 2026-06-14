import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, MessageSquare, TrendingUp, Handshake, AlertTriangle, CheckCircle, Plus, ArrowRight, Eye, Pencil, Trash2, BadgeCheck } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import toast from 'react-hot-toast';

// ─── Theme: Furniture-app ZIP reference (Coral accent + Navy actions) ─
const CS = {
  primary: '#FF5C5C', primaryHover: '#FF4242', primaryPale: '#FFECEC',
  dark: '#242B3D', darkHover: '#1A2030',
  bg: '#F6F7FB', card: '#FFFFFF', border: 'rgba(36,43,61,0.07)',
  text: '#242B3D', textSub: '#8A94A6', textMuted: '#AEB6C4',
};
const FONT = "'Poppins', system-ui, sans-serif";
const SHADOW = '0 8px 24px rgba(36,43,61,0.06)';
const SHADOW_HOVER = '0 14px 34px rgba(36,43,61,0.12)';

const Dashboard = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCount, setAllCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [markingSoldId, setMarkingSoldId] = useState(null);

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

  // ─── Mark as Sold toggle ─────────────────────────────────────────
  const handleMarkSold = async (id, currentStatus, e) => {
    e.stopPropagation();
    if (currentStatus === 'Pending' || currentStatus === 'Exchanged') {
      toast.error(`Cannot mark — resource is currently "${currentStatus}"`);
      return;
    }
    setMarkingSoldId(id);
    try {
      const res = await API.patch(`/resource/${id}/mark-sold`);
      if (res.data.success) {
        toast.success(res.data.message);
        setRecentResources(prev => prev.map(r => r._id === id ? { ...r, status: res.data.resource.status } : r));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setMarkingSoldId(null);
    }
  };

  // ─── Delete (soft) with confirmation modal ───────────────────────
  const handleDelete = (id, title, e) => {
    e.stopPropagation();
    setDeleteModal({ open: true, id, title });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ open: false, id: null, title: '' });
    setDeletingId(id);
    try {
      const res = await API.delete(`/resource/delete/${id}`);
      if (res.data.success) {
        toast.success('Resource deleted!');
        setRecentResources(prev => prev.filter(r => r._id !== id));
        setAllCount(prev => prev - 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = [
    { label: 'My Listings', value: allCount, icon: Package, path: '/resources' },
    { label: 'Active', value: recentResources.filter(r => r.status === 'Available').length, icon: TrendingUp, path: '/resources' },
    { label: 'Exchanges', value: recentResources.filter(r => r.type === 'Exchange').length, icon: Handshake, path: '/resources' },
    { label: 'Messages', value: '—', icon: MessageSquare, path: '/messages' },
  ];

  // Type → coral price line; status → calm pill
  const statusStyle = (s) => ({
    Available: { bg: '#E7F8F0', color: '#0E9F6E' },
    Pending: { bg: '#FFF4E5', color: '#D97706' },
    Exchanged: { bg: '#EEF1F6', color: CS.textSub },
    Sold: { bg: '#FEE2E2', color: '#991B1B' },
  }[s] || { bg: '#EEF1F6', color: CS.textSub });

  return (
    <UserLayout>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: FONT }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: CS.text, letterSpacing: '-0.02em' }}>
              Good {greeting}, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p style={{ color: CS.textSub, fontSize: 14, marginTop: 6 }}>Here's an overview of your campus activity.</p>
          </div>
          <button onClick={() => navigate('/add-resource')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: CS.dark, color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = CS.darkHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = CS.dark; e.currentTarget.style.transform = 'none'; }}>
            <Plus style={{ width: 16, height: 16 }} /> Add Listing
          </button>
        </div>

        {/* ═══ PROFILE INCOMPLETE BANNER ═══ */}
        {!isProfileComplete && (
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', borderRadius: 18, background: CS.primaryPale, border: `1px solid rgba(255,92,92,0.15)`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: CS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                  <span key={item.field} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: item.done ? '#E7F8F0' : '#fff', color: item.done ? '#0E9F6E' : CS.primary }}>
                    {item.done ? <CheckCircle style={{ width: 10, height: 10 }} /> : <AlertTriangle style={{ width: 10, height: 10 }} />}
                    {item.field}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/profile" style={{ padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: CS.dark, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Complete Profile →
            </Link>
          </div>
        )}

        {/* ═══ STATS GRID (calm, coral icon chip) ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.25rem' }} className="db-stats">
          {stats.map((s, i) => (
            <div key={i} onClick={() => navigate(s.path)}
              style={{ background: CS.card, borderRadius: 18, padding: '1.25rem', border: `1px solid ${CS.border}`, cursor: 'pointer', transition: 'all 0.18s', boxShadow: SHADOW }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_HOVER; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: CS.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon style={{ width: 18, height: 18, color: CS.primary }} />
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: CS.textMuted }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: CS.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: CS.textSub, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ MY LISTINGS (card grid) ═══ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: CS.text }}>My Listings</h3>
            <p style={{ fontSize: 13, color: CS.textSub, marginTop: 2 }}>Your recent listings and their status</p>
          </div>
          <button onClick={() => navigate('/resources')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', fontSize: 13, color: CS.primary, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            View all <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {loading ? (
          /* Skeleton cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="db-grid">
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: CS.card, borderRadius: 20, border: `1px solid ${CS.border}`, overflow: 'hidden', boxShadow: SHADOW }}>
                <div style={{ height: 160, background: '#EEF1F6', animation: 'dbPulse 1.2s ease-in-out infinite' }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ height: 14, width: '70%', background: '#EEF1F6', borderRadius: 6, marginBottom: 10, animation: 'dbPulse 1.2s ease-in-out infinite' }} />
                  <div style={{ height: 12, width: '40%', background: '#EEF1F6', borderRadius: 6, animation: 'dbPulse 1.2s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : recentResources.length === 0 ? (
          /* Empty state */
          <div style={{ background: CS.card, borderRadius: 20, border: `1px solid ${CS.border}`, boxShadow: SHADOW, padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: CS.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Package style={{ width: 28, height: 28, color: CS.primary }} />
            </div>
            <p style={{ color: CS.text, fontSize: 16, fontWeight: 600 }}>No listings yet</p>
            <p style={{ color: CS.textSub, fontSize: 13, marginTop: 4 }}>Start by adding your first resource to the campus marketplace.</p>
            <button onClick={() => navigate('/add-resource')}
              style={{ marginTop: 18, padding: '11px 22px', background: CS.dark, color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus style={{ width: 16, height: 16 }} /> Add First Listing
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="db-grid">
            {recentResources.map((r, i) => {
              const ss = statusStyle(r.status);
              const isSold = r.status === 'Sold';
              return (
                <div key={r._id || i}
                  onClick={() => navigate(`/resource/${r._id}`)}
                  style={{
                    background: CS.card, borderRadius: 20, border: `1px solid ${isSold ? '#FECACA' : CS.border}`,
                    overflow: 'hidden', cursor: 'pointer', boxShadow: SHADOW, transition: 'all 0.18s',
                    display: 'flex', flexDirection: 'column',
                    opacity: isSold ? 0.65 : 1,
                    filter: isSold ? 'grayscale(40%)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isSold) { e.currentTarget.style.boxShadow = SHADOW_HOVER; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW; e.currentTarget.style.transform = 'none'; }}>

                  {/* Image */}
                  <div style={{ position: 'relative', height: 160, background: CS.primaryPale }}>
                    {r.image_url
                      ? <img src={r.image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package style={{ width: 32, height: 32, color: CS.primary, opacity: 0.6 }} /></div>}
                    {/* Status pill on image */}
                    <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 11px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>
                      {r.status}
                    </span>
                    {/* Sold overlay banner */}
                    {isSold && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(153,27,27,0.12)' }}>
                        <span style={{ padding: '6px 20px', borderRadius: 9999, background: '#991B1B', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(153,27,27,0.4)' }}>SOLD</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: CS.text, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: isSold ? CS.textSub : CS.primary }}>{r.price > 0 ? `₹${r.price}` : 'Free'}</span>
                      <span style={{ fontSize: 12, color: CS.textMuted }}>·</span>
                      <span style={{ fontSize: 12, color: CS.textSub }}>{r.category}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/resource/${r._id}`); }}
                        title="View"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 10, background: CS.dark, color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Eye style={{ width: 13, height: 13 }} /> View
                      </button>
                      {/* Mark Sold / Mark Available toggle */}
                      <button onClick={(e) => handleMarkSold(r._id, r.status, e)}
                        disabled={markingSoldId === r._id || r.status === 'Pending' || r.status === 'Exchanged'}
                        title={isSold ? 'Mark as Available' : 'Mark as Sold'}
                        style={{ width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: 10, background: isSold ? '#FEE2E2' : '#E7F8F0', color: isSold ? '#991B1B' : '#0E9F6E', border: 'none', cursor: (r.status === 'Pending' || r.status === 'Exchanged') ? 'not-allowed' : 'pointer', opacity: markingSoldId === r._id ? 0.5 : 1, transition: 'all 0.18s' }}>
                        <BadgeCheck style={{ width: 14, height: 14 }} />
                      </button>
                      {!isSold && (
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/add-resource?edit=${r._id}`); }}
                          title="Edit"
                          style={{ width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: 10, background: '#F6F7FB', color: CS.text, border: `1px solid ${CS.border}`, cursor: 'pointer' }}>
                          <Pencil style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                      <button onClick={(e) => handleDelete(r._id, r.title, e)} disabled={deletingId === r._id}
                        title="Delete"
                        style={{ width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: 10, background: CS.primaryPale, color: CS.primary, border: 'none', cursor: 'pointer', opacity: deletingId === r._id ? 0.5 : 1 }}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        @keyframes dbPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @media(max-width:900px){ .db-stats{grid-template-columns:repeat(2,1fr)!important;} .db-grid{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:560px){ .db-stats{grid-template-columns:repeat(2,1fr)!important;} .db-grid{grid-template-columns:1fr!important;} }
      `}</style>

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {deleteModal.open && (
        <div onClick={() => setDeleteModal({ open: false, id: null, title: '' })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(36,43,61,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(36,43,61,0.25)', animation: 'modalIn 0.2s ease', fontFamily: FONT }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: CS.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Trash2 style={{ width: 24, height: 24, color: CS.primary }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: CS.text, textAlign: 'center', marginBottom: 8 }}>Delete Listing?</h3>
            <p style={{ fontSize: 14, color: CS.textSub, textAlign: 'center', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: CS.text }}>"{deleteModal.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button onClick={() => setDeleteModal({ open: false, id: null, title: '' })}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: `1px solid ${CS.border}`, background: CS.bg, color: CS.textSub, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: CS.primary, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default Dashboard;
