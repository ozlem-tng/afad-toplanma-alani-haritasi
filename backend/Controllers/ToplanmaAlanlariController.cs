using backend.DTOs;
using backend.Business.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/toplanma-alanlari")]
public class ToplanmaAlanlariController : ControllerBase
{
    private readonly IToplanmaAlaniService _service;

    public ToplanmaAlanlariController(
        IToplanmaAlaniService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ToplanmaAlaniDto>>> GetAll()
    {
        var alanlar = await _service.GetAllAsync();

        return Ok(alanlar);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ToplanmaAlaniDto>> GetById(int id)
    {
        var alan = await _service.GetByIdAsync(id);

        if (alan is null)
        {
            return NotFound(new
            {
                message = "Toplanma alanı bulunamadı."
            });
        }

        return Ok(alan);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ToplanmaAlaniDto>> Update(
        int id,
        [FromBody] UpdateToplanmaAlaniDto dto)
    {
        var alan = await _service.UpdateAsync(id, dto);

        if (alan is null)
            return NotFound(new { message = "Toplanma alanı bulunamadı." });

        return Ok(alan);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
            return NotFound(new { message = "Toplanma alanı bulunamadı." });

        return NoContent();
    }
}
