import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { WeightUnit, LengthUnit, FluidUnit, WeekStartDay } from '../types';
import { CustomDropdown } from './common/CustomDropdown';
import {
  Camera,
  Trash2,
  Check,
  Compass,
  Calendar,
  Scale,
  Ruler,
  Clock,
  Shield,
  ExternalLink,
  Share2,
  Copy,
  Save,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Globe,
} from 'lucide-react';

const COMMON_TIMEZONES = [
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (UTC+05:45 - Nepal)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+05:30 - India)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+04:00 - UAE)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+08:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+09:00 - Japan)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+00:00 / GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+01:00 / CET)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+01:00 / CET)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-05:00 / EST)' },
  { value: 'America/Chicago', label: 'America/Chicago (UTC-06:00 / CST)' },
  { value: 'America/Denver', label: 'America/Denver (UTC-07:00 / MST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-08:00 / PST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC+10:00 / AEST)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
];

const PRESET_AVATARS = [
  { name: 'Lifter', emoji: '🏋️', bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { name: 'Runner', emoji: '🏃', bg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' },
  { name: 'Boxer', emoji: '🥊', bg: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)' },
  { name: 'Cyclist', emoji: '🚴', bg: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)' },
  { name: 'Gymnast', emoji: '🤸', bg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' },
  { name: 'Swimmer', emoji: '🏊', bg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' },
];

export const UserProfileTab: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [height, setHeight] = useState<number | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('KG');
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('CM');
  const [fluidUnit, setFluidUnit] = useState<FluidUnit>('ML');
  const [timeZone, setTimeZone] = useState('UTC');
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>('MONDAY');

  // UI state
  const [detectedTz, setDetectedTz] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLan, setCopiedLan] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Initialize fields from current user profile
  useEffect(() => {
    if (user?.profile) {
      setDisplayName(user.profile.displayName || '');
      setAvatarUrl(user.profile.avatarUrl || null);
      setHeight(user.profile.height ?? '');
      setDateOfBirth(
        user.profile.dateOfBirth
          ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0]
          : ''
      );
      setWeightUnit(user.profile.weightUnit || 'KG');
      setLengthUnit(user.profile.lengthUnit || 'CM');
      setFluidUnit(user.profile.fluidUnit || 'ML');
      setTimeZone(user.profile.timeZone || 'UTC');
      setWeekStartDay(user.profile.weekStartDay || 'MONDAY');
    }

    // Detect browser/system timezone
    try {
      const sysTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (sysTz) {
        setDetectedTz(sysTz);
        // If user's timezone is default UTC or empty, suggest detected system timezone
        if (!user?.profile?.timeZone || user.profile.timeZone === 'UTC') {
          setTimeZone(sysTz);
        }
      }
    } catch {
      // Intl unsupported
    }
  }, [user]);

  // Handle Photo Upload with client-side compression to square JPEG
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const dimension = Math.min(size, 320); // crisp 320x320
        canvas.width = dimension;
        canvas.height = dimension;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Center-crop to square
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, dimension, dimension);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(dataUrl);
          setShowPresets(false);
          setErrorMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Preset avatar creation as SVG data URL
  const handleSelectPreset = (preset: typeof PRESET_AVATARS[0]) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <rect width="160" height="160" rx="80" fill="#0F172A"/>
        <text x="50%" y="54%" font-size="70" text-anchor="middle" dominant-baseline="middle">${preset.emoji}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatarUrl(dataUrl);
    setShowPresets(false);
  };

  const handleDetectTimezone = () => {
    try {
      const sysTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (sysTz) {
        setTimeZone(sysTz);
        setDetectedTz(sysTz);
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage('Could not automatically determine system timezone.');
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await api.updateProfile({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        height: height !== '' ? Number(height) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        weightUnit,
        lengthUnit,
        fluidUnit,
        timeZone,
        weekStartDay,
      });

      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update athlete profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    const age = Math.abs(ageDt.getUTCFullYear() - 1970);
    return isNaN(age) ? null : age;
  };

  const shareableLanUrl = 'http://192.168.1.133:5173';
  const shareablePublicUrl = 'https://jim-fitness-tracker.loca.lt';

  const handleCopyLan = () => {
    navigator.clipboard.writeText(shareableLanUrl);
    setCopiedLan(true);
    setTimeout(() => setCopiedLan(false), 2500);
  };

  const handleCopyPublic = () => {
    navigator.clipboard.writeText(shareablePublicUrl);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2500);
  };

  const timezoneOptions = [
    ...(detectedTz && !COMMON_TIMEZONES.some((t) => t.value === detectedTz)
      ? [
          {
            value: detectedTz,
            label: detectedTz,
            subLabel: 'Detected system device timezone',
            badge: 'Detected',
          },
        ]
      : []),
    ...COMMON_TIMEZONES.map((tz) => ({
      value: tz.value,
      label: tz.label.split(' (')[0],
      subLabel: tz.label.includes(' (')
        ? tz.label.substring(tz.label.indexOf('(') + 1, tz.label.length - 1)
        : undefined,
      badge: tz.value === detectedTz ? 'Detected' : undefined,
    })),
  ];

  const weekStartOptions = [
    {
      value: 'MONDAY',
      label: 'Monday',
      subLabel: 'Standard Training Cycle (Mon - Sun volume tracking)',
      badge: 'Athletic Standard',
    },
    {
      value: 'SUNDAY',
      label: 'Sunday',
      subLabel: 'Traditional Calendar (Sun - Sat volume tracking)',
    },
  ];

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '840px', margin: '0 auto' }}>
      {/* Top Title & Save Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
            Athlete Profile & Settings
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage your personal biometrics, measurement units, timezone, and avatar photo.
          </p>
        </div>

        <button
          onClick={() => handleSaveProfile()}
          disabled={isSaving}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.4rem', gap: '0.5rem', minWidth: '150px', justifyContent: 'center' }}
        >
          {isSaving ? (
            'Saving...'
          ) : saveSuccess ? (
            <>
              <Check size={16} /> Saved!
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(200, 102, 62, 0.14)', border: '1px solid rgba(200, 102, 62, 0.35)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary-light)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>Profile and measurement preferences have been saved successfully.</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: 'var(--accent-rose-bg)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Athlete Identity Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.75rem' }}>
          {/* Avatar Picture with Camera Overlay */}
          <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
            <div
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                border: '2px solid rgba(200, 102, 62, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || user.email}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary-light)' }}>
                  {(displayName || user.email)[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Upload Button Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile picture"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                border: '2px solid #080C14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Camera size={16} strokeWidth={2.5} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Photo Actions & Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {displayName || 'Personal Athlete'}
              </h3>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                {user.role}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {user.email}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.775rem', gap: '0.4rem' }}
              >
                <Camera size={14} /> Upload Photo
              </button>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.775rem', gap: '0.4rem' }}
              >
                <Sparkles size={14} color="var(--accent-amber)" /> Preset Avatars
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', gap: '0.35rem' }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            {/* Preset Avatars Drawer */}
            {showPresets && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.85rem',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Choose avatar:</span>
                {PRESET_AVATARS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    title={p.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {p.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Display Name Input */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Full Athlete Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex Rivers"
            className="input-field"
            style={{ maxWidth: '420px', background: 'rgba(255, 255, 255, 0.03)' }}
          />
        </div>
      </div>

      {/* 2. Biometrics & Physical Metrics */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={18} color="var(--accent-primary-light)" />
          Physical Biometrics
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Configures your training volume metrics, progressive overload, and body stats.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {/* Height */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <Ruler size={14} color="var(--accent-cyan)" /> Height ({lengthUnit.toLowerCase()})
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="e.g. 182"
              className="input-field input-mono"
              style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.03)' }}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <Calendar size={14} color="var(--accent-indigo)" /> Date of Birth {dateOfBirth && calculateAge(dateOfBirth) ? `(${calculateAge(dateOfBirth)} years old)` : ''}
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input-field"
              style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-main)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Measurement Units (Segmented Buttons) */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ruler size={18} color="var(--accent-cyan)" />
          Preferred Measurement Units
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Choose how weights, lengths, and liquid nutrition are displayed across all your training sessions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {/* Weight Unit Segmented Toggle */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Weight Scale
            </span>
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => setWeightUnit('KG')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: weightUnit === 'KG' ? 'var(--accent-primary)' : 'transparent',
                  color: weightUnit === 'KG' ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                KG (Kilograms)
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('LB')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: weightUnit === 'LB' ? 'var(--accent-primary)' : 'transparent',
                  color: weightUnit === 'LB' ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                LB (Pounds)
              </button>
            </div>
          </div>

          {/* Length Unit */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Distance / Length
            </span>
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => setLengthUnit('CM')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: lengthUnit === 'CM' ? 'var(--accent-primary)' : 'transparent',
                  color: lengthUnit === 'CM' ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                CM
              </button>
              <button
                type="button"
                onClick={() => setLengthUnit('INCH')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: lengthUnit === 'INCH' ? 'var(--accent-primary)' : 'transparent',
                  color: lengthUnit === 'INCH' ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                INCH
              </button>
            </div>
          </div>

          {/* Fluid Unit */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Fluid Intake
            </span>
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => setFluidUnit('ML')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: fluidUnit === 'ML' ? 'var(--accent-primary)' : 'transparent',
                  color: fluidUnit === 'ML' ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                ML
              </button>
              <button
                type="button"
                onClick={() => setFluidUnit('OZ')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: fluidUnit === 'OZ' ? 'var(--accent-primary)' : 'transparent',
                  color: fluidUnit === 'OZ' ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                FL OZ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Scheduling & Timezone Detection */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} color="var(--accent-indigo)" />
          Localization & Training Calendar
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Sets your system calendar boundaries and workout log timestamps.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Timezone Selector + Detect Button */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                System Time Zone
              </label>
              <button
                type="button"
                onClick={handleDetectTimezone}
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', gap: '0.3rem' }}
                title="Automatically read system time zone"
              >
                <Clock size={12} color="var(--accent-primary-light)" /> Detect My Timezone
              </button>
            </div>

            <CustomDropdown
              options={timezoneOptions}
              value={timeZone}
              onChange={setTimeZone}
              searchable={true}
              placeholder="Search or select timezone..."
              icon={<Clock size={15} />}
            />
            {detectedTz && (
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.45rem' }}>
                Detected on device: <strong style={{ color: 'var(--accent-primary-light)' }}>{detectedTz}</strong>
              </span>
            )}
          </div>

          {/* Week Starts On Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Week Starts On
            </label>
            <CustomDropdown
              options={weekStartOptions}
              value={weekStartDay}
              onChange={(val) => setWeekStartDay(val as WeekStartDay)}
              icon={<Calendar size={15} />}
            />
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.45rem' }}>
              Defines the first day of the week for volume progression charts.
            </span>
          </div>
        </div>
      </div>

      {/* 5. Share with Friends / Testing Links */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid rgba(200, 102, 62, 0.3)', background: 'linear-gradient(135deg, rgba(200, 102, 62, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Share2 size={18} color="var(--accent-primary-light)" />
            Share System For Testing
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
            Share these live links with friends, workout partners, or test on your mobile devices.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Public Internet Link */}
          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(200, 102, 62, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={16} color="var(--accent-primary-light)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary-light)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                  Worldwide Public Testing Link (Anywhere in the World)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPublic}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
              >
                {copiedPublic ? (
                  <>
                    <Check size={13} color="var(--accent-primary-light)" /> Copied Public Link!
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy Public Link
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <a
                href={shareablePublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.925rem', color: 'var(--accent-primary-light)', fontFamily: 'var(--font-mono)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {shareablePublicUrl} <ExternalLink size={13} />
              </a>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                localtunnel bypass password: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>27.34.73.44</strong>
              </span>
            </div>
          </div>

          {/* Local Wi-Fi Link */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wifi size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Local Wi-Fi Network Link (Fastest for your phone on same Wi-Fi)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLan}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
              >
                {copiedLan ? (
                  <>
                    <Check size={13} color="var(--accent-primary-light)" /> Copied Local Link!
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy Local Link
                  </>
                )}
              </button>
            </div>

            <div>
              <a
                href={shareableLanUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {shareableLanUrl} <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Account & Swagger Link */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Shield size={16} color="var(--accent-primary-light)" /> Developer API & OpenAPI Docs
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Interactive Swagger REST documentation at <code style={{ color: 'var(--accent-primary-light)' }}>http://localhost:3000/api/docs</code>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            Swagger Docs <ExternalLink size={14} />
          </a>

          <button
            onClick={logout}
            className="btn btn-danger"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
