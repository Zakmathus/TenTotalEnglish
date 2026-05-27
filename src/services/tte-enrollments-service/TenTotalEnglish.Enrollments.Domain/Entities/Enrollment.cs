namespace TenTotalEnglish.Enrollments.Domain.Entities;

public class Enrollment
{
    public string Id { get; private set; } = Guid.NewGuid().ToString("N");
    public string StudentId { get; private set; }
    public string GroupId { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string Status { get; private set; }
    public decimal PriceAtEnrollment { get; private set; }
    public int ChargeDayAtEnrollment { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Enrollment(
        string studentId,
        string groupId,
        DateTime startDate,
        decimal priceAtEnrollment,
        int chargeDayAtEnrollment)
    {
        StudentId = studentId;
        GroupId = groupId;
        StartDate = startDate;
        PriceAtEnrollment = priceAtEnrollment;
        ChargeDayAtEnrollment = chargeDayAtEnrollment;
        Status = "Active";
    }

    public Enrollment(
        string id,
        string studentId,
        string groupId,
        DateTime startDate,
        DateTime? endDate,
        string status,
        decimal priceAtEnrollment,
        int chargeDayAtEnrollment,
        DateTime createdAtUtc)
    {
        Id = id;
        StudentId = studentId;
        GroupId = groupId;
        StartDate = startDate;
        EndDate = endDate;
        Status = status;
        PriceAtEnrollment = priceAtEnrollment;
        ChargeDayAtEnrollment = chargeDayAtEnrollment;
        CreatedAtUtc = createdAtUtc;
    }

    public void Deactivate(DateTime? endDate = null)
    {
        EndDate = endDate ?? DateTime.UtcNow;
        Status = "Inactive";
    }
}