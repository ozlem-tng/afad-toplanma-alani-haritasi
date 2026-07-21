using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities;

[Table("toplanma_alanlari")]
public class GatheringArea
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("alan_tur")]
    public string? AreaType { get; set; }

    [Column("alan_m2")]
    public double? AreaSquareMeters { get; set; }

    [Column("mahalle_adi")]
    public string? NeighborhoodName { get; set; }

    [Column("ilce_adi")]
    public string? DistrictName { get; set; }

    [Column("kapasite")]
    public int? Capacity { get; set; }

    [Column("point_wkt")]
    public string? PointWkt { get; set; }
}