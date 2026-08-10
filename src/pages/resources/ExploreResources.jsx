import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Search, IndianRupee, MapPin, Package, Heart, SlidersHorizontal } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

const CS = {
  primary: '#215E61', primaryPale: '#E6EEEE', primaryLight: 'rgba(33,94,97,0.18)',
  accent: '#FF9E20', accentHover: '#D98212', accentPale: 'rgba(255,158,32,0.12)',
  bg: '#F4F2F2', card: '#FFFFFF', border: 'rgba(29,33,40,0.09)',
  text: '#1D2128', textSub: 'rgba(29,33,40,0.72)', textMuted: 'rgba(29,33,40,0.68)',
};

const CATEGORIES = ['All', 'Book', 'Notes', 'Stationery', 'Project', 'Other'];
const TYPES = ['All', 'Free', 'Paid', 'Exchange'];

const ExploreResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const { isWishlisted, toggleWishlist: ctxToggle } = useWishlist();

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/resource/all');
        if (res.data.success) setResources(res.data.resources);
      } catch (error) {
        if (error.response) toast.error(`Failed to load: ${error.response.data?.message || error.response.status}`);
        else if (error.request) toast.error('Cannot connect to server.');
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = resources.filter(r => {
    const matchSearch = !search.trim() || r.title?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchType = activeType === 'All' || r.type === activeType;
    return matchSearch && matchCat && matchType;
  });

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    ctxToggle(id);
  };

  const typeStyle = (type) => ({
    Free: { bg: '#D1FAE5', color: '#059669' },
    Paid: { bg: CS.primaryPale, color: CS.primary },
    Exchange: { bg: '#FEF3C7', color: '#D97706' },
  }[type] || { bg: '#F1F5F9', color: CS.textSub });

  return (
    <UserLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: CS.text, letterSpacing: '-0.02em' }}>Explore Resources</h1>
          <p style={{ color: CS.textSub, fontSize: 15, marginTop: 6 }}>
            {loading ? 'Loading...' : `${filtered.length} resource${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* ═══ SEARCH + FILTERS ═══ */}
        <div style={{ background: CS.card, borderRadius: 20, padding: '1.25rem 1.5rem', border: `1px solid ${CS.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '1.5rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: CS.textMuted, pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or category..."
              style={{ width: '100%', padding: '10px 16px 10px 42px', background: '#F5F2FD', border: `1px solid ${CS.border}`, borderRadius: 12, fontSize: 14, color: CS.text, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.border = `1.5px solid ${CS.primary}`; e.target.style.boxShadow = '0 0 0 3px rgba(91,91,214,0.12)'; }}
              onBlur={e => { e.target.style.border = `1px solid ${CS.border}`; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SlidersHorizontal style={{ width: 15, height: 15, color: CS.textSub, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: CS.textSub, fontWeight: 600, marginRight: 4 }}>Category:</span>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', background: activeCategory === cat ? CS.accent : CS.primaryPale, color: activeCategory === cat ? '#fff' : CS.primary }}>
                {cat}
              </button>
            ))}
            <span style={{ fontSize: 12, color: CS.textSub, fontWeight: 600, marginLeft: 8, marginRight: 4 }}>Type:</span>
            {TYPES.map(t => (
              <button key={t} onClick={() => setActiveType(t)}
                style={{ padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', background: activeType === t ? CS.accent : '#F1F5F9', color: activeType === t ? '#fff' : CS.textSub }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ GRID ═══ */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div style={{ width: 40, height: 40, border: `3px solid #E2DFFF`, borderTopColor: CS.accent, borderRadius: '50%', animation: 'erSpin 0.7s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: CS.card, borderRadius: 20, border: `1px solid ${CS.border}` }}>
            <Package style={{ width: 48, height: 48, color: CS.primaryLight, margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: CS.text, marginBottom: 6 }}>No resources found</p>
            <p style={{ fontSize: 14, color: CS.textMuted }}>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="er-grid">
            {filtered.map((r) => {
              const ts = typeStyle(r.type);
              const isSold = r.status === 'Sold';
              return (
                <div key={r._id}
                  onClick={() => !isSold && (window.location.href = `/resource/${r._id}`)}
                  style={{ textDecoration: 'none', cursor: isSold ? 'not-allowed' : 'pointer' }}>
                  <div style={{ background: CS.card, borderRadius: 20, overflow: 'hidden', border: `1px solid ${isSold ? '#FECACA' : CS.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', height: '100%', opacity: isSold ? 0.65 : 1, filter: isSold ? 'grayscale(40%)' : 'none' }}
                    onMouseEnter={e => { if (!isSold) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(91,91,214,0.12)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; }}>
                    {/* Image */}
                    <div style={{ position: 'relative', aspectRatio: '4/3', background: CS.primaryPale, overflow: 'hidden' }}>
                      {r.image_url
                        ? <img src={r.image_url} alt={r.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package style={{ width: 32, height: 32, color: CS.primaryLight }} /></div>
                      }
                      {/* Sold overlay */}
                      {isSold && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(153,27,27,0.12)' }}>
                          <span style={{ padding: '6px 20px', borderRadius: 9999, background: '#991B1B', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(153,27,27,0.4)' }}>SOLD</span>
                        </div>
                      )}
                      {!isSold && (
                        <button onClick={e => toggleWishlist(r._id, e)}
                          style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
                          <Heart style={{ width: 15, height: 15, color: isWishlisted(r._id) ? '#ef4444' : CS.textSub, fill: isWishlisted(r._id) ? '#ef4444' : 'none' }} />
                        </button>
                      )}
                      <span style={{ position: 'absolute', bottom: 10, left: 10, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: ts.bg, color: ts.color }}>
                        {r.type}
                      </span>
                    </div>
                    {/* Body */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isSold ? CS.textMuted : CS.primary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{r.category}</span>
                      <h3 style={{ fontWeight: 700, fontSize: 14, color: CS.text, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>{r.title}</h3>
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${CS.border}`, gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: isSold ? CS.textSub : CS.accent, flexShrink: 0 }}>
                          {r.price > 0 ? <><IndianRupee style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle' }} />{r.price}</> : 'Free'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: CS.textMuted, overflow: 'hidden', maxWidth: 120, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          <MapPin style={{ width: 11, height: 11, flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.location || 'Campus'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes erSpin{to{transform:rotate(360deg);}} @media(max-width:1024px){.er-grid{grid-template-columns:repeat(3,1fr)!important;}} @media(max-width:768px){.er-grid{grid-template-columns:repeat(2,1fr)!important;}} @media(max-width:480px){.er-grid{grid-template-columns:1fr!important;}}`}</style>
    </UserLayout>
  );
};

export default ExploreResources;
