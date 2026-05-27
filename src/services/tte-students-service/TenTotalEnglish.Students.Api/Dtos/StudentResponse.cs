namespace TenTotalEnglish.Students.Api.Dtos;

public class StudentResponse
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Occupation { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public bool CompanySupport { get; set; }
    public decimal? CompanySupportAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
