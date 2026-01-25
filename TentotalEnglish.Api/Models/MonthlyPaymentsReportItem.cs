namespace TentotalEnglish.Api.Models;

public record MonthlyPaymentsReportItem(int Year, int Month, decimal TotalAmount, int PaymentsCount);
