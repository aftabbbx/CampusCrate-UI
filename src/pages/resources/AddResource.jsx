import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import useProfileGate from '../../hooks/useProfileGate';
import UserLayout from '../../components/UserLayout';
import {
  ArrowLeft, Upload, Package, FileText, Tag,
  IndianRupee, MapPin, CheckCircle, Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CS = {
  primary: '#5B5BD6', primaryHover: '#4338CA', primaryPale: '#EEEEFF',
  bg: '#F8FAFC', card: '#FFFFFF', border: 'rgba(199,196,214,0.35)',
  text: '#0F172A', textSub: '#64748B', textMuted: '#94A3B8',
};

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: CS.textSub, marginBottom: 6 }}>{children}</label>
);

const Input = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: CS.textMuted, pointerEvents: 'none' }} />}
    <input {...props} style={{
      width: '100%', padding: Icon ? '10px 14px 10px 42px' : '10px 14px',
      background: CS.bg, border: `1px solid ${CS.border}`, borderRadius: 12,
      fontSize: 14, color: CS.text, outline: 'none', fontFamily: 'inherit',
      transition: 'all 0.2s', boxSizing: 'border-box', ...props.style
    }}
      onFocus={e => { e.target.style.border = `1.5px solid ${CS.primary}`; e.target.style.boxShadow = '0 0 0 3px rgba(91,91,214,0.1)'; }}
      onBlur={e => { e.target.style.border = `1px solid ${CS.border}`; e.target.style.boxShadow = 'none'; }}
    />
  </div>
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{
    width: '100%', padding: '10px 14px', background: CS.bg,
    border: `1px solid ${CS.border}`, borderRadius: 12, fontSize: 14,
    color: CS.text, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
    appearance: 'none', transition: 'all 0.2s', boxSizing: 'border-box', ...props.style
  }}
    onFocus={e => { e.target.style.border = `1.5px solid ${CS.primary}`; e.target.style.boxShadow = '0 0 0 3px rgba(91,91,214,0.1)'; }}
    onBlur={e => { e.target.style.border = `1px solid ${CS.border}`; e.target.style.boxShadow = 'none'; }}
  >
    {children}
  </select>
);

