using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using TenTotalEnglish.Payments.Application.Interfaces;
using TenTotalEnglish.Payments.Domain.Entities;

namespace TenTotalEnglish.Payments.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly IAmazonDynamoDB _dynamoDb = new AmazonDynamoDBClient();
    private readonly string _tableName = Environment.GetEnvironmentVariable("TABLE_NAME") ?? "tte-dev-main";

    public async Task CreateAsync(Payment payment)
    {
        var item = new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"STUDENT#{payment.StudentId}" },
            ["SK"] = new AttributeValue { S = $"PAYMENT#{payment.Month}#{payment.Id}" },
            ["PaymentId"] = new AttributeValue { S = payment.Id },
            ["StudentId"] = new AttributeValue { S = payment.StudentId },
            ["EnrollmentId"] = new AttributeValue { S = payment.EnrollmentId },
            ["Amount"] = new AttributeValue { N = payment.Amount.ToString() },
            ["PaymentDate"] = new AttributeValue { S = payment.PaymentDate.ToString("O") },
            ["Month"] = new AttributeValue { S = payment.Month },
            ["Status"] = new AttributeValue { S = payment.Status }
        };

        await _dynamoDb.PutItemAsync(_tableName, item);
    }

    public async Task<List<Payment>> GetByStudentIdAsync(string studentId)
    {
        var response = await _dynamoDb.QueryAsync(new QueryRequest
        {
            TableName = _tableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new AttributeValue { S = $"STUDENT#{studentId}" },
                [":sk"] = new AttributeValue { S = "PAYMENT#" }
            }
        });

        return response.Items.Select(x => new Payment(
            x["PaymentId"].S,
            x["StudentId"].S,
            x["EnrollmentId"].S,
            decimal.Parse(x["Amount"].N),
            DateTime.Parse(x["PaymentDate"].S),
            x["Month"].S,
            x["Status"].S,
            DateTime.UtcNow
        )).ToList();
    }

    public async Task<ActiveEnrollment?> GetActiveEnrollmentByStudentIdAsync(string studentId)
    {
        var res = await _dynamoDb.GetItemAsync(_tableName, new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"STUDENT#{studentId}" },
            ["SK"] = new AttributeValue { S = "ACTIVE_ENROLLMENT" }
        });

        if (res.Item == null || res.Item.Count == 0) return null;

        var i = res.Item;

        return new ActiveEnrollment(
            i["EnrollmentId"].S,
            i["StudentId"].S,
            i["GroupId"].S,
            DateTime.Parse(i["StartDate"].S),
            i["Status"].S,
            decimal.Parse(i["PriceAtEnrollment"].N),
            int.Parse(i["ChargeDayAtEnrollment"].N),
            DateTime.Parse(i["CreatedAtUtc"].S)
        );
    }

    public async Task<bool> ExistsPaymentForEnrollmentMonthAsync(string studentId, string enrollmentId, string month)
    {
        var res = await _dynamoDb.QueryAsync(new QueryRequest
        {
            TableName = _tableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new AttributeValue { S = $"STUDENT#{studentId}" },
                [":sk"] = new AttributeValue { S = $"PAYMENT#{month}#" }
            }
        });

        return res.Items.Any(x => x["EnrollmentId"].S == enrollmentId);
    }

    public async Task<List<ActiveEnrollment>> GetAllActiveEnrollmentsAsync()
    {
        var res = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = _tableName,
            FilterExpression = "SK = :sk",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":sk"] = new AttributeValue { S = "ACTIVE_ENROLLMENT" }
            }
        });

        return res.Items.Select(i => new ActiveEnrollment(
            i["EnrollmentId"].S,
            i["StudentId"].S,
            i["GroupId"].S,
            DateTime.Parse(i["StartDate"].S),
            i["Status"].S,
            decimal.Parse(i["PriceAtEnrollment"].N),
            int.Parse(i["ChargeDayAtEnrollment"].N),
            DateTime.Parse(i["CreatedAtUtc"].S)
        )).ToList();
    }
}