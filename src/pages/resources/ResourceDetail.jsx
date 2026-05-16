import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { ArrowLeft, User, MapPin, Calendar, Clock, IndianRupee, Tag, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

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
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/dashboard" style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-card)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)',
            border: '1px solid var(--color-border)', textDecoration: 'none'
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Resource Details
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Image */}
          <div>
            <div className="card-lg" style={{ overflow: 'hidden', padding: 0, height: '400px', background: 'var(--color-bg-alt)' }}>
              {resource.image_url ? (
                <img src={resource.image_url} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  <Tag style={{ width: '48px', height: '48px', opacity: 0.2 }} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Seller Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Title & Price Card */}
            <div className="card-lg" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: resource.type === 'Paid' ? '#eef2ff' : resource.type === 'Exchange' ? '#fef3c7' : '#d1fae5',
                  color: resource.type === 'Paid' ? '#4f46e5' : resource.type === 'Exchange' ? '#d97706' : '#059669',
                }}>{resource.type}</span>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-sub)'
                }}>{resource.category}</span>
                <span style={{
                  padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: resource.status === 'Available' ? '#d1fae5' : '#e2e8f0',
                  color: resource.status === 'Available' ? '#059669' : '#64748b'
                }}>{resource.status}</span>
              </div>
              
              <h1 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {resource.title}
              </h1>
              
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
                {resource.price > 0 ? <><IndianRupee style={{ width: '24px', height: '24px', marginRight: '2px' }} />{resource.price}</> : 'Free'}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Description</h3>
                <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {resource.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-sub)' }}>
                  <ShieldAlert style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Condition</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>{resource.condition}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-sub)' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Location</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>{resource.location || 'Campus'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)' }}>Listed By</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {resource.owner_id?.profile_image ? (
                      <img src={resource.owner_id.profile_image} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                        {resource.owner_id?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1.05rem' }}>{resource.owner_id?.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-sub)' }}>{resource.owner_id?.semester || 'Student'}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/messages')} className="btn btn-brand" style={{ width: '100%', marginTop: '0.5rem' }}>
                Message Seller
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResourceDetail;
