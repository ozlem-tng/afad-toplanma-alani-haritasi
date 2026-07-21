using backend.DTOs;

namespace backend.Business.Interfaces;

public interface IToplanmaAlaniService
{
    Task<List<ToplanmaAlaniDto>> GetAllAsync();
    Task<ToplanmaAlaniDto?> GetByIdAsync(int id);
    Task<ToplanmaAlaniDto> CreateAsync(CreateToplanmaAlaniDto dto);
    Task<ToplanmaAlaniDto?> UpdateAsync(int id, UpdateToplanmaAlaniDto dto);
    Task<bool> DeleteAsync(int id);
    Task<ToplanmaAlaniDto?> RestoreAsync(int id);
}
