import { MessageSquare } from 'lucide-react';
import UserLayout from '../components/UserLayout';

const Messages = () => {
  return (
    <UserLayout>
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--color-brand)' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Messages Coming Soon
          </h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            We are currently integrating real-time Socket.io chat. Soon you will be able to message sellers directly here!
          </p>
        </div>
      </div>
    </UserLayout>
  );
};

export default Messages;
