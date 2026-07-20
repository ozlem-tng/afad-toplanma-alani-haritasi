using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace backend.Controllers;

[ApiController]
[Route("api/geo")]
public class GeoController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public GeoController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet("gathering-areas")]
    public IActionResult GetGatheringAreas()
    {
        var path = Path.Combine(
            _environment.ContentRootPath,
            "GeoData",
            "TOPLANMAALANLARI_recent.geojson");

        if (!System.IO.File.Exists(path))
            return NotFound("GeoJSON file was not found.");

        var json = System.IO.File.ReadAllText(path);
        return Content(json, "application/json");
    }

    [HttpGet("ankara-boundary")]
    public IActionResult GetAnkaraBoundary()
    {
        var path = Path.Combine(
            _environment.ContentRootPath,
            "GeoData",
            "ANKARA_IL_SINIRI.geojson");

        if (!System.IO.File.Exists(path))
            return NotFound("GeoJSON file was not found.");

        var json = System.IO.File.ReadAllText(path);
        return Content(json, "application/json");
    }
}