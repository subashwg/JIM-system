import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Gauge, ExternalLink, LogOut, Heart, Scale, Ruler, Compass } from 'lucide-react';

export const UserProfileTab: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header Profile Card */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--accent-indigo) 0%, #4338CA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
            }}
          >
            {(user.profile?.displayName || user.email)[0].toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {user.profile?.displayName || 'Fitness Athlete'}
              </h2>
              <span className="badge badge-indigo">{user.role}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ padding: '0.6rem 1.25rem' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Preferences & Biometrics */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gauge size={18} color="var(--accent-primary-light)" />
          Athlete Configuration & Units
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Scale size={14} /> Weight Unit
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700 }}>
              {user.profile?.weightUnit || 'KG'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Ruler size={14} /> Height
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700 }}>
              {user.profile?.height ? `${user.profile.height} cm` : '182 cm'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Compass size={14} /> Time Zone
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.profile?.timeZone || 'Europe/London'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Heart size={14} /> Week Starts On
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {user.profile?.weekStartDay || 'MONDAY'}
            </div>
          </div>
        </div>
      </div>

      {/* Backend & Swagger Link */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Shield size={16} color="var(--accent-primary-light)" /> Backend API & Interactive OpenAPI Docs
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Connected to NestJS backend at <code style={{ color: 'var(--accent-primary-light)' }}>http://localhost:3000/api/v1</code>
          </div>
        </div>

        <a
          href="http://localhost:3000/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
        >
          Open Swagger <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
