import React, { useState, useEffect, useRef } from 'react';
import type { WorkoutExercise, WorkoutSet, Exercise, SetType } from '../types';
import { api } from '../services/api';
import { RestTimer } from './RestTimer';
import { ExerciseLibrary } from './ExerciseLibrary';
import confetti from 'canvas-confetti';
import {
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Award,
  X,
  Flame,
  AlertCircle,
} from 'lucide-react';

interface ActiveWorkoutProps {
  initialExercises?: Exercise[];
  initialName?: string;
  onFinish: () => void;
  onCancel: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  initialExercises = [],
  initialName = 'Quick Workout',
  onFinish,
  onCancel,
}) => {
  const [workoutName, setWorkoutName] = useState(initialName);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer state
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);

  // Add Exercise Modal
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Helper to format Date into datetime-local input "YYYY-MM-DDTHH:mm" using local timezone
  const toLocalDatetimeInput = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [workoutLocalTime, setWorkoutLocalTime] = useState<string>(() => toLocalDatetimeInput(new Date()));

  const hasInitializedRef = useRef(false);

  // Initial populate if started from template or list
  useEffect(() => {
    if (!hasInitializedRef.current && initialExercises.length > 0) {
      hasInitializedRef.current = true;
      const formatted: WorkoutExercise[] = initialExercises.map((ex, exIdx) => ({
        exerciseId: ex.id,
        orderIndex: exIdx,
        exercise: ex,
        sets: [
          { orderIndex: 0, setNumber: 1, setType: 'WORKING', weight: 60, reps: 10, completedReps: 10, rpe: 8, isCompleted: false },
          { orderIndex: 1, setNumber: 2, setType: 'WORKING', weight: 60, reps: 10, completedReps: 10, rpe: 8, isCompleted: false },
          { orderIndex: 2, setNumber: 3, setType: 'WORKING', weight: 60, reps: 10, completedReps: 10, rpe: 8, isCompleted: false },
        ],
      }));
      setExercises(formatted);
    }
  }, [initialExercises]);

  // Elapsed Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainder = secs % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Add exercise to session
  const handleAddExercise = (exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        orderIndex: prev.length,
        exercise,
        sets: [
          { orderIndex: 0, setNumber: 1, setType: 'WORKING', weight: 40, reps: 10, completedReps: 10, rpe: 8, isCompleted: false },
        ],
      },
    ]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (exIndex: number) => {
    setExercises((prev) =>
      prev
        .filter((_, idx) => idx !== exIndex)
        .map((ex, idx) => ({ ...ex, orderIndex: idx }))
    );
  };

  // Add set to an exercise
  const handleAddSet = (exIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== exIndex) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: WorkoutSet = {
          orderIndex: ex.sets.length,
          setNumber: ex.sets.length + 1,
          setType: lastSet?.setType || 'WORKING',
          weight: lastSet?.weight !== undefined ? lastSet.weight : 40,
          reps: lastSet?.reps !== undefined ? lastSet.reps : 10,
          completedReps: lastSet?.reps !== undefined ? lastSet.reps : 10,
          rpe: lastSet?.rpe || 8,
          isCompleted: false,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      })
    );
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets
            .filter((_, idx) => idx !== setIndex)
            .map((s, idx) => ({ ...s, orderIndex: idx, setNumber: idx + 1 })),
        };
      })
    );
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            return {
              ...set,
              [field]: value,
              ...(field === 'reps' ? { completedReps: value } : {}),
            };
          }),
        };
      })
    );
  };

  const handleToggleComplete = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, eIdx) => {
        if (eIdx !== exIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            const nextCompleted = !set.isCompleted;
            if (nextCompleted) {
              // Automatically trigger rest timer countdown!
              setRestDuration(set.setType === 'WARMUP' ? 60 : 90);
              setShowRestTimer(true);
            }
            return {
              ...set,
              isCompleted: nextCompleted,
            };
          }),
        };
      })
    );
  };

  // Calculate live session stats
  let totalVolume = 0;
  let totalSets = 0;
  let completedSetsCount = 0;

  exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      totalSets++;
      if (s.isCompleted) {
        completedSetsCount++;
        totalVolume += (Number(s.weight) || 0) * (Number(s.completedReps ?? s.reps) || 0);
      }
    });
  });

  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      setError('Please add at least one exercise to your workout.');
      return;
    }
    setError(null);
    setIsFinishing(true);

    try {
      // Determine the exact local timestamp of when the workout was done
      const completionDate = workoutLocalTime ? new Date(workoutLocalTime) : new Date();

      // Ensure localDate is strictly computed using local calendar year, month, day
      const pad = (n: number) => String(n).padStart(2, '0');
      const localDate = `${completionDate.getFullYear()}-${pad(completionDate.getMonth() + 1)}-${pad(completionDate.getDate())}`;

      const completedAt = completionDate.toISOString();
      const startedAt = new Date(completionDate.getTime() - Math.max(elapsedSeconds, 1) * 1000).toISOString();

      await api.createWorkout({
        name: workoutName.trim() || 'Workout Session',
        notes: workoutNotes.trim() || undefined,
        startedAt,
        completedAt,
        localDate,
        durationSeconds: elapsedSeconds,
        status: 'COMPLETED',
        exercises: exercises.map((ex, exIdx) => ({
          exerciseId: ex.exerciseId,
          orderIndex: exIdx,
          notes: ex.notes?.trim() || undefined,
          sets: ex.sets.map((s, sIdx) => ({
            setNumber: sIdx + 1,
            setType: s.setType || 'WORKING',
            completedReps: Math.max(0, Number(s.completedReps ?? s.reps) || 0),
            targetReps: s.reps ? Number(s.reps) : undefined,
            weight: s.weight !== undefined && s.weight !== null ? Number(s.weight) || 0 : 0,
            weightUnit: 'KG',
            rpe: s.rpe ? Number(s.rpe) : undefined,
            isCompleted: Boolean(s.isCompleted),
            restDurationSeconds: s.restDurationSeconds || s.restTimeSeconds || 90,
          })),
        })),
      } as any);

      // Celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B'],
        });
      } catch {
        // confetti optional
      }

      setTimeout(() => {
        onFinish();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to save workout session.');
      setIsFinishing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Rest Timer Widget if active */}
      {showRestTimer && (
        <RestTimer
          initialSeconds={restDuration}
          onClose={() => setShowRestTimer(false)}
        />
      )}

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(200, 102, 62, 0.3)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Flame size={12} /> Active Workout
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary-light)' }}>
                <Clock size={14} />
                <span>{formatElapsedTime(elapsedSeconds)}</span>
              </div>
            </div>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                outline: 'none',
                width: '100%',
              }}
              placeholder="Workout Name..."
            />
            <input
              type="text"
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
                marginTop: '0.2rem',
              }}
              placeholder="Add session notes / training goals..."
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <Clock size={13} color="var(--accent-primary-light)" />
                <span>Workout Time:</span>
              </div>
              <input
                type="datetime-local"
                value={workoutLocalTime}
                onChange={(e) => setWorkoutLocalTime(e.target.value)}
                title="Local timestamp of when the workout was done"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-primary-light)',
                  fontSize: '0.775rem',
                  padding: '0.25rem 0.5rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                (Defaults to current local time, adjust if logging past session)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
            >
              Discard
            </button>
            <button
              onClick={handleFinishWorkout}
              disabled={isFinishing}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem' }}
            >
              <Award size={16} />
              {isFinishing ? 'Saving...' : 'Finish Workout'}
            </button>
          </div>
        </div>

        {/* Live volume & stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Volume Lifted</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
              {totalVolume.toLocaleString()} kg
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Sets Completed</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700 }}>
              {completedSetsCount} / {totalSets}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Exercises</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700 }}>
              {exercises.length}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem', background: 'var(--accent-rose-bg)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Exercises Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {exercises.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Dumbbell size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--text-dim)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Exercises Added Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Add exercises to track your sets, reps, and weights for this session.
            </p>
            <button
              onClick={() => setShowExercisePicker(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Add Exercise
            </button>
          </div>
        ) : (
          exercises.map((ex, exIdx) => (
            <div key={exIdx} className="glass-panel" style={{ padding: '1.25rem' }}>
              {/* Exercise Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(200, 102, 62, 0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary-light)',
                    }}
                  >
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ex.exercise?.name || 'Exercise'}</h4>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {ex.exercise?.primaryMuscleGroups?.join(', ')} • {ex.exercise?.equipmentType}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="btn-icon"
                  title="Remove exercise"
                  style={{ padding: '0.35rem' }}
                >
                  <Trash2 size={15} color="var(--accent-rose)" />
                </button>
              </div>

              {/* Sets Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.5rem 0.4rem', width: '45px', textAlign: 'center' }}>SET</th>
                      <th style={{ padding: '0.5rem 0.4rem', width: '90px' }}>TYPE</th>
                      <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>KG</th>
                      <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>REPS</th>
                      <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center', width: '65px' }}>RPE</th>
                      <th style={{ padding: '0.5rem 0.4rem', width: '45px', textAlign: 'center' }}>DONE</th>
                      <th style={{ padding: '0.5rem 0.4rem', width: '35px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set, sIdx) => (
                      <tr
                        key={sIdx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: set.isCompleted ? 'rgba(200, 102, 62, 0.1)' : 'transparent',
                          transition: 'var(--transition-smooth)',
                        }}
                      >
                        {/* Set index */}
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: set.isCompleted ? 'var(--accent-primary-light)' : 'var(--text-muted)' }}>
                          {sIdx + 1}
                        </td>

                        {/* Set Type */}
                        <td style={{ padding: '0.5rem 0.4rem' }}>
                          <select
                            value={set.setType}
                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'setType', e.target.value as SetType)}
                            style={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(200, 102, 62, 0.35)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--accent-primary-light)',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              padding: '0.3rem 0.5rem',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="WORKING">Working</option>
                            <option value="WARMUP">Warmup</option>
                            <option value="DROP_SET">Drop Set</option>
                            <option value="FAILURE">Failure</option>
                          </select>
                        </td>

                        {/* Weight */}
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight ?? ''}
                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'weight', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="input-field input-mono"
                            style={{ padding: '0.35rem', width: '70px', display: 'inline-block' }}
                          />
                        </td>

                        {/* Reps */}
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            value={set.reps ?? ''}
                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'reps', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="input-field input-mono"
                            style={{ padding: '0.35rem', width: '60px', display: 'inline-block' }}
                          />
                        </td>

                        {/* RPE */}
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={set.rpe ?? ''}
                            placeholder="8"
                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'rpe', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="input-field input-mono"
                            style={{ padding: '0.35rem', width: '50px', display: 'inline-block' }}
                          />
                        </td>

                        {/* Complete Checkbox */}
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            aria-label={`Mark set ${sIdx + 1} as ${set.isCompleted ? 'incomplete' : 'complete'}`}
                            onClick={() => handleToggleComplete(exIdx, sIdx)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: set.isCompleted ? 'none' : '2px solid rgba(255, 255, 255, 0.28)',
                              background: set.isCompleted ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                              color: set.isCompleted ? '#FFFFFF' : 'transparent',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out',
                              boxShadow: set.isCompleted ? '0 0 10px rgba(200, 102, 62, 0.5)' : 'none',
                            }}
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                        </td>

                        {/* Delete Set */}
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, sIdx)}
                            className="btn-icon"
                            style={{ padding: '0.2rem', background: 'transparent', border: 'none' }}
                          >
                            <X size={14} color="var(--text-dim)" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Set button */}
              <div style={{ marginTop: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Plus size={14} /> Add Set
                </button>
              </div>
            </div>
          ))
        )}

        {/* Add Exercise Trigger Button */}
        {exercises.length > 0 && (
          <button
            onClick={() => setShowExercisePicker(true)}
            className="btn btn-secondary"
            style={{ padding: '0.85rem', width: '100%', borderStyle: 'dashed' }}
          >
            <Plus size={18} /> Add Another Exercise
          </button>
        )}
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Choose Exercise</h3>
              <button onClick={() => setShowExercisePicker(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <ExerciseLibrary
              selectionMode
              onSelectForWorkout={handleAddExercise}
            />
          </div>
        </div>
      )}
    </div>
  );
};
