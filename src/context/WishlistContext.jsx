import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Heart, HeartOff, X } from 'lucide-react';

const WishlistContext = createContext(null);
const LS_KEY = 'cc_wishlist_ids';

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

// ─── Custom Confirm Modal ─────────────────────────────────────────────
const ConfirmModal = ({ config, onClose }) => {
  if (!config) return null;
  const isAdd = config.type === 'add';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      
      {/* Modal */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 400, margin: '1rem',
        background: '#fff', borderRadius: 20, padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 10000,
        animation: 'wishModalIn 0.25s ease-out',
      }}>
        {/* Close */}
        <button onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, width: 28, height: 28,
            borderRadius: '50%', border: 'none', background: '#F1F5F9',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <X style={{ width: 14, height: 14, color: '#64748B' }} />
        </button>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isAdd ? '#FEF2F2' : '#F1F5F9',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.75rem',
          }}>
            {isAdd ? (
              <Heart style={{ width: 26, height: 26, color: '#ef4444' }} />
            ) : (
              <HeartOff style={{ width: 26, height: 26, color: '#64748B' }} />
            )}
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {isAdd ? 'Add to Wishlist?' : 'Remove from Wishlist?'}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            {isAdd
              ? 'This item will be saved to your wishlist. You can access it anytime from your profile.'
              : 'This item will be removed from your wishlist. You can always add it back later.'}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose}
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: 12,
              border: '1px solid #E2E8F0', background: '#fff',
              color: '#64748B', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>
          <button onClick={config.onConfirm}
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: 12,
              border: 'none',
              background: isAdd ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#64748B',
              color: '#fff', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              boxShadow: isAdd ? '0 4px 14px rgba(239,68,68,0.3)' : '0 4px 14px rgba(100,116,139,0.2)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            {isAdd ? '❤️ Add to Wishlist' : 'Remove'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes wishModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────
export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_KEY)) || []); }
    catch { return new Set(); }
  });
  const pendingRef = useRef(new Set());
  const [confirmConfig, setConfirmConfig] = useState(null);

  // Fetch wishlist IDs from backend on login
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setWishlistIds(new Set());
      localStorage.removeItem(LS_KEY);
      return;
    }
    const fetchIds = async () => {
      try {
        const res = await API.get('/wishlist/ids');
        if (res.data.success) {
          const ids = new Set(res.data.ids);
          setWishlistIds(ids);
          localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
        }
      } catch (_) {}
    };
    fetchIds();
  }, [isAuthenticated, token]);

  // Internal API call (after confirmation)
  const executeToggle = useCallback(async (resourceId, wasWishlisted) => {
    // Optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (wasWishlisted) next.delete(resourceId);
      else next.add(resourceId);
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return next;
    });

    try {
      const res = await API.post(`/wishlist/toggle/${resourceId}`);
      if (res.data.success) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (res.data.wishlisted) next.add(resourceId);
          else next.delete(resourceId);
          localStorage.setItem(LS_KEY, JSON.stringify([...next]));
          return next;
        });

        if (res.data.wishlisted) {
          toast.success('Added to wishlist ❤️');
        } else {
          toast('Removed from wishlist', {
            icon: '💔',
            style: { background: '#FEF2F2', color: '#991B1B', fontWeight: 600 },
          });
        }
      }
    } catch (err) {
      // Revert
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.add(resourceId);
        else next.delete(resourceId);
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
        return next;
      });
      const msg = err?.response?.data?.message || 'Failed to update wishlist';
      toast.error(msg);
    } finally {
      pendingRef.current.delete(resourceId);
    }
  }, []);

  // Show confirm modal, then execute
  const toggleWishlist = useCallback((resourceId) => {
    if (pendingRef.current.has(resourceId)) return;

    const wasWishlisted = wishlistIds.has(resourceId);

    setConfirmConfig({
      type: wasWishlisted ? 'remove' : 'add',
      onConfirm: () => {
        pendingRef.current.add(resourceId);
        setConfirmConfig(null);
        executeToggle(resourceId, wasWishlisted);
      },
    });
  }, [wishlistIds, executeToggle]);

  const isWishlisted = useCallback((resourceId) => wishlistIds.has(resourceId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistCount: wishlistIds.size, isWishlisted, toggleWishlist }}>
      {children}
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </WishlistContext.Provider>
  );
};
