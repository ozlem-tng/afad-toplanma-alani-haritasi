using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Data.Seeders;
using backend.Business.Interfaces;
using backend.Business.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// 2. Swagger / API Explorer Setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. HTTP Clients & Service Registrations
builder.Services.AddHttpClient<OsrmService>();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IToplanmaAlaniService, ToplanmaAlaniService>();

// 4. DbContext Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseNetTopologySuite()
    ));

// 5. CORS Configuration
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

// 6. Database Migrations & Data Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        Console.WriteLine("Applying pending migrations...");
        await context.Database.MigrateAsync();

        // ToplanmaAlani Entity Seeder
        var insertedCount = await ToplanmaAlaniSeeder.SeedAsync(context, app.Environment);
        if (insertedCount > 0)
        {
            Console.WriteLine($"{insertedCount} toplanma alanı PostgreSQL'e eklendi.");
        }

        Console.WriteLine("Database check and seeding execution finished.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred during database startup/seeding: {ex.Message}");
    }
}

// 7. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        //c.RoutePrefix = string.Empty;
    });
}

// app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();