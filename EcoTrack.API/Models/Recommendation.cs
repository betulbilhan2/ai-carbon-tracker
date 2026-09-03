using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTrack.API.Models;

[Table("oneriler")]
public class Recommendation
{
    [Key]
    [Column("oneri_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int OneriId { get; set; }

    [Column("kullanici_id")]
    public int KullaniciId { get; set; }

    [Column("hesaplama_id")]
    public int? HesaplamaId { get; set; }

    [Required]
    [Column("oneri_metni", TypeName = "text")]
    public string OneriMetni { get; set; } = string.Empty;

    [Column("etki_skoru")]
    public double EtkiSkoru { get; set; }

    [Column("uygulandi_mi")]
    public bool UygulandiMi { get; set; } = false;

    [Column("olusturulma_tarihi")]
    public DateTime OlusturulmaTarihi { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey(nameof(KullaniciId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(HesaplamaId))]
    public CarbonCalculation? CarbonCalculation { get; set; }
}
