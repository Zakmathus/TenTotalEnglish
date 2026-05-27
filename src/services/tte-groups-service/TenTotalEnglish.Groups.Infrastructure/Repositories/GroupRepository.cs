using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using TenTotalEnglish.Groups.Application.Interfaces;
using TenTotalEnglish.Groups.Domain.Entities;

namespace TenTotalEnglish.Groups.Infrastructure.Repositories;

public class GroupRepository : IGroupRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public GroupRepository(IAmazonDynamoDB dynamoDb)
    {
        _dynamoDb = dynamoDb;
        _tableName = Environment.GetEnvironmentVariable("TABLE_NAME") ?? "tte-dev-main";
    }

    public async Task CreateAsync(Group group, CancellationToken cancellationToken = default)
    {
        var item = new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"GROUP#{group.Id}" },
            ["SK"] = new AttributeValue { S = "PROFILE" },
            ["EntityType"] = new AttributeValue { S = "Group" },
            ["GroupId"] = new AttributeValue { S = group.Id },
            ["Name"] = new AttributeValue { S = group.Name },
            ["Level"] = new AttributeValue { S = group.Level },
            ["Schedule"] = new AttributeValue { S = group.Schedule },
            ["ChargeDay"] = new AttributeValue { N = group.ChargeDay.ToString() },
            ["MonthlyPrice"] = new AttributeValue
            {
                N = group.MonthlyPrice.ToString(System.Globalization.CultureInfo.InvariantCulture)
            },
            ["CreatedAtUtc"] = new AttributeValue { S = group.CreatedAtUtc.ToString("O") }
        };

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        }, cancellationToken);
    }

    public async Task<Group?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["PK"] = new AttributeValue { S = $"GROUP#{id}" },
                ["SK"] = new AttributeValue { S = "PROFILE" }
            }
        }, cancellationToken);

        if (response.Item == null || response.Item.Count == 0)
            return null;

        var item = response.Item;

        return new Group(
            item["GroupId"].S,
            item["Name"].S,
            item["Level"].S,
            item["Schedule"].S,
            int.Parse(item["ChargeDay"].N),
            decimal.Parse(item["MonthlyPrice"].N, System.Globalization.CultureInfo.InvariantCulture),
            DateTime.Parse(item["CreatedAtUtc"].S)
        );
    }

    public async Task<List<Group>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var response = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = _tableName,
            FilterExpression = "begins_with(PK, :pk) AND SK = :sk",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new AttributeValue { S = "GROUP#" },
                [":sk"] = new AttributeValue { S = "PROFILE" }
            }
        }, cancellationToken);

        var groups = new List<Group>();

        foreach (var item in response.Items)
        {
            groups.Add(new Group(
                item["GroupId"].S,
                item["Name"].S,
                item["Level"].S,
                item["Schedule"].S,
                int.Parse(item["ChargeDay"].N),
                decimal.Parse(item["MonthlyPrice"].N, System.Globalization.CultureInfo.InvariantCulture),
                DateTime.Parse(item["CreatedAtUtc"].S)
            ));
        }

        return groups
            .OrderBy(g => g.Name)
            .ToList();
    }
}