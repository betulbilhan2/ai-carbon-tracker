using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class HealthController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(EcoTrackDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// API ve veritabanı bağlantısını kontrol eder.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetHealth()
    {
        string dbStatus;

        try
        {
            // PostgreSQL bağlantısını test et
            bool canConnect = await _context.Database.CanConnectAsync();
            dbStatus = canConnect ? "Connected" : "Disconnected";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Veritabanı bağlantı kontrolü başarısız.");
            dbStatus = $"Disconnected - {ex.Message}";
        }

        var response = new
        {
            status     = dbStatus.StartsWith("Connected") ? "Healthy" : "Degraded",
            serverTime = DateTime.UtcNow,
            database   = dbStatus,
            version    = "EcoTrack API v1.0 — TerkenTech"
        };

        return dbStatus.StartsWith("Connected")
            ? Ok(response)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
    }
}
