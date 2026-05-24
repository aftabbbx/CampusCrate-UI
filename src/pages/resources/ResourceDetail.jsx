import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useProfileGate from '../../hooks/useProfileGate';
import UserLayout from '../../components/UserLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, ShieldCheck, Tag, Clock, Eye, Heart, Share2,
  MessageSquare, User, Star, ChevronRight, Package, IndianRupee, Bookmark,
  CheckCircle2, AlertTriangle,
} from 'lucide-react';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { isProfileComplete, guardAction } = useProfileGate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await API.get(`/resource/${id}`);
        if (res.data.success) {
          setResource(res.data.resource);
        }
      } catch (error) {
        console.error('Failed to fetch resource', error);
        toast.error('Resource not found');
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, navigate]);

  // ─── Message Seller: create a conversation & redirect ─────────
  const handleMessageSeller = () => {
    guardAction(async () => {
      if (!resource?.owner_id?._id) return;
      if (resource.owner_id._id === user?._id) {
        toast.error("You can't message yourself!");
        return;
      }

      setMessageSending(true);
      try {
        // Send an intro message to kick off the conversation
        await API.post('/message/send', {
          receiver_id: resource.owner_id._id,
          message: `Hi! I'm interested in your resource "${resource.title}".`,
          message_type: 'text',
        });
        toast.success('Message sent! Redirecting to chat...');
        navigate('/messages');
      } catch (err) {
        if (err.response?.data?.profileIncomplete) {
          toast.error('Complete your profile to unlock this feature 🔒');
        } else {
          // If duplicate conversation exists, just navigate
          navigate('/messages');
        }
      } finally {
        setMessageSending(false);
      }
    });
  };

  const isOwnerOnline = resource?.owner_id?._id && onlineUsers.has(resource.owner_id._id);
  const isOwnResource = resource?.owner_id?._id === user?._id;

  // Helpers
  const getTypeStyle = (type) => {
    switch (type) {
      case 'Free': return { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', label: 'Free' };
      case 'Paid': return { bg: 'linear-gradient(135deg, #eef2ff, #c7d2fe)', color: '#4f46e5', label: 'Paid' };
      case 'Exchange': return { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', label: 'Exchange' };
      default: return { bg: '#f1f5f9', color: '#64748b', label: type };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: '#d1fae5', color: '#059669', icon: CheckCircle2 };
      case 'Pending': return { bg: '#fef3c7', color: '#d97706', icon: Clock };
      case 'Exchanged': return { bg: '#e2e8f0', color: '#64748b', icon: Package };
      default: return { bg: '#f1f5f9', color: '#64748b', icon: Tag };
    }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
        </div>
      </UserLayout>
    );
  }

  if (!resource) return null;

  const typeStyle = getTypeStyle(resource.type);
  const statusStyle = getStatusStyle(resource.status);
  const StatusIcon = statusStyle.icon;

  return (
    <UserLayout>
      <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

        {/* ─── Breadcrumb Nav ─────────────────────────────────────── */}
        <div className="anim-up" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{
            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)',
            border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-brand-pale)'; e.currentTarget.style.color = 'var(--color-brand)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-card)'; e.currentTarget.style.color = 'var(--color-text)'; }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/resources')}>Resources</span>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{resource.title}</span>
          </div>
        </div>

        {/* ─── Main Grid ─────────────────────────────────────────── */}
        <div className="anim-up" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', animationDelay: '0.05s' }}>

          {/* ═══ Left Column ═══════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Image Card */}
            <div className="card-lg" style={{ overflow: 'hidden', position: 'relative', padding: 0 }}>
              {/* Status Badge overlay */}
              <div style={{
                position: 'absolute', top: '1rem', left: '1rem', zIndex: 2,
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                color: statusStyle.color, border: `1px solid ${statusStyle.color}20`,
              }}>
                <StatusIcon style={{ width: '14px', height: '14px' }} />
                {resource.status}
              </div>

              {/* Type Badge overlay */}
              <div style={{
                position: 'absolute', top: '1rem', right: '1rem', zIndex: 2,
                padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                background: typeStyle.bg, color: typeStyle.color,
              }}>
                {resource.type}
              </div>

              {resource.image_url ? (
                <div style={{ position: 'relative', paddingBottom: '65%', background: 'var(--color-bg-alt)' }}>
                  <img
                    src={resource.image_url}
                    alt={resource.title}
                    onLoad={() => setImageLoaded(true)}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      objectFit: 'cover', transition: 'opacity 0.4s ease',
                      opacity: imageLoaded ? 1 : 0,
                    }}
                  />
                  {!imageLoaded && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ paddingBottom: '65%', position: 'relative', background: 'linear-gradient(135deg, var(--color-bg-alt), var(--color-border-light))' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package style={{ width: '56px', height: '56px', color: 'var(--color-text-muted)', opacity: 0.2 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                Description
              </h3>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {resource.description}
              </p>
            </div>

            {/* Details Grid Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '1rem' }}>
                Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: Tag, label: 'Category', value: resource.category, color: '#4f46e5' },
                  { icon: ShieldCheck, label: 'Condition', value: resource.condition, color: resource.condition === 'New' ? '#10b981' : '#f59e0b' },
                  { icon: MapPin, label: 'Location', value: resource.location || 'Campus', color: '#3b82f6' },
                  { icon: Clock, label: 'Posted', value: timeAgo(resource.createdAt), color: '#64748b' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--color-bg)',
                    border: '1px solid var(--color-border-light)',
                  }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}10`, flexShrink: 0 }}>
                      <item.icon style={{ width: '16px', height: '16px', color: item.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--color-text-muted)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginTop: '0.125rem' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ Right Column (Sticky) ═════════════════════════════ */}
          <div style={{ position: 'sticky', top: '76px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Price Card */}
            <div className="card-lg" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.03), rgba(129, 140, 248, 0.05))', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '0.25rem', lineHeight: 1.2 }}>
                {resource.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-brand)', lineHeight: 1 }}>
                  {resource.price > 0 ? `₹${resource.price}` : 'Free'}
                </span>
                {resource.type === 'Exchange' && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>or exchange</span>
                )}
              </div>

              {/* Quick info pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>
                  {resource.type}
                </span>
                <span style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-sub)' }}>
                  {resource.category}
                </span>
                <span style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: resource.condition === 'New' ? '#d1fae5' : '#fef3c7', color: resource.condition === 'New' ? '#059669' : '#d97706' }}>
                  {resource.condition}
                </span>
              </div>

              {/* CTA Button */}
              {!isOwnResource && resource.status === 'Available' && (
                <button
                  onClick={handleMessageSeller}
                  disabled={messageSending}
                  className="btn btn-brand"
                  style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', borderRadius: '0.75rem', gap: '0.5rem' }}
                >
                  {messageSending ? (
                    <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Sending...</>
                  ) : (
                    <><MessageSquare style={{ width: '18px', height: '18px' }} /> Message Seller</>
                  )}
                </button>
              )}
              {isOwnResource && (
                <div style={{ textAlign: 'center', padding: '0.625rem', borderRadius: '0.75rem', background: 'var(--color-bg)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  This is your listing
                </div>
              )}
              {!isOwnResource && resource.status !== 'Available' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem', borderRadius: '0.75rem', background: '#fef3c7', fontSize: '0.8125rem', color: '#d97706', fontWeight: 500 }}>
                  <AlertTriangle style={{ width: '16px', height: '16px' }} />
                  This resource is no longer available
                </div>
              )}
            </div>

            {/* Seller Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Listed By
              </h3>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', padding: '0.75rem', borderRadius: '0.75rem', transition: 'background 0.15s' }}
                onClick={() => resource.owner_id?.roll_number && navigate(`/profile/${resource.owner_id.roll_number}`)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    {resource.owner_id?.profile_image ? (
                      <img src={resource.owner_id.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>
                        {resource.owner_id?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  {isOwnerOnline && <div className="online-dot online-dot-pulse" style={{ border: '2.5px solid var(--color-card)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem' }}>{resource.owner_id?.name || 'User'}</div>
                  <div style={{ fontSize: '0.75rem', color: isOwnerOnline ? '#10b981' : 'var(--color-text-muted)', fontWeight: 500 }}>
                    {isOwnerOnline ? '● Online now' : resource.owner_id?.semester ? `Semester ${resource.owner_id.semester}` : 'Student'}
                  </div>
                </div>
                <ChevronRight style={{ width: '18px', height: '18px', color: 'var(--color-text-muted)' }} />
              </div>

              {resource.owner_id?.bio && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)', marginTop: '0.75rem', padding: '0 0.75rem', lineHeight: 1.5 }}>
                  "{resource.owner_id.bio}"
                </p>
              )}
            </div>

            {/* Safety Notice */}
            <div style={{
              padding: '1rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.75rem',
              background: 'var(--color-bg)', border: '1px solid var(--color-border-light)',
              color: 'var(--color-text-muted)', lineHeight: 1.5,
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
            }}>
              <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--color-brand)', flexShrink: 0, marginTop: '1px' }} />
              <span>Always meet in a safe campus location. Verify items before completing the exchange.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive override for single column on mobile */}
      <style>{`
        @media (max-width: 840px) {
          div[style*="gridTemplateColumns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </UserLayout>
  );
};

export default ResourceDetail;
