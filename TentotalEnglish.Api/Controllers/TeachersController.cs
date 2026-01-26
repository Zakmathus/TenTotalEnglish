using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TentotalEnglish.Api.Models;
using TentotalEnglish.Domain.Entities;
using TentotalEnglish.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class TeachersController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeachersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Teacher>>> GetAll()
        => await _db.Teachers.AsNoTracking()
            .OrderBy(t => t.LastName).ThenBy(t => t.FirstName)
            .ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Teacher>> GetById(Guid id)
    {
        var teacher = await _db.Teachers.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        return teacher is null ? NotFound() : Ok(teacher);
    }

    [HttpPost]
    public async Task<ActionResult<Teacher>> Create(CreateTeacherRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FirstName)) return BadRequest("FirstName es requerido.");
        if (string.IsNullOrWhiteSpace(req.LastName)) return BadRequest("LastName es requerido.");
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest("Email es requerido.");
        if (!req.Email.Contains('@')) return BadRequest("Email inválido.");

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var exists = await _db.Teachers.AnyAsync(t => t.Email == normalizedEmail);
        if (exists) return Conflict("Ya existe un maestro con ese email.");

        var teacher = new Teacher
        {
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Email = normalizedEmail
        };

        _db.Teachers.Add(teacher);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = teacher.Id }, teacher);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateTeacherRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FirstName)) return BadRequest("FirstName es requerido.");
        if (string.IsNullOrWhiteSpace(req.LastName)) return BadRequest("LastName es requerido.");
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest("Email es requerido.");
        if (!req.Email.Contains('@')) return BadRequest("Email inválido.");

        var teacher = await _db.Teachers.FirstOrDefaultAsync(t => t.Id == id);
        if (teacher is null) return NotFound();

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var emailTaken = await _db.Teachers.AnyAsync(t => t.Id != id && t.Email == normalizedEmail);
        if (emailTaken) return Conflict("Ese email ya está en uso por otro maestro.");

        teacher.FirstName = req.FirstName.Trim();
        teacher.LastName = req.LastName.Trim();
        teacher.Email = normalizedEmail;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var teacher = await _db.Teachers.FirstOrDefaultAsync(t => t.Id == id);
        if (teacher is null) return NotFound();

        _db.Teachers.Remove(teacher);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
