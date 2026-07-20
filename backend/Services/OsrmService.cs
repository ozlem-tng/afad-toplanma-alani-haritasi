using System.Globalization;
using System.Net.Http;
using System.Threading.Tasks;
using System.IO;
using System;

namespace backend.Services;

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
        double endLongitude)
    {
        try
        {
            // OSRM expects: longitude,latitude;longitude,latitude
            var url = $"http://router.project-osrm.org/route/v1/driving/" +
                      $"{startLongitude.ToString(CultureInfo.InvariantCulture)},{startLatitude.ToString(CultureInfo.InvariantCulture)};" +
                      $"{endLongitude.ToString(CultureInfo.InvariantCulture)},{endLatitude.ToString(CultureInfo.InvariantCulture)}" +
                      "?overview=full&geometries=geojson";
            
            Console.WriteLine($"Requesting OSRM Route: {url}");

            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"OSRM Error Response: {errorContent}");
                throw new Exception($"OSRM Server returned status code {(int)response.StatusCode}: {errorContent}");
            }

            return await response.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"OSRM Exception: {ex.Message}");
            throw; // Re-throw to be handled elegantly by RouteController
        }
    }
}