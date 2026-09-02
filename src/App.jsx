import { useState } from 'react';

import Navbar          from './components/layout/Navbar';
import SettingsModal   from './components/settings/SettingsModal';
import OverviewPage    from './pages/OverviewPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import ActivityPage    from './pages/ActivityPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PlaceholderScreen from './components/common/PlaceholderScreen';
import { Settings } from 'lucide-react';

// ── Central App State ─────────────────────────────────────────────
export default function App() {
  const [activeTab,      setActiveTab]      = useState('overview');
  const [ecoScore,       setEcoScore]       = useState(847);
  const [streak,         setStreak]         = useState(12);
  const [taskDone,       setTaskDone]       = useState(false);
  const [totalSavedKg,   setTotalSavedKg]   = useState(18.4);
  const [weeklyLimit,    setWeeklyLimit]    = useState(56);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab,    setSettingsTab]    = useState('budget');

  // ── Handlers ────────────────────────────────────────────────────
  function handleTaskComplete() {
    if (taskDone) return;
    setTaskDone(true);
    setEcoScore(prev => prev + 50);
    setStreak(prev => prev + 1);
  }

  function handleActivitySaved({ kg }) {
    const pts = Math.max(5, Math.round(10 - kg * 0.5));
    setEcoScore(prev => prev + pts);
    setTotalSavedKg(prev => +(prev + kg * 0.05).toFixed(1));
  }

  function openSettings(tab = 'budget') {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }

  function handleSettingsSave({ weeklyLimit: newLimit }) {
    setWeeklyLimit(newLimit);
  }

  // ── Page router ──────────────────────────────────────────────────
  function renderContent() {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            ecoScore={ecoScore}
            streak={streak}
            taskDone={taskDone}
            weeklyLimit={weeklyLimit}
            onTaskComplete={handleTaskComplete}
            onNavigateActivity={() => setActiveTab('activity')}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            onNavigateCoach={() => setActiveTab('overview')}
          />
        );
      case 'activity':
        return (
          <ActivityPage onActivitySaved={handleActivitySaved} />
        );
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'settings':
        return (
          <PlaceholderScreen
            icon={Settings}
            title="Ayarlar"
            description="Ayarlar modalını açmak için sağ üstteki ⚙️ ikonuna veya bütçe kapsülündeki Düzenle butonuna tıklayın."
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F0D' }}>
      {/* ── Sticky Navbar ── */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        weeklyLimit={weeklyLimit}
        ecoScore={ecoScore}
        onOpenSettings={() => openSettings('budget')}
        onOpenBudget={() => openSettings('budget')}
      />

      {/* ── Main content — full width ── */}
      <main>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

          {/* Task-complete flash notification */}
          {taskDone && (
            <div
              className="flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium"
              style={{
                backgroundColor: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22C55E',
              }}
            >
              <span>🎉</span>
              <span>
                Harika! +50 Eco-Puan kazandın. Toplam:{' '}
                <strong className="font-mono">{ecoScore} pts</strong> — Seri:{' '}
                <strong>{streak} gün</strong>
              </span>
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      {/* ── Settings Modal ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsTab}
        weeklyLimit={weeklyLimit}
        onSave={handleSettingsSave}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
