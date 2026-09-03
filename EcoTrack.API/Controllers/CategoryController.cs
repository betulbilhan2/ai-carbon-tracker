using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Data;
using EcoTrack.API.Models;

namespace EcoTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoryController : ControllerBase
{
    private readonly EcoTrackDbContext _context;
    private readonly ILogger<CategoryController> _logger;

    public CategoryController(EcoTrackDbContext context, ILogger<CategoryController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Tüm aktivite kategorilerini ve emisyon katsayılarını döner.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.ActivityCategories
            .OrderBy(c => c.KategoriId)
            .Select(c => new CategoryDto(
                c.KategoriId,
                c.KategoriAdi,
                c.BirimTipi,
                c.EmisyonKatsayisi
            ))
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// Belirtilen ID'ye ait kategoriyi döner.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _context.ActivityCategories.FindAsync(id);

        if (category is null)
            return NotFound(new { message = $"Kategori bulunamadı. ID: {id}" });

        return Ok(new CategoryDto(
            category.KategoriId,
            category.KategoriAdi,
            category.BirimTipi,
            category.EmisyonKatsayisi
        ));
    }
}

// ── Response DTO ─────────────────────────────────────────────────
public record CategoryDto(
    int    KategoriId,
    string KategoriAdi,
    string BirimTipi,
    double EmisyonKatsayisi
);
