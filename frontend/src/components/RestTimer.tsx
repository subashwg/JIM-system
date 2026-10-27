import React, { useState, useEffect } from 'react';
import { Timer, Plus, RotateCcw, X, Play, Pause } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  onClose?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds = 90, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      // Play a quick beep or audio notification if possible
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch {
        // audio context unsupported or blocked
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const addTime = (secs: number) => {
    setSecondsLeft((prev) => prev + secs);
    if (!isActive) setIsActive(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rest-timer-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: secondsLeft === 0 ? 'var(--accent-rose-bg)' : 'rgba(200, 102, 62, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: secondsLeft === 0 ? 'var(--accent-rose)' : 'var(--accent-primary-light)',
          }}
        >
          <Timer size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Rest Interval
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: secondsLeft === 0 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => setIsActive(!isActive)}
          className="btn-icon"
          title={isActive ? 'Pause' : 'Resume'}
          style={{ padding: '0.4rem 0.6rem' }}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={() => addTime(30)}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={12} /> 30s
        </button>

        <button
          onClick={() => addTime(60)}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={12} /> 60s
        </button>

        <button
          onClick={() => {
            setSecondsLeft(initialSeconds);
            setIsActive(true);
          }}
          className="btn-icon"
          title="Reset"
          style={{ padding: '0.4rem 0.6rem' }}
        >
          <RotateCcw size={15} />
        </button>

        {onClose && (
          <button onClick={onClose} className="btn-icon" title="Dismiss" style={{ padding: '0.4rem 0.6rem' }}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
