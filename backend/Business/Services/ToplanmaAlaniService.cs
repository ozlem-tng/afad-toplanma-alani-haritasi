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
            .OrderBy(x => x.Id)
            .ToListAsync();

        return alanlar.Select(MapToDto).ToList();
    }

    public async Task<ToplanmaAlaniDto?> GetByIdAsync(int id)
    {
        var alan = await _context.ToplanmaAlanlari
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return alan is null ? null : MapToDto(alan);
    }

    public async Task<ToplanmaAlaniDto?> UpdateAsync(
        int id,
        UpdateToplanmaAlaniDto dto)
    {
        var alan = await _context.ToplanmaAlanlari
            .FirstOrDefaultAsync(x => x.Id == id);

        if (alan is null)
            return null;

        alan.Name = dto.Name.Trim();
        alan.AlanTur = dto.AlanTur.Trim();
        alan.AlanM2 = dto.AlanM2;
        alan.MahalleAdi = NormalizeOptionalText(dto.MahalleAdi);
        alan.IlceAdi = NormalizeOptionalText(dto.IlceAdi);
        alan.Kapasite = dto.Kapasite;
        alan.PointWkt = new Point(dto.Longitude, dto.Latitude)
        {
            SRID = 4326
        };
        await _context.SaveChangesAsync();
        return MapToDto(alan);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var alan = await _context.ToplanmaAlanlari
            .FirstOrDefaultAsync(x => x.Id == id);

        if (alan is null)
            return false;

        _context.ToplanmaAlanlari.Remove(alan);
        await _context.SaveChangesAsync();
        return true;
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static ToplanmaAlaniDto MapToDto(ToplanmaAlani entity)
    {
        return new ToplanmaAlaniDto
        {
            Id = entity.Id,
            Name = entity.Name,
            AlanTur = entity.AlanTur,
            AlanM2 = entity.AlanM2,
            MahalleAdi = entity.MahalleAdi,
            IlceAdi = entity.IlceAdi,
            Kapasite = entity.Kapasite,
            Longitude = entity.PointWkt?.X ?? 0,
            Latitude = entity.PointWkt?.Y ?? 0
        };
    }
}
