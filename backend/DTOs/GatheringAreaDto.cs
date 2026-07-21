namespace backend.DTOs.GatheringArea;

public class GatheringAreaDto
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? AreaType { get; set; }

    public double? AreaSquareMeters { get; set; }

    public string? NeighborhoodName { get; set; }

    public string? DistrictName { get; set; }

    public int? Capacity { get; set; }

    public string? PointWkt { get; set; }
}