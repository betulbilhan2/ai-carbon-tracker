using System.ComponentModel.DataAnnotations;

namespace EcoTrack.API.DTOs;

/// <summary>
/// Kullanıcıdan gelen yeni aktivite kaydı için giriş modeli.
/// </summary>
public class ActivityCreateDto
{
    /// <summary>
    /// Aktiviteyi kaydeden kullanıcının ID'si. Gerçek auth gelene kadar varsayılan: 1.
    /// </summary>
    public int KullaniciId { get; set; } = 1;

    /// <summary>
    /// Aktivite kategorisi (FK → aktivite_kategorileri.kategori_id).
    /// </summary>
    [Required(ErrorMessage = "Kategori ID zorunludur.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir kategori seçmelisiniz.")]
    public int KategoriId { get; set; }

    /// <summary>
    /// Tüketim değeri (km, kWh, porsiyon, adet, kg vb. kategoriye göre değişir).
    /// </summary>
    [Required(ErrorMessage = "Tüketim değeri zorunludur.")]
    [Range(0.001, double.MaxValue, ErrorMessage = "Tüketim değeri 0'dan büyük olmalıdır.")]
    public double TuketimDegeri { get; set; }

    /// <summary>
    /// Aktivitenin gerçekleştiği tarih ve saat (UTC). Boş bırakılırsa şu anki UTC zamanı kullanılır.
    /// </summary>
    public DateTime? AktiviteTarihi { get; set; }

    /// <summary>
    /// İsteğe bağlı kullanıcı notu.
    /// </summary>
    [MaxLength(500)]
    public string? Not { get; set; }
}
