using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TentotalEnglish.Api.Models;
using TentotalEnglish.Domain.Entities;
using TentotalEnglish.Infrastructure.Data;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public EnrollmentsController(AppDbContext db) => _db = db;

    // GET /api/enrollments?studentId=...&courseId=...&activeOnly=true
    [HttpGet]
    public async Task<ActionResult<List<Enrollment>>> Get(
        [FromQuery] Guid? studentId,
        [FromQuery] Guid? courseId,
        [FromQuery] bool activeOnly = false)
    {
        var q = _db.Enrollments.AsNoTracking().AsQueryable();

        if (studentId.HasValue) q = q.Where(e => e.StudentId == studentId.Value);
        if (courseId.HasValue) q = q.Where(e => e.CourseId == courseId.Value);
        if (activeOnly) q = q.Where(e => e.IsActive);

        return await q.OrderByDescending(e => e.StartDateUtc).ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Enrollment>> GetById(Guid id)
    {
        var enrollment = await _db.Enrollments.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return enrollment is null ? NotFound() : Ok(enrollment);
    }

    [HttpPost]
    public async Task<ActionResult<Enrollment>> Create(CreateEnrollmentRequest req)
    {
        if (req.StudentId == Guid.Empty) return BadRequest("StudentId es requerido.");
        if (req.CourseId == Guid.Empty) return BadRequest("CourseId es requerido.");

        var studentExists = await _db.Students.AnyAsync(s => s.Id == req.StudentId);
        if (!studentExists) return BadRequest("StudentId no existe.");

        var courseExists = await _db.Courses.AnyAsync(c => c.Id == req.CourseId);
        if (!courseExists) return BadRequest("CourseId no existe.");

        var alreadyActive = await _db.Enrollments.AnyAsync(e =>
            e.StudentId == req.StudentId && e.CourseId == req.CourseId && e.IsActive);

        if (alreadyActive) return Conflict("El alumno ya tiene una inscripción activa en ese curso.");

        var enrollment = new Enrollment
        {
            StudentId = req.StudentId,
            CourseId = req.CourseId,
            StartDateUtc = DateTime.UtcNow,
            IsActive = true
        };

        _db.Enrollments.Add(enrollment);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = enrollment.Id }, enrollment);
    }

    // "End" enrollment (soft close)
    [HttpPost("{id:guid}/end")]
    public async Task<IActionResult> End(Guid id, EndEnrollmentRequest req)
    {
        var enrollment = await _db.Enrollments.FirstOrDefaultAsync(e => e.Id == id);
        if (enrollment is null) return NotFound();

        if (!enrollment.IsActive) return BadRequest("La inscripción ya está finalizada.");

        enrollment.IsActive = false;
        enrollment.EndDateUtc = req.EndDateUtc ?? DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var enrollment = await _db.Enrollments.FirstOrDefaultAsync(e => e.Id == id);
        if (enrollment is null) return NotFound();

        _db.Enrollments.Remove(enrollment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
