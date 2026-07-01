using System;
using Microsoft.EntityFrameworkCore;
using ApiMateriales2026Fagnola.Models;
 
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
 
    public DbSet<Materiales> Materiales { get; set; }
    public DbSet<Rubro> Rubros { get; set; }
    public DbSet<Productos> Productos { get; set; }
}

