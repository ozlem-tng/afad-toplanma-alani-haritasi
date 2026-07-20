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

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var geoService = services.GetRequiredService<GeoDataServices>();

        // Ensure database is created and migrated
        Console.WriteLine("Applying pending migrations...");
        await context.Database.MigrateAsync();

        var geoJsonPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "GeoData", "TOPLANMAALANLARI_recent.geojson");

        Console.WriteLine($"Checking database and seeding spatial points from: {geoJsonPath}");
        await geoService.SeedGeoJsonDataAsync(geoJsonPath);
        Console.WriteLine("Database check and seeding execution finished.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during database startup/seeding: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); 
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();