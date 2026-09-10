import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLoginUser, registerUser as apiRegisterUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ecotrack_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecotrack_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [latestAiRecommendation, setLatestAiRecommendation] = useState(() => {
    const saved = localStorage.getItem('ecotrack_ai_recommendation');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const normalizeUser = (u) => {
    if (!u) return null;
    const uid = u.id ?? u.kullanici_id ?? u.kullaniciId ?? u.KullaniciId ?? 1;
    const adSoyad = u.ad_soyad ?? u.adSoyad ?? u.AdSoyad ?? u.name ?? 'Kullanıcı';
    const email = u.email ?? u.Email ?? u.eposta ?? '';
    const universite = u.universite ?? u.Universite ?? u.university ?? '';
    const bolum = u.bolum ?? u.Bolum ?? u.department ?? '';
    const sehir = u.sehir ?? u.Sehir ?? u.city ?? '';
    const birincilUlasim = u.birincil_ulasim ?? u.birincilUlasim ?? u.transport ?? 'Özel Araç';
    const diyetTuru = u.diyet_turu ?? u.diyetTuru ?? u.diet ?? 'Az Etli (Flexitarian)';
    const hedeflenenKarbonLimiti = Number(u.hedeflenenKarbonLimiti ?? u.haftalik_hedef ?? 56.0);
    const gunlukSeri = Number(u.currentStreak ?? u.streak ?? u.gunlukSeri ?? u.gunluk_seri ?? (uid === 1 ? 12 : 1));
    const ecoPuan = Number(u.ecoScore ?? u.ecoPuan ?? (uid === 1 ? 847 : 100));
    const haftalikToplamKarbon = Number(u.haftalikToplamKarbon ?? u.haftalik_emisyon ?? (uid === 1 ? 34.2 : 0.0));

    return {
      id: uid,
      kullaniciId: uid,
      kullanici_id: uid,
      ad_soyad: adSoyad,
      adSoyad,
      email,
      eposta: email,
      universite: universite || 'Kampüsüm',
      Universite: universite || 'Kampüsüm',
      university: universite || 'Kampüsüm',
      bolum,
      Bolum: bolum,
      department: bolum,
      sehir: sehir || 'Şehrim',
      Sehir: sehir || 'Şehrim',
      city: sehir || 'Şehrim',
      birincil_ulasim: birincilUlasim,
      birincilUlasim,
      transport: birincilUlasim,
      diyet_turu: diyetTuru,
      diyetTuru,
      diet: diyetTuru,
      hedeflenenKarbonLimiti,
      haftalik_hedef: hedeflenenKarbonLimiti,
      gunlukSeri,
      gunluk_seri: gunlukSeri,
      currentStreak: gunlukSeri,
      streak: gunlukSeri,
      ecoPuan,
      ecoScore: ecoPuan,
      haftalikToplamKarbon,
      haftalik_emisyon: haftalikToplamKarbon,
    };
  };

  // Uygulama ilk açıldığında token varsa kullanıcı profilini doğrula
  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const profile = await getCurrentUser();
          if (profile) {
            // Eğer localStorage'da kayıtlı kullanıcı verisi varsa yerel profil bilgilerini koru
            const savedLocal = localStorage.getItem('ecotrack_user');
            let parsedLocal = null;
            if (savedLocal) {
              try { parsedLocal = JSON.parse(savedLocal); } catch {}
            }

            const merged = normalizeUser({
              ...profile,
              ...(parsedLocal || {}),
              ecoPuan: profile.ecoPuan ?? parsedLocal?.ecoPuan,
              gunlukSeri: profile.gunlukSeri ?? parsedLocal?.gunlukSeri,
              haftalikToplamKarbon: profile.haftalikToplamKarbon ?? parsedLocal?.haftalikToplamKarbon,
            });

            setUser(merged);
            localStorage.setItem('ecotrack_user', JSON.stringify(merged));
          }
        } catch (err) {
          console.warn('Oturum doğrulanamadı veya token süresi doldu:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (credentials) => {
    const response = await apiLoginUser(credentials);
    if (response && response.token) {
      setToken(response.token);
      localStorage.setItem('ecotrack_token', response.token);

      const userData = normalizeUser(response);
      setUser(userData);
      localStorage.setItem('ecotrack_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Geçersiz sunucu yanıtı.');
  };

  const register = async (formData) => {
    const response = await apiRegisterUser(formData);
    if (response && response.token) {
      setToken(response.token);
      localStorage.setItem('ecotrack_token', response.token);

      const userData = normalizeUser(response);
      setUser(userData);
      localStorage.setItem('ecotrack_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Kayıt başarısız oldu.');
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = { ...(prev || {}), ...updatedData };
      if (updatedData.ecoScore !== undefined || updatedData.ecoPuan !== undefined) {
        const val = Number(updatedData.ecoScore ?? updatedData.ecoPuan);
        merged.ecoScore = val;
        merged.ecoPuan = val;
      }
      if (updatedData.currentStreak !== undefined || updatedData.streak !== undefined || updatedData.gunlukSeri !== undefined) {
        const sVal = Number(updatedData.currentStreak ?? updatedData.streak ?? updatedData.gunlukSeri);
        merged.currentStreak = sVal;
        merged.streak = sVal;
        merged.gunlukSeri = sVal;
        merged.gunluk_seri = sVal;
      }
      const newUser = normalizeUser(merged);
      localStorage.setItem('ecotrack_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const addScoreAndStreak = (pointsToAdd = 0, streakToAdd = 0) => {
    setUser(prev => {
      if (!prev) return prev;
      const curScore = Number(prev.ecoScore ?? prev.ecoPuan ?? 100);
      const curStreak = Number(prev.currentStreak ?? prev.streak ?? prev.gunlukSeri ?? 1);
      const newScore = curScore + pointsToAdd;
      const newStreak = curStreak + streakToAdd;
      const updated = normalizeUser({
        ...prev,
        ecoScore: newScore,
        ecoPuan: newScore,
        currentStreak: newStreak,
        streak: newStreak,
        gunlukSeri: newStreak,
        gunluk_seri: newStreak,
      });
      localStorage.setItem('ecotrack_user', JSON.stringify(updated));
      return updated;
    });
  };

  const saveAiRecommendation = (rec) => {
    setLatestAiRecommendation(rec);
    if (rec) {
      localStorage.setItem('ecotrack_ai_recommendation', JSON.stringify(rec));
    } else {
      localStorage.removeItem('ecotrack_ai_recommendation');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setLatestAiRecommendation(null);
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    localStorage.removeItem('ecotrack_ai_recommendation');
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    updateUser,
    addScoreAndStreak,
    logout,
    latestAiRecommendation,
    saveAiRecommendation,
    setLatestAiRecommendation: saveAiRecommendation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