const AddResource = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isProfileComplete, guardAction } = useProfileGate();

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', type: 'Paid', price: '', condition: 'Used', location: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['Book', 'Notes', 'Stationery', 'Project', 'Other'];
  const types = ['Free', 'Paid', 'Exchange'];
  const conditions = ['New', 'Used'];

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return; }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    guardAction(async () => {
      if (!formData.title || !formData.category || !formData.description) { toast.error('Please fill all required fields'); return; }
      if (formData.type === 'Paid' && !formData.price) { toast.error('Please enter a price'); return; }
      setIsLoading(true);
      let imageUrl = '';
      try {
        if (image) {
          const imgForm = new FormData();
          imgForm.append('image', image);
          const uploadRes = await API.post('/resource/upload', imgForm, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (uploadRes.data.success) imageUrl = uploadRes.data.image_url;
          else throw new Error('Image upload failed');
        }
        const res = await API.post('/resource/create', { ...formData, price: formData.type === 'Paid' ? Number(formData.price) : 0, image_url: imageUrl });
        if (res.data.success) { toast.success('Resource listed! 🎉'); navigate('/dashboard'); }
      } catch (error) {
        if (error.response?.data?.profileIncomplete) toast.error('Complete your profile first 🔒');
        else toast.error(error.response?.data?.message || 'Failed to add resource');
      } finally { setIsLoading(false); }
    });
  };

  return (
    <UserLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '2rem' }}>
          <button onClick={() => navigate(-1)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: CS.card, border: `1px solid ${CS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CS.text, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = CS.primaryPale; e.currentTarget.style.color = CS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = CS.card; e.currentTarget.style.color = CS.text; }}>
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: CS.text, letterSpacing: '-0.02em' }}>List a Resource</h1>
            <p style={{ fontSize: 14, color: CS.textSub, marginTop: 4 }}>Share books, notes, or items with your campus community.</p>
          </div>
        </div>

        {/* Profile incomplete banner */}
        {!isProfileComplete && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: 16, background: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle style={{ width: 20, height: 20, color: '#D97706', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#92400E', marginBottom: 2 }}>Profile Incomplete</p>
              <p style={{ fontSize: 12, color: '#A16207', lineHeight: 1.4 }}>Complete your profile (roll number, course, batch, semester) before listing.</p>
            </div>
            <Link to="/profile" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#D97706', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>Complete Profile</Link>
          </div>
        )}

        {/* Form card */}
        <div style={{ background: CS.card, borderRadius: 24, border: `1px solid ${CS.border}`, boxShadow: '0 4px 24px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="ar-grid">

              {/* ─── Left: Details ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div>
                  <Label>Resource Title *</Label>
                  <Input icon={Package} name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Advanced Engineering Mathematics" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <Label>Category *</Label>
                    <Select name="category" value={formData.category} onChange={handleInputChange} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Condition *</Label>
                    <Select name="condition" value={formData.condition} onChange={handleInputChange}>
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <Label>Listing Type *</Label>
                    <Select name="type" value={formData.type} onChange={handleInputChange}>
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Price (₹) {formData.type !== 'Paid' && '(Optional)'}</Label>
                    <Input icon={IndianRupee} name="price" type="number" min="0" value={formData.price} onChange={handleInputChange} placeholder={formData.type === 'Paid' ? 'e.g. 250' : '0'} disabled={formData.type === 'Free'} />
                  </div>
                </div>

                <div>
                  <Label>Location (Optional)</Label>
                  <Input icon={MapPin} name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Library Cafe, Block B" />
                </div>

                <div>
                  <Label>Description *</Label>
                  <div style={{ position: 'relative' }}>
                    <FileText style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: CS.textMuted, pointerEvents: 'none' }} />
                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                      placeholder="Describe the item, edition, condition, any defects..."
                      required
                      style={{ width: '100%', minHeight: 120, padding: '10px 14px 10px 42px', background: CS.bg, border: `1px solid ${CS.border}`, borderRadius: 12, fontSize: 14, color: CS.text, outline: 'none', fontFamily: 'inherit', resize: 'vertical', transition: 'all 0.2s', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.border = `1.5px solid ${CS.primary}`; e.target.style.boxShadow = '0 0 0 3px rgba(91,91,214,0.1)'; }}
                      onBlur={e => { e.target.style.border = `1px solid ${CS.border}`; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Right: Image ─── */}
              <div>
                <Label>Resource Image</Label>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                <div onClick={() => fileInputRef.current.click()}
                  style={{ border: `2px dashed ${CS.border}`, borderRadius: 18, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CS.bg, cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = CS.primary}
                  onMouseLeave={e => e.currentTarget.style.borderColor = CS.border}>
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Upload style={{ width: 16, height: 16 }} /> Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: CS.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <ImageIcon style={{ width: 24, height: 24, color: CS.primary }} />
                      </div>
                      <p style={{ fontWeight: 600, color: CS.text, fontSize: 14, marginBottom: 4 }}>Click to upload image</p>
                      <p style={{ fontSize: 12, color: CS.textMuted }}>JPG, PNG or WEBP (max 5MB)</p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.25rem', padding: '1rem', background: CS.primaryPale, borderRadius: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Tag style={{ width: 18, height: 18, color: CS.primary, flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: CS.primary, marginBottom: 4 }}>Pro Tip</p>
                    <p style={{ fontSize: 12, color: CS.textSub, lineHeight: 1.5 }}>Clear, well-lit photos are 3× more likely to get inquiries. Show covers, defects clearly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.25rem 2rem', background: CS.bg, borderTop: `1px solid ${CS.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/dashboard" style={{ padding: '9px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: CS.textSub, textDecoration: 'none', background: 'none', border: `1px solid ${CS.border}`, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                Cancel
              </Link>
              <button type="submit" disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 24px', background: isLoading ? '#A5A5FF' : CS.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = CS.primaryHover; e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,91,214,0.3)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = isLoading ? '#A5A5FF' : CS.primary; e.currentTarget.style.boxShadow = 'none'; }}>
                {isLoading
                  ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'arSpin 0.7s linear infinite' }} /> Publishing...</>
                  : <><CheckCircle style={{ width: 16, height: 16 }} /> List Resource</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes arSpin{to{transform:rotate(360deg);}} @media(max-width:700px){.ar-grid{grid-template-columns:1fr!important;}}`}</style>
    </UserLayout>
  );
};

export default AddResource;
