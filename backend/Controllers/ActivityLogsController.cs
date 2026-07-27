using backend.Business.Services;
using backend.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/islem-gecmisi")]
public class ActivityLogsController : ControllerBase
{
    private readonly ActivityLogService _service;

    public ActivityLogsController(ActivityLogService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ActivityLogDto>>> GetLatest([FromQuery] int limit = 50)
    {
        return Ok(await _service.GetLatestAsync(limit));
    }
}