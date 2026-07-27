using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace backend.Data.Seeders;

public static class ToplanmaAlaniSeeder
{
    private const int BatchSize = 500;
    private const int CandidateCount = 15;
    private static readonly GeometryFactory GeometryFactory =
        new(new PrecisionModel(), 4326);

    public static async Task<int> SeedAsync(AppDbContext context, IWebHostEnvironment environment)
    {
        var filePath = Path.Combine(
            environment.ContentRootPath,
            "GeoData",
            "TOPLANMAALANLARI_recent.geojson");

        if (!File.Exists(filePath))
            throw new FileNotFoundException("Toplanma alanları GeoJSON dosyası bulunamadı.", filePath);

        var sourceRows = await ReadSourceRowsAsync(filePath);
        var hasAreas = await context.ToplanmaAlanlari.AnyAsync();
        var hasCandidates = await context.CandidatePoints.AnyAsync();

        if (hasAreas || hasCandidates)
            return await BackfillAreaGeometriesAsync(context, sourceRows);

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
            AreaGeometry = x.AreaGeometry,
            CreatedAt = DateTime.UtcNow
        }));
        var changedCount = await context.SaveChangesAsync();

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
                PointWkt = x.PointWkt,
                AreaGeometry = x.AreaGeometry
            }));
            changedCount += await context.SaveChangesAsync();
            context.ChangeTracker.Clear();
        }

        await transaction.CommitAsync();
        return changedCount;
    }

    private static async Task<List<SourceRow>> ReadSourceRowsAsync(string filePath)
    {
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

            var areaGeometry = ReadAreaGeometry(feature.GetProperty("geometry"));
            if (areaGeometry is null || areaGeometry.IsEmpty)
                continue;

            var envelope = areaGeometry.EnvelopeInternal;
            var point = CreatePoint(
                (envelope.MinX + envelope.MaxX) / 2,
                (envelope.MinY + envelope.MaxY) / 2);

            sourceRows.Add(new SourceRow(
                sourceId,
                GetString(properties, "NAME") ?? "İsimsiz Toplanma Alanı",
                GetString(properties, "ALAN_TUR") ?? "BELİRTİLMEMİŞ",
                GetDouble(properties, "Alan_m2"),
                GetString(properties, "MAHALLE_ADI"),
                GetString(properties, "ILCE_ADI"),
                GetInt(properties, "Kapasite"),
                point,
                areaGeometry));
        }

        return sourceRows;
    }

    private static async Task<int> BackfillAreaGeometriesAsync(
        AppDbContext context,
        IReadOnlyCollection<SourceRow> sourceRows)
    {
        var rowsById = sourceRows.ToDictionary(x => x.SourceId);
        var changedCount = 0;
        await using var transaction = await context.Database.BeginTransactionAsync();

        foreach (var idBatch in rowsById.Keys.Chunk(BatchSize))
        {
            var areas = await context.ToplanmaAlanlari
                .Where(x => idBatch.Contains(x.Id) && x.AreaGeometry == null)
                .ToListAsync();
            foreach (var area in areas)
                area.AreaGeometry = CopyGeometry(rowsById[area.Id].AreaGeometry);

            var candidates = await context.CandidatePoints
                .Where(x => idBatch.Contains(x.Id) && x.AreaGeometry == null)
                .ToListAsync();
            foreach (var candidate in candidates)
                candidate.AreaGeometry = CopyGeometry(rowsById[candidate.Id].AreaGeometry);

            changedCount += await context.SaveChangesAsync();
            context.ChangeTracker.Clear();
        }

        await transaction.CommitAsync();
        return changedCount;
    }

    private static MultiPolygon? ReadAreaGeometry(JsonElement geometry)
    {
        if (!geometry.TryGetProperty("type", out var typeElement) ||
            !geometry.TryGetProperty("coordinates", out var coordinates))
            return null;

        var polygons = new List<Polygon>();
        switch (typeElement.GetString())
        {
            case "Polygon":
                AddPolygon(coordinates, polygons);
                break;
            case "MultiPolygon":
                foreach (var polygonCoordinates in coordinates.EnumerateArray())
                    AddPolygon(polygonCoordinates, polygons);
                break;
            default:
                return null;
        }

        return polygons.Count == 0
            ? null
            : GeometryFactory.CreateMultiPolygon(polygons.ToArray());
    }

    private static void AddPolygon(JsonElement polygonCoordinates, ICollection<Polygon> polygons)
    {
        if (polygonCoordinates.ValueKind != JsonValueKind.Array || polygonCoordinates.GetArrayLength() == 0)
            return;

        var rings = polygonCoordinates.EnumerateArray().ToArray();
        var shell = CreateRing(rings[0]);
        if (shell is null)
            return;

        var holes = rings.Skip(1)
            .Select(CreateRing)
            .Where(x => x is not null)
            .Cast<LinearRing>()
            .ToArray();
        polygons.Add(GeometryFactory.CreatePolygon(shell, holes));
    }

    private static LinearRing? CreateRing(JsonElement ringCoordinates)
    {
        if (ringCoordinates.ValueKind != JsonValueKind.Array)
            return null;

        var coordinates = new List<Coordinate>();
        foreach (var pair in ringCoordinates.EnumerateArray())
        {
            if (pair.ValueKind != JsonValueKind.Array || pair.GetArrayLength() < 2 ||
                !pair[0].TryGetDouble(out var longitude) ||
                !pair[1].TryGetDouble(out var latitude) ||
                !double.IsFinite(longitude) || !double.IsFinite(latitude))
                return null;

            var coordinate = new Coordinate(longitude, latitude);
            if (coordinates.Count == 0 || !coordinates[^1].Equals2D(coordinate))
                coordinates.Add(coordinate);
        }

        if (coordinates.Count < 3)
            return null;
        if (!coordinates[0].Equals2D(coordinates[^1]))
            coordinates.Add(coordinates[0].Copy());
        if (coordinates.Count < 4)
            return null;

        return GeometryFactory.CreateLinearRing(coordinates.ToArray());
    }

    private static MultiPolygon CopyGeometry(MultiPolygon geometry) =>
        geometry.Copy() as MultiPolygon
        ?? throw new InvalidOperationException("Alan geometrisi kopyalanamadı.");

    private static Point CreatePoint(double longitude, double latitude) =>
        GeometryFactory.CreatePoint(new Coordinate(longitude, latitude));

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

    private sealed record SourceRow(
        int SourceId,
        string Name,
        string AlanTur,
        double AlanM2,
        string? MahalleAdi,
        string? IlceAdi,
        int Kapasite,
        Point PointWkt,
        MultiPolygon AreaGeometry);
}