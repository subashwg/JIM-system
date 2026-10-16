import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { WorkoutHistory } from './components/WorkoutHistory';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutTemplates } from './components/WorkoutTemplates';
import { ActiveWorkout } from './components/ActiveWorkout';
import { UserProfileTab } from './components/UserProfileTab';
import type { WorkoutTemplate, Exercise } from './types';
import {
  Dumbbell,
  History,
  Bookmark,
  User as UserIcon,
  Flame,
  Zap,
} from 'lucide-react';

type Tab = 'workouts' | 'exercises' | 'routines' | 'profile';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('workouts');

  // Active workout session state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeWorkoutData, setActiveWorkoutData] = useState<{
    name?: string;
    exercises?: Exercise[];
  }>({});

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Connecting to JIM System...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleStartQuickWorkout = () => {
    setActiveWorkoutData({
      name: `Workout — ${new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`,
      exercises: [],
    });
    setIsWorkoutActive(true);
  };

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    const exList: Exercise[] = template.exercises
      ?.map((te) => te.exercise)
      .filter((ex): ex is Exercise => !!ex) || [];

    setActiveWorkoutData({
      name: `${template.name} Session`,
      exercises: exList,
    });
    setIsWorkoutActive(true);
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="nav-header">
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="logo-badge">
              <div className="logo-icon">
                <Zap size={20} strokeWidth={2.5} />
              </div>
              <span>
                JIM <span style={{ color: 'var(--accent-primary-light)' }}>SYSTEM</span>
              </span>
            </div>

            {/* In-Workout Indicator pill */}
            {isWorkoutActive && (
              <div
                className="badge badge-emerald"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  animation: 'pulse 2s infinite',
                }}
              >
                <Flame size={13} /> IN WORKOUT SESSION
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              onClick={() => { setActiveTab('workouts'); }}
              className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`}
            >
              <History size={15} />
              <span className="hidden-mobile">Workouts</span>
            </button>

            <button
              onClick={() => { setActiveTab('exercises'); }}
              className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            >
              <Dumbbell size={15} />
              <span className="hidden-mobile">Exercises</span>
            </button>

            <button
              onClick={() => { setActiveTab('routines'); }}
              className={`tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
            >
              <Bookmark size={15} />
              <span className="hidden-mobile">Routines</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); }}
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <UserIcon size={15} />
              <span className="hidden-mobile">Profile</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {isWorkoutActive ? (
          <ActiveWorkout
            initialName={activeWorkoutData.name}
            initialExercises={activeWorkoutData.exercises}
            onFinish={() => {
              setIsWorkoutActive(false);
              setActiveTab('workouts');
            }}
            onCancel={() => {
              if (confirm('Discard current workout session?')) {
                setIsWorkoutActive(false);
              }
            }}
          />
        ) : (
          <>
            {activeTab === 'workouts' && (
              <WorkoutHistory onStartNewWorkout={handleStartQuickWorkout} />
            )}

            {activeTab === 'exercises' && (
              <ExerciseLibrary />
            )}

            {activeTab === 'routines' && (
              <WorkoutTemplates onStartFromTemplate={handleStartFromTemplate} />
            )}

            {activeTab === 'profile' && (
              <UserProfileTab />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
