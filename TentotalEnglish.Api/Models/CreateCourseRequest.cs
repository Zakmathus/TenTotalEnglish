namespace TentotalEnglish.Api.Models;

public record CreateCourseRequest(string Name, string? Description, decimal MonthlyPrice);
