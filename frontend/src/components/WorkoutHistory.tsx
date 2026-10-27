import React, { useState, useEffect } from 'react';
import type { WorkoutSession } from '../types';
import { api } from '../services/api';
import { History, Calendar, Trash2, ChevronDown, ChevronUp, Flame, Play, Clock } from 'lucide-react';

interface WorkoutHistoryProps {
  onStartNewWorkout: () => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ onStartNewWorkout }) => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkouts({ limit: 50 });
      setWorkouts(res.items);
      // Auto-expand the most recent workout
      if (res.items.length > 0) {
        setExpandedId(res.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load workout history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this recorded workout?')) return;
    try {
      await api.deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Failed to delete workout', err);
    }
  };

  const calculateSessionVolume = (workout: WorkoutSession) => {
    let volume = 0;
    workout.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        if (s.isCompleted || s.isCompleted === undefined) {
          const reps = s.completedReps ?? s.reps ?? 0;
          volume += (s.weight || 0) * reps;
        }
      });
    });
    return volume;
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatDuration = (start: string, end?: string | null) => {
    if (!end) return 'In progress';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} min`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="var(--accent-primary-light)" />
            Workout Log & History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Review past training sessions, total tonnage, and progressive overload
          </p>
        </div>

        <button onClick={onStartNewWorkout} className="btn btn-primary">
          <Play size={15} fill="currentColor" /> Log New Workout
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading recorded workouts...
        </div>
      ) : workouts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Flame size={40} style={{ margin: '0 auto 1rem', color: 'var(--accent-amber)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Workouts Logged Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Log your first training session to view your progressive overload statistics and volume charts.
          </p>
          <button onClick={onStartNewWorkout} className="btn btn-primary">
            Start First Workout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {workouts.map((w) => {
            const isExpanded = expandedId === w.id;
            const volume = calculateSessionVolume(w);

            return (
              <div
                key={w.id}
                className="glass-panel"
                style={{
                  border: isExpanded ? '1px solid rgba(200, 102, 62, 0.4)' : '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : w.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                        {w.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} />
                        {formatDate(w.startedAt)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)' }}>
                        <Clock size={13} />
                        {formatTime(w.completedAt || w.startedAt)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{w.name}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Volume</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                        {volume.toLocaleString()} kg
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Duration</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {formatDuration(w.startedAt, w.completedAt || w.endedAt)}
                      </div>
                      {w.completedAt && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {formatTime(w.startedAt)} – {formatTime(w.completedAt)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => handleDelete(w.id, e)}
                        className="btn-icon"
                        title="Delete workout"
                        style={{ padding: '0.4rem' }}
                      >
                        <Trash2 size={15} color="var(--accent-rose)" />
                      </button>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {/* Timestamp metadata bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} color="var(--accent-primary-light)" />
                        <span>Logged Time: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{formatTime(w.completedAt || w.startedAt)}</strong> (Local Time)</span>
                      </div>
                      {w.completedAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>Session Window: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{formatTime(w.startedAt)} – {formatTime(w.completedAt)}</strong></span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} color="var(--accent-cyan)" />
                        <span>Calendar Date: <strong style={{ color: 'var(--text-main)' }}>{w.localDate || formatDate(w.startedAt)}</strong></span>
                      </div>
                    </div>

                    {w.notes && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        "{w.notes}"
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {w.exercises?.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {ex.exercise?.name || 'Exercise'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {ex.sets?.length || 0} sets
                            </span>
                          </div>

                          {/* Sets summary pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {ex.sets?.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                style={{
                                  background: s.isCompleted ? 'rgba(200, 102, 62, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                                  border: s.isCompleted ? '1px solid rgba(200, 102, 62, 0.35)' : '1px solid var(--border-subtle)',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '4px',
                                  color: s.isCompleted ? 'var(--accent-primary-light)' : 'var(--text-muted)',
                                }}
                              >
                                Set {s.setNumber || sIdx + 1}: {s.weight}kg × {s.completedReps ?? s.reps ?? 0} {s.rpe ? `@ RPE ${s.rpe}` : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
