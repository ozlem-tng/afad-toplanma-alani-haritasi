using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class PlacesController : ControllerBase
{
    private readonly backend.Data.AppDbContext _context;

    public PlacesController(backend.Data.AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlaces()
    {
        var places = await _context.Places.ToListAsync();
        return Ok(places);
    }

    // Optional: Spatial query example (e.g., find places near a coordinate)
    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearbyPlaces(double longitude, double latitude, double radiusInMeters = 5000)
    {
        var referencePoint = new NetTopologySuite.Geometries.Point(longitude, latitude) { SRID = 4326 };

        // Uses PostGIS ST_Distance within EF Core to query by distance efficiently using the GIST index
        var nearbyPlaces = await _context.Places
            .Where(p => p.Geom.IsWithinDistance(referencePoint, radiusInMeters / 111320.0)) // Rough degree approximation or use raw SQL if preferred
            .ToListAsync();

        return Ok(nearbyPlaces);
    }
}