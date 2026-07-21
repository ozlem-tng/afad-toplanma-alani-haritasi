using backend.Entities;

namespace backend.Repositories.Interfaces;

public interface IGatheringAreaRepository
{
    Task<List<GatheringArea>> GetAllAsync();

    Task<GatheringArea?> GetByIdAsync(int id);
}