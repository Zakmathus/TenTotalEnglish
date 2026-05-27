namespace TenTotalEnglish.Students.Domain.Entities;

public class Student
{
    public string Id { get; private set; } = Guid.NewGuid().ToString("N");
    public string FullName { get; private set; }
    public DateTime BirthDate { get; private set; }
    public string Phone { get; private set; }
    public string Email { get; private set; }
    public string Occupation { get; private set; }
    public string Neighborhood { get; private set; }
    public string? CompanyName { get; private set; }
    public bool CompanySupport { get; private set; }
    public decimal? CompanySupportAmount { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Student(
        string fullName,
        DateTime birthDate,
        string phone,
        string email,
        string occupation,
        string neighborhood,
        string? companyName,
        bool companySupport,
        decimal? companySupportAmount)
    {
        FullName = fullName;
        BirthDate = birthDate;
        Phone = phone;
        Email = email;
        Occupation = occupation;
        Neighborhood = neighborhood;
        CompanyName = companyName;
        CompanySupport = companySupport;
        CompanySupportAmount = companySupportAmount;
    }

    private Student()
    {
        FullName = string.Empty;
        Phone = string.Empty;
        Email = string.Empty;
        Occupation = string.Empty;
        Neighborhood = string.Empty;
    }

    public static Student Rehydrate(
        string id,
        string fullName,
        DateTime birthDate,
        string phone,
        string email,
        string occupation,
        string neighborhood,
        string? companyName,
        bool companySupport,
        decimal? companySupportAmount,
        DateTime createdAtUtc)
    {
        return new Student
        {
            Id = id,
            FullName = fullName,
            BirthDate = birthDate,
            Phone = phone,
            Email = email,
            Occupation = occupation,
            Neighborhood = neighborhood,
            CompanyName = companyName,
            CompanySupport = companySupport,
            CompanySupportAmount = companySupportAmount,
            CreatedAtUtc = createdAtUtc
        };
    }
}