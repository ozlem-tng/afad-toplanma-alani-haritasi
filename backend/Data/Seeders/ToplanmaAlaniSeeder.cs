using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace backend.Data.Seeders;

public static class ToplanmaAlaniSeeder
{
    private const int BatchSize = 500;
    private const int CandidateCount = 15;

    public static async Task<int> SeedAsync(AppDbContext context, IWebHostEnvironment environment)
    {
        if (await context.ToplanmaAlanlari.AnyAsync() || await context.CandidatePoints.AnyAsync())
            return 0;

        var filePath = Path.Combine(
            environment.ContentRootPath,
            "GeoData",
            "TOPLANMAALANLARI_recent.geojson");

        if (!File.Exists(filePath))
            throw new FileNotFoundException("Toplanma alanları GeoJSON dosyası bulunamadı.", filePath);

        await using var stream = File.OpenRead(filePath);
        using var document = await JsonDocument.ParseAsync(stream);

        var sourceRows = new List<SourceRow>();
        var seenIds = new HashSet<int>();

        foreach (var feature in document.RootElement.GetProperty("features").EnumerateArray())
        {
            var properties = feature.GetProperty("properties");
            var sourceId = GetInt(properties, "ID");

            if (sourceId <= 0 || !seenIds.Add(sourceId))
                continue;

            var (longitude, latitude) = GetGeometryCenter(feature.GetProperty("geometry"));
            if (!longitude.HasValue || !latitude.HasValue)
                continue;

            sourceRows.Add(new SourceRow(
                sourceId,
                GetString(properties, "NAME") ?? "İsimsiz Toplanma Alanı",
                GetString(properties, "ALAN_TUR") ?? "BELİRTİLMEMİŞ",
                GetDouble(properties, "Alan_m2"),
                GetString(properties, "MAHALLE_ADI"),
                GetString(properties, "ILCE_ADI"),
                GetInt(properties, "Kapasite"),
                CreatePoint(longitude.Value, latitude.Value)));
        }

        var orderedRows = sourceRows.OrderBy(x => x.SourceId).ToList();
        var candidateRows = orderedRows.TakeLast(CandidateCount).ToList();
        var areaRows = orderedRows.Take(Math.Max(0, orderedRows.Count - CandidateCount)).ToList();
        await using var transaction = await context.Database.BeginTransactionAsync();

        await context.CandidatePoints.AddRangeAsync(candidateRows.Select(x => new CandidatePoint
        {
            Id = x.SourceId,
            Name = x.Name,
            AlanTur = x.AlanTur,
            AlanM2 = x.AlanM2,
            MahalleAdi = x.MahalleAdi,
            IlceAdi = x.IlceAdi,
            Kapasite = x.Kapasite,
            PointWkt = x.PointWkt,
            CreatedAt = DateTime.UtcNow
        }));
        await context.SaveChangesAsync();

        var insertedCount = 0;
        foreach (var batch in areaRows.Chunk(BatchSize))
        {
            await context.ToplanmaAlanlari.AddRangeAsync(batch.Select(x => new ToplanmaAlani
            {
                Id = x.SourceId,
                Name = x.Name,
                AlanTur = x.AlanTur,
                AlanM2 = x.AlanM2,
                MahalleAdi = x.MahalleAdi,
                IlceAdi = x.IlceAdi,
                Kapasite = x.Kapasite,
                PointWkt = x.PointWkt
            }));
            insertedCount += await context.SaveChangesAsync();
            context.ChangeTracker.Clear();
        }

        await transaction.CommitAsync();
        return insertedCount;
    }

    private static Point CreatePoint(double longitude, double latitude) =>
        new(longitude, latitude) { SRID = 4326 };

    private static string? GetString(JsonElement properties, string name) =>
        properties.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static int GetInt(JsonElement properties, string name) =>
        properties.TryGetProperty(name, out var value) && value.TryGetInt32(out var result)
            ? result
            : 0;

    private static double GetDouble(JsonElement properties, string name) =>
        properties.TryGetProperty(name, out var value) && value.TryGetDouble(out var result)
            ? result
            : 0;

    private static (double? Longitude, double? Latitude) GetGeometryCenter(JsonElement geometry)
    {
        if (!geometry.TryGetProperty("coordinates", out var coordinates))
            return (null, null);

        var minLongitude = double.MaxValue;
        var maxLongitude = double.MinValue;
        var minLatitude = double.MaxValue;
        var maxLatitude = double.MinValue;
        ReadCoordinates(coordinates, ref minLongitude, ref maxLongitude, ref minLatitude, ref maxLatitude);

        return minLongitude == double.MaxValue
            ? (null, null)
            : ((minLongitude + maxLongitude) / 2, (minLatitude + maxLatitude) / 2);
    }

    private static void ReadCoordinates(
        JsonElement element,
        ref double minLongitude,
        ref double maxLongitude,
        ref double minLatitude,
        ref double maxLatitude)
    {
        if (element.ValueKind != JsonValueKind.Array)
            return;

        if (element.GetArrayLength() >= 2 &&
            element[0].ValueKind == JsonValueKind.Number &&
            element[1].ValueKind == JsonValueKind.Number)
        {
            var longitude = element[0].GetDouble();
            var latitude = element[1].GetDouble();
            minLongitude = Math.Min(minLongitude, longitude);
            maxLongitude = Math.Max(maxLongitude, longitude);
            minLatitude = Math.Min(minLatitude, latitude);
            maxLatitude = Math.Max(maxLatitude, latitude);
            return;
        }

        foreach (var child in element.EnumerateArray())
            ReadCoordinates(child, ref minLongitude, ref maxLongitude, ref minLatitude, ref maxLatitude);
    }

    private sealed record SourceRow(
        int SourceId,
        string Name,
        string AlanTur,
        double AlanM2,
        string? MahalleAdi,
        string? IlceAdi,
        int Kapasite,
        Point PointWkt);
}
