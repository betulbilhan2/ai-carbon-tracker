namespace EcoTrack.API.DTOs;

/// <summary>
/// Dashboard ana sayfasına özel özet yanıt modeli.
/// </summary>
public class DashboardSummaryDto
{
    // ── Karbon Metrikleri ──────────────────────────────────────────
    /// <summary>Bugünkü toplam karbon emisyonu (kg CO₂e).</summary>
    public double BugunkuKarbon    { get; init; }

    /// <summary>Son 7 güne ait toplam karbon emisyonu (kg CO₂e).</summary>
    public double HaftalikToplamKarbon { get; init; }

    /// <summary>Kullanıcının belirlediği haftalık hedef limit (kg CO₂e).</summary>
    public double HaftalikLimit    { get; init; } = 56.0;

    /// <summary>Haftalık kullanım yüzdesi: (HaftalikToplamKarbon / HaftalikLimit) * 100.</summary>
    public double ButceYuzdesi     { get; init; }

    // ── Gamification ───────────────────────────────────────────────
    /// <summary>Toplam modellenen CO₂e tasarrufu (kg).</summary>
    public double ToplamTasarruf   { get; init; }

    /// <summary>Arka arkaya aktivite girilen gün sayısı.</summary>
    public int    GunlukSeri       { get; init; }

    /// <summary>Hesaplanan Eco-Puan (tasarruf * 10 formülü).</summary>
    public int    EcoPuan          { get; init; }

    /// <summary>Kullanıcının aktif rozet adı.</summary>
    public string AktifRozet      { get; init; } = "İlk Adım";

    // ── AI Öneri ──────────────────────────────────────────────────
    /// <summary>En güncel uygulanmamış AI önerisi.</summary>
    public OneriOzetiDto? GununOnerisi { get; init; }

    // ── Son Aktiviteler ───────────────────────────────────────────
    /// <summary>Kullanıcının son 5 aktivite logu.</summary>
    public IList<AktiviteLogDto> SonAktiviteler { get; init; } = new List<AktiviteLogDto>();
}

/// <summary>
/// Günün önerisi özeti.
/// </summary>
public class OneriOzetiDto
{
    public int    OneriId          { get; init; }
    public string OneriMetni       { get; init; } = string.Empty;
    public double EtkiSkoru        { get; init; }
    public string PotansiyelTasarruf { get; init; } = string.Empty;
    public bool   UygulandiMi      { get; init; }
    public DateTime OlusturulmaTarihi { get; init; }
}

/// <summary>
/// Son aktiviteler listesi satırı.
/// </summary>
public class AktiviteLogDto
{
    public int      AktiviteId      { get; init; }
    public string   KategoriAdi     { get; init; } = string.Empty;
    public string   BirimTipi       { get; init; } = string.Empty;
    public double   TuketimDegeri   { get; init; }
    public double   HesaplananKarbon { get; init; }
    public DateTime AktiviteTarihi  { get; init; }
}

/// <summary>
/// POST /api/activities yanıt modeli.
/// </summary>
public class ActivityCreatedResponseDto
{
    public int      AktiviteId       { get; init; }
    public int      HesaplamaId      { get; init; }
    public string   KategoriAdi      { get; init; } = string.Empty;
    public string   BirimTipi        { get; init; } = string.Empty;
    public double   TuketimDegeri    { get; init; }
    public double   KarbonMiktari    { get; init; }
    public double   EmisyonKatsayisi { get; init; }
    public DateTime AktiviteTarihi   { get; init; }
    public OneriOzetiDto? OlusturulanOneri { get; init; }
    public string   Mesaj            { get; init; } = string.Empty;
}
