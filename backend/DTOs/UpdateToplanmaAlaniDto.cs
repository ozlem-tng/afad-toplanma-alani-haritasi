using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.DTOs;

public class UpdateToplanmaAlaniDto
{
    [Required]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("alanTur")]
    public string AlanTur { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    [JsonPropertyName("alanM2")]
    public double AlanM2 { get; set; }

    [JsonPropertyName("mahalleAdi")]
    public string? MahalleAdi { get; set; }

    [JsonPropertyName("ilceAdi")]
    public string? IlceAdi { get; set; }

    [Range(0, int.MaxValue)]
    [JsonPropertyName("kapasite")]
    public int Kapasite { get; set; }

    [JsonPropertyName("pointWkt")]
    public string? PointWkt { get; set; }
}
