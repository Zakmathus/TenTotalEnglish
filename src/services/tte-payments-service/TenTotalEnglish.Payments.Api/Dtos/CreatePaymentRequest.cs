namespace TenTotalEnglish.Payments.Api.Dtos;

public class CreatePaymentRequest
{
    public string StudentId { get; set; } = default!;
    public string EnrollmentId { get; set; } = default!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Month { get; set; } = default!;
}