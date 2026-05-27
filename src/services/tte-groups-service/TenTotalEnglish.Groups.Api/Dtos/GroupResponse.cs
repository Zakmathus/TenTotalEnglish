namespace TenTotalEnglish.Groups.Api.Dtos;

public class GroupResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Schedule { get; set; } = string.Empty;
    public int ChargeDay { get; set; }
    public decimal MonthlyPrice { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}