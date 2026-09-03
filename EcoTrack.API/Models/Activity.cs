using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTrack.API.Models;

[Table("aktiviteler")]
public class Activity
{
    [Key]
    [Column("aktivite_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AktiviteId { get; set; }

    [Column("kullanici_id")]
    public int KullaniciId { get; set; }

    [Column("kategori_id")]
    public int KategoriId { get; set; }

    [Column("tuketim_degeri")]
    public double TuketimDegeri { get; set; }

    [Column("aktivite_tarihi")]
    public DateTime AktiviteTarihi { get; set; }

    // Navigation Properties
    [ForeignKey(nameof(KullaniciId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(KategoriId))]
    public ActivityCategory Category { get; set; } = null!;

    public CarbonCalculation? CarbonCalculation { get; set; }
}
