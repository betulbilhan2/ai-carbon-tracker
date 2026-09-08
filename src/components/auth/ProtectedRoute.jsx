import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, fallback }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0F0D', color: '#22C55E' }}
      >
        <div className="flex flex-col items-center gap-3 font-mono text-sm">
          <span className="text-2l animate-spin">🌍 </span>
          <span>EcoTrack AI oturumu doğrulanıyor…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return children;
}
