using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Entities;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<GatheringArea> GatheringAreas { get; set; }
}