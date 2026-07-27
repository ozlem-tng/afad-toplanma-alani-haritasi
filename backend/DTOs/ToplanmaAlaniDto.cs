using System.Text.Json.Serialization;
using NetTopologySuite.Geometries;

namespace backend.DTOs;

public class ToplanmaAlaniDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string AlanTur { get; set; } = string.Empty;

    public double AlanM2 { get; set; }

    public string? MahalleAdi { get; set; }

    public string? IlceAdi { get; set; }

    public int Kapasite { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    [JsonPropertyName("geometry")]
    public object? Geometry { get; set; }
}