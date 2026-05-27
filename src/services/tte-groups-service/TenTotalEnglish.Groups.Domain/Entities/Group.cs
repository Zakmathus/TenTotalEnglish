namespace TenTotalEnglish.Groups.Domain.Entities;

public class Group
{
    public string Id { get; private set; } = Guid.NewGuid().ToString("N");
    public string Name { get; private set; }
    public string Level { get; private set; }
    public string Schedule { get; private set; }
    public int ChargeDay { get; private set; }
    public decimal MonthlyPrice { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Group(
        string name,
        string level,
        string schedule,
        int chargeDay,
        decimal monthlyPrice)
    {
        Name = name;
        Level = level;
        Schedule = schedule;
        ChargeDay = chargeDay;
        MonthlyPrice = monthlyPrice;
    }

    public Group(
        string id,
        string name,
        string level,
        string schedule,
        int chargeDay,
        decimal monthlyPrice,
        DateTime createdAtUtc)
    {
        Id = id;
        Name = name;
        Level = level;
        Schedule = schedule;
        ChargeDay = chargeDay;
        MonthlyPrice = monthlyPrice;
        CreatedAtUtc = createdAtUtc;
    }
}