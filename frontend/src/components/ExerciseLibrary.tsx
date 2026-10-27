import React, { useState, useEffect } from 'react';
import type { Exercise } from '../types';
import { api } from '../services/api';
import { Search, Plus, Dumbbell, X, History, Info } from 'lucide-react';
import { CustomDropdown } from './common/CustomDropdown';

const EQUIPMENT_OPTIONS = [
  { value: 'ALL', label: 'All Equipment' },
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'DUMBBELL', label: 'Dumbbell' },
  { value: 'MACHINE', label: 'Machine' },
  { value: 'CABLE', label: 'Cable' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'BAND', label: 'Band' },
  { value: 'OTHER', label: 'Other' },
];

const MOVEMENT_OPTIONS = [
  { value: 'PUSH', label: 'Push' },
  { value: 'PULL', label: 'Pull' },
  { value: 'SQUAT', label: 'Squat' },
  { value: 'HINGE', label: 'Hinge' },
  { value: 'LUNGE', label: 'Lunge' },
  { value: 'ISOLATION', label: 'Isolation' },
  { value: 'CARRY', label: 'Carry' },
  { value: 'CARDIO', label: 'Cardio' },
];

const EXERCISE_TYPE_OPTIONS = [
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
  { value: 'ASSISTED', label: 'Assisted' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'DURATION', label: 'Duration' },
];

interface ExerciseLibraryProps {
  onSelectForWorkout?: (exercise: Exercise) => void;
  selectionMode?: boolean;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onSelectForWorkout,
  selectionMode = false,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [historyModalExercise, setHistoryModalExercise] = useState<Exercise | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New exercise form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentType, setEquipmentType] = useState('BARBELL');
  const [movementCategory, setMovementCategory] = useState('PUSH');
  const [exerciseType, setExerciseType] = useState('STRENGTH');
  const [primaryMuscles, setPrimaryMuscles] = useState('CHEST');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await api.getExercises({ limit: 100 });
      setExercises(data.items);
    } catch (err) {
      console.error('Failed to load exercises', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const musclesArray = primaryMuscles.split(',').map((m) => m.trim().toUpperCase()).filter(Boolean);
      await api.createExercise({
        name,
        description,
        equipmentType: equipmentType as any,
        movementCategory: movementCategory as any,
        exerciseType: exerciseType as any,
        primaryMuscleGroups: musclesArray,
        secondaryMuscleGroups: [],
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      fetchExercises();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create exercise');
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (exercise: Exercise) => {
    setHistoryModalExercise(exercise);
    setLoadingHistory(true);
    try {
      const res: any = await api.getExerciseHistory(exercise.id);
      setHistoryData(Array.isArray(res) ? res : (res.history ?? []));
    } catch (err) {
      console.warn('Failed to load history', err);
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter exercises
  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscleGroups.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || ex.movementCategory === categoryFilter;
    const matchesEquipment = equipmentFilter === 'ALL' || ex.equipmentType === equipmentFilter;
    return matchesSearch && matchesCategory && matchesEquipment;
  });

  const categories = ['ALL', 'PUSH', 'PULL', 'SQUAT', 'HINGE', 'LUNGE', 'ISOLATION'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top action row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dumbbell className="text-emerald" size={24} color="var(--accent-primary-light)" />
            Exercise Library
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Comprehensive directory of preloaded and custom exercises
          </p>
        </div>

        {!selectionMode && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Custom Exercise
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search exercises or target muscles (e.g. Bench, Quads, Lats)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginRight: '0.25rem' }}>
              MOVEMENT:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="tab-btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.75rem',
                  background: categoryFilter === cat ? 'rgba(200, 102, 62, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: categoryFilter === cat ? 'var(--accent-primary-light)' : 'var(--text-muted)',
                  border: categoryFilter === cat ? '1px solid rgba(200, 102, 62, 0.4)' : '1px solid transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>EQUIPMENT:</span>
            <CustomDropdown
              options={EQUIPMENT_OPTIONS}
              value={equipmentFilter}
              onChange={setEquipmentFilter}
              width="160px"
            />
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading exercises from catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Info size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-dim)' }} />
          <p style={{ fontWeight: 600 }}>No exercises found matching criteria</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Try searching another keyword or create a custom exercise</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {ex.name}
                  </h3>
                  {ex.isCustom && (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Custom</span>
                  )}
                </div>

                {ex.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                    {ex.description}
                  </p>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-emerald">
                    {ex.movementCategory}
                  </span>
                  <span className="badge badge-indigo">
                    {ex.equipmentType}
                  </span>
                  {ex.primaryMuscleGroups.map((muscle) => (
                    <span
                      key={muscle}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-main)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => openHistory(ex)}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                >
                  <History size={13} /> Performance History
                </button>

                {selectionMode && onSelectForWorkout && (
                  <button
                    type="button"
                    onClick={() => onSelectForWorkout(ex)}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    + Add to Workout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Custom Exercise */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create Custom Exercise</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'var(--accent-rose-bg)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateExercise} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Hammer Curl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Description / Execution Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Focus on peak contraction and controlled eccentric phase..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <CustomDropdown
                    label="Equipment"
                    options={EQUIPMENT_OPTIONS.filter((o) => o.value !== 'ALL')}
                    value={equipmentType}
                    onChange={setEquipmentType}
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Movement"
                    options={MOVEMENT_OPTIONS}
                    value={movementCategory}
                    onChange={setMovementCategory}
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Type"
                    options={EXERCISE_TYPE_OPTIONS}
                    value={exerciseType}
                    onChange={setExerciseType}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Primary Target Muscles (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHEST, TRICEPS"
                  value={primaryMuscles}
                  onChange={(e) => setPrimaryMuscles(e.target.value)}
                  className="input-field"
                />
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
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Creating...' : 'Save Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Exercise History & PRs */}
      {historyModalExercise && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{historyModalExercise.name}</h3>
                <span className="badge badge-emerald" style={{ marginTop: '0.25rem' }}>Performance History</span>
              </div>
              <button onClick={() => setHistoryModalExercise(null)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading workout history...
              </div>
            ) : historyData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No completed workout records found for this exercise yet. Complete your first workout with this exercise to see PRs and volume progression!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {historyData.map((h, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>{new Date(h.date || h.workout?.startedAt || Date.now()).toLocaleDateString()}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{h.workout?.name || 'Workout Session'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                      {h.sets?.map((s: any, idx: number) => (
                        <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {s.weight}kg × {s.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
