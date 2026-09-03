using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTrack.API.Models;

[Table("karbon_hesaplamalari")]
public class CarbonCalculation
{
    [Key]
    [Column("hesaplama_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int HesaplamaId { get; set; }

    [Column("kullanici_id")]
    public int KullaniciId { get; set; }

    [Column("aktivite_id")]
    public int AktiviteId { get; set; }

    [Column("karbon_miktari")]
    public double KarbonMiktari { get; set; }

    [Column("hesaplama_tarihi")]
    public DateTime HesaplamaTarihi { get; set; }

    // Navigation Properties
    [ForeignKey(nameof(KullaniciId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(AktiviteId))]
    public Activity Activity { get; set; } = null!;

    public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();
}
