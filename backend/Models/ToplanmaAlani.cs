using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace backend.Models;

[Table("toplanma_alanlari")]
public class ToplanmaAlani
{
    [Key]
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

    [Required]
    [Column("point_wkt", TypeName = "geometry(Point,4326)")]
    public Point PointWkt { get; set; } = null!;

    [Column("alan_geometrisi", TypeName = "geometry(MultiPolygon,4326)")]
    public MultiPolygon? AreaGeometry { get; set; }

    [Column("silinme_tarihi")]
    public DateTime? DeletedAt { get; set; }

}