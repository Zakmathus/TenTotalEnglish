using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using TenTotalEnglish.Enrollments.Application.Interfaces;
using TenTotalEnglish.Enrollments.Domain.Entities;

namespace TenTotalEnglish.Enrollments.Infrastructure.Repositories;

public class EnrollmentRepository : IEnrollmentRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public EnrollmentRepository(IAmazonDynamoDB dynamoDb)
    {
        _dynamoDb = dynamoDb;
        _tableName = Environment.GetEnvironmentVariable("TABLE_NAME") ?? "tte-dev-main";
    }

    public async Task<bool> HasActiveEnrollmentAsync(string studentId, CancellationToken cancellationToken = default)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["PK"] = new AttributeValue { S = $"STUDENT#{studentId}" },
                ["SK"] = new AttributeValue { S = "ACTIVE_ENROLLMENT" }
            }
        }, cancellationToken);

        return response.Item != null && response.Item.Count > 0;
    }

    public async Task CreateAsync(Enrollment enrollment, CancellationToken cancellationToken = default)
    {
        await CreateOrReplaceActiveAsync(enrollment, cancellationToken);
    }

    public async Task CreateOrReplaceActiveAsync(Enrollment enrollment, CancellationToken cancellationToken = default)
    {
        var currentActive = await GetActiveByStudentIdAsync(enrollment.StudentId, cancellationToken);
        var transactItems = new List<TransactWriteItem>();

        if (currentActive is not null)
        {
            currentActive.Deactivate(enrollment.StartDate);

            transactItems.Add(new TransactWriteItem
            {
                Put = new Put
                {
                    TableName = _tableName,
                    Item = BuildHistoricalItem(currentActive)
                }
            });
        }

        transactItems.Add(new TransactWriteItem
        {
            Put = new Put
            {
                TableName = _tableName,
                Item = BuildHistoricalItem(enrollment)
            }
        });

        transactItems.Add(new TransactWriteItem
        {
            Put = new Put
            {
                TableName = _tableName,
                Item = BuildActiveItem(enrollment)
            }
        });

        transactItems.Add(new TransactWriteItem
        {
            Put = new Put
            {
                TableName = _tableName,
                Item = BuildGroupStudentItem(enrollment)
            }
        });

        await _dynamoDb.TransactWriteItemsAsync(new TransactWriteItemsRequest
        {
            TransactItems = transactItems
        }, cancellationToken);
    }

    public async Task<Enrollment?> GetActiveByStudentIdAsync(string studentId, CancellationToken cancellationToken = default)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["PK"] = new AttributeValue { S = $"STUDENT#{studentId}" },
                ["SK"] = new AttributeValue { S = "ACTIVE_ENROLLMENT" }
            }
        }, cancellationToken);

        if (response.Item == null || response.Item.Count == 0)
            return null;

        return MapEnrollment(response.Item);
    }

    private static Enrollment MapEnrollment(Dictionary<string, AttributeValue> item)
    {
        DateTime? endDate = null;

        if (item.TryGetValue("EndDate", out var endDateValue) && !string.IsNullOrWhiteSpace(endDateValue.S))
        {
            endDate = DateTime.Parse(endDateValue.S);
        }

        return new Enrollment(
            item["EnrollmentId"].S,
            item["StudentId"].S,
            item["GroupId"].S,
            DateTime.Parse(item["StartDate"].S),
            endDate,
            item["Status"].S,
            decimal.Parse(item["PriceAtEnrollment"].N, System.Globalization.CultureInfo.InvariantCulture),
            int.Parse(item["ChargeDayAtEnrollment"].N),
            DateTime.Parse(item["CreatedAtUtc"].S)
        );
    }

    private static Dictionary<string, AttributeValue> BuildHistoricalItem(Enrollment enrollment)
    {
        var item = new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"STUDENT#{enrollment.StudentId}" },
            ["SK"] = new AttributeValue { S = $"ENROLLMENT#{enrollment.StartDate:yyyy-MM-dd}#{enrollment.Id}" },
            ["EntityType"] = new AttributeValue { S = "Enrollment" },
            ["EnrollmentId"] = new AttributeValue { S = enrollment.Id },
            ["StudentId"] = new AttributeValue { S = enrollment.StudentId },
            ["GroupId"] = new AttributeValue { S = enrollment.GroupId },
            ["StartDate"] = new AttributeValue { S = enrollment.StartDate.ToString("yyyy-MM-dd") },
            ["Status"] = new AttributeValue { S = enrollment.Status },
            ["PriceAtEnrollment"] = new AttributeValue { N = enrollment.PriceAtEnrollment.ToString(System.Globalization.CultureInfo.InvariantCulture) },
            ["ChargeDayAtEnrollment"] = new AttributeValue { N = enrollment.ChargeDayAtEnrollment.ToString() },
            ["CreatedAtUtc"] = new AttributeValue { S = enrollment.CreatedAtUtc.ToString("O") }
        };

        if (enrollment.EndDate.HasValue)
        {
            item["EndDate"] = new AttributeValue { S = enrollment.EndDate.Value.ToString("yyyy-MM-dd") };
        }

        return item;
    }

    private static Dictionary<string, AttributeValue> BuildActiveItem(Enrollment enrollment)
    {
        return new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"STUDENT#{enrollment.StudentId}" },
            ["SK"] = new AttributeValue { S = "ACTIVE_ENROLLMENT" },
            ["EntityType"] = new AttributeValue { S = "Enrollment" },
            ["EnrollmentId"] = new AttributeValue { S = enrollment.Id },
            ["StudentId"] = new AttributeValue { S = enrollment.StudentId },
            ["GroupId"] = new AttributeValue { S = enrollment.GroupId },
            ["StartDate"] = new AttributeValue { S = enrollment.StartDate.ToString("yyyy-MM-dd") },
            ["Status"] = new AttributeValue { S = enrollment.Status },
            ["PriceAtEnrollment"] = new AttributeValue { N = enrollment.PriceAtEnrollment.ToString(System.Globalization.CultureInfo.InvariantCulture) },
            ["ChargeDayAtEnrollment"] = new AttributeValue { N = enrollment.ChargeDayAtEnrollment.ToString() },
            ["CreatedAtUtc"] = new AttributeValue { S = enrollment.CreatedAtUtc.ToString("O") }
        };
    }

    private static Dictionary<string, AttributeValue> BuildGroupStudentItem(Enrollment enrollment)
    {
        return new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"GROUP#{enrollment.GroupId}" },
            ["SK"] = new AttributeValue { S = $"STUDENT#{enrollment.StudentId}" },
            ["EntityType"] = new AttributeValue { S = "GroupStudent" },
            ["EnrollmentId"] = new AttributeValue { S = enrollment.Id },
            ["StudentId"] = new AttributeValue { S = enrollment.StudentId },
            ["GroupId"] = new AttributeValue { S = enrollment.GroupId },
            ["Status"] = new AttributeValue { S = enrollment.Status },
            ["StartDate"] = new AttributeValue { S = enrollment.StartDate.ToString("yyyy-MM-dd") }
        };
    }
}