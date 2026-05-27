namespace TenTotalEnglish.Groups.Api.Dtos;

public class CreateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Schedule { get; set; } = string.Empty;
    public int ChargeDay { get; set; }
    public decimal MonthlyPrice { get; set; }
}