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
        double endLongitude)
    {
        var result = await _osrmService.GetRouteAsync(
            startLatitude,
            startLongitude,
            endLatitude,
            endLongitude
        );

        return Content(result, "application/json");
    }
}
