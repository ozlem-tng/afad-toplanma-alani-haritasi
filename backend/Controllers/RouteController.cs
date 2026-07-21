using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RouteController : ControllerBase
{
    private readonly OsrmService _osrmService;

    public RouteController(OsrmService osrmService)
    {
        _osrmService = osrmService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoute(
        [FromQuery] double startLatitude,
        [FromQuery] double startLongitude,
        [FromQuery] double endLatitude,
        [FromQuery] double endLongitude)
    {
        try
        {
            var result = await _osrmService.GetRouteAsync(
                startLatitude,
                startLongitude,
                endLatitude,
                endLongitude
            );

            return Content(result, "application/json");
        }
        catch (Exception ex)
        {
            // Gracefully catch OSRM failures and return a clean error message
            return StatusCode(500, new { message = $"Failed to calculate route: {ex.Message}" });
        }
    }
}