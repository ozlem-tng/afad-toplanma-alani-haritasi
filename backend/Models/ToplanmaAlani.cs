using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("toplanma_alanlari")]
public class ToplanmaAlani
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("alan_tur")]
    public string AlanTur { get; set; } = string.Empty;

    [Column("alan_m2")]
    public double AlanM2 { get; set; }

    [Column("mahalle_adi")]
    public string? MahalleAdi { get; set; }

    [Column("ilce_adi")]
    public string? IlceAdi { get; set; }

    [Column("kapasite")]
    public int Kapasite { get; set; }

    [Column("point_wkt")]
    public string? PointWkt { get; set; }
}
