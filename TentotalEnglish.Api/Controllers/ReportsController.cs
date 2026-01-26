using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TentotalEnglish.Api.Models;
using TentotalEnglish.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) => _db = db;

    // GET /api/reports/payments/monthly?year=2026
    [HttpGet("payments/monthly")]
    public async Task<ActionResult<List<MonthlyPaymentsReportItem>>> PaymentsMonthly([FromQuery] int? year)
    {
        var q = _db.Payments.AsNoTracking().AsQueryable();

        if (year.HasValue)
            q = q.Where(p => p.PaidAtUtc.Year == year.Value);

        var raw = await q
            .GroupBy(p => new { Year = p.PaidAtUtc.Year, Month = p.PaidAtUtc.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                TotalAmount = g.Sum(x => x.Amount),
                PaymentsCount = g.Count()
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync();

        var result = raw
            .Select(x => new MonthlyPaymentsReportItem(x.Year, x.Month, x.TotalAmount, x.PaymentsCount))
            .ToList();

        return result;
    }

    // GET /api/reports/payments/monthly-by-student?studentId=...&year=2026
    [HttpGet("payments/monthly-by-student")]
    public async Task<ActionResult<List<MonthlyPaymentsReportItem>>> PaymentsMonthlyByStudent(
        [FromQuery] Guid studentId,
        [FromQuery] int? year)
    {
        if (studentId == Guid.Empty) return BadRequest("studentId es requerido.");

        var studentExists = await _db.Students.AnyAsync(s => s.Id == studentId);
        if (!studentExists) return BadRequest("studentId no existe.");

        var q = _db.Payments.AsNoTracking().Where(p => p.StudentId == studentId);

        if (year.HasValue)
            q = q.Where(p => p.PaidAtUtc.Year == year.Value);

        var raw = await q
            .GroupBy(p => new { Year = p.PaidAtUtc.Year, Month = p.PaidAtUtc.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                TotalAmount = g.Sum(x => x.Amount),
                PaymentsCount = g.Count()
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync();

        var result = raw
            .Select(x => new MonthlyPaymentsReportItem(x.Year, x.Month, x.TotalAmount, x.PaymentsCount))
            .ToList();

        return result;
    }
}
