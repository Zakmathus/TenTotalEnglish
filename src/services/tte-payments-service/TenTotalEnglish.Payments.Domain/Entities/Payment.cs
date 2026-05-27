namespace TenTotalEnglish.Payments.Domain.Entities;

public class Payment
{
    public string Id { get; private set; } = Guid.NewGuid().ToString("N");
    public string StudentId { get; private set; }
    public string EnrollmentId { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime PaymentDate { get; private set; }
    public string Month { get; private set; }
    public string Status { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Payment(string studentId, string enrollmentId, decimal amount, DateTime paymentDate, string month)
    {
        StudentId = studentId;
        EnrollmentId = enrollmentId;
        Amount = amount;
        PaymentDate = paymentDate;
        Month = month;
        Status = "Registered";
    }

    public Payment(string id, string studentId, string enrollmentId, decimal amount, DateTime paymentDate, string month, string status, DateTime createdAtUtc)
    {
        Id = id;
        StudentId = studentId;
        EnrollmentId = enrollmentId;
        Amount = amount;
        PaymentDate = paymentDate;
        Month = month;
        Status = status;
        CreatedAtUtc = createdAtUtc;
    }
}