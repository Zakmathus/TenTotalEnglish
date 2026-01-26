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
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Student>>> GetAll()
        => await _db.Students.AsNoTracking()
            .OrderBy(s => s.LastName).ThenBy(s => s.FirstName)
            .ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Student>> GetById(Guid id)
    {
        var student = await _db.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        return student is null ? NotFound() : Ok(student);
    }

    [HttpPost]
    public async Task<ActionResult<Student>> Create(CreateStudentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FirstName)) return BadRequest("FirstName es requerido.");
        if (string.IsNullOrWhiteSpace(req.LastName)) return BadRequest("LastName es requerido.");
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest("Email es requerido.");
        if (!req.Email.Contains('@')) return BadRequest("Email inválido.");

        var exists = await _db.Students.AnyAsync(s => s.Email == req.Email);
        if (exists) return Conflict("Ya existe un alumno con ese email.");

        var student = new Student
        {
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Email = req.Email.Trim().ToLowerInvariant()
        };

        _db.Students.Add(student);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateStudentRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FirstName)) return BadRequest("FirstName es requerido.");
        if (string.IsNullOrWhiteSpace(req.LastName)) return BadRequest("LastName es requerido.");
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest("Email es requerido.");
        if (!req.Email.Contains('@')) return BadRequest("Email inválido.");

        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound();

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var emailTaken = await _db.Students.AnyAsync(s => s.Id != id && s.Email == normalizedEmail);
        if (emailTaken) return Conflict("Ese email ya está en uso por otro alumno.");

        student.FirstName = req.FirstName.Trim();
        student.LastName = req.LastName.Trim();
        student.Email = normalizedEmail;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound();

        _db.Students.Remove(student);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
