import { useState } from 'react';
import { Leaf, Lock, Mail, User, GraduationCap, BookOpen, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigateLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    adSoyad: '',
    email: '',
    password: '',
    universite: 'ODTÜ',
    bolum: 'Bilgisayar Mühendisliği',
    sehir: '',
    hedeflenenKarbonLimiti: 56,
    haftalikHedef: 56,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      await register({
        adSoyad: formData.adSoyad,
        email: formData.email,
        password: formData.password,
        sifre: formData.password,
        universite: formData.universite,
        bolum: formData.bolum,
        sehir: formData.sehir,
        haftalikHedef: 56,
        hedeflenenKarbonLimiti: 56,
      });
    } catch (err) {
      setError(err.message || 'Kayıt işlemi gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
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

      <div className="relative w-full max-w-lg">
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
            EcoTrack AI Hesabı Oluştur
          </h1>
          <p className="text-sm" style={{ color: '#4B6E5E' }}>
            Kampüsünde ve Türkiye genelinde sürdürülebilirlik liderleri arasına katıl
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
            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
                Ad Soyad
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  color="#4B6E5E"
                />
                <input
                  type="text"
                  required
                  value={formData.adSoyad}
                  onChange={e => handleChange('adSoyad', e.target.value)}
                  placeholder="Örn: Caner Yıldız"
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
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="ornek@metu.edu.tr"
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
                Şifre (En az 6 karakter)
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
                  minLength={6}
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
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

            {/* Üniversite & Bölüm (2 kolon) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
                  Üniversite
                </label>
                <div className="relative">
                  <GraduationCap
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    color="#4B6E5E"
                  />
                  <input
                    type="text"
                    required
                    value={formData.universite}
                    onChange={e => handleChange('universite', e.target.value)}
                    placeholder="ODTÜ, İTÜ, vb."
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

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
                  Bölüm
                </label>
                <div className="relative">
                  <BookOpen
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    color="#4B6E5E"
                  />
                  <input
                    type="text"
                    required
                    value={formData.bolum}
                    onChange={e => handleChange('bolum', e.target.value)}
                    placeholder="Bilgisayar Müh."
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
            </div>

            {/* Şehir */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#4B6E5E' }}>
                Şehir
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  color="#4B6E5E"
                />
                <input
                  type="text"
                  required
                  value={formData.sehir}
                  onChange={e => handleChange('sehir', e.target.value)}
                  placeholder="Örn: Elazığ, İstanbul, Ankara, İzmir..."
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
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 cursor-pointer"
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
                'Hesap Oluşturuluyor…'
              ) : (
                <>
                  <span>Kaydol ve Başla</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login */}
          <div className="mt-6 text-center text-xs" style={{ color: '#4B6E5E' }}>
            Zaten hesabınız var mı?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-semibold hover:underline cursor-pointer transition-colors"
              style={{ color: '#22C55E' }}
            >
              Giriş Yapın
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
