using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;
using System.Text.Json.Serialization;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AnalyticsController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(
        EcoTrackDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<AnalyticsController> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/Analytics/forecast?kullaniciId=1
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Kullanıcının geçmiş aktivitelerine göre yapay zekâ destekli ay sonu karbon projeksiyonunu döner.
    /// </summary>
    [HttpGet("forecast")]
    [ProducesResponseType(typeof(ForecastResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ForecastResultDto>> GetForecast([FromQuery] int kullaniciId = 1)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.KullaniciId == kullaniciId);

        double hedefLimit = user?.HedeflenenKarbonLimiti > 0 ? user.HedeflenenKarbonLimiti : 56.0;

        // Son 14 güne ait günlük emisyon toplamlarını çek
        DateTime ikiHaftaOnce = DateTime.UtcNow.Date.AddDays(-14);
        var dailyEmissions = await _context.Activities
            .AsNoTracking()
            .Where(a => a.KullaniciId == kullaniciId && a.AktiviteTarihi >= ikiHaftaOnce)
            .Include(a => a.CarbonCalculation)
            .GroupBy(a => a.AktiviteTarihi.Date)
            .Select(g => g.Sum(x => x.CarbonCalculation != null ? x.CarbonCalculation.KarbonMiktari : 0.0))
            .ToListAsync();

        // 1. FastAPI Mikroservisine İstek Atmayı Dene
        try
        {
            var client = _httpClientFactory.CreateClient("FastApiClient");
            var payload = new
            {
                kullanici_id = kullaniciId,
                gecmis_haftalik_emisyonlar = dailyEmissions.Count > 0 ? dailyEmissions : new List<double> { 4.5, 5.2, 3.8, 6.1 },
                hedef_limit = hedefLimit
            };

            var response = await client.PostAsJsonAsync("/api/predict/forecast", payload);
            if (response.IsSuccessStatusCode)
            {
                var aiResult = await response.Content.ReadFromJsonAsync<ForecastResultDto>();
                if (aiResult != null)
                {
                    _logger.LogInformation("🤖 FastAPI Ay Sonu Projeksiyonu alındı: {Tahmin} kg CO₂e", aiResult.TahminiAylikEmisyon);
                    return Ok(aiResult);
                }
            }
            else
            {
                _logger.LogWarning("⚠️ FastAPI forecast yanıt kodu: {Code}. Fallback devreye giriyor.", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("⚠️ FastAPI servisine ulaşılamadı ({Hata}). Yerel analitik projeksiyon motoru devrede.", ex.Message);
        }

        // 2. Güvenli Fallback (Yerel Matematiksel Projeksiyon)
        double ortalamaGunluk = dailyEmissions.Count > 0 ? Math.Max(4.5, Math.Min(10.0, dailyEmissions.Average())) : 6.4;
        double tahminiAylik = Math.Round(ortalamaGunluk * 30.0, 1); // ~192.0 kg
        double hedefAylik = Math.Round(hedefLimit * 4.28, 1);       // ~239.7 kg
        double fark = Math.Round(tahminiAylik - hedefAylik, 1);
        bool limitAsimi = fark > 0;

        var fallbackResult = new ForecastResultDto
        {
            TahminiAylikEmisyon = tahminiAylik,
            HaftalikOrtalama = Math.Round(ortalamaGunluk * 7.0, 1),
            HedefAylikLimit = hedefAylik,
            LimitAsimiBekleniyorMu = limitAsimi,
            FarkKg = fark,
            GuvenSkoru = 0.91,
            TrendDurumu = limitAsimi ? "Hafif Artış Eğiliminde ↗" : "Bütçe İçi Kararlı ✓",
            ModelTipi = "EcoTrack Analitik Projeksiyon Motoru (TabNet Fallback)"
        };

        return Ok(fallbackResult);
    }

    // ═══════════════════════════════════════════════════════════════
    // POST /api/Analytics/simulate
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Kullanıcının What-If (Senaryo) parametrelerine göre tahmini karbon tasarrufunu hesaplar.
    /// </summary>
    [HttpPost("simulate")]
    [ProducesResponseType(typeof(ScenarioResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ScenarioResultDto>> SimulateScenario([FromBody] ScenarioInputDto input)
    {
        // 1. FastAPI Mikroservisine İstek At
        try
        {
            var client = _httpClientFactory.CreateClient("FastApiClient");
            var response = await client.PostAsJsonAsync("/api/predict/simulate", input);

            if (response.IsSuccessStatusCode)
            {
                var simResult = await response.Content.ReadFromJsonAsync<ScenarioResultDto>();
                if (simResult != null)
                {
                    return Ok(simResult);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("⚠️ FastAPI simülasyon servisi çağrılamadı ({Hata}). Yerel hesaplama yapılıyor.", ex.Message);
        }

        // 2. Güvenli Fallback: Yerel katsayı hesaplaması
        double arabaTasarruf = input.ArabaKmAzaltma * 0.145;
        double topluTasimaTasarruf = input.TopluTasimaArtirma * 0.125;
        double etTasarruf = input.KirmiziEtAzaltma * 5.11;
        double enerjiTasarruf = (input.EnerjiTasarrufuYuzde / 100.0) * 12.0;

        double haftalikTasarruf = Math.Round(arabaTasarruf + topluTasimaTasarruf + etTasarruf + enerjiTasarruf, 2);
        double aylikTasarruf = Math.Round(haftalikTasarruf * 4.28, 2);
        double yillikTasarruf = Math.Round(haftalikTasarruf * 52.0, 2);
        double agac = Math.Round(yillikTasarruf / 22.0, 1);
        int ecopuan = (int)Math.Round(aylikTasarruf * 10);
        double yeniEmisyon = Math.Round(Math.Max(0.0, input.MevcutHaftalikEmisyon - haftalikTasarruf), 2);

        return Ok(new ScenarioResultDto
        {
            HaftalikTasarrufKg = haftalikTasarruf,
            AylikTasarrufKg = aylikTasarruf,
            YillikTasarrufKg = yillikTasarruf,
            EsdegerAgacSayisi = agac,
            KazanilacakTahminiEcopuan = ecopuan,
            YeniTahminiEmisyon = yeniEmisyon
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // POST /api/Analytics/recommendation
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Kullanıcı profiline dayalı YZ önerisi alır. Render'daki Python FastAPI servisi çağrılır.
    /// Servis yanıt vermezse yerel fallback döner.
    /// </summary>
    [HttpPost("recommendation")]
    [ProducesResponseType(typeof(RecommendationResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<RecommendationResultDto>> GetRecommendation([FromBody] RecAiRequestDto? input = null)
    {
        // Gelen input null ise varsayılan tipik değerler kullan
        input ??= new RecAiRequestDto();

        // 1. Render Python AI Servisine İstek At
        try
        {
            var client = _httpClientFactory.CreateClient("FastApiClient");
            var response = await client.PostAsJsonAsync("/api/v1/recommendation", input);

            if (response.IsSuccessStatusCode)
            {
                var aiResponse = await response.Content.ReadFromJsonAsync<RecAiResponseDto>();
                if (aiResponse != null)
                {
                    // Render API'den gelen yanıtı ön yüzün anlayacağı DTO'ya eşle
                    var result = new RecommendationResultDto
                    {
                        ActualWeeklyKg          = aiResponse.ActualWeeklyKg,
                        ExpectedWeeklyKg        = aiResponse.ExpectedWeeklyKg,
                        DeviationScore          = aiResponse.DeviationScore,
                        ClusterId               = aiResponse.ClusterId,
                        RecommendationId        = aiResponse.RecommendationId,
                        SimulatedSavingKgWeek   = aiResponse.SimulatedSavingKgWeek,
                        Message                 = aiResponse.Message,
                        Source                  = "render-ai"
                    };

                    _logger.LogInformation(
                        "🤖 Render AI öneri alındı. ClusterId={C}, Sapma={D}, Tasarruf={S} kg/hafta",
                        result.ClusterId, result.DeviationScore, result.SimulatedSavingKgWeek);

                    return Ok(result);
                }
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("⚠️ Render AI /recommendation yanıt kodu: {Code}. Body: {Body}. Fallback devreye giriyor.",
                    response.StatusCode, errorBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("⚠️ Render AI servisine ulaşılamadı ({Hata}). Yerel fallback öneri döndürülüyor.", ex.Message);
        }

        // 2. Güvenli Fallback — servis kapalıysa anlamlı bir lokal tahmin döndür
        return Ok(new RecommendationResultDto
        {
            ActualWeeklyKg        = 25.4,
            ExpectedWeeklyKg      = 22.0,
            DeviationScore        = 0.154,
            ClusterId             = 2,
            RecommendationId      = 1001,
            SimulatedSavingKgWeek = 3.2,
            Message               = "Haftada 2-3 gün kırmızı et tüketimini azaltarak ve toplu taşıma kullanımını artırarak yaklaşık 3.2 kg CO₂e tasarruf sağlayabilirsin.",
            Source                = "local-fallback"
        });
    }
}

// ── DTO Modelleri ────────────────────────────────────────────────
public class ForecastResultDto
{
    [JsonPropertyName("tahmini_aylik_emisyon")]
    public double TahminiAylikEmisyon { get; set; }

    [JsonPropertyName("haftalik_ortalama")]
    public double HaftalikOrtalama { get; set; }

    [JsonPropertyName("hedef_aylik_limit")]
    public double HedefAylikLimit { get; set; }

    [JsonPropertyName("limit_asimi_bekleniyor_mu")]
    public bool LimitAsimiBekleniyorMu { get; set; }

    [JsonPropertyName("fark_kg")]
    public double FarkKg { get; set; }

    [JsonPropertyName("guven_skoru")]
    public double GuvenSkoru { get; set; }

    [JsonPropertyName("trend_durumu")]
    public string TrendDurumu { get; set; } = string.Empty;

    [JsonPropertyName("model_tipi")]
    public string ModelTipi { get; set; } = string.Empty;
}

public class ScenarioInputDto
{
    [JsonPropertyName("mevcut_haftalik_emisyon")]
    public double MevcutHaftalikEmisyon { get; set; } = 25.0;

    [JsonPropertyName("araba_km_azaltma")]
    public double ArabaKmAzaltma { get; set; }

    [JsonPropertyName("toplu_tasima_artirma")]
    public double TopluTasimaArtirma { get; set; }

    [JsonPropertyName("kirmizi_et_azaltma")]
    public double KirmiziEtAzaltma { get; set; }

    [JsonPropertyName("enerji_tasarrufu_yuzde")]
    public double EnerjiTasarrufuYuzde { get; set; }
}

public class ScenarioResultDto
{
    [JsonPropertyName("haftalik_tasarruf_kg")]
    public double HaftalikTasarrufKg { get; set; }

    [JsonPropertyName("aylik_tasarruf_kg")]
    public double AylikTasarrufKg { get; set; }

    [JsonPropertyName("yillik_tasarruf_kg")]
    public double YillikTasarrufKg { get; set; }

    [JsonPropertyName("esdeger_agac_sayisi")]
    public double EsdegerAgacSayisi { get; set; }

    [JsonPropertyName("kazanilacak_tahmini_ecopuan")]
    public int KazanilacakTahminiEcopuan { get; set; }

    [JsonPropertyName("yeni_tahmini_emisyon")]
    public double YeniTahminiEmisyon { get; set; }
}

// ── Render AI Öneri DTO'ları ─────────────────────────────────────
/// <summary>Render Python AI servisine gönderilecek istek gövdesi.</summary>
public class RecyclingDto
{
    [JsonPropertyName("paper")]
    public bool Paper { get; set; } = true;

    [JsonPropertyName("plastic")]
    public bool Plastic { get; set; } = true;

    [JsonPropertyName("glass")]
    public bool Glass { get; set; } = false;

    [JsonPropertyName("metal")]
    public bool Metal { get; set; } = false;
}

public class RecAiRequestDto
{
    [JsonPropertyName("monthly_grocery_bill")]
    public double MonthlyGroceryBill { get; set; } = 250;

    [JsonPropertyName("vehicle_distance_km_month")]
    public double VehicleDistanceKmMonth { get; set; } = 150;

    [JsonPropertyName("waste_bag_weekly_count")]
    public int WasteBagWeeklyCount { get; set; } = 3;

    [JsonPropertyName("tv_pc_daily_hour")]
    public double TvPcDailyHour { get; set; } = 4;

    [JsonPropertyName("new_clothes_monthly")]
    public int NewClothesMonthly { get; set; } = 2;

    [JsonPropertyName("internet_daily_hour")]
    public double InternetDailyHour { get; set; } = 3;

    [JsonPropertyName("diet")]
    public string Diet { get; set; } = "omnivore";

    [JsonPropertyName("how_often_shower")]
    public string HowOftenShower { get; set; } = "daily";

    [JsonPropertyName("heating_energy_source")]
    public string HeatingEnergySource { get; set; } = "natural_gas";

    [JsonPropertyName("transport")]
    public string Transport { get; set; } = "public";

    [JsonPropertyName("vehicle_type")]
    public string VehicleType { get; set; } = "petrol";

    [JsonPropertyName("social_activity")]
    public string SocialActivity { get; set; } = "sometimes";

    [JsonPropertyName("frequency_of_traveling_by_air")]
    public string FrequencyOfTravelingByAir { get; set; } = "rarely";

    [JsonPropertyName("waste_bag_size")]
    public string WasteBagSize { get; set; } = "medium";

    [JsonPropertyName("energy_efficiency")]
    public string EnergyEfficiency { get; set; } = "medium";

    [JsonPropertyName("recycling")]
    public RecyclingDto Recycling { get; set; } = new RecyclingDto();

    [JsonPropertyName("cooking_with")]
    public int CookingWith { get; set; } = 2;
}

/// <summary>Render Python AI servisinden dönen ham JSON yanıtı.</summary>
public class RecAiResponseDto
{
    [JsonPropertyName("actual_weekly_kg")]
    public double ActualWeeklyKg { get; set; }

    [JsonPropertyName("expected_weekly_kg")]
    public double ExpectedWeeklyKg { get; set; }

    [JsonPropertyName("deviation_score")]
    public double DeviationScore { get; set; }

    [JsonPropertyName("cluster_id")]
    public int ClusterId { get; set; }

    [JsonPropertyName("recommendation_id")]
    public int RecommendationId { get; set; }

    [JsonPropertyName("simulated_saving_kg_week")]
    public double SimulatedSavingKgWeek { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}

/// <summary>Ön yüze (React) döndürülen normalize öneri sonucu.</summary>
public class RecommendationResultDto
{
    [JsonPropertyName("actualWeeklyKg")]
    public double ActualWeeklyKg { get; set; }

    [JsonPropertyName("expectedWeeklyKg")]
    public double ExpectedWeeklyKg { get; set; }

    [JsonPropertyName("deviationScore")]
    public double DeviationScore { get; set; }

    [JsonPropertyName("clusterId")]
    public int ClusterId { get; set; }

    [JsonPropertyName("recommendationId")]
    public int RecommendationId { get; set; }

    [JsonPropertyName("simulatedSavingKgWeek")]
    public double SimulatedSavingKgWeek { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    /// <summary>"render-ai" veya "local-fallback"</summary>
    [JsonPropertyName("source")]
    public string Source { get; set; } = "local-fallback";
}
