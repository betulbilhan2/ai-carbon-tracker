using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UserController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly ILogger<UserController> _logger;

    public UserController(EcoTrackDbContext context, ILogger<UserController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Kullanıcının hedeflenen haftalık karbon limitini günceller.
    /// PUT /api/User/target
    /// </summary>
    [HttpPut("target")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWeeklyTarget([FromBody] UpdateTargetRequest request)
    {
        if (request.YeniHedef < 10 || request.YeniHedef > 500)
            return BadRequest(new { message = "Limit 10 - 500 kg CO₂e arasında olmalıdır." });

        var user = await _context.Users.FindAsync(request.KullaniciId);
        if (user is null)
            return NotFound(new { message = $"Kullanıcı bulunamadı. ID: {request.KullaniciId}" });

        double eskiLimit = user.HedeflenenKarbonLimiti;
        user.HedeflenenKarbonLimiti = request.YeniHedef;
        await _context.SaveChangesAsync();

        _logger.LogInformation("🎯 Karbon limiti güncellendi: KullaniciId={Id}, {Eski} -> {Yeni}", 
            request.KullaniciId, eskiLimit, request.YeniHedef);

        return Ok(new
        {
            message = "Haftalık karbon hedefi başarıyla güncellendi.",
            kullaniciId = request.KullaniciId,
            eskiHedef = eskiLimit,
            yeniHedef = request.YeniHedef
        });
    }

    /// <summary>
    /// Görev tamamlandığında kullanıcıya Eco-Puan ekler ve istatistiği günceller.
    /// POST /api/User/add-points
    /// </summary>
    [HttpPost("add-points")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPoints([FromBody] AddPointsRequest request)
    {
        var stat = await _context.UserStatistics.FirstOrDefaultAsync(s => s.KullaniciId == request.KullaniciId);
        if (stat is null)
            return NotFound(new { message = $"Kullanıcı istatistiği bulunamadı. ID: {request.KullaniciId}" });

        // Tasarruf üzerinden puanı orantıla veya doğrudan tasarruf değerini artır (50 puan = ~5 kg tasarruf eşdeğeri)
        double eklenecekTasarruf = Math.Round(request.Puan / 10.0, 2);
        stat.ToplamTasarruf = Math.Round(stat.ToplamTasarruf + eklenecekTasarruf, 2);
        stat.GuncellenmeZamani = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        int yeniToplamPuan = (int)Math.Round(stat.ToplamTasarruf * 10.0 + stat.GunlukSeri * 5.0);

        _logger.LogInformation("⭐ Puan eklendi: KullaniciId={Id}, +{Puan} Puan, Yeni Toplam={Toplam}", 
            request.KullaniciId, request.Puan, yeniToplamPuan);

        return Ok(new
        {
            message = $"{request.Puan} Eco-Puan başarıyla eklendi.",
            eklenenPuan = request.Puan,
            toplamPuan = yeniToplamPuan,
            toplamTasarruf = stat.ToplamTasarruf
        });
    }
}

public class UpdateTargetRequest
{
    public int KullaniciId { get; set; } = 1;
    public double YeniHedef { get; set; } = 56.0;
}

public class AddPointsRequest
{
    public int KullaniciId { get; set; } = 1;
    public int Puan { get; set; } = 50;
}
