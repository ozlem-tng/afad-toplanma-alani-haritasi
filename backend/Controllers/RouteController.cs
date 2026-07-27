using backend.Business.Services;
using Microsoft.AspNetCore.Mvc;

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
        double startLatitude,
        double startLongitude,
        double endLatitude,
        double endLongitude,
        string travelMode = "walking")
    {
        if (travelMode is not ("walking" or "driving"))
        {
            return BadRequest(new { message = "travelMode yalnızca 'walking' veya 'driving' olabilir." });
        }

        var result = await _osrmService.GetRouteAsync(
            startLatitude,
            startLongitude,
            endLatitude,
            endLongitude,
            travelMode
        );

        return Content(result, "application/json");
    }
}
