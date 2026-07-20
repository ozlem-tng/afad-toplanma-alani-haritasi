using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    public DbSet<Place> Places { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("postgis");

        modelBuilder.Entity<Place>(entity =>
        {
            entity.ToTable("places");
            entity.Property(e => e.Geom).HasColumnType("geometry(Point, 4326)");
        });

        base.OnModelCreating(modelBuilder);
    }
}