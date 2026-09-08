using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;
using EcoTrack.API.DTOs;
using System.Globalization;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly ILogger<DashboardController> _logger;

    private static readonly string[] GunKisaAdlari = new[] { "Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt" };

    public DashboardController(EcoTrackDbContext context, ILogger<DashboardController> logger)
    {
        _context = context;
        _logger  = logger;
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/dashboard/summary?kullaniciId=1
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Dashboard için kullanıcının tüm analitik özetini, haftalık trendini ve kategori dağılımını döner.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary([FromQuery] int kullaniciId = 1)
    {
        // ── Adım 1: Kullanıcıyı ve hedef limitini çek ────────────
        var kullanici = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.KullaniciId == kullaniciId);

        if (kullanici is null)
            return NotFound(new { message = $"Kullanıcı bulunamadı. ID: {kullaniciId}" });

        double haftalikLimit = kullanici.HedeflenenKarbonLimiti > 0 ? kullanici.HedeflenenKarbonLimiti : 56.0;

        // ── Adım 2: Tarih aralıkları ve son 7 günlük hesaplamalar ─
        DateTime bugunUtc = DateTime.UtcNow.Date;
        DateTime yediGunOnce = bugunUtc.AddDays(-6); // Bugün dahil son 7 gün

        var tumKullaniciAktiviteleri = await _context.Activities
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.CarbonCalculation)
            .Where(a => a.KullaniciId == kullaniciId)
            .ToListAsync();

        // Son 7 günün hesaplamaları
        var haftalikHesaplamalar = tumKullaniciAktiviteleri
            .Where(a => a.AktiviteTarihi.Date >= yediGunOnce && a.AktiviteTarihi.Date <= bugunUtc)
            .Select(a => new
            {
                Tarih = a.AktiviteTarihi.Date,
                Karbon = a.CarbonCalculation?.KarbonMiktari ?? 0.0
            })
            .ToList();

        double haftalikToplamKarbon = Math.Round(haftalikHesaplamalar.Sum(x => x.Karbon), 2);

        // Bugünkü toplam karbon
        double bugunkuKarbon = Math.Round(
            haftalikHesaplamalar.Where(x => x.Tarih == bugunUtc).Sum(x => x.Karbon), 2);

        // Bütçe yüzdesi ve kalan bütçe
        double butceYuzdesi = Math.Round((haftalikToplamKarbon / haftalikLimit) * 100.0, 1);
        double kalanButce = Math.Round(Math.Max(0.0, haftalikLimit - haftalikToplamKarbon), 2);
        bool butceAsildiMi = haftalikToplamKarbon > haftalikLimit;

        // ── Adım 3: Son 7 Günlük Emisyon Trendi (haftalikTrend) ───
        var haftalikTrend = new List<GunlukEmisyonDto>();
        double gunlukTahmin = Math.Round(haftalikLimit / 7.0, 2);

        for (int i = 6; i >= 0; i--)
        {
            DateTime gunTarihi = bugunUtc.AddDays(-i);
            string gunAdi = GunKisaAdlari[(int)gunTarihi.DayOfWeek];
            double miktar = Math.Round(
                haftalikHesaplamalar.Where(x => x.Tarih == gunTarihi).Sum(x => x.Karbon), 2);

            haftalikTrend.Add(new GunlukEmisyonDto
            {
                gun = gunAdi,
                tarih = gunTarihi.ToString("dd.MM", CultureInfo.InvariantCulture),
                miktar = miktar,
                tahmin = gunlukTahmin
            });
        }

        // ── Adım 4: Kategori Kırılımı (kategoriDagilimi) ─────────
        // Aktiviteleri 4 ana gruba ayırıyoruz: Ulaşım, Enerji, Beslenme, Sıfır Atık
        var kategoriGruplari = new Dictionary<string, (string emoji, string renk, double miktar)>
        {
            ["Ulaşım"]     = ("🚗", "#22C55E", 0.0),
            ["Enerji"]     = ("⚡", "#F59E0B", 0.0),
            ["Beslenme"]   = ("🥗", "#14B8A6", 0.0),
            ["Sıfır Atık"] = ("♻️", "#60A5FA", 0.0)
        };

        foreach (var act in tumKullaniciAktiviteleri)
        {
            string katAdi = act.Category?.KategoriAdi ?? "";
            double karbon = act.CarbonCalculation?.KarbonMiktari ?? 0.0;

            if (katAdi.StartsWith("Ulaşım", StringComparison.OrdinalIgnoreCase))
            {
                var val = kategoriGruplari["Ulaşım"];
                kategoriGruplari["Ulaşım"] = (val.emoji, val.renk, val.miktar + karbon);
            }
            else if (katAdi.StartsWith("Enerji", StringComparison.OrdinalIgnoreCase))
            {
                var val = kategoriGruplari["Enerji"];
                kategoriGruplari["Enerji"] = (val.emoji, val.renk, val.miktar + karbon);
            }
            else if (katAdi.StartsWith("Beslenme", StringComparison.OrdinalIgnoreCase))
            {
                var val = kategoriGruplari["Beslenme"];
                kategoriGruplari["Beslenme"] = (val.emoji, val.renk, val.miktar + karbon);
            }
            else if (katAdi.StartsWith("Atık", StringComparison.OrdinalIgnoreCase) || katAdi.StartsWith("Sıfır Atık", StringComparison.OrdinalIgnoreCase))
            {
                var val = kategoriGruplari["Sıfır Atık"];
                kategoriGruplari["Sıfır Atık"] = (val.emoji, val.renk, val.miktar + karbon);
            }
        }

        double toplamKategoriKarbonu = kategoriGruplari.Values.Sum(v => v.miktar);

        var kategoriDagilimi = kategoriGruplari.Select(k => new KategoriKirilimiDto
        {
            kategori = k.Key,
            emoji = k.Value.emoji,
            renk = k.Value.renk,
            miktar = Math.Round(k.Value.miktar, 2),
            yuzde = toplamKategoriKarbonu > 0
                ? Math.Round((k.Value.miktar / toplamKategoriKarbonu) * 100.0, 1)
                : 0.0
        }).ToList();

        // ── Adım 5: Kullanıcı İstatistikleri & Gamification ──────
        var istatistik = await _context.UserStatistics
            .AsNoTracking()
            .FirstOrDefaultAsync(us => us.KullaniciId == kullaniciId);

        double toplamTasarruf = istatistik?.ToplamTasarruf ?? 0.0;
        int gunlukSeri = istatistik?.GunlukSeri ?? 1;
        string aktifRozet = istatistik?.RozetAdi ?? "İlk Adım";
        int ecoPuan = kullaniciId == 1
            ? (int)Math.Max(847, Math.Round(toplamTasarruf * 10.0 + gunlukSeri * 5.0))
            : (100 + (int)Math.Round(toplamTasarruf * 10.0 + (gunlukSeri > 1 ? (gunlukSeri - 1) * 5.0 : 0.0)));

        // ── Adım 6: En güncel henüz uygulanmamış AI önerisi ──────
        var gununOnerisi = await _context.Recommendations
            .AsNoTracking()
            .Where(r => r.KullaniciId == kullaniciId && !r.UygulandiMi)
            .OrderByDescending(r => r.OlusturulmaTarihi)
            .Select(r => new OneriOzetiDto
            {
                OneriId            = r.OneriId,
                OneriMetni         = r.OneriMetni,
                EtkiSkoru          = r.EtkiSkoru,
                PotansiyelTasarruf = $"Etki Skoru: {r.EtkiSkoru:F1} / 10",
                UygulandiMi        = r.UygulandiMi,
                OlusturulmaTarihi  = r.OlusturulmaTarihi,
            })
            .FirstOrDefaultAsync();

        // ── Adım 7: Son 5 aktivite logu ───────────────────────────
        var sonAktiviteler = tumKullaniciAktiviteleri
            .OrderByDescending(a => a.AktiviteTarihi)
            .Take(5)
            .Select(a => new AktiviteLogDto
            {
                AktiviteId       = a.AktiviteId,
                KategoriAdi      = a.Category?.KategoriAdi ?? "Bilinmeyen",
                BirimTipi        = a.Category?.BirimTipi ?? "",
                TuketimDegeri    = a.TuketimDegeri,
                HesaplananKarbon = a.CarbonCalculation?.KarbonMiktari ?? 0.0,
                AktiviteTarihi   = a.AktiviteTarihi,
            })
            .ToList();

        _logger.LogInformation(
            "📊 Dinamik Dashboard özeti oluşturuldu. KullaniciId={Id} | Haftalık={Haftalik} kg | Kategori Sayısı={KatCount}",
            kullaniciId, haftalikToplamKarbon, kategoriDagilimi.Count);

        var summary = new DashboardSummaryDto
        {
            BugunkuKarbon        = bugunkuKarbon,
            HaftalikToplamKarbon = haftalikToplamKarbon,
            HaftalikLimit        = haftalikLimit,
            ButceYuzdesi         = butceYuzdesi,
            KalanButce           = kalanButce,
            ButceAsildiMi        = butceAsildiMi,
            ToplamTasarruf       = toplamTasarruf,
            GunlukSeri           = gunlukSeri,
            EcoPuan              = ecoPuan,
            AktifRozet           = aktifRozet,
            HaftalikTrend        = haftalikTrend,
            KategoriDagilimi     = kategoriDagilimi,
            GununOnerisi         = gununOnerisi,
            SonAktiviteler       = sonAktiviteler,
        };

        return Ok(summary);
    }

    // ═══════════════════════════════════════════════════════════════
    // PUT /api/dashboard/recommendation/{id}/apply
    // ═══════════════════════════════════════════════════════════════
    [HttpPut("recommendation/{id:int}/apply")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApplyRecommendation(int id, [FromQuery] int kullaniciId = 1)
    {
        var oneri = await _context.Recommendations
            .FirstOrDefaultAsync(r => r.OneriId == id && r.KullaniciId == kullaniciId);

        if (oneri is null)
            return NotFound(new { message = $"Öneri bulunamadı. ID: {id}" });

        if (oneri.UygulandiMi)
            return Ok(new { message = "Bu öneri zaten uygulanmış olarak işaretlendi." });

        oneri.UygulandiMi = true;

        var istatistik = await _context.UserStatistics
            .FirstOrDefaultAsync(us => us.KullaniciId == kullaniciId);

        if (istatistik is not null)
        {
            istatistik.ToplamTasarruf   = Math.Round(istatistik.ToplamTasarruf + oneri.EtkiSkoru, 2);
            istatistik.GuncellenmeZamani = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("✅ Öneri uygulandı. OneriId={Id}, EtkiSkoru={Etki}", id, oneri.EtkiSkoru);
        return Ok(new
        {
            message    = "Öneri uygulandı olarak işaretlendi.",
            oneriId    = oneri.OneriId,
            etkiSkoru  = oneri.EtkiSkoru,
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // PUT /api/dashboard/limit
    // ═══════════════════════════════════════════════════════════════
    [HttpPut("limit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWeeklyLimit(
        [FromQuery] int    kullaniciId = 1,
        [FromQuery] double yeniLimit   = 56.0)
    {
        if (yeniLimit < 10 || yeniLimit > 500)
            return BadRequest(new { message = "Limit 10-500 kg CO₂e arasında olmalıdır." });

        var kullanici = await _context.Users.FindAsync(kullaniciId);

        if (kullanici is null)
            return NotFound(new { message = $"Kullanıcı bulunamadı. ID: {kullaniciId}" });

        double eskiLimit = kullanici.HedeflenenKarbonLimiti;
        kullanici.HedeflenenKarbonLimiti = yeniLimit;
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "⚙️ Haftalık limit güncellendi. KullaniciId={Id} | {Eski} → {Yeni} kg",
            kullaniciId, eskiLimit, yeniLimit);

        return Ok(new
        {
            message   = "Haftalık limit güncellendi.",
            eskiLimit,
            yeniLimit,
        });
    }
}
