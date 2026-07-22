using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore;
using backend.Data;
using backend.Data.Seeders;
using backend.Business.Interfaces;
using backend.Business.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

builder.Services.AddHttpClient<OsrmService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<
    IToplanmaAlaniService,
    ToplanmaAlaniService
>();
builder.Services.AddScoped<CandidatePointService>();
builder.Services.AddScoped<ActivityLogService>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        ),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
                  Uri.TryCreate(origin, UriKind.Absolute, out var uri) && uri.IsLoopback)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await context.Database.MigrateAsync();
    var changedCount = await ToplanmaAlaniSeeder.SeedAsync(context, app.Environment);

    if (changedCount > 0)
        Console.WriteLine($"{changedCount} coğrafi kayıt PostgreSQL ile eşitlendi.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        c.RoutePrefix = string.Empty;
    });
}

// app.UseHttpsRedirection(); 
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
