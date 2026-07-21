using backend.Entities;

namespace backend.Services.Interfaces;

public interface IGatheringAreaService
{
    Task<List<GatheringArea>> GetAllAsync();

    Task<GatheringArea?> GetByIdAsync(int id);
}