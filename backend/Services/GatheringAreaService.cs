using backend.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services;

public class GatheringAreaService : IGatheringAreaService
{
    private readonly IGatheringAreaRepository _repository;

    public GatheringAreaService(IGatheringAreaRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<GatheringArea>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<GatheringArea?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }
}