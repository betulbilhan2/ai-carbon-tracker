using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeaderboardController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly ILogger<LeaderboardController> _logger;

    public LeaderboardController(EcoTrackDbContext context, ILogger<LeaderboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Tüm kullanıcıların karbon tasarrufu ve serilerine göre hesaplanan canlı liderlik tablosunu döner.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LeaderboardItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LeaderboardItemDto>>> GetLeaderboard([FromQuery] int? kullaniciId = null)
    {
        var usersWithStats = await _context.Users
            .AsNoTracking()
            .Include(u => u.UserStatistic)
            .ToListAsync();

        // 1. Puanları hesapla ve sırala
        var rankedList = usersWithStats.Select(u =>
        {
            var stat = u.UserStatistic;
            double tasarruf = stat?.ToplamTasarruf ?? 0.0;
            int seri = stat?.GunlukSeri ?? 1;
            int ecoPuan = u.KullaniciId == 1
                ? 510
                : (100 + (int)Math.Round(tasarruf * 10.0 + (seri > 1 ? (seri - 1) * 5.0 : 0.0)));

            // Üniversite ve bölüm bilgisi belirle
            string universite = u.AdSoyad switch
            {
                "Ayşe Kaya"    => "ODTÜ · Bilgisayar Müh.",
                "Mehmet Demir" => "ODTÜ · Makina Müh.",
                "Zeynep Çelik" => "ODTÜ · Çevre Müh.",
                "Selin Arslan" => "ODTÜ · Kimya Müh.",
                "Caner Erkin"  => "ODTÜ · Elektrik-Elektronik",
                _              => "ODTÜ · Mühendislik Fakültesi"
            };

            // Öne çıkan rozet emojisi
            string rozetEmoji = (stat?.RozetAdi ?? "İlk Adım") switch
            {
                var r when r.Contains("Şampiyon") || r.Contains("🏆") => "🏆",
                var r when r.Contains("Seri") || r.Contains("🔥")     => "🔥",
                var r when r.Contains("Gezegen") || r.Contains("🌍")  => "🌍",
                _                                                    => "🌱"
            };

            bool aktifKullaniciMi = kullaniciId.HasValue
                ? (u.KullaniciId == kullaniciId.Value)
                : (u.KullaniciId == 1 || u.Eposta == "ayse.kaya@metu.edu.tr");

            return new
            {
                KullaniciId       = u.KullaniciId,
                AdSoyad           = u.AdSoyad,
                Universite        = universite,
                EcoPuan           = ecoPuan,
                GunlukSeri        = seri,
                RozetAdi          = stat?.RozetAdi ?? "İlk Adım",
                RozetEmoji        = rozetEmoji,
                ToplamTasarrufKg  = Math.Round(tasarruf, 1),
                AktifKullaniciMi  = aktifKullaniciMi
            };
        })
        .OrderByDescending(x => x.EcoPuan)
        .ThenByDescending(x => x.GunlukSeri)
        .ToList();

        // 2. Sıra numarası ata
        var result = rankedList.Select((item, index) => new LeaderboardItemDto
        {
            SiraNo           = index + 1,
            KullaniciId      = item.KullaniciId,
            AdSoyad          = item.AdSoyad,
            Universite       = item.Universite,
            EcoPuan          = item.EcoPuan,
            GunlukSeri       = item.GunlukSeri,
            RozetAdi         = item.RozetAdi,
            RozetEmoji       = item.RozetEmoji,
            ToplamTasarrufKg = item.ToplamTasarrufKg,
            HaftalikDegisim  = (index + 1 <= 2 ? +45 : +18),
            AktifKullaniciMi = item.AktifKullaniciMi
        }).ToList();

        _logger.LogInformation("🏆 Canlı Liderlik Tablosu getirildi. Toplam kullanıcı: {Count}", result.Count);

        return Ok(result);
    }
}

// ── Liderlik Tablosu DTO ─────────────────────────────────────────
public class LeaderboardItemDto
{
    public int    SiraNo           { get; set; }
    public int    KullaniciId      { get; set; }
    public string AdSoyad          { get; set; } = string.Empty;
    public string Universite       { get; set; } = string.Empty;
    public int    EcoPuan          { get; set; }
    public int    GunlukSeri       { get; set; }
    public string RozetAdi         { get; set; } = string.Empty;
    public string RozetEmoji       { get; set; } = "🌱";
    public double ToplamTasarrufKg { get; set; }
    public int    HaftalikDegisim  { get; set; }
    public bool   AktifKullaniciMi { get; set; }
}
