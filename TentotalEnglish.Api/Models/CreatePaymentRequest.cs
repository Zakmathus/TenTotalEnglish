namespace TentotalEnglish.Api.Models;

public record CreatePaymentRequest(Guid StudentId, decimal Amount, string? Currency, string? Notes);
