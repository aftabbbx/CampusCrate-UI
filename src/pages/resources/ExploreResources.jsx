import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Search, Filter, IndianRupee, MapPin } from 'lucide-react';

const ExploreResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await API.get('/resource/all');
        if (res.data.success) {
          setResources(res.data.resources);
        }
      } catch (error) {
        console.error('Failed to fetch resources', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem', marginLeft: '260px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Explore Resources
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Find books, notes, and equipment shared by your campus community.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search resources..." 
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2.25rem', background: 'var(--color-card)',
                border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.8125rem',
                outline: 'none', width: '250px', color: 'var(--color-text)'
              }} 
            />
          </div>
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '0.5rem 0.75rem' }}>
            <Filter style={{ width: '16px', height: '16px' }} /> Filter
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card-lg" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No resources found. Try adjusting your search!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredResources.map((r) => (
            <Link key={r._id} to={`/resource/${r._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Image */}
                <div style={{ height: '180px', background: 'var(--color-bg-alt)', position: 'relative' }}>
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      No Image
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                      background: r.type === 'Paid' ? '#eef2ff' : r.type === 'Exchange' ? '#fef3c7' : '#d1fae5',
                      color: r.type === 'Paid' ? '#4f46e5' : r.type === 'Exchange' ? '#d97706' : '#059669',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>{r.type}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {r.category}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.title}
                  </h3>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
                      {r.price > 0 ? <><IndianRupee style={{ width: '16px', height: '16px' }} />{r.price}</> : 'Free'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-sub)' }}>
                      <MapPin style={{ width: '12px', height: '12px' }} /> {r.location || 'Campus'}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreResources;
