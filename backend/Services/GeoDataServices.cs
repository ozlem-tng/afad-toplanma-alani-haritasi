using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using NetTopologySuite.Geometries;
using System.Text.Json;

namespace backend.Services;

public class GeoDataServices
{
    private readonly AppDbContext _context;

    public GeoDataServices(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GatheringPointDto>> GetGatheringPointsAsync()
    {
        return await _context.Places
            .Select(p => new GatheringPointDto
            {
                Id = p.Id,
                Name = p.Name,
                Latitude = p.Geom.Y, 
                Longitude = p.Geom.X
            })
            .ToListAsync();
    }

    public async Task SeedGeoJsonDataAsync(string filePath)
    {
        Console.WriteLine($"[DEBUG] Looking for GeoJSON file at absolute path: {Path.GetFullPath(filePath)}");
        
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"[ERROR] File.Exists returned FALSE! The file was not found at: {filePath}");
            throw new FileNotFoundException($"GeoJSON file not found at: {filePath}");
        }
        else
        {
            Console.WriteLine("[SUCCESS] File.Exists returned TRUE! File found.");
        }

        // if (await _context.Places.AnyAsync()) { return; }

        var jsonString = await File.ReadAllTextAsync(filePath);
        using var doc = JsonDocument.Parse(jsonString);
        var features = doc.RootElement.GetProperty("features");

        var geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        var placesToInsert = new List<Place>();

        foreach (var feature in features.EnumerateArray())
        {
            var properties = feature.GetProperty("properties");
            var geometry = feature.GetProperty("geometry");
            var coordinates = geometry.GetProperty("coordinates");
            string geoType = geometry.GetProperty("type").GetString() ?? "Point";

            double longitude = 0;
            double latitude = 0;

            if (geoType == "Point" && coordinates.ValueKind == JsonValueKind.Array && coordinates.GetArrayLength() >= 2)
            {
                longitude = coordinates[0].GetDouble();
                latitude = coordinates[1].GetDouble();
            }
            else if (geoType == "Polygon" || geoType == "MultiPoint")
            {
                var firstRing = coordinates[0];
                if (firstRing.ValueKind == JsonValueKind.Array)
                {
                    var firstCoord = firstRing[0];
                    longitude = firstCoord[0].GetDouble();
                    latitude = firstCoord[1].GetDouble();
                }
            }
            else
            {
                continue;
            }

            string name = properties.TryGetProperty("ADI", out var nameProp) ? nameProp.GetString() ?? "Bilinmeyen Alan" : "Bilinmeyen Alan";
            string category = properties.TryGetProperty("TURU", out var catProp) ? catProp.GetString() ?? "Toplanma Alani" : "Toplanma Alani";

            var point = geometryFactory.CreatePoint(new Coordinate(longitude, latitude));

            placesToInsert.Add(new Place
            {
                Name = name,
                Category = category,
                Geom = point
            });
        }

        if (placesToInsert.Any())
        {
            _context.Places.RemoveRange(_context.Places);
            await _context.SaveChangesAsync();

            await _context.Places.AddRangeAsync(placesToInsert);
            await _context.SaveChangesAsync();
            Console.WriteLine($"[SUCCESS] Successfully seeded {placesToInsert.Count} places into the database!");
        }
        else
        {
            Console.WriteLine("[WARNING] No valid places were parsed from the GeoJSON file.");
        }
    }
}