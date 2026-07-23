using System.Globalization;

namespace backend.Business.Services;

public class OsrmService
{
    private readonly HttpClient _httpClient;

    public OsrmService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> GetRouteAsync(
        double startLatitude,
        double startLongitude,
        double endLatitude,
        double endLongitude,
        string travelMode)
    {
        var server = travelMode == "walking"
            ? "https://routing.openstreetmap.de/routed-foot"
            : "https://routing.openstreetmap.de/routed-car";

        // Profili dinamik belirle
        var profile = travelMode == "walking"
            ? "foot"
            : "driving";

        var url =
            $"{server}/route/v1/{profile}/" +
            $"{startLongitude.ToString(CultureInfo.InvariantCulture)},{startLatitude.ToString(CultureInfo.InvariantCulture)};" +
            $"{endLongitude.ToString(CultureInfo.InvariantCulture)},{endLatitude.ToString(CultureInfo.InvariantCulture)}" +
            "?overview=full&geometries=geojson";
       

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}
