using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;
public class Place
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AlanTur { get; set; }
    public double? AlanM2 { get; set; }
    public int? Kapasite { get; set; }
    public string? MahalleAdi { get; set; }
    public string? IlceAdi { get; set; }
    
    // Configured as a Point geometry
    public Point? Geom { get; set; } 
}
