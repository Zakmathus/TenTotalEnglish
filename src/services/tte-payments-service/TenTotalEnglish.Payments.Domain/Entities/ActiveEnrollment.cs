namespace TenTotalEnglish.Payments.Domain.Entities;

public class ActiveEnrollment
{
    public string EnrollmentId { get; private set; }
    public string StudentId { get; private set; }
    public string GroupId { get; private set; }
    public DateTime StartDate { get; private set; }
    public string Status { get; private set; }
    public decimal PriceAtEnrollment { get; private set; }
    public int ChargeDayAtEnrollment { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    public ActiveEnrollment(string enrollmentId, string studentId, string groupId, DateTime startDate, string status, decimal priceAtEnrollment, int chargeDayAtEnrollment, DateTime createdAtUtc)
    {
        EnrollmentId = enrollmentId;
        StudentId = studentId;
        GroupId = groupId;
        StartDate = startDate;
        Status = status;
        PriceAtEnrollment = priceAtEnrollment;
        ChargeDayAtEnrollment = chargeDayAtEnrollment;
        CreatedAtUtc = createdAtUtc;
    }
}