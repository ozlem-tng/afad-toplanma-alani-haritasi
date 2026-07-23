using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.DTOs;

public class ActivityLogDto
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("toplanmaAlaniId")]
    public int? GatheringAreaId { get; set; }

    [JsonPropertyName("adayNoktaId")]
    public int? CandidatePointId { get; set; }

    [JsonPropertyName("islemTuru")]
    public string ActionType { get; set; } = string.Empty;

    [JsonPropertyName("eskiDegerler")]
    public JsonElement? OldValues { get; set; }

    [JsonPropertyName("yeniDegerler")]
    public JsonElement? NewValues { get; set; }

    [JsonPropertyName("islemTarihi")]
    public DateTime CreatedAt { get; set; }
}