using backend.Business.Services;
using backend.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/aday-noktalar")]
public class CandidatePointsController : ControllerBase
{
    private readonly CandidatePointService _service;

    public CandidatePointsController(CandidatePointService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CandidatePointDto>>> GetAll([FromQuery] string? decision)
    {
        return Ok(await _service.GetAllAsync(decision));
    }

    [HttpPost("{id:int}/kabul")]
    public async Task<ActionResult<CandidatePointDto>> Accept(int id)
    {
        try
        {
            var result = await _service.AcceptAsync(id);
            return result is null
                ? NotFound(new { message = "Aday nokta bulunamadı." })
                : Ok(result);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("{id:int}/ret")]
    public async Task<ActionResult<CandidatePointDto>> Reject(int id, [FromBody] RejectCandidateDto dto)
    {
        try
        {
            var result = await _service.RejectAsync(id, dto.RejectionReason);
            return result is null
                ? NotFound(new { message = "Aday nokta bulunamadı." })
                : Ok(result);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}