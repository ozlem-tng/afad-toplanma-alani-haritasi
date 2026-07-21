using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Business.Services;

public class CandidatePointService
{
    private readonly AppDbContext _context;

    public CandidatePointService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CandidatePointDto>> GetAllAsync(string? decision)
    {
        var query = _context.CandidatePoints.AsNoTracking();

        query = decision?.ToLowerInvariant() switch
        {
            "pending" => query.Where(x => x.IsAccepted == null),
            "accepted" => query.Where(x => x.IsAccepted == true),
            "rejected" => query.Where(x => x.IsAccepted == false),
            _ => query
        };

        return (await query.OrderByDescending(x => x.CreatedAt).ToListAsync())
            .Select(MapToDto)
            .ToList();
    }

    public async Task<CandidatePointDto?> AcceptAsync(int id)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var candidate = await _context.CandidatePoints.FirstOrDefaultAsync(x => x.Id == id);

        if (candidate is null)
            return null;
        if (candidate.IsAccepted.HasValue)
            throw new InvalidOperationException("Bu aday için daha önce karar verilmiş.");
        var area = new ToplanmaAlani
        {
            Id = candidate.Id,
            Name = candidate.Name,
            AlanTur = candidate.AlanTur,
            AlanM2 = candidate.AlanM2,
            MahalleAdi = candidate.MahalleAdi,
            IlceAdi = candidate.IlceAdi,
            Kapasite = candidate.Kapasite,
            PointWkt = candidate.PointWkt.Copy() as NetTopologySuite.Geometries.Point
                ?? throw new InvalidOperationException("Aday konumu geçersiz.")
        };

        _context.ToplanmaAlanlari.Add(area);
        await _context.SaveChangesAsync();

        candidate.IsAccepted = true;
        candidate.DecidedAt = DateTime.UtcNow;
        candidate.GatheringAreaId = area.Id;
        _context.ActivityLogs.Add(new ActivityLog
        {
            GatheringAreaId = area.Id,
            CandidatePointId = candidate.Id,
            ActionType = "ADAY_KABUL_EDILDI",
            NewValues = ToplanmaAlaniService.Snapshot(area),
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return MapToDto(candidate);
    }

    public async Task<CandidatePointDto?> RejectAsync(int id, string rejectionReason)
    {
        var candidate = await _context.CandidatePoints.FirstOrDefaultAsync(x => x.Id == id);

        if (candidate is null)
            return null;
        if (candidate.IsAccepted.HasValue)
            throw new InvalidOperationException("Bu aday için daha önce karar verilmiş.");

        candidate.IsAccepted = false;
        candidate.DecidedAt = DateTime.UtcNow;
        candidate.RejectionReason = rejectionReason.Trim();
        _context.ActivityLogs.Add(new ActivityLog
        {
            CandidatePointId = candidate.Id,
            ActionType = "ADAY_REDDEDILDI",
            NewValues = Snapshot(candidate),
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return MapToDto(candidate);
    }

    private static CandidatePointDto MapToDto(CandidatePoint entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        AlanTur = entity.AlanTur,
        AlanM2 = entity.AlanM2,
        MahalleAdi = entity.MahalleAdi,
        IlceAdi = entity.IlceAdi,
        Kapasite = entity.Kapasite,
        Latitude = entity.PointWkt.Y,
        Longitude = entity.PointWkt.X,
        IsAccepted = entity.IsAccepted,
        CreatedAt = entity.CreatedAt,
        DecidedAt = entity.DecidedAt,
        RejectionReason = entity.RejectionReason,
        GatheringAreaId = entity.GatheringAreaId
    };

    private static string Snapshot(CandidatePoint entity) => JsonSerializer.Serialize(new
    {
        id = entity.Id,
        name = entity.Name,
        alanTur = entity.AlanTur,
        alanM2 = entity.AlanM2,
        mahalleAdi = entity.MahalleAdi,
        ilceAdi = entity.IlceAdi,
        kapasite = entity.Kapasite,
        latitude = entity.PointWkt.Y,
        longitude = entity.PointWkt.X,
        kabulEdildi = entity.IsAccepted,
        retNedeni = entity.RejectionReason
    });
}
