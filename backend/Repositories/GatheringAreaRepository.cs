using backend.Data;
using backend.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class GatheringAreaRepository : IGatheringAreaRepository
{
    private readonly AppDbContext _context;

    public GatheringAreaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GatheringArea>> GetAllAsync()
    {
        return await _context.GatheringAreas.ToListAsync();
    }

    public async Task<GatheringArea?> GetByIdAsync(int id)
    {
        return await _context.GatheringAreas
            .FirstOrDefaultAsync(x => x.Id == id);
    }
}