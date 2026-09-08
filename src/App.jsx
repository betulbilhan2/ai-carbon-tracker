import { useState, useEffect } from 'react';

import Navbar          from './components/layout/Navbar';
import SettingsModal   from './components/settings/SettingsModal';
import OverviewPage    from './pages/OverviewPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import ActivityPage    from './pages/ActivityPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PlaceholderScreen from './components/common/PlaceholderScreen';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { updateWeeklyTarget, getDashboardSummary } from './services/api';
import { Settings, Leaf } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  const [activeTab,      setActiveTab]      = useState('overview');
  const [ecoScore,       setEcoScore]       = useState(100);
  const [streak,         setStreak]         = useState(1);
  const [taskDone,       setTaskDone]       = useState(false);
  const [totalSavedKg,   setTotalSavedKg]   = useState(0.0);
  const [weeklyLimit,    setWeeklyLimit]    = useState(56);
  const [weeklyUsed,     setWeeklyUsed]     = useState(0.0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab,    setSettingsTab]    = useState('budget');
  const [selectedCategory, setSelectedCategory] = useState('transport');

  // Kullanıcı giriş yaptığında veya profil yüklendiğinde hedeflenen bütçeyi ve istatistikleri senkronize et
  useEffect(() => {
    if (user) {
      const limit = Number(user.haftalik_hedef ?? user.hedeflenenKarbonLimiti ?? 56);
      const score = Number(user.ecoScore ?? user.ecoPuan ?? (user.kullaniciId === 1 ? 847 : 100));
      const s = Number(user.streak ?? user.gunlukSeri ?? (user.kullaniciId === 1 ? 12 : 1));
      const used = Number(user.haftalik_emisyon ?? user.haftalikToplamKarbon ?? (user.kullaniciId === 1 ? 34.2 : 0.0));

      setWeeklyLimit(limit);
      setEcoScore(score);
      setStreak(s);
      setWeeklyUsed(used);

      const userId = user.kullaniciId || user.kullanici_id;
      if (userId) {
        getDashboardSummary(userId)
          .then(summary => {
            if (summary) {
              if (typeof summary.haftalikToplamKarbon === 'number') {
                setWeeklyUsed(summary.haftalikToplamKarbon);
              }
              if (typeof summary.haftalikLimit === 'number') {
                setWeeklyLimit(summary.haftalikLimit);
              }
              if (typeof summary.ecoPuan === 'number') {
                setEcoScore(summary.ecoPuan);
              }
              if (typeof summary.gunlukSeri === 'number') {
                setStreak(summary.gunlukSeri);
              }
              if (typeof summary.toplamTasarruf === 'number') {
                setTotalSavedKg(summary.toplamTasarruf);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  // ── Handlers ────────────────────────────────────────────────────
  function handleTaskComplete() {
    setTaskDone(true);
    setEcoScore(prev => prev + 50);
    setStreak(prev => prev + 1);
  }

  function handleActivitySaved({ kg }) {
    const pts = Math.max(5, Math.round(10 - kg * 0.5));
    setEcoScore(prev => prev + pts);
    setTotalSavedKg(prev => +(prev + kg * 0.05).toFixed(1));
    setWeeklyUsed(prev => +(prev + kg).toFixed(1));
  }

  function openSettings(tab = 'budget') {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  }

  async function handleSettingsSave({ weeklyLimit: newLimit }) {
    setWeeklyLimit(newLimit);
    try {
      const userId = user?.kullaniciId || 1;
      await updateWeeklyTarget(userId, newLimit);
      console.log('✅ Haftalık karbon hedefi veritabanında güncellendi:', newLimit);
    } catch (err) {
      console.error('Haftalık hedef güncellenirken hata:', err);
    }
  }

  function handleNavigateActivity(category = 'transport') {
    setSelectedCategory(category);
    setActiveTab('activity');
  }

  function handleNavigateLeaderboard() {
    setActiveTab('leaderboard');
  }

  // ── Yükleniyor Ekranı ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#0A0F0D' }}>
        <div
          className="flex items-center justify-center rounded-2xl p-4 mb-3 animate-pulse"
          style={{
            backgroundColor: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <Leaf size={32} color="#22C55E" />
        </div>
        <p className="text-sm font-medium text-emerald-400 font-mono animate-pulse">
          EcoTrack AI başlatılıyor...
        </p>
      </div>
    );
  }

  // ── Kimlik Doğrulama Ekranları (Login / Register) ─────────────────
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthView('register')} />;
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
            onNavigateActivity={handleNavigateActivity}
            onNavigateLeaderboard={handleNavigateLeaderboard}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            onNavigateCoach={(category) => handleNavigateActivity(category || 'waste')}
          />
        );
      case 'activity':
        return (
          <ActivityPage 
            onActivitySaved={handleActivitySaved} 
            initialCategory={selectedCategory} 
          />
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
        weeklyUsed={weeklyUsed}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
