namespace TentotalEnglish.Api.Models;

public record UpdateCourseRequest(string Name, string? Description, decimal MonthlyPrice);
