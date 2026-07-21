using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<OsrmService>();
builder.Services.AddScoped<GeoDataServices>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        "Host=127.0.0.1;Database=afad_toplanma_alani_haritasi;Username=postgres;Password=Bhjd1903..",
        x => x.UseNetTopologySuite()
    ));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Helper function to locate the geojson file reliably
string GetGeoJsonFilePath()
{
    var path1 = Path.Combine(AppContext.BaseDirectory, "GeoData", "TOPLANMAALANLARI_recent.geojson");
    if (File.Exists(path1)) return path1;

    var path2 = Path.Combine(Directory.GetCurrentDirectory(), "GeoData", "TOPLANMAALANLARI_recent.geojson");
    if (File.Exists(path2)) return path2;

    return string.Empty;
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var geoService = services.GetRequiredService<GeoDataServices>();

        Console.WriteLine("Applying pending migrations...");
        await context.Database.MigrateAsync();

        var geoJsonPath = GetGeoJsonFilePath();
        if (string.IsNullOrEmpty(geoJsonPath))
        {
            Console.WriteLine($"[ERROR] Could not find 'TOPLANMAALANLARI_recent.geojson' in BaseDirectory ({AppContext.BaseDirectory}) or CurrentDirectory ({Directory.GetCurrentDirectory()}).");
        }
        else
        {
            Console.WriteLine($"Clearing old places data and re-seeding from: {geoJsonPath}");
            await context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE places RESTART IDENTITY CASCADE;");
            await geoService.SeedGeoJsonDataAsync(geoJsonPath);
            Console.WriteLine("Database seeding execution finished successfully!");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CRITICAL ERROR] An error occurred during startup/seeding: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); 
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1"));
}

// Manual route to force-trigger seeding and view errors directly in browser/Swagger
app.MapGet("/seed-data", async (AppDbContext context, GeoDataServices geoService) =>
{
    try
    {
        var geoJsonPath = GetGeoJsonFilePath();
        if (string.IsNullOrEmpty(geoJsonPath))
        {
            return Results.BadRequest($"File not found. BaseDirectory: {AppContext.BaseDirectory}, CurrentDirectory: {Directory.GetCurrentDirectory()}");
        }

        await context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE places RESTART IDENTITY CASCADE;");
        await geoService.SeedGeoJsonDataAsync(geoJsonPath);
        return Results.Ok($"Seeding successful from path: {geoJsonPath}");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Seeding failed with exception: {ex.Message} | StackTrace: {ex.StackTrace}");
    }
});

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();