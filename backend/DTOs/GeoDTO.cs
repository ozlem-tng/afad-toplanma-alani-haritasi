namespace backend.DTOs;

public class GatheringPointDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string MahalleAdi { get; set; } = string.Empty;
    public string IlceAdi { get; set; } = string.Empty;
}