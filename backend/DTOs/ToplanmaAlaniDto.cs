using System.Text.Json.Serialization;

namespace backend.DTOs;

public class ToplanmaAlaniDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("alanTur")]
    public string AlanTur { get; set; } = string.Empty;

    [JsonPropertyName("alanM2")]
    public double AlanM2 { get; set; }

    [JsonPropertyName("mahalleAdi")]
    public string? MahalleAdi { get; set; }

    [JsonPropertyName("ilceAdi")]
    public string? IlceAdi { get; set; }

    [JsonPropertyName("kapasite")]
    public int Kapasite { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }
}
