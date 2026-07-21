using System.Text.Json;
using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Business.Services;

public class ActivityLogService
{
    private readonly AppDbContext _context;

    public ActivityLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActivityLogDto>> GetLatestAsync(int limit)
    {
        var safeLimit = Math.Clamp(limit, 1, 200);
        var rows = await _context.ActivityLogs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(safeLimit)
            .ToListAsync();

        return rows.Select(x => new ActivityLogDto
        {
            Id = x.Id,
            GatheringAreaId = x.GatheringAreaId,
            CandidatePointId = x.CandidatePointId,
            ActionType = x.ActionType,
            OldValues = ParseJson(x.OldValues),
            NewValues = ParseJson(x.NewValues),
            CreatedAt = x.CreatedAt
        }).ToList();
    }

    private static JsonElement? ParseJson(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        using var document = JsonDocument.Parse(value);
        return document.RootElement.Clone();
    }
}
