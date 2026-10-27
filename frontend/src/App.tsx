import React, { useState, useEffect } from 'react';
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
  Zap,
  Play,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';

type Tab = 'workouts' | 'exercises' | 'routines' | 'profile';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('workouts');

  // Collapsible sidebar state (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jim_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jim_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
              border: '3px solid rgba(200, 102, 62, 0.25)',
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
    <div className="app-container">
      {/* Leftmost Vertical Sidebar */}
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {/* Brand Logo & Collapse Toggle */}
          <div className="sidebar-header-row">
            <div
              className="sidebar-logo"
              onClick={() => setActiveTab('workouts')}
              title="JIM System Dashboard"
            >
              <div className="logo-icon">
                <Zap size={20} strokeWidth={2.5} />
              </div>
              {!isSidebarCollapsed && (
                <div className="sidebar-brand-text">
                  <span>
                    JIM <span style={{ color: 'var(--accent-primary-light)' }}>SYSTEM</span>
                  </span>
                  <span className="sidebar-brand-sub">FITNESS PLATFORM</span>
                </div>
              )}
            </div>

            {/* Collapse toggle icon in header (when expanded) */}
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="sidebar-toggle-btn"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Active Workout Banner if active */}
          {isWorkoutActive && (
            <div
              className={`sidebar-active-card ${isSidebarCollapsed ? 'collapsed' : ''}`}
              title={isSidebarCollapsed ? `Workout Active: ${activeWorkoutData.name || 'Current Workout'}` : undefined}
            >
              <div className="sidebar-pulse-dot" />
              {isSidebarCollapsed ? (
                <>
                  <Flame size={16} color="var(--accent-primary-light)" />
                  <div className="sidebar-tooltip">Workout in Progress</div>
                </>
              ) : (
                <div style={{ minWidth: 0 }}>
                  <div className="sidebar-active-title">SESSION IN PROGRESS</div>
                  <div className="sidebar-active-name" title={activeWorkoutData.name || 'Current Workout'}>
                    {activeWorkoutData.name || 'Quick Workout'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vertical Menu Tabs */}
          <nav className="sidebar-nav-section">
            {!isSidebarCollapsed && <div className="sidebar-nav-label">Main Menu</div>}

            <button
              onClick={() => setActiveTab('workouts')}
              className={`sidebar-tab ${activeTab === 'workouts' ? 'active' : ''}`}
              aria-label="Workouts"
            >
              <div className="sidebar-tab-icon">
                <History size={19} />
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span className="sidebar-tab-label">Workouts</span>
                  {activeTab === 'workouts' && <div className="sidebar-tab-active-dot" />}
                </>
              )}
              {isSidebarCollapsed && <div className="sidebar-tooltip">Workouts</div>}
            </button>

            <button
              onClick={() => setActiveTab('exercises')}
              className={`sidebar-tab ${activeTab === 'exercises' ? 'active' : ''}`}
              aria-label="Exercises"
            >
              <div className="sidebar-tab-icon">
                <Dumbbell size={19} />
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span className="sidebar-tab-label">Exercises</span>
                  {activeTab === 'exercises' && <div className="sidebar-tab-active-dot" />}
                </>
              )}
              {isSidebarCollapsed && <div className="sidebar-tooltip">Exercises</div>}
            </button>

            <button
              onClick={() => setActiveTab('routines')}
              className={`sidebar-tab ${activeTab === 'routines' ? 'active' : ''}`}
              aria-label="Routines"
            >
              <div className="sidebar-tab-icon">
                <Bookmark size={19} />
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span className="sidebar-tab-label">Routines</span>
                  {activeTab === 'routines' && <div className="sidebar-tab-active-dot" />}
                </>
              )}
              {isSidebarCollapsed && <div className="sidebar-tooltip">Routines</div>}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-tab ${activeTab === 'profile' ? 'active' : ''}`}
              aria-label="Profile"
            >
              <div className="sidebar-tab-icon">
                <UserIcon size={19} />
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span className="sidebar-tab-label">Profile</span>
                  {activeTab === 'profile' && <div className="sidebar-tab-active-dot" />}
                </>
              )}
              {isSidebarCollapsed && <div className="sidebar-tooltip">Profile & Settings</div>}
            </button>

            {/* Expand Toggle Button in Rail (matching screenshot circular arrow) */}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="sidebar-tab sidebar-toggle-tab"
                aria-label="Expand sidebar"
              >
                <div className="sidebar-tab-icon sidebar-toggle-circle">
                  <ChevronRight size={17} />
                </div>
                <div className="sidebar-tooltip">Expand Menu</div>
              </button>
            )}
          </nav>

          {/* Quick Action Button */}
          {!isWorkoutActive && (
            <div className={`sidebar-action-wrap ${isSidebarCollapsed ? 'collapsed' : ''}`}>
              <button
                onClick={handleStartQuickWorkout}
                className={`btn btn-primary ${isSidebarCollapsed ? 'sidebar-action-btn-collapsed' : 'sidebar-action-btn'}`}
                aria-label="Start Quick Workout"
              >
                <Play size={15} fill="currentColor" />
                {!isSidebarCollapsed && <span>Quick Workout</span>}
                {isSidebarCollapsed && <div className="sidebar-tooltip">Quick Workout</div>}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer with athlete info & logout */}
        <div className={`sidebar-footer ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div
            className="sidebar-user-card"
            onClick={() => setActiveTab('profile')}
            title={!isSidebarCollapsed ? 'View Athlete Profile' : undefined}
          >
            <div className="sidebar-user-avatar">
              {user?.profile?.avatarUrl ? (
                <img
                  src={user.profile.avatarUrl}
                  alt={user?.profile?.displayName || 'Avatar'}
                  style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
                />
              ) : (
                (user?.profile?.displayName || user?.email || 'A')[0].toUpperCase()
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">
                  {user?.profile?.displayName || 'Athlete'}
                </div>
                <div className="sidebar-user-sub">
                  {user?.profile?.weightUnit || 'KG'} • {user?.role || 'USER'}
                </div>
              </div>
            )}
            {isSidebarCollapsed && <div className="sidebar-tooltip">Athlete Profile</div>}
          </div>

          <button
            onClick={logout}
            className="sidebar-logout-btn"
            title={!isSidebarCollapsed ? 'Sign Out' : undefined}
            aria-label="Sign Out"
          >
            <LogOut size={16} />
            {isSidebarCollapsed && <div className="sidebar-tooltip">Sign Out</div>}
          </button>
        </div>
      </aside>

      {/* Main Content Area on the right */}
      <div className="app-body">
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
