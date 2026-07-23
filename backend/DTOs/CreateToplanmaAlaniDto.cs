using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.DTOs;

public class CreateToplanmaAlaniDto
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

    [Range(-90, 90)]
    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }
}