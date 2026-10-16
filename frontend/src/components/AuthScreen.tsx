import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Zap, ShieldCheck, Flame, ArrowRight, Sparkles } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, displayName || undefined);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login('demo@jim.app', 'Password123!');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
              color: '#042F20',
            }}
          >
            <Dumbbell size={30} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
            JIM <span style={{ color: 'var(--accent-primary-light)' }}>SYSTEM</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Next-generation strength & progressive overload tracker
          </p>
        </div>

        {/* Quick Demo Login Callout */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.12))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
              <Sparkles size={14} /> Quick Demo Account
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pre-seeded with 12 exercises & workout history
            </div>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            1-Click Demo
          </button>
        </div>

        {/* Main Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              style={{
                flex: 1,
                padding: '0.55rem',
                border: 'none',
                background: !isRegister ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: !isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              style={{
                flex: 1,
                padding: '0.55rem',
                border: 'none',
                background: isRegister ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--accent-rose-bg)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-rose)',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Hayes"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="athlete@gym.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            >
              {isSubmitting ? 'Authenticating...' : isRegister ? 'Register & Begin Tracking' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 500 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Zap size={13} color="var(--accent-primary-light)" /> Fast Logging</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Flame size={13} color="var(--accent-amber)" /> PR Tracking</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={13} color="var(--accent-indigo)" /> Local DB</span>
        </div>

      </div>
    </div>
  );
};
