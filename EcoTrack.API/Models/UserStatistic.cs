using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTrack.API.Models;

[Table("kullanici_istatistikleri")]
public class UserStatistic
{
    [Key]
    [Column("istatistik_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IstatistikId { get; set; }

    [Column("kullanici_id")]
    public int KullaniciId { get; set; }

    [Column("toplam_tasarruf")]
    public double ToplamTasarruf { get; set; } = 0.0;

    [Column("gunluk_seri")]
    public int GunlukSeri { get; set; } = 0;

    [MaxLength(100)]
    [Column("rozet_adi")]
    public string RozetAdi { get; set; } = "İlk Adım";

    [Column("guncellenme_tarihi")]
    public DateTime GuncellenmeZamani { get; set; } = DateTime.UtcNow;

    // Navigation Property
    [ForeignKey(nameof(KullaniciId))]
    public User User { get; set; } = null!;
}
