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

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.AlanTur).HasColumnName("alan_tur");
            entity.Property(e => e.AlanM2).HasColumnName("alan_m2");
            entity.Property(e => e.Kapasite).HasColumnName("kapasite");
            entity.Property(e => e.MahalleAdi).HasColumnName("mahalle_adi");
            entity.Property(e => e.IlceAdi).HasColumnName("ilce_adi");
            
            // Updated column type to Point
            entity.Property(e => e.Geom)
                  .HasColumnName("coordinates")
                  .HasColumnType("geometry(Point, 4326)");
        });

        base.OnModelCreating(modelBuilder);
    }
}