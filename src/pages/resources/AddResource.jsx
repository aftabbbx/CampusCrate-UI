import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import useProfileGate from '../../hooks/useProfileGate';
import {
  ArrowLeft, Upload, Package, FileText, Tag,
  IndianRupee, MapPin, CheckCircle, Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddResource = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isProfileComplete, guardAction } = useProfileGate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'Paid',
    price: '',
    condition: 'Used',
    location: ''
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['Book', 'Notes', 'Stationery', 'Project', 'Other'];
  const types = ['Free', 'Paid', 'Exchange'];
  const conditions = ['New', 'Used'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    guardAction(async () => {
      if (!formData.title || !formData.category || !formData.description) {
        toast.error('Please fill all required fields');
        return;
      }
      
      if (formData.type === 'Paid' && !formData.price) {
        toast.error('Please enter a price');
        return;
      }

      setIsLoading(true);
      let imageUrl = '';

      try {
        // 1. Upload Image to Cloudinary if selected
        if (image) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);
          
          const uploadRes = await API.post('/resource/upload', imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          if (uploadRes.data.success) {
            imageUrl = uploadRes.data.image_url;
          } else {
            throw new Error('Image upload failed');
          }
        }

        // 2. Create Resource
        const resourceData = {
          ...formData,
          price: formData.type === 'Paid' ? Number(formData.price) : 0,
          image_url: imageUrl
        };

        const res = await API.post('/resource/create', resourceData);
        
        if (res.data.success) {
          toast.success('Resource added successfully! 🎉');
          navigate('/dashboard');
        }
      } catch (error) {
        if (error.response?.data?.profileIncomplete) {
          toast.error('Complete your profile to unlock this feature 🔒');
        } else {
          console.error('Error adding resource:', error);
          toast.error(error.response?.data?.message || 'Failed to add resource');
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/dashboard" style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-card)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)',
            border: '1px solid var(--color-border)', textDecoration: 'none'
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Add New Resource
            </h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              List your books, notes, or items for other students.
            </p>
          </div>
        </div>

        {/* Profile Incomplete Banner */}
        {!isProfileComplete && (
          <div style={{
            marginBottom: '1.25rem', padding: '1rem 1.25rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a33)', border: '1px solid #fde68a',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#92400e', marginBottom: '0.125rem' }}>
                Profile Incomplete
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a16207', lineHeight: 1.4 }}>
                Complete your profile (roll number, course, batch, semester) before listing a resource.
              </p>
            </div>
            <Link to="/profile" style={{
              padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.75rem',
              fontWeight: 600, background: '#d97706', color: 'white', textDecoration: 'none',
              whiteSpace: 'nowrap', transition: 'opacity 0.2s',
            }}>Complete Profile</Link>
          </div>
        )}

        <div className="card-lg" style={{ overflow: 'hidden' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                {/* Left Column: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Title */}
                  <div>
                    <label className="form-label">Resource Title *</label>
                    <div className="form-group" style={{ position: 'relative' }}>
                      <Package className="form-icon" />
                      <input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Advanced Engineering Mathematics" className="form-input" required />
                    </div>
                  </div>

                  {/* Category & Condition */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label">Category *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" style={{ paddingLeft: '1rem', cursor: 'pointer', appearance: 'none' }} required>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Condition *</label>
                      <select name="condition" value={formData.condition} onChange={handleInputChange} className="form-input" style={{ paddingLeft: '1rem', cursor: 'pointer', appearance: 'none' }}>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Type & Price */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label">Listing Type *</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="form-input" style={{ paddingLeft: '1rem', cursor: 'pointer', appearance: 'none' }}>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Price (₹) {formData.type !== 'Paid' && '(Optional)'}</label>
                      <div className="form-group" style={{ position: 'relative' }}>
                        <IndianRupee className="form-icon" style={{ width: '16px', height: '16px' }} />
                        <input 
                          name="price" type="number" min="0" value={formData.price} onChange={handleInputChange} 
                          placeholder={formData.type === 'Paid' ? 'e.g. 250' : '0'} 
                          className="form-input" disabled={formData.type === 'Free'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="form-label">Location on Campus (Optional)</label>
                    <div className="form-group" style={{ position: 'relative' }}>
                      <MapPin className="form-icon" />
                      <input name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Library Cafe, Block B" className="form-input" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="form-label">Description *</label>
                    <div className="form-group" style={{ position: 'relative' }}>
                      <FileText style={{ position: 'absolute', left: '0.8125rem', top: '0.875rem', width: '18px', height: '18px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                      <textarea 
                        name="description" value={formData.description} onChange={handleInputChange} 
                        placeholder="Describe the item, edition, any highlights or missing pages..." 
                        className="form-input" style={{ minHeight: '120px', padding: '0.6875rem 0.875rem 0.6875rem 2.625rem', resize: 'vertical' }} required 
                      />
                    </div>
                  </div>

                </div>

                {/* Right Column: Image Upload */}
                <div>
                  <label className="form-label">Resource Image</label>
                  
                  <input 
                    type="file" ref={fileInputRef} onChange={handleImageChange} 
                    accept="image/*" style={{ display: 'none' }} 
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    style={{ 
                      border: '2px dashed var(--color-border)', borderRadius: '1rem', height: '260px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--color-input)', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                      transition: 'border-color 0.2s', ...(!imagePreview && { ':hover': { borderColor: 'var(--color-brand)' } })
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} 
                          onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                          <span style={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Upload style={{ width: '18px', height: '18px' }} /> Change Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                          <ImageIcon style={{ width: '24px', height: '24px', color: 'var(--color-brand)' }} />
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Click to upload image</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>JPG, PNG or WEBP (max. 5MB)</p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-brand-pale)', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Tag style={{ width: '20px', height: '20px', color: 'var(--color-brand)', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand)', marginBottom: '0.125rem' }}>Pro Tip for Sellers</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-sub)', lineHeight: 1.5 }}>
                        Listings with clear, well-lit photos are 3x more likely to sell quickly. Make sure the cover and any defects are visible.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
            
            {/* Footer / Submit */}
            <div style={{ padding: '1.25rem 2rem', background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Link to="/dashboard" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
              <button type="submit" disabled={isLoading} className="btn btn-brand" style={{ width: 'auto' }}>
                {isLoading ? (
                  <><div className="spinner" /> Publishing...</>
                ) : (
                  <><CheckCircle style={{ width: '16px', height: '16px' }} /> List Resource</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AddResource;
