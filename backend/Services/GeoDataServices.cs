using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using System.Text.Json;
using backend.Data;
using backend.Models;

namespace backend.Services;

public class GeoDataServices
{
    private readonly AppDbContext _context;

    public GeoDataServices(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedGeoJsonDataAsync(string filePath)
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"[ERROR] GeoJSON file not found at: {filePath}");
            return;
        }

        var jsonContent = await File.ReadAllTextAsync(filePath);
        using var doc = JsonDocument.Parse(jsonContent);
        var root = doc.RootElement;

        if (root.TryGetProperty("features", out var featuresArray))
        {
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(4326);
            var placesList = new List<Place>();

            int totalFeatures = 0;
            int successfullyParsed = 0;

            foreach (var feature in featuresArray.EnumerateArray())
            {
                totalFeatures++;
                if (feature.TryGetProperty("properties", out var props))
                {
                    // Helper function to find properties case-insensitively
                    string? GetPropString(params string[] keys)
                    {
                        foreach (var key in keys)
                        {
                            foreach (var prop in props.EnumerateObject())
                            {
                                if (string.Equals(prop.Name, key, StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.String)
                                {
                                    return prop.Value.GetString();
                                }
                            }
                        }
                        return null;
                    }

                    double? GetPropDouble(params string[] keys)
                    {
                        foreach (var key in keys)
                        {
                            foreach (var prop in props.EnumerateObject())
                            {
                                if (string.Equals(prop.Name, key, StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.Number)
                                {
                                    return prop.Value.GetDouble();
                                }
                            }
                        }
                        return null;
                    }

                    int? GetPropInt(params string[] keys)
                    {
                        foreach (var key in keys)
                        {
                            foreach (var prop in props.EnumerateObject())
                            {
                                if (string.Equals(prop.Name, key, StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.Number)
                                {
                                    return prop.Value.GetInt32();
                                }
                            }
                        }
                        return null;
                    }

                    var name = GetPropString("NAME", "name", "ADI", "Ad") ?? "Unknown Place";
                    var alanTur = GetPropString("ALAN_TUR", "alan_tur", "Tur", "Turu");
                    var alanM2 = GetPropDouble("Alan_m2", "ALAN_M2", "alan_m2", "Alan", "Area");
                    var kapasite = GetPropInt("Kapasite", "KAPASITE", "Capacity");
                    var mahalleAdi = GetPropString("MAHALLE_ADI", "mahalle_adi", "Mahalle");
                    var ilceAdi = GetPropString("ILCE_ADI", "ilce_adi", "Ilce");

                    Point? pointGeom = null;

                    if (feature.TryGetProperty("geometry", out var geomProp))
                    {
                        var type = geomProp.GetProperty("type").GetString();

                        if (type == "Point" && geomProp.TryGetProperty("coordinates", out var coordsProp))
                        {
                            double lng = coordsProp[0].GetDouble();
                            double lat = coordsProp[1].GetDouble();
                            pointGeom = geometryFactory.CreatePoint(new Coordinate(lng, lat));
                        }
                        else if (type == "Polygon" && geomProp.TryGetProperty("coordinates", out var polyCoordsProp))
                        {
                            var rings = polyCoordsProp.EnumerateArray();
                            if (rings.MoveNext())
                            {
                                var outerRingCoords = rings.Current.EnumerateArray()
                                    .Select(c => new Coordinate(c[0].GetDouble(), c[1].GetDouble()))
                                    .ToArray();

                                if (outerRingCoords.Length >= 4)
                                {
                                    var linearRing = geometryFactory.CreateLinearRing(outerRingCoords);
                                    var polygon = geometryFactory.CreatePolygon(linearRing);
                                    pointGeom = polygon.Centroid;
                                }
                            }
                        }
                        // Added MultiPolygon support just in case your dataset has multi-polygon boundaries
                        else if (type == "MultiPolygon" && geomProp.TryGetProperty("coordinates", out var multiCoordsProp))
                        {
                            var firstPolygon = multiCoordsProp.EnumerateArray();
                            if (firstPolygon.MoveNext())
                            {
                                var firstRing = firstPolygon.Current.EnumerateArray();
                                if (firstRing.MoveNext())
                                {
                                    var outerRingCoords = firstRing.Current.EnumerateArray()
                                        .Select(c => new Coordinate(c[0].GetDouble(), c[1].GetDouble()))
                                        .ToArray();

                                    if (outerRingCoords.Length >= 4)
                                    {
                                        var linearRing = geometryFactory.CreateLinearRing(outerRingCoords);
                                        var polygon = geometryFactory.CreatePolygon(linearRing);
                                        pointGeom = polygon.Centroid;
                                    }
                                }
                            }
                        }
                    }

                    if (pointGeom != null)
                    {
                        placesList.Add(new Place
                        {
                            Name = name,
                            AlanTur = alanTur,
                            AlanM2 = alanM2,
                            Kapasite = kapasite,
                            MahalleAdi = mahalleAdi,
                            IlceAdi = ilceAdi,
                            Geom = pointGeom
                        });
                        successfullyParsed++;
                    }
                }
            }

            Console.WriteLine($"[INFO] Total features found in GeoJSON: {totalFeatures}");
            Console.WriteLine($"[INFO] Successfully parsed and queued for insert: {successfullyParsed}");

            if (placesList.Count > 0)
            {
                await _context.Places.AddRangeAsync(placesList);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[INFO] Successfully saved {placesList.Count} records to database!");
            }
            else
            {
                Console.WriteLine("[WARNING] 0 places were added! Check if geometry or property filters skipped them.");
            }
        }
        else
        {
            Console.WriteLine("[ERROR] 'features' array not found in the root of the GeoJSON file.");
        }
    }
}