using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("places")]
public class Place
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    public required string Name { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [Required]
    [Column("geom", TypeName = "geometry(Point, 4326)")]
    public required Point Geom { get; set; }
}