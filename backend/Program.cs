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

// Business / Domain Servisleri
builder.Services.AddScoped<IToplanmaAlaniService, ToplanmaAlaniService>();
builder.Services.AddScoped<CandidatePointService>();
builder.Services.AddScoped<ActivityLogService>();
builder.Services.AddScoped<IEmailService, EmailService>(); // <-- EKLENEN SERVİS KAYDI

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
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
    var insertedCount = await ToplanmaAlaniSeeder.SeedAsync(context, app.Environment);

    if (insertedCount > 0)
        Console.WriteLine($"{insertedCount} toplanma alanı PostgreSQL'e eklendi.");
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

app.UseHttpsRedirection(); 
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();