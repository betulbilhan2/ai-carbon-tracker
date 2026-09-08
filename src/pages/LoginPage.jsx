import { useState } from 'react';
import { Leaf, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#0A0F0D' }}
    >
      {/* Background glow effects */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center rounded-2xl p-3 mb-4"
            style={{
              backgroundColor: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)',
              boxShadow: '0 0 25px rgba(34,197,94,0.15)',
            }}
          >
            <Leaf size={32} color="#22C55E" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            EcoTrack AI'a Hoş Geldiniz
          </h1>
          <p className="text-sm" style={{ color: '#4B6E5E' }}>
            Yapay zekâ destekli karbon ayak izi ve davranış koçluğu platformu
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            backgroundColor: '#111816',
            border: '1px solid #1E3A30',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#EF4444',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
                Üniversite E-Postası
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  color="#4B6E5E"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@universite.edu.tr"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#182420',
                    border: '1px solid #1E3A30',
                    color: '#86EFAC',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#22C55E')}
                  onBlur={e => (e.target.style.borderColor = '#1E3A30')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
                Şifre
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  color="#4B6E5E"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#182420',
                    border: '1px solid #1E3A30',
                    color: '#86EFAC',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#22C55E')}
                  onBlur={e => (e.target.style.borderColor = '#1E3A30')}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: loading ? '#1E3A30' : '#22C55E',
                color: loading ? '#4B6E5E' : '#0A0F0D',
                boxShadow: loading ? 'none' : '0 0 20px rgba(34,197,94,0.25)',
              }}
              onMouseEnter={e => {
                if (!loading) e.currentTarget.style.backgroundColor = '#16A34A';
              }}
              onMouseLeave={e => {
                if (!loading) e.currentTarget.style.backgroundColor = '#22C55E';
              }}
            >
              {loading ? (
                'Giriş Yapılıyor…'
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #1E3A30' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold" style={{ color: '#4B6E5E' }}>
                Hızlı Demo Hesapları
              </span>
              <Sparkles size={13} color="#22C55E" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ayse.kaya@metu.edu.tr', 'hashed_secret_123')}
                className="p-2 rounded-xl text-left text-xs transition-colors cursor-pointer"
                style={{ backgroundColor: '#182420', border: '1px solid #1E3A30', color: '#86EFAC' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
              >
                <div className="font-bold truncate">Ayşe Kaya</div>
                <div className="text-[10px] truncate" style={{ color: '#4B6E5E' }}>ODTÜ · Bilgisayar</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('mehmet.demir@metu.edu.tr', '123456')}
                className="p-2 rounded-xl text-left text-xs transition-colors cursor-pointer"
                style={{ backgroundColor: '#182420', border: '1px solid #1E3A30', color: '#86EFAC' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#22C55E')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E3A30')}
              >
                <div className="font-bold truncate">Mehmet Demir</div>
                <div className="text-[10px] truncate" style={{ color: '#4B6E5E' }}>ODTÜ · Makina</div>
              </button>
            </div>
          </div>

          {/* Toggle Register */}
          <div className="mt-6 text-center text-xs" style={{ color: '#4B6E5E' }}>
            Hesabınız yok mu?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="font-semibold hover:underline cursor-pointer transition-colors"
              style={{ color: '#22C55E' }}
            >
              Hemen Kaydolun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
