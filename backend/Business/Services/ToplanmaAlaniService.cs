using System.Text.Json;
using backend.Business.Interfaces;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace backend.Business.Services;

public class ToplanmaAlaniService : IToplanmaAlaniService
{
    private readonly AppDbContext _context;

    public ToplanmaAlaniService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ToplanmaAlaniDto>> GetAllAsync()
    {
        var alanlar = await _context.ToplanmaAlanlari
            .AsNoTracking()
            .Where(x => x.DeletedAt == null)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return alanlar.Select(MapToDto).ToList();
    }

    public async Task<ToplanmaAlaniDto?> GetByIdAsync(int id)
    {
        var alan = await _context.ToplanmaAlanlari
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);

        return alan is null ? null : MapToDto(alan);
    }

    public async Task<ToplanmaAlaniDto> CreateAsync(CreateToplanmaAlaniDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var alan = new ToplanmaAlani
        {
            Name = dto.Name.Trim(),
            AlanTur = dto.AlanTur.Trim(),
            AlanM2 = dto.AlanM2,
            MahalleAdi = NormalizeOptionalText(dto.MahalleAdi),
            IlceAdi = NormalizeOptionalText(dto.IlceAdi),
            Kapasite = dto.Kapasite,
            PointWkt = CreatePoint(dto.Longitude, dto.Latitude)
        };

        _context.ToplanmaAlanlari.Add(alan);
        await _context.SaveChangesAsync();
        AddActivity("ALAN_EKLENDI", alan.Id, null, null, Snapshot(alan));
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return MapToDto(alan);
    }

    public async Task<ToplanmaAlaniDto?> UpdateAsync(int id, UpdateToplanmaAlaniDto dto)
    {
        var alan = await _context.ToplanmaAlanlari
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);

        if (alan is null)
            return null;

        var oldValues = Snapshot(alan);
        alan.Name = dto.Name.Trim();
        alan.AlanTur = dto.AlanTur.Trim();
        alan.AlanM2 = dto.AlanM2;
        alan.MahalleAdi = NormalizeOptionalText(dto.MahalleAdi);
        alan.IlceAdi = NormalizeOptionalText(dto.IlceAdi);
        alan.Kapasite = dto.Kapasite;
        if (dto.Latitude.HasValue && dto.Longitude.HasValue)
            alan.PointWkt = CreatePoint(dto.Longitude.Value, dto.Latitude.Value);

        AddActivity("ALAN_GUNCELLENDI", alan.Id, null, oldValues, Snapshot(alan));
        await _context.SaveChangesAsync();
        return MapToDto(alan);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var alan = await _context.ToplanmaAlanlari
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null);

        if (alan is null)
            return false;

        var oldValues = Snapshot(alan);
        alan.DeletedAt = DateTime.UtcNow;
        AddActivity("ALAN_SILINDI", alan.Id, null, oldValues, Snapshot(alan));
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ToplanmaAlaniDto?> RestoreAsync(int id)
    {
        var alan = await _context.ToplanmaAlanlari
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt != null);

        if (alan is null)
            return null;

        var oldValues = Snapshot(alan);
        alan.DeletedAt = null;
        AddActivity("ALAN_GERI_ALINDI", alan.Id, null, oldValues, Snapshot(alan));
        await _context.SaveChangesAsync();
        return MapToDto(alan);
    }

    internal static ToplanmaAlaniDto MapToDto(ToplanmaAlani entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        AlanTur = entity.AlanTur,
        AlanM2 = entity.AlanM2,
        MahalleAdi = entity.MahalleAdi,
        IlceAdi = entity.IlceAdi,
        Kapasite = entity.Kapasite,
        Latitude = entity.PointWkt.Y,
        Longitude = entity.PointWkt.X
    };

    internal static string Snapshot(ToplanmaAlani entity) => JsonSerializer.Serialize(new
    {
        id = entity.Id,
        name = entity.Name,
        alanTur = entity.AlanTur,
        alanM2 = entity.AlanM2,
        mahalleAdi = entity.MahalleAdi,
        ilceAdi = entity.IlceAdi,
        kapasite = entity.Kapasite,
        latitude = entity.PointWkt.Y,
        longitude = entity.PointWkt.X
    });

    private void AddActivity(string action, int? areaId, int? candidateId, string? oldValues, string? newValues)
    {
        _context.ActivityLogs.Add(new ActivityLog
        {
            ActionType = action,
            GatheringAreaId = areaId,
            CandidatePointId = candidateId,
            OldValues = oldValues,
            NewValues = newValues,
            CreatedAt = DateTime.UtcNow
        });
    }

    private static Point CreatePoint(double longitude, double latitude) =>
        new(longitude, latitude) { SRID = 4326 };

    private static string? NormalizeOptionalText(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
