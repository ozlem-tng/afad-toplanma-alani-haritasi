using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace backend.Models;

[Table("aday_noktalar")]
public class CandidatePoint
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
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

    [Column("kabul_edildi")]
    public bool? IsAccepted { get; set; }

    [Column("olusturulma_tarihi")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("karar_tarihi")]
    public DateTime? DecidedAt { get; set; }

    [Column("ret_nedeni")]
    public string? RejectionReason { get; set; }

    [Column("toplanma_alani_id")]
    public int? GatheringAreaId { get; set; }

    public ToplanmaAlani? GatheringArea { get; set; }
}
