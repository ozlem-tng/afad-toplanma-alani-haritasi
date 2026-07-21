using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<ToplanmaAlani> ToplanmaAlanlari { get; set; }

    public DbSet<CandidatePoint> CandidatePoints { get; set; }

    public DbSet<ActivityLog> ActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("postgis");

        modelBuilder.Entity<ToplanmaAlani>()
            .HasIndex(x => x.PointWkt)
            .HasMethod("gist");

        modelBuilder.Entity<CandidatePoint>()
            .HasIndex(x => x.PointWkt)
            .HasMethod("gist");

        modelBuilder.Entity<CandidatePoint>()
            .HasOne(x => x.GatheringArea)
            .WithMany()
            .HasForeignKey(x => x.GatheringAreaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ActivityLog>()
            .HasOne(x => x.GatheringArea)
            .WithMany()
            .HasForeignKey(x => x.GatheringAreaId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<ActivityLog>()
            .HasOne(x => x.CandidatePoint)
            .WithMany()
            .HasForeignKey(x => x.CandidatePointId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
