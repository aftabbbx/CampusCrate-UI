import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2, Package } from 'lucide-react';
import API from '../api/axios';
import UserLayout from '../components/UserLayout';
import { useWishlist } from '../context/WishlistContext';

const CS = {
  primary: '#FF5C5C', primaryPale: '#FFECEC', primaryHover: '#FF4242',
  bg: '#F6F7FB', card: '#FFFFFF', border: 'rgba(36,43,61,0.07)',
  text: '#242B3D', textSub: '#8A94A6', textMuted: '#AEB6C4',
  danger: '#ef4444', success: '#10b981',
};

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await API.get('/wishlist');
      if (res.data.success) setItems(res.data.wishlist);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleRemove = async (resourceId) => {
    await toggleWishlist(resourceId);
    // After toggle, re-fetch to stay in sync
    setTimeout(async () => {
      try {
        const res = await API.get('/wishlist');
        if (res.data.success) setItems(res.data.wishlist);
      } catch (_) {}
    }, 500);
  };

  const categoryColors = {
    Book: { bg: '#EEF2FF', color: '#4338CA', emoji: '📚' },
    Notes: { bg: '#F0FDF4', color: '#166534', emoji: '📝' },
    Stationery: { bg: '#FFF7ED', color: '#C2410C', emoji: '✏️' },
    Project: { bg: '#FDF2F8', color: '#BE185D', emoji: '🔬' },
    Other: { bg: '#F5F3FF', color: '#7C3AED', emoji: '📦' },
  };

  return (
    <UserLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: CS.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heart style={{ width: 28, height: 28, color: CS.danger, fill: CS.danger }} />
              My Wishlist
            </h1>
            <p style={{ color: CS.textSub, fontSize: '0.9rem', marginTop: 4 }}>
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Link to="/resources"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.625rem 1.5rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600,
              background: CS.primary, color: '#fff', textDecoration: 'none',
              transition: 'all 0.2s', border: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = CS.primaryHover}
            onMouseLeave={e => e.currentTarget.style.background = CS.primary}
          >
            <ShoppingBag style={{ width: 16, height: 16 }} /> Browse More
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ borderColor: CS.border, borderTopColor: CS.primary }} />
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div style={{
            background: CS.card, borderRadius: 20, border: `1px solid ${CS.border}`,
            padding: '4rem 2rem', textAlign: 'center',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <Heart style={{ width: 36, height: 36, color: '#FECACA' }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: CS.text, marginBottom: 8 }}>
              Your wishlist is empty
            </h3>
            <p style={{ color: CS.textSub, fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              Save items you love by tapping the heart icon on any resource. They'll show up here so you can find them easily later.
            </p>
            <Link to="/resources"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.75rem 2rem', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600,
                background: CS.primary, color: '#fff', textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = CS.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background = CS.primary}
            >
              Explore Resources <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && items.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {items.map(item => {
              const r = item.resource;
              if (!r) return null;
              const cat = categoryColors[r.category] || categoryColors.Other;
              const owner = r.owner_id;

              return (
                <Link key={item.resource_id} to={`/resource/${r._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{
                    background: CS.card, borderRadius: 16, border: `1px solid ${CS.border}`,
                    overflow: 'hidden', transition: 'all 0.25s ease',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.04)', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(91,91,214,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.04)'; }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: 180, background: '#F1F5F9', overflow: 'hidden' }}>
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package style={{ width: 48, height: 48, color: '#CBD5E1' }} />
                      </div>
                    )}

                    {/* Remove button */}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.resource_id); }}
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                        border: 'none', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.transform = 'scale(1)'; }}
                      title="Remove from wishlist"
                    >
                      <Heart style={{ width: 18, height: 18, color: CS.danger, fill: CS.danger }} />
                    </button>

                    {/* Category badge */}
                    <span style={{
                      position: 'absolute', top: 12, left: 12,
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: cat.bg, color: cat.color, letterSpacing: '0.02em',
                    }}>
                      {cat.emoji} {r.category}
                    </span>

                    {/* Type badge */}
                    <span style={{
                      position: 'absolute', bottom: 12, left: 12,
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: r.type === 'Free' ? '#D1FAE5' : r.type === 'Exchange' ? '#FEF3C7' : '#EEEEFF',
                      color: r.type === 'Free' ? '#065F46' : r.type === 'Exchange' ? '#92400E' : '#4338CA',
                    }}>
                      {r.type}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1rem 1.125rem' }}>
                    <h3 style={{
                      fontSize: '0.9375rem', fontWeight: 700, color: CS.text,
                      marginBottom: 6, lineHeight: 1.35,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {r.title}
                    </h3>

                    <p style={{
                      fontSize: '0.8rem', color: CS.textSub, marginBottom: 12,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {r.description}
                    </p>

                    {/* Footer: Owner + Price */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${CS.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {owner?.profile_image ? (
                          <img src={owner.profile_image} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: CS.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: CS.primary }}>
                            {owner?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span style={{ fontSize: '0.75rem', color: CS.textSub, fontWeight: 500 }}>
                          {owner?.name || 'Unknown'}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.9375rem', fontWeight: 800,
                        color: r.type === 'Free' ? CS.success : CS.primary,
                      }}>
                        {r.type === 'Free' ? 'Free' : r.type === 'Exchange' ? 'Exchange' : `₹${r.price}`}
                      </span>
                    </div>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Wishlist;
