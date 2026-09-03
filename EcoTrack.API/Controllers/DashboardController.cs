using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;
using EcoTrack.API.DTOs;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(EcoTrackDbContext context, ILogger<DashboardController> logger)
    {
        _context = context;
        _logger  = logger;
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/dashboard/summary?kullaniciId=1
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Dashboard için kullanıcının tüm analitik özetini tek sorguda döner.
    /// Sekans Diyagramı Adım 1-6 uygulanır.
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

        double haftalikLimit = kullanici.HedeflenenKarbonLimiti;

        // ── Adım 2: Haftalık toplam karbon (son 7 gün) ────────────
        DateTime haftaBaslangici = DateTime.UtcNow.AddDays(-7).Date;
        DateTime bugunBaslangici = DateTime.UtcNow.Date;
        DateTime bugunBitis     = bugunBaslangici.AddDays(1);

        // Tüm haftalık hesaplamaları tek sorguda çek
        var haftalikHesaplamalar = await _context.CarbonCalculations
            .AsNoTracking()
            .Where(cc => cc.KullaniciId == kullaniciId
                      && cc.HesaplamaTarihi >= haftaBaslangici)
            .Select(cc => new { cc.KarbonMiktari, cc.HesaplamaTarihi })
            .ToListAsync();

        double haftalikToplamKarbon = Math.Round(
            haftalikHesaplamalar.Sum(cc => cc.KarbonMiktari), 2);

        // ── Adım 3: Bugünkü toplam karbon ─────────────────────────
        double bugunkuKarbon = Math.Round(
            haftalikHesaplamalar
                .Where(cc => cc.HesaplamaTarihi >= bugunBaslangici
                          && cc.HesaplamaTarihi <  bugunBitis)
                .Sum(cc => cc.KarbonMiktari), 2);

        // Bütçe yüzdesi (100'ü geçebilir)
        double butceYuzdesi = haftalikLimit > 0
            ? Math.Round((haftalikToplamKarbon / haftalikLimit) * 100.0, 1)
            : 0.0;

        // ── Adım 4: Kullanıcı istatistikleri ──────────────────────
        var istatistik = await _context.UserStatistics
            .AsNoTracking()
            .FirstOrDefaultAsync(us => us.KullaniciId == kullaniciId);

        double toplamTasarruf = istatistik?.ToplamTasarruf ?? 0.0;
        int    gunlukSeri     = istatistik?.GunlukSeri     ?? 0;
        string aktifRozet     = istatistik?.RozetAdi       ?? "İlk Adım";

        // EcoPuan hesabı: tasarruf × 10 + seri × 5 (temel formül)
        int ecoPuan = (int)Math.Round(toplamTasarruf * 10.0 + gunlukSeri * 5.0);

        // ── Adım 5: En güncel uygulanmamış öneri ──────────────────
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

        // ── Adım 6: Son 5 aktivite logu ───────────────────────────
        var sonAktiviteler = await _context.Activities
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.CarbonCalculation)
            .Where(a => a.KullaniciId == kullaniciId)
            .OrderByDescending(a => a.AktiviteTarihi)
            .Take(5)
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

        _logger.LogInformation(
            "📊 Dashboard özeti hazırlandı. KullaniciId={Id} | Haftalık={Haftalik} kg | Seri={Seri} gün",
            kullaniciId, haftalikToplamKarbon, gunlukSeri);

        // ── DashboardSummaryDto oluştur ve dön ─────────────────────
        var summary = new DashboardSummaryDto
        {
            BugunkuKarbon       = bugunkuKarbon,
            HaftalikToplamKarbon = haftalikToplamKarbon,
            HaftalikLimit       = haftalikLimit,
            ButceYuzdesi        = butceYuzdesi,
            ToplamTasarruf      = toplamTasarruf,
            GunlukSeri          = gunlukSeri,
            EcoPuan             = ecoPuan,
            AktifRozet          = aktifRozet,
            GununOnerisi        = gununOnerisi,
            SonAktiviteler      = sonAktiviteler,
        };

        return Ok(summary);
    }

    // ═══════════════════════════════════════════════════════════════
    // PUT /api/dashboard/recommendation/{id}/apply
    // Öneriyi "uygulandı" olarak işaretle
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Bir öneriyi uygulandı olarak işaretler ve tasarruf istatistiğini günceller.
    /// </summary>
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

        // Tasarrufu istatistiğe yansıt
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
    // Kullanıcının haftalık karbon limitini güncelle
    // ═══════════════════════════════════════════════════════════════
    /// <summary>
    /// Kullanıcının hedeflenen haftalık karbon limitini günceller.
    /// </summary>
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
