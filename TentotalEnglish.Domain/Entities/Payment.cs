namespace TentotalEnglish.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "MXN";
    public DateTime PaidAtUtc { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
