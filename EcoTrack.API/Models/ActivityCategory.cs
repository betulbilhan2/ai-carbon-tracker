using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoTrack.API.Models;

[Table("aktivite_kategorileri")]
public class ActivityCategory
{
    [Key]
    [Column("kategori_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int KategoriId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("kategori_adi")]
    public string KategoriAdi { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    [Column("birim_tipi")]
    public string BirimTipi { get; set; } = string.Empty;

    [Column("emisyon_katsayisi")]
    public double EmisyonKatsayisi { get; set; }

    // Navigation Properties
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
