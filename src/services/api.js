// ── Merkezi API İstemcisi ─────────────────────────────────────────
// Tüm backend iletişimi bu dosya üzerinden yönetilir.

const BASE_URL = 'http://localhost:5284/api';

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
// Haftalık Limiti Güncelle
// PUT /api/Dashboard/limit
// ─────────────────────────────────────────────────────────────────
export async function updateWeeklyLimit(yeniLimit, kullaniciId = 1) {
  return apiFetch(`/Dashboard/limit?kullaniciId=${kullaniciId}&yeniLimit=${yeniLimit}`, {
    method: 'PUT',
  });
}
