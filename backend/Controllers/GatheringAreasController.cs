using backend.DTOs.GatheringArea;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GatheringAreasController : ControllerBase
{
    private readonly IGatheringAreaService _service;

    public GatheringAreasController(IGatheringAreaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<GatheringAreaDto>>> GetAll()
    {
        var gatheringAreas = await _service.GetAllAsync();

        var result = gatheringAreas.Select(area => new GatheringAreaDto
        {
            Id = area.Id,
            Name = area.Name,
            AreaType = area.AreaType,
            AreaSquareMeters = area.AreaSquareMeters,
            NeighborhoodName = area.NeighborhoodName,
            DistrictName = area.DistrictName,
            Capacity = area.Capacity,
            PointWkt = area.PointWkt
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GatheringAreaDto>> GetById(int id)
    {
        var area = await _service.GetByIdAsync(id);

        if (area == null)
            return NotFound();

        var result = new GatheringAreaDto
        {
            Id = area.Id,
            Name = area.Name,
            AreaType = area.AreaType,
            AreaSquareMeters = area.AreaSquareMeters,
            NeighborhoodName = area.NeighborhoodName,
            DistrictName = area.DistrictName,
            Capacity = area.Capacity,
            PointWkt = area.PointWkt
        };

        return Ok(result);
    }
}