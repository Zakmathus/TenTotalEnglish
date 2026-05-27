namespace TenTotalEnglish.Enrollments.Api.Dtos;

public class CreateEnrollmentRequest
{
    public string StudentId { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public decimal PriceAtEnrollment { get; set; }
    public int ChargeDayAtEnrollment { get; set; }
}