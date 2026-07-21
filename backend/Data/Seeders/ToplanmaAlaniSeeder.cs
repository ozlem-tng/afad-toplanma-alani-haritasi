using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace backend.Data.Seeders;

public static class ToplanmaAlaniSeeder
{
    private const int BatchSize = 500;

    public static async Task<int> SeedAsync(
        AppDbContext context,
        IWebHostEnvironment environment)
    {
        // Veritabanı daha önce doldurulduysa aynı kayıtları tekrar ekleme.
        if (await context.ToplanmaAlanlari.AnyAsync())
            return 0;

        var filePath = Path.Combine(
            environment.ContentRootPath,
            "GeoData",
            "TOPLANMAALANLARI_recent.geojson");

        if (!File.Exists(filePath))
            throw new FileNotFoundException("Toplanma alanları GeoJSON dosyası bulunamadı.", filePath);

        await using var stream = File.OpenRead(filePath);
        using var document = await JsonDocument.ParseAsync(stream);

        var features = document.RootElement.GetProperty("features");
        var seenIds = new HashSet<int>();
        var batch = new List<ToplanmaAlani>(BatchSize);
        var insertedCount = 0;

        await using var transaction = await context.Database.BeginTransactionAsync();

        foreach (var feature in features.EnumerateArray())
        {
            var properties = feature.GetProperty("properties");
            var id = GetInt(properties, "ID");

            // Kaynak dosyada aynı ID ile yinelenen feature'lar bulunuyor.
            if (id <= 0 || !seenIds.Add(id))
                continue;

            var geometry = feature.GetProperty("geometry");
            var (longitude, latitude) = GetGeometryCenter(geometry);

            batch.Add(new ToplanmaAlani
            {
                Id = id,
                Name = GetString(properties, "NAME") ?? "İsimsiz Toplanma Alanı",
                AlanTur = GetString(properties, "ALAN_TUR") ?? "BELİRTİLMEMİŞ",
                AlanM2 = GetDouble(properties, "Alan_m2"),
                MahalleAdi = GetString(properties, "MAHALLE_ADI"),
                IlceAdi = GetString(properties, "ILCE_ADI"),
                Kapasite = GetInt(properties, "Kapasite"),
                PointWkt = longitude.HasValue && latitude.HasValue
    ? new Point(longitude.Value, latitude.Value)
    {
        SRID = 4326
    }
    : null
            });

            if (batch.Count < BatchSize)
                continue;

            insertedCount += await InsertBatchAsync(context, batch);
        }

        insertedCount += await InsertBatchAsync(context, batch);
        await transaction.CommitAsync();

        return insertedCount;
    }

    private static async Task<int> InsertBatchAsync(
        AppDbContext context,
        List<ToplanmaAlani> batch)
    {
        if (batch.Count == 0)
            return 0;

        var count = batch.Count;
        await context.ToplanmaAlanlari.AddRangeAsync(batch);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        batch.Clear();

        return count;
    }

    private static string? GetString(JsonElement properties, string name)
    {
        return properties.TryGetProperty(name, out var value) &&
               value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
    }

    private static int GetInt(JsonElement properties, string name)
    {
        return properties.TryGetProperty(name, out var value) &&
               value.TryGetInt32(out var result)
            ? result
            : 0;
    }

    private static double GetDouble(JsonElement properties, string name)
    {
        return properties.TryGetProperty(name, out var value) &&
               value.TryGetDouble(out var result)
            ? result
            : 0;
    }

    private static (double? Longitude, double? Latitude) GetGeometryCenter(
        JsonElement geometry)
    {
        if (!geometry.TryGetProperty("coordinates", out var coordinates))
            return (null, null);

        var minLongitude = double.MaxValue;
        var maxLongitude = double.MinValue;
        var minLatitude = double.MaxValue;
        var maxLatitude = double.MinValue;

        ReadCoordinates(
            coordinates,
            ref minLongitude,
            ref maxLongitude,
            ref minLatitude,
            ref maxLatitude);

        if (minLongitude == double.MaxValue)
            return (null, null);

        return (
            (minLongitude + maxLongitude) / 2,
            (minLatitude + maxLatitude) / 2);
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
        {
            ReadCoordinates(
                child,
                ref minLongitude,
                ref maxLongitude,
                ref minLatitude,
                ref maxLatitude);
        }
    }
}
