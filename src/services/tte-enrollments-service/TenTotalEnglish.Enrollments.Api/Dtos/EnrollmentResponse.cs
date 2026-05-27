namespace TenTotalEnglish.Enrollments.Api.Dtos;

public class EnrollmentResponse
{
    public string Id { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal PriceAtEnrollment { get; set; }
    public int ChargeDayAtEnrollment { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}