using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;
using EcoTrack.API.DTOs;
using EcoTrack.API.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/activities")]
[Produces("application/json")]
public class ActivityController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ActivityController> _logger;

    // ── Fogg B=MAP Kural Motoru (Fallback / Yedek Mekanizması) ─────
    private static readonly Dictionary<int, (string Metin, double EtkiSkoru, string PotansiyelTasarruf)> FoggKurallari
        = new()
        {
            [1]  = ("Yarın kampüse otobüs veya metro ile giderek aynı mesafeyi yalnızca 0.36 kg CO₂e ile katedebilirsin.",
                    8.5,
                    "Haftada 5 gün uygulanırsa aylık ~28 kg CO₂e tasarruf"),

            [6]  = ("Bu uçuş mesafesi için tren veya otobüs alternatifini değerlendirmeyi düşün. Emisyonu %80 oranında azaltabilirsin.",
                    9.2,
                    "Her uçuş yerine kara yolu %80 daha az emisyon"),

            [7]  = ("Kullanılmayan elektronik cihazları bekleme modundan tamamen kapat. Aylık ~3 kWh tasarruf sağlayabilirsin.",
                    6.0,
                    "Aylık ~1.4 kg CO₂e tasarruf"),

            [8]  = ("Termostatı 1°C düşürmek ısıtma tüketimini %5-7 azaltır. Aylık ~4 m³ tasarruf hedefi koy.",
                    6.8,
                    "Aylık ~8.2 kg CO₂e tasarruf"),

            [9]  = ("Kömür yerine doğalgaz veya güneş enerjisi kaynaklarına geçiş karbon ayak izini %40 oranında azaltır.",
                    9.5,
                    "Alternatif enerji ile yıllık yüzlerce kg CO₂e tasarruf"),

            [10] = ("Bu öğün yerine vejetaryen seçenek tercih etseydin 5.1 kg CO₂e tasarruf ederdin. Haftada 2 öğün dene!",
                    7.8,
                    "Haftada 2 öğün değişimi → aylık ~45 kg CO₂e tasarruf"),

            [14] = ("Yanına yeniden kullanılabilir mataranı alarak tek kullanımlık plastik tüketimini sıfırlayabilirsin.",
                    7.2,
                    "Günlük 1 şişe azaltma → yıllık ~30 kg CO₂e tasarruf"),

            [17] = ("Organik atıklarını kompostlayarak hem toprak zenginleştir hem de çöp emisyonunu %60 azalt.",
                    6.5,
                    "Kompost ile yıllık ~15 kg CO₂e tasarruf"),
        };

    private static readonly (string Metin, double EtkiSkoru, string PotansiyelTasarruf) YedekOneri =
        ("Günlük küçük adımlar büyük fark yaratır. Ulaşım, enerji ve beslenme alışkanlıklarından birini iyileştirmeyi dene.",
         5.0,
         "Aylık ~10-20 kg CO₂e potansiyel tasarruf");

    public ActivityController(
        EcoTrackDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<ActivityController> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger  = logger;
    }

    // ═══════════════════════════════════════════════════════════════
    // POST /api/activities
    // Sekans Diyagramı Adım 1-7 tam akış (FastAPI AI entegrasyonlu)
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Yeni bir aktivite kaydeder, karbon hesaplar, istatistikleri günceller ve 
    /// Python/FastAPI mikroservisi üzerinden bağlamsal Fogg B=MAP önerisi oluşturur.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ActivityCreatedResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityCreatedResponseDto>> CreateActivity(
        [FromBody] ActivityCreateDto dto)
    {
        // ── Adım 1: Ön Doğrulamalar ─────────────────────────────
        var kategori = await _context.ActivityCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.KategoriId == dto.KategoriId);

        if (kategori is null)
            return NotFound(new { message = $"Kategori bulunamadı. ID: {dto.KategoriId}" });

        bool kullaniciVar = await _context.Users.AnyAsync(u => u.KullaniciId == dto.KullaniciId);
        if (!kullaniciVar)
            return BadRequest(new { message = $"Kullanıcı bulunamadı. ID: {dto.KullaniciId}" });

        // ── Adım 2: Hesaplama Değerleri ─────────────────────────
        double karbonMiktari = Math.Round(dto.TuketimDegeri * kategori.EmisyonKatsayisi, 4);
        DateTime aktiviteTarihi = dto.AktiviteTarihi?.ToUniversalTime() ?? DateTime.UtcNow;

        ActivityCreatedResponseDto? resultResponse = null;

        // ── Adım 3: NpgsqlRetryingExecutionStrategy ile Güvenli İşlem ──
        var strategy = _context.Database.CreateExecutionStrategy();

        try
        {
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                // 1. Aktivite Kaydı
                var aktivite = new Activity
                {
                    KullaniciId    = dto.KullaniciId,
                    KategoriId     = dto.KategoriId,
                    TuketimDegeri  = dto.TuketimDegeri,
                    AktiviteTarihi = aktiviteTarihi,
                };
                _context.Activities.Add(aktivite);
                await _context.SaveChangesAsync();

                // 2. Karbon Hesaplama Kaydı
                var hesaplama = new CarbonCalculation
                {
                    KullaniciId     = dto.KullaniciId,
                    AktiviteId      = aktivite.AktiviteId,
                    KarbonMiktari   = karbonMiktari,
                    HesaplamaTarihi = DateTime.UtcNow,
                };
                _context.CarbonCalculations.Add(hesaplama);
                await _context.SaveChangesAsync();

                // 3. Kullanıcı İstatistiklerini Güncelle
                var istatistik = await _context.UserStatistics
                    .FirstOrDefaultAsync(us => us.KullaniciId == dto.KullaniciId);

                if (istatistik is null)
                {
                    istatistik = new UserStatistic
                    {
                        KullaniciId       = dto.KullaniciId,
                        GunlukSeri        = 1,
                        ToplamTasarruf    = 0.0,
                        RozetAdi          = "İlk Adım",
                        GuncellenmeZamani = DateTime.UtcNow,
                    };
                    _context.UserStatistics.Add(istatistik);
                }
                else
                {
                    bool bugunBaskaAktiviteVar = await _context.Activities
                        .AnyAsync(a => a.KullaniciId == dto.KullaniciId
                                   && a.AktiviteId   != aktivite.AktiviteId
                                   && a.AktiviteTarihi.Date == aktiviteTarihi.Date);

                    if (!bugunBaskaAktiviteVar)
                        istatistik.GunlukSeri += 1;

                    double alternatifTasarruf = Math.Round(karbonMiktari * 0.05, 2);
                    istatistik.ToplamTasarruf   = Math.Round(istatistik.ToplamTasarruf + alternatifTasarruf, 2);
                    istatistik.GuncellenmeZamani = DateTime.UtcNow;

                    istatistik.RozetAdi = istatistik.GunlukSeri switch
                    {
                        >= 30 => "Çevre Şampiyonu 🏆",
                        >= 14 => "14 Günlük Seri 🔥",
                        >= 7  => "Gezegen Dostu 🌍",
                        >= 1  => "İlk Adım 🌱",
                        _     => istatistik.RozetAdi,
                    };
                }
                await _context.SaveChangesAsync();

                // 4. FastAPI Mikroservisine Çağrı Yap (veya Fallback)
                var (oneriMetni, etkiSkoru, potansiyel) = await GetRecommendationFromAiOrFallbackAsync(
                    dto.KullaniciId,
                    dto.KategoriId,
                    kategori.KategoriAdi,
                    dto.TuketimDegeri,
                    karbonMiktari,
                    istatistik.GunlukSeri);

                // 5. Öneriyi Veritabanına Kaydet
                var oneri = new Recommendation
                {
                    KullaniciId       = dto.KullaniciId,
                    HesaplamaId       = hesaplama.HesaplamaId,
                    OneriMetni        = oneriMetni,
                    EtkiSkoru         = etkiSkoru,
                    UygulandiMi       = false,
                    OlusturulmaTarihi = DateTime.UtcNow,
                };
                _context.Recommendations.Add(oneri);
                await _context.SaveChangesAsync();

                // Commit
                await transaction.CommitAsync();

                _logger.LogInformation(
                    "✅ Aktivite başarıyla kaydedildi. AktiviteId={AktiviteId}, Karbon={Karbon} kg CO₂e, AI Skor={Skor}",
                    aktivite.AktiviteId, karbonMiktari, etkiSkoru);

                resultResponse = new ActivityCreatedResponseDto
                {
                    AktiviteId       = aktivite.AktiviteId,
                    HesaplamaId      = hesaplama.HesaplamaId,
                    KategoriAdi      = kategori.KategoriAdi,
                    BirimTipi        = kategori.BirimTipi,
                    TuketimDegeri    = dto.TuketimDegeri,
                    KarbonMiktari    = karbonMiktari,
                    EmisyonKatsayisi = kategori.EmisyonKatsayisi,
                    AktiviteTarihi   = aktiviteTarihi,
                    Mesaj            = $"✅ {kategori.KategoriAdi} aktivitesi kaydedildi. {karbonMiktari:F2} kg CO₂e hesaplandı.",
                    OlusturulanOneri = new OneriOzetiDto
                    {
                        OneriId            = oneri.OneriId,
                        OneriMetni         = oneri.OneriMetni,
                        EtkiSkoru          = oneri.EtkiSkoru,
                        PotansiyelTasarruf = potansiyel,
                        UygulandiMi        = false,
                        OlusturulmaTarihi  = oneri.OlusturulmaTarihi,
                    },
                };
            });

            return CreatedAtAction(nameof(GetRecentActivities), new { kullaniciId = dto.KullaniciId }, resultResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Aktivite kaydedilirken hata oluştu.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Aktivite kaydedilemedi.", hata = ex.Message });
        }
    }

    // ── FastAPI Çağrısı ve Fallback Yardımcı Metodu ─────────────────
    private async Task<(string Metin, double EtkiSkoru, string Potansiyel)> GetRecommendationFromAiOrFallbackAsync(
        int kullaniciId,
        int kategoriId,
        string kategoriAdi,
        double tuketimDegeri,
        double karbonMiktari,
        int gunlukSeri)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("FastApiClient");
            var payload = new
            {
                kullanici_id   = kullaniciId,
                kategori_id    = kategoriId,
                kategori_adi   = kategoriAdi,
                tuketim_degeri = tuketimDegeri,
                karbon_miktari = karbonMiktari,
                gunluk_seri    = gunlukSeri
            };

            var response = await client.PostAsJsonAsync("/api/recommend", payload);
            if (response.IsSuccessStatusCode)
            {
                var aiResult = await response.Content.ReadFromJsonAsync<AiRecommendationResponse>();
                if (aiResult != null && !string.IsNullOrWhiteSpace(aiResult.OneriMetni))
                {
                    _logger.LogInformation("🤖 FastAPI AI önerisi başarıyla alındı. Model: {Model}", aiResult.ModelSurumu);
                    return (aiResult.OneriMetni, aiResult.EtkiSkoru, aiResult.PotansiyelTasarruf);
                }
            }
            else
            {
                _logger.LogWarning("⚠️ FastAPI yanıt kodu: {Code}. Fallback devreye giriyor.", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("⚠️ FastAPI mikroservisine bağlanılamadı ({Hata}). Fallback kural motoru devreye giriyor.", ex.Message);
        }

        // Güvenli Fallback: Yerel kural motoru
        return FoggKurallari.TryGetValue(kategoriId, out var fallback)
            ? fallback
            : YedekOneri;
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/activities/recent?kullaniciId=1
    // ═══════════════════════════════════════════════════════════════
    [HttpGet("recent")]
    [ProducesResponseType(typeof(IEnumerable<AktiviteLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AktiviteLogDto>>> GetRecentActivities(
        [FromQuery] int kullaniciId = 1)
    {
        var sonAktiviteler = await _context.Activities
            .Include(a => a.Category)
            .Include(a => a.CarbonCalculation)
            .Where(a => a.KullaniciId == kullaniciId)
            .OrderByDescending(a => a.AktiviteTarihi)
            .Take(10)
            .Select(a => new AktiviteLogDto
            {
                AktiviteId       = a.AktiviteId,
                KategoriAdi      = a.Category.KategoriAdi,
                BirimTipi        = a.Category.BirimTipi,
                TuketimDegeri    = a.TuketimDegeri,
                HesaplananKarbon = a.CarbonCalculation != null
                                   ? a.CarbonCalculation.KarbonMiktari
                                   : 0.0,
                AktiviteTarihi   = a.AktiviteTarihi,
            })
            .ToListAsync();

        return Ok(sonAktiviteler);
    }

    // ═══════════════════════════════════════════════════════════════
    // DELETE /api/activities/{id} veya /api/Activity/{id}
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Belirtilen aktiviteyi ve bağlı karbon hesaplamasını siler.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteActivity(int id)
    {
        var aktivite = await _context.Activities.FindAsync(id);

        if (aktivite is null)
            return NotFound(new { message = $"Aktivite bulunamadı. ID: {id}" });

        _context.Activities.Remove(aktivite);
        await _context.SaveChangesAsync();

        _logger.LogInformation("🗑️ Aktivite başarıyla silindi. AktiviteId={Id}", id);
        return Ok(new { message = "Aktivite silindi", id = id });
    }
}

// ── FastAPI Response Model ───────────────────────────────────────
internal class AiRecommendationResponse
{
    [JsonPropertyName("oneri_metni")]
    public string OneriMetni { get; set; } = string.Empty;

    [JsonPropertyName("etki_skoru")]
    public double EtkiSkoru { get; set; }

    [JsonPropertyName("potansiyel_tasarruf")]
    public string PotansiyelTasarruf { get; set; } = string.Empty;

    [JsonPropertyName("model_surumu")]
    public string ModelSurumu { get; set; } = string.Empty;
}
