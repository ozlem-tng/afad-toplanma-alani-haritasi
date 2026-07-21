using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite;
using System.Text.Json;
using backend.Models;

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

    [HttpPost("import")]
    public async Task<IActionResult> ImportGeoJson([FromBody] JsonElement geoJsonFeatureCollection)
    {
        try
        {
            if (geoJsonFeatureCollection.TryGetProperty("features", out var featuresArray))
            {
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(4326);

                foreach (var feature in featuresArray.EnumerateArray())
                {
                    if (feature.TryGetProperty("properties", out var props))
                    {
                        var name = props.GetProperty("NAME").GetString() ?? "Unknown";
                        var alanTur = props.TryGetProperty("ALAN_TUR", out var at) ? at.GetString() : null;
                        var alanM2 = props.TryGetProperty("Alan_m2", out var am2) && am2.ValueKind == JsonValueKind.Number ? am2.GetDouble() : (double?)null;
                        var kapasite = props.TryGetProperty("Kapasite", out var cap) && cap.ValueKind == JsonValueKind.Number ? cap.GetInt32() : (int?)null;
                        var mahalleAdi = props.TryGetProperty("MAHALLE_ADI", out var ma) ? ma.GetString() : null;
                        var ilceAdi = props.TryGetProperty("ILCE_ADI", out var ia) ? ia.GetString() : null;

                        Point? pointGeom = null;

                        if (feature.TryGetProperty("geometry", out var geomProp))
                        {
                            var type = geomProp.GetProperty("type").GetString();
                            
                            // Option A: If your GeoJSON geometry is already a Point
                            if (type == "Point" && geomProp.TryGetProperty("coordinates", out var coordsProp))
                            {
                                double lng = coordsProp[0].GetDouble();
                                double lat = coordsProp[1].GetDouble();
                                pointGeom = geometryFactory.CreatePoint(new Coordinate(lng, lat));
                            }
                            // Option B: If your GeoJSON is a Polygon, extract its Centroid as a Point
                            else if (type == "Polygon" && geomProp.TryGetProperty("coordinates", out var polyCoordsProp))
                            {
                                var rings = polyCoordsProp.EnumerateArray();
                                if (rings.MoveNext())
                                {
                                    var outerRingCoords = rings.Current.EnumerateArray()
                                        .Select(c => new Coordinate(c[0].GetDouble(), c[1].GetDouble()))
                                        .ToArray();

                                    var linearRing = geometryFactory.CreateLinearRing(outerRingCoords);
                                    var polygon = geometryFactory.CreatePolygon(linearRing);
                                    
                                    // Convert polygon to a single point coordinate using Centroid
                                    pointGeom = polygon.Centroid;
                                }
                            }
                        }

                        var place = new Place
                        {
                            Name = name,
                            AlanTur = alanTur,
                            AlanM2 = alanM2,
                            Kapasite = kapasite,
                            MahalleAdi = mahalleAdi,
                            IlceAdi = ilceAdi,
                            Geom = pointGeom
                        };

                        _context.Places.Add(place);
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "GeoJSON features successfully imported as points!" });
            }

            return BadRequest("Invalid GeoJSON format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}