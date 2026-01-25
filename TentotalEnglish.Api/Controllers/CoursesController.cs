using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TentotalEnglish.Api.Models;
using TentotalEnglish.Domain.Entities;
using TentotalEnglish.Infrastructure.Data;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CoursesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Course>>> GetAll()
        => await _db.Courses.AsNoTracking().OrderBy(c => c.Name).ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Course>> GetById(Guid id)
    {
        var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpPost]
    public async Task<ActionResult<Course>> Create(CreateCourseRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Name es requerido.");
        if (req.MonthlyPrice < 0) return BadRequest("MonthlyPrice no puede ser negativo.");

        var course = new Course
        {
            Name = req.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            MonthlyPrice = req.MonthlyPrice
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCourseRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Name es requerido.");
        if (req.MonthlyPrice < 0) return BadRequest("MonthlyPrice no puede ser negativo.");

        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return NotFound();

        course.Name = req.Name.Trim();
        course.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        course.MonthlyPrice = req.MonthlyPrice;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return NotFound();

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
