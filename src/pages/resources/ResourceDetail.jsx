import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useProfileGate from '../../hooks/useProfileGate';
import UserLayout from '../../components/UserLayout';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, ShieldCheck, Tag, Clock, MessageSquare,
  ChevronRight, Package, IndianRupee, CheckCircle2, AlertTriangle, Heart,
} from 'lucide-react';

const CS = {
  primary: '#5B5BD6', primaryHover: '#4338CA', primaryPale: '#EEEEFF',
  bg: '#F8FAFC', card: '#FFFFFF', border: 'rgba(199,196,214,0.35)',
  text: '#0F172A', textSub: '#64748B', textMuted: '#94A3B8',
};

// ─── Wishlist Button Component ───────────────────────────────────────
const WishlistButton = ({ resourceId }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(resourceId);

  return (
    <button onClick={() => toggleWishlist(resourceId)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '13px', border: `2px solid ${wishlisted ? '#ef4444' : CS.border}`,
        borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all 0.2s',
        background: wishlisted ? '#FEF2F2' : CS.card,
        color: wishlisted ? '#ef4444' : CS.textSub,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <Heart style={{ width: 18, height: 18, fill: wishlisted ? '#ef4444' : 'none' }} />
      {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
    </button>
  );
};

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { guardAction } = useProfileGate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/resource/${id}`);
        if (res.data.success) setResource(res.data.resource);
      } catch {
        toast.error('Resource not found');
        navigate('/resources');
      } finally { setLoading(false); }
    })();
  }, [id, navigate]);

  const handleMessageSeller = () => {
    guardAction(async () => {
      if (!resource?.owner_id?._id) return;
      if (resource.owner_id._id === user?._id) { toast.error("You can't message yourself!"); return; }
      setMessageSending(true);
      try {
        await API.post('/message/send', {
          receiver_id: resource.owner_id._id,
          message: `Hi! I'm interested in your resource "${resource.title}".`,
          message_type: 'text',
        });
        toast.success('Message sent! Redirecting...');
        navigate('/messages');
      } catch (err) {
        if (err.response?.data?.profileIncomplete) toast.error('Complete your profile first 🔒');
        else navigate('/messages');
      } finally { setMessageSending(false); }
    });
  };

  const typeStyle = (type) => ({
    Free: { bg: '#D1FAE5', color: '#059669' },
    Paid: { bg: CS.primaryPale, color: CS.primary },
    Exchange: { bg: '#FEF3C7', color: '#D97706' },
  }[type] || { bg: '#F1F5F9', color: CS.textSub });

  const timeAgo = (date) => {
    if (!date) return '';
    const d = (Date.now() - new Date(date).getTime()) / 1000;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  if (loading) return (
    <UserLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ width: 40, height: 40, border: `3px solid #E2DFFF`, borderTopColor: CS.primary, borderRadius: '50%', animation: 'rdSpin 0.7s linear infinite' }} />
        <style>{`@keyframes rdSpin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </UserLayout>
  );

  if (!resource) return null;
  const ts = typeStyle(resource.type);
  const isOwner = resource?.owner_id?._id === user?._id;
  const ownerOnline = resource?.owner_id?._id && onlineUsers?.has?.(resource.owner_id._id);

  return (
    <UserLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: CS.card, border: `1px solid ${CS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CS.text, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = CS.primaryPale; e.currentTarget.style.color = CS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = CS.card; e.currentTarget.style.color = CS.text; }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: CS.textMuted }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onClick={() => navigate('/resources')}
              onMouseEnter={e => e.currentTarget.style.color = CS.primary}
              onMouseLeave={e => e.currentTarget.style.color = CS.textMuted}>Resources</span>
            <ChevronRight style={{ width: 13, height: 13 }} />
            <span style={{ color: CS.text, fontWeight: 500 }}>{resource.title}</span>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }} className="rd-grid">

          {/* ─── Left ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Image */}
            <div style={{ background: CS.card, borderRadius: 24, border: `1px solid ${CS.border}`, overflow: 'hidden', position: 'relative', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', gap: 8, position: 'absolute', top: 14, left: 14, zIndex: 2 }}>
                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: resource.status === 'Available' ? '#059669' : '#D97706', border: `1px solid ${resource.status === 'Available' ? '#059669' : '#D97706'}30` }}>
                  <CheckCircle2 style={{ width: 12, height: 12, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />{resource.status}
                </span>
              </div>
              <span style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: ts.bg, color: ts.color }}>
                {resource.type}
              </span>
              {resource.image_url ? (
                <div style={{ position: 'relative', paddingBottom: '60%', background: CS.primaryPale }}>
                  {!imageLoaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: `3px solid #E2DFFF`, borderTopColor: CS.primary, borderRadius: '50%', animation: 'rdSpin 0.7s linear infinite' }} /></div>}
                  <img src={resource.image_url} alt={resource.title} onLoad={() => setImageLoaded(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.4s' }} />
                </div>
              ) : (
                <div style={{ paddingBottom: '60%', position: 'relative', background: `linear-gradient(135deg, ${CS.primaryPale}, #EEF2FF)` }}>
                  <Package style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 56, height: 56, color: CS.primaryLight, opacity: 0.5 }} />
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ background: CS.card, borderRadius: 20, padding: '1.5rem', border: `1px solid ${CS.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: CS.text, marginBottom: '0.875rem' }}>Description</h3>
              <p style={{ color: CS.textSub, fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{resource.description}</p>
            </div>

            {/* Details grid */}
            <div style={{ background: CS.card, borderRadius: 20, padding: '1.5rem', border: `1px solid ${CS.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: CS.text, marginBottom: '1rem' }}>Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {[
                  { icon: Tag, label: 'Category', value: resource.category, color: CS.primary },
                  { icon: ShieldCheck, label: 'Condition', value: resource.condition, color: resource.condition === 'New' ? '#059669' : '#D97706' },
                  { icon: MapPin, label: 'Location', value: resource.location || 'Campus', color: '#3B82F6' },
                  { icon: Clock, label: 'Posted', value: timeAgo(resource.createdAt), color: CS.textSub },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem', borderRadius: 14, background: CS.bg, border: `1px solid ${CS.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon style={{ width: 15, height: 15, color: item.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: CS.textMuted }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: CS.text, marginTop: 2 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right (sticky) ────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Price + CTA card */}
            <div style={{ background: CS.card, borderRadius: 24, padding: '1.75rem', border: `1px solid ${CS.border}`, boxShadow: '0 4px 20px rgba(91,91,214,0.08)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${CS.primaryPale}, transparent)`, pointerEvents: 'none' }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: CS.text, lineHeight: 1.2, marginBottom: '1rem' }}>{resource.title}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: CS.primary, lineHeight: 1 }}>
                  {resource.price > 0 ? <><IndianRupee style={{ width: 22, height: 22, display: 'inline', verticalAlign: 'middle' }} />{resource.price}</> : 'Free'}
                </span>
                {resource.type === 'Exchange' && <span style={{ fontSize: 13, color: CS.textMuted }}>or exchange</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
                {[resource.type, resource.category, resource.condition].map((v, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: CS.primaryPale, color: CS.primary }}>{v}</span>
                ))}
              </div>

              {!isOwner && resource.status === 'Available' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <WishlistButton resourceId={resource._id} />
                <button onClick={handleMessageSeller} disabled={messageSending}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: `linear-gradient(135deg, ${CS.primary}, ${CS.primaryHover})`, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(91,91,214,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  {messageSending
                    ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rdSpin 0.7s linear infinite' }} /> Sending...</>
                    : <><MessageSquare style={{ width: 18, height: 18 }} /> Message Seller</>
                  }
                </button>
                </div>
              )}
              {isOwner && <div style={{ textAlign: 'center', padding: '10px', borderRadius: 12, background: CS.bg, fontSize: 13, color: CS.textSub, fontWeight: 500 }}>This is your listing</div>}
              {!isOwner && resource.status !== 'Available' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#FEF3C7', fontSize: 13, color: '#D97706', fontWeight: 500 }}>
                  <AlertTriangle style={{ width: 15, height: 15 }} /> No longer available
                </div>
              )}
            </div>

            {/* Seller card */}
            <div style={{ background: CS.card, borderRadius: 20, padding: '1.25rem', border: `1px solid ${CS.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: CS.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Listed By</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem', borderRadius: 14, cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => resource.owner_id?.roll_number && navigate(`/profile/${resource.owner_id.roll_number}`)}
                onMouseEnter={e => e.currentTarget.style.background = CS.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${CS.primary}, #818CF8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {resource.owner_id?.profile_image
                      ? <img src={resource.owner_id.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{resource.owner_id?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    }
                  </div>
                  {ownerOnline && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: CS.text, fontSize: 15 }}>{resource.owner_id?.name || 'User'}</div>
                  <div style={{ fontSize: 12, color: ownerOnline ? '#059669' : CS.textMuted, fontWeight: 500 }}>
                    {ownerOnline ? '● Online' : resource.owner_id?.semester ? `Sem ${resource.owner_id.semester}` : 'Student'}
                  </div>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: CS.textMuted }} />
              </div>
            </div>

            {/* Safety notice */}
            <div style={{ display: 'flex', gap: 10, padding: '1rem 1.25rem', borderRadius: 14, background: CS.primaryPale, fontSize: 12, color: CS.textSub, lineHeight: 1.5 }}>
              <ShieldCheck style={{ width: 15, height: 15, color: CS.primary, flexShrink: 0, marginTop: 1 }} />
              Always meet in a safe campus location. Verify items before completing any exchange.
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes rdSpin{to{transform:rotate(360deg);}} @media(max-width:860px){.rd-grid{grid-template-columns:1fr!important;}}`}</style>
    </UserLayout>
  );
};

export default ResourceDetail;
