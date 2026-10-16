import React, { useState, useEffect } from 'react';
import type { WorkoutTemplate, Exercise } from '../types';
import { api } from '../services/api';
import { Bookmark, Plus, Play, Trash2, X, Dumbbell, Calendar, CheckCircle2 } from 'lucide-react';

interface WorkoutTemplatesProps {
  onStartFromTemplate: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplates: React.FC<WorkoutTemplatesProps> = ({ onStartFromTemplate }) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // New Template Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [tplData, exData] = await Promise.all([
        api.getTemplates(),
        api.getExercises({ limit: 100 }),
      ]);
      setTemplates(tplData);
      setAvailableExercises(exData.items);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || selectedExerciseIds.length === 0) return;
    setSubmitting(true);
    try {
      await api.createTemplate({
        name: templateName,
        description: templateDesc,
        isPublic: false,
        exercises: selectedExerciseIds.map((exId, idx) => ({
          exerciseId: exId,
          orderIndex: idx,
          targetSets: 3,
          targetReps: 10,
          restTimeSeconds: 90,
        })),
      });
      setShowCreateModal(false);
      setTemplateName('');
      setTemplateDesc('');
      setSelectedExerciseIds([]);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to create template', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workout routine?')) return;
    try {
      await api.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template', err);
    }
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={24} color="var(--accent-indigo)" />
            Workout Routines
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Reusable split routines and workout programs
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={16} /> New Routine Template
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading saved routines...
        </div>
      ) : templates.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Calendar size={40} style={{ margin: '0 auto 1rem', color: 'var(--accent-indigo)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Routines Created Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Create workout splits (e.g. Chest & Triceps, Leg Day, Full Body) to quickly launch structured workouts in 1 click.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Create Your First Routine
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                    {tpl.name}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                    className="btn-icon"
                    title="Delete routine"
                    style={{ padding: '0.35rem' }}
                  >
                    <Trash2 size={15} color="var(--accent-rose)" />
                  </button>
                </div>

                {tpl.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {tpl.description}
                  </p>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Exercises ({tpl.exercises?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {tpl.exercises?.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.825rem',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{item.exercise?.name || 'Exercise'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary-light)', fontSize: '0.75rem' }}>
                          {item.targetSets} sets × {item.targetReps || '10'} reps
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onStartFromTemplate(tpl)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Play size={16} fill="currentColor" /> Start Workout With Routine
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Template */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Routine</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Routine Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertrophy Push Day A"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Description / Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary chest and shoulder hypertrophy with triceps burnout..."
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Select Exercises ({selectedExerciseIds.length} chosen)
                </label>
                <div
                  style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {availableExercises.map((ex) => {
                    const isSelected = selectedExerciseIds.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => toggleExerciseSelection(ex.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                          transition: 'var(--transition-smooth)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Dumbbell size={15} color={isSelected ? 'var(--accent-primary-light)' : 'var(--text-dim)'} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ex.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 size={16} color="var(--accent-primary-light)" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedExerciseIds.length === 0}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
