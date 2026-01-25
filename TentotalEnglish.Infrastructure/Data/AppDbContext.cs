using Microsoft.EntityFrameworkCore;
using TentotalEnglish.Domain.Entities;

namespace TentotalEnglish.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Payment> Payments => Set<Payment>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Enrollment>()
         .HasOne(e => e.Student)
         .WithMany(s => s.Enrollments)
         .HasForeignKey(e => e.StudentId);

        modelBuilder.Entity<Enrollment>()
         .HasOne(e => e.Course)
         .WithMany(c => c.Enrollments)
         .HasForeignKey(e => e.CourseId);

        // Evita duplicar inscripción activa del mismo alumno al mismo curso
        modelBuilder.Entity<Enrollment>()
         .HasIndex(e => new { e.StudentId, e.CourseId, e.IsActive });

        base.OnModelCreating(modelBuilder);
    }
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

}
