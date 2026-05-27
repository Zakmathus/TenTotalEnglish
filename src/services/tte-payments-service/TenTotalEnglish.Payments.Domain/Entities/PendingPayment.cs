namespace TenTotalEnglish.Payments.Domain.Entities;

public class PendingPayment
{
    public string StudentId { get; set; } = default!;
    public string EnrollmentId { get; set; } = default!;
    public string GroupId { get; set; } = default!;
    public decimal ExpectedAmount { get; set; }
    public int ChargeDay { get; set; }
    public string Month { get; set; } = default!;
    public string Status { get; set; } = "Pending";
}