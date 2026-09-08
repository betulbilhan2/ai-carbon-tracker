using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTrack.API.Models;

[Table("kullanicilar")]
public class User
{
    [Key]
    [Column("kullanici_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int KullaniciId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("ad_soyad")]
    public string AdSoyad { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("eposta")]
    public string Eposta { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("sifrelenmis_sifre")]
    public string SifrelenmisSifre { get; set; } = string.Empty;

    [Column("hedeflenen_karbon_limiti")]
    public double HedeflenenKarbonLimiti { get; set; } = 56.0;

    [Column("sehir")]
    [MaxLength(100)]
    public string? Sehir { get; set; } = "Ankara";

    [Column("universite")]
    [MaxLength(150)]
    public string? Universite { get; set; } = "ODTÜ";

    [Column("bolum")]
    [MaxLength(150)]
    public string? Bolum { get; set; } = "Bilgisayar Mühendisliği";

    [Column("birincil_ulasim")]
    [MaxLength(50)]
    public string? BirincilUlasim { get; set; } = "Özel Araç";

    [Column("diyet_turu")]
    [MaxLength(50)]
    public string? DiyetTuru { get; set; } = "Az Etli (Flexitarian)";

    [Column("kayit_tarihi")]
    public DateTime KayitTarihi { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<CarbonCalculation> CarbonCalculations { get; set; } = new List<CarbonCalculation>();
    public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();
    public UserStatistic? UserStatistic { get; set; }
}
