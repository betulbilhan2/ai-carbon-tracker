// ── Merkezi API İstemcisi ─────────────────────────────────────────
// Tüm backend iletişimi bu dosya üzerinden yönetilir.

export const BASE_URL = 'http://localhost:5284/api';
export const API_BASE_URL = BASE_URL;

// ── Yardımcı: ortak fetch ─────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  // Yanıt gövdesi her zaman JSON olmayabilir (204 No Content vb.)
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const errMsg = data?.message ?? data?.title ?? `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────
// Aktivite Kategorileri
// GET /api/Category
// ─────────────────────────────────────────────────────────────────
export async function getCategories() {
  return apiFetch('/Category');
}

// ─────────────────────────────────────────────────────────────────
// Aktivite Kaydet
// POST /api/Activity
// data: { kullaniciId, kategoriId, tuketimDegeri, aktiviteTarihi?, not? }
// ─────────────────────────────────────────────────────────────────
export async function createActivity(data) {
  return apiFetch('/Activity', {
    method: 'POST',
    body: JSON.stringify({
      kullaniciId:    data.kullaniciId    ?? 1,
      kategoriId:     data.kategoriId,
      tuketimDegeri:  data.tuketimDegeri,
      aktiviteTarihi: data.aktiviteTarihi ?? new Date().toISOString(),
      not:            data.not            ?? null,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// Son Aktiviteler
// GET /api/Activity/recent?kullaniciId=1
// ─────────────────────────────────────────────────────────────────
export async function getRecentActivities(kullaniciId = 1) {
  return apiFetch(`/Activity/recent?kullaniciId=${kullaniciId}`);
}

// ─────────────────────────────────────────────────────────────────
// Aktivite Sil
// DELETE /api/activities/{id}
// ─────────────────────────────────────────────────────────────────
export const deleteActivity = async (id) => {
  const res = await fetch(`${BASE_URL}/activities/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Silme işlemi başarısız");
  }
  const text = await res.text();
  return text ? JSON.parse(text) : { message: "Aktivite silindi" };
};

// ─────────────────────────────────────────────────────────────────
// Dashboard Özeti
// GET /api/Dashboard/summary?kullaniciId=1
// ─────────────────────────────────────────────────────────────────
export async function getDashboardSummary(kullaniciId = 1) {
  return apiFetch(`/Dashboard/summary?kullaniciId=${kullaniciId}`);
}

// ─────────────────────────────────────────────────────────────────
// Öneriyi Uygula
// PUT /api/Dashboard/recommendation/{id}/apply
// ─────────────────────────────────────────────────────────────────
export async function applyRecommendation(id, kullaniciId = 1) {
  return apiFetch(`/Dashboard/recommendation/${id}/apply?kullaniciId=${kullaniciId}`, {
    method: 'PUT',
  });
}

// ─────────────────────────────────────────────────────────────────
// Haftalık Limiti Güncelle (User / Target)
// PUT /api/User/target
// ─────────────────────────────────────────────────────────────────
export async function updateWeeklyTarget(kullaniciId = 1, yeniHedef = 56.0) {
  return apiFetch('/User/target', {
    method: 'PUT',
    body: JSON.stringify({
      kullaniciId,
      yeniHedef: Number(yeniHedef),
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// Kullanıcıya Eco-Puan Ekle
// POST /api/User/add-points
// ─────────────────────────────────────────────────────────────────
export async function addUserPoints(kullaniciId = 1, puan = 50) {
  return apiFetch('/User/add-points', {
    method: 'POST',
    body: JSON.stringify({
      kullaniciId,
      puan: Number(puan),
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// Liderlik Tablosu
// GET /api/Leaderboard
// ─────────────────────────────────────────────────────────────────
export async function getLeaderboard() {
  return apiFetch('/Leaderboard');
}

// ─────────────────────────────────────────────────────────────────
// Tahminsel Analizler: Ay Sonu Karbon Projeksiyonu
// GET /api/Analytics/forecast?kullaniciId=1
// ─────────────────────────────────────────────────────────────────
export async function getCarbonForecast(kullaniciId = 1) {
  return apiFetch(`/Analytics/forecast?kullaniciId=${kullaniciId}`);
}

// ─────────────────────────────────────────────────────────────────
// Tahminsel Analizler: What-If Senaryo Simülatörü
// POST /api/Analytics/simulate
// ─────────────────────────────────────────────────────────────────
export async function simulateScenario(scenarioData) {
  return apiFetch('/Analytics/simulate', {
    method: 'POST',
    body: JSON.stringify({
      mevcut_haftalik_emisyon: scenarioData.mevcutHaftalikEmisyon ?? 25.0,
      araba_km_azaltma:        Number(scenarioData.arabaKmAzaltma ?? 0),
      toplu_tasima_artirma:    Number(scenarioData.topluTasimaArtirma ?? 0),
      kirmizi_et_azaltma:      Number(scenarioData.kirmiziEtAzaltma ?? 0),
      enerji_tasarrufu_yuzde:  Number(scenarioData.enerjiTasarrufuYuzde ?? 0),
    }),
  });
}
