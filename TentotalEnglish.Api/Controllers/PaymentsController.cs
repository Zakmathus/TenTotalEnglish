using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TentotalEnglish.Api.Models;
using TentotalEnglish.Domain.Entities;
using TentotalEnglish.Infrastructure.Data;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PaymentsController(AppDbContext db) => _db = db;

    // GET /api/payments?studentId=...
    [HttpGet]
    public async Task<ActionResult<List<Payment>>> Get([FromQuery] Guid? studentId)
    {
        var q = _db.Payments.AsNoTracking().AsQueryable();

        if (studentId.HasValue)
            q = q.Where(p => p.StudentId == studentId.Value);

        // Nota: NO incluyo Student por default para evitar ciclos/JSON gigante.
        return await q.OrderByDescending(p => p.PaidAtUtc).ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Payment>> GetById(Guid id)
    {
        var payment = await _db.Payments.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        return payment is null ? NotFound() : Ok(payment);
    }

    [HttpPost]
    public async Task<ActionResult<Payment>> Create(CreatePaymentRequest req)
    {
        if (req.StudentId == Guid.Empty) return BadRequest("StudentId es requerido.");
        if (req.Amount <= 0) return BadRequest("Amount debe ser mayor a 0.");

        var studentExists = await _db.Students.AnyAsync(s => s.Id == req.StudentId);
        if (!studentExists) return BadRequest("StudentId no existe.");

        var currency = string.IsNullOrWhiteSpace(req.Currency) ? "MXN" : req.Currency!.Trim().ToUpperInvariant();

        var payment = new Payment
        {
            StudentId = req.StudentId,
            Amount = req.Amount,
            Currency = currency,
            Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
            PaidAtUtc = DateTime.UtcNow,
            Student = new Student() // Initialize the required 'Student' property
        };


        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.Id == id);
        if (payment is null) return NotFound();

        _db.Payments.Remove(payment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
